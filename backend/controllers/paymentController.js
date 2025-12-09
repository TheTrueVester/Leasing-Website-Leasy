import dotenv from "dotenv";
import Stripe from "stripe";
import { Booking } from "../models/bookingModel.js";
import { Listing } from "../models/listingModel.js";
import { Payment } from "../models/paymentModel.js";

dotenv.config();

import { mailSender } from "../utils/sendMail.js";
import { Application } from "../models/applicationModel.js";

const { STRIPE_SECRET_KEY, origin } = process.env;
const stripe = Stripe(STRIPE_SECRET_KEY);

export const bookingCheckoutSession = async (req, res, next) => {
  try {
    const { listingId, bookingId } = req.body;

    if (!listingId || !bookingId) {
      return res.status(400).json({ message: "Missing required attributes." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const { price, title, description, attachments } = listing;
    const images = attachments
      .filter((attachment) => attachment.match(/\.(jpeg|jpg|gif|png)$/))
      .map((attachment) => encodeURI(attachment));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal", "sepa_debit"],
      ui_mode: "embedded",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: price * 100,
            product_data: {
              name: title,
              description: description,
              images,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      receipt_email: booking.tenant.email,
      return_url: `${origin}/return/?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
    });
    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing the payment." });
  }
};

export const processAfterPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    const { payment_type: paymentType } = req.query;
    if (!paymentType) {
      return res.status(400).json({ message: "Payment type is required." });
    }

    const { paymentEmail } = req.body;
    if (!paymentEmail) {
      return res.status(400).json({ message: "Customer email is required." });
    }

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "host",
        model: "User",
      })
      .populate({
        path: "tenant",
        model: "User",
      })
      .populate({
        path: "paymentFromTenant",
        model: "Payment",
      })
      .populate({
        path: "application",
        model: "Application",
      });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    const listingId = booking.application.listing;
    const listing = await Listing.findById(listingId);
    listing.status = "RENTED";
    listing.save().catch((e) => {
      throw new Error(e);
    });

    // set all other payments' status to REJECTED
    Application.find({ listing: listingId }).then((apps) => {
      apps
        .filter((a) => a.id !== booking.application.id)
        .forEach((a) => {
          Application.findByIdAndUpdate(a.id, { status: "REJECTED" }).catch(
            (errors) => {
              console.log(errors);
            }
          );
        });
    });

    const payment = await Payment.findById(booking.paymentFromTenant.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    if (payment.status === "SETTLED") {
      return res
        .status(400)
        .json({ message: "The transaction has been settled previously" });
    }
    payment.status = "SETTLED";
    payment.paymentDate = Date.now();
    payment.paymentType = paymentType;

    const sendConfirmationEmail = async (hostEmail, booking) => {
      try {
        console.log("Sending email to: ", hostEmail);
        console.log("Booking: ", booking);
        const mailResponse = await mailSender(
          hostEmail,
          `Payment for ${listing.title} completed.`,
          `<p>Payment for the listing <b>${
            listing.title
          }</b> has been completed by <b>${booking.tenant.firstname}</b>.</p>
           <br/>You can contact the tenant via <a href=${"http://localhost:5173/chat"}>chat</a> and discuss specific matters.
           <br/><p><b>Your payment will be done by Leasy once the sublet period is over. We may contact you as well to ask for your payment details, if you haven't included them in your <a href=${"http://localhost:5173/me"}>profile</a></b></p>
           <br/><p>Booking ID: ${booking._id}</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    };

    const sendConfirmationEmailToTenant = async (tenantEmail, booking) => {
      try {
        console.log("Sending email to: ", tenantEmail);
        console.log("Booking: ", booking);
        const mailResponse = await mailSender(
          tenantEmail,
          `Payment for ${listing.title} completed.`,
          `<p>You have completed the payment for the listing <b>${
            listing.title
          }</b> in the sum of <b>€${booking.paymentFromTenant.total}</b>.</p>
           <br/>You can contact the renter via <a href=${"http://localhost:5173/chat"}>chat</a> and discuss specific matters.
           <br/><p>Booking ID: ${booking._id}</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    };

    await payment.save();
    await sendConfirmationEmail(booking.host.email, booking);
    await sendConfirmationEmailToTenant(paymentEmail, booking);

    return res.status(200).json({
      message: "Payment info updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing the payment." });
  }
};

// Send money to host. Used in cron job.
export const sendMoneyToHost = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error("Booking ID is required.");
    }

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "application",
        populate: {
          path: "listing",
          model: "Listing",
        },
      })
      .populate({
        path: "host",
        model: "User",
      })
      .populate({
        path: "tenant",
        model: "User",
      });
    if (!booking) {
      throw new Error("Booking not found.");
    }

    const payment = await Payment.findById(booking.paymentToHost);
    if (!payment) {
      throw new Error("Payment to host not found.");
    }
    if (payment.status === "SETTLED") {
      throw new Error("Payment to host already settled.");
    }

    // Create payment intent to host
    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.total * 100,
      currency: "EUR",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      transfer_data: {
        destination: process.env.RENTER_TEST_STRIPE_ACCOUNT,
      },
    });

    // Confirm payment intent, transfer money to host
    const confirmPayment = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: "pm_card_visa",
        return_url: "https://www.example.com",
      }
    );

    if (confirmPayment.status !== "succeeded") {
      console.error("Payment failed: ", confirmPayment);
      return {
        success: false,
      };
    }

    // Update payment status post successful payment
    console.log("Payment succeeded: ", confirmPayment);
    payment.status = "SETTLED";
    payment.paymentDate = Date.now();
    payment.paymentType = "BANK_TRANSFER";
    payment.save().catch((e) => {
      throw new Error(e);
    });

    console.log("Payment settled successfully: ", payment);
    // send payment confirmation email to host
    const sendConfirmationEmail = async (hostEmail, booking) => {
      try {
        console.log("Sending email to: ", hostEmail);
        console.log("Booking: ", booking);
        const mailResponse = await mailSender(
          hostEmail,
          `Payment for ${listing.title} completed.`,
          `<p>Payment for the listing <b>${listing.title}</b> has been sent to your specified bank acoount.</p>
           <br/>Thank you for trusting Leasy!.
           <br/><p>Booking ID: ${booking._id}</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    };
    const sendConfirmationEmailToTenant = async (tenantEmail, booking) => {
      try {
        console.log("Sending email to: ", tenantEmail);
        console.log("Booking: ", booking);
        const mailResponse = await mailSender(
          tenantEmail,
          `${listing.title} has concluded.`,
          `<p>We hope that you enjoyed your stay at <b>${listing.title}</b>. Tell a friend about Leasy if you found your experience enjoyable!</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    };
    // send emails
    await sendConfirmationEmail(booking.host.email, booking);
    await sendConfirmationEmailToTenant(booking.tenant.email, booking);

    // Deactivating listing after payment to host is settled
    console.log("Deactivating listing: ", booking.application.listing._id);
    const listing = await Listing.findById(booking.application.listing._id);
    listing.status = "INACTIVE";
    listing.save().catch((e) => {
      throw new Error(e);
    });
    console.log("Listing deactivated successfully: ", listing);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
};
