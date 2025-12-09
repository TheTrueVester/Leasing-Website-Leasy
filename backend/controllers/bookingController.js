import dotenv from "dotenv";
import mongoose from "mongoose";
import { Application } from "../models/applicationModel.js";
import { Booking } from "../models/bookingModel.js";
import { Listing } from "../models/listingModel.js";
import { Payment } from "../models/paymentModel.js";
import { User } from "../models/userModel.js";
dotenv.config();

import { mailSender } from "../utils/sendMail.js";

export const createBooking = async (req, res, next) => {
  try {
    const { hostEmail, tenantEmail, applicationID } = req.body;

    if (!hostEmail) {
      return res.status(400).json({ message: "Host email is required." });
    }
    if (!tenantEmail) {
      return res.status(400).json({ message: "Tenant email is required." });
    }
    if (!applicationID) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    
    const host = await User.findOne({ email: hostEmail });
    if (!host) {
      return res.status(404).json({ message: "Host not found." });
    }

    
    const tenant = await User.findOne({ email: tenantEmail });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    
    const application = await Application.findOne({ _id: applicationID });
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    // Check if the listing exists and belongs to the host
    if (!application.listing) {
      return res
        .status(404)
        .json({ message: "Listing not found in the application." });
    }
    // Also checks if the application is linked to the appropriate listing
    const listing = await Listing.findById(application.listing);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Check if the host owns the listing
    if (!listing.createdBy.equals(host._id)) {
      return res
        .status(403)
        .json({ message: "Host does not own this listing." });
    }
    // Check if the tenant in the application matches the booking tenant
    if (!application.applicant.equals(tenant._id)) {
      return res
        .status(403)
        .json({ message: "Tenant does not match the application applicant." });
    }

    // Check if a booking already exists for the given application ID
    const existingBooking = await Booking.findOne({
      application: applicationID,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Booking already exists for this application." });
    }

    const payment = await Payment.create({
      total: listing.price,
      sender: application.applicant._id,
      recipient: process.env.LEASY_ADMIN_USER_ID,
    });

    const paymentToHost = await Payment.create({
      total: listing.price * (1 - process.env.LEASY_COMMISSION),
      sender: process.env.LEASY_ADMIN_USER_ID,
      recipient: host._id,
      status: "PENDING",
    });

    // Create the booking
    const booking = await Booking.create({
      host: host._id,
      tenant: tenant._id,
      application: application._id,
      paymentFromTenant: payment._id,
      paymentToHost: paymentToHost._id,
    });
    application.status = "ACCEPTED";
    await application.save();

    // Send a confirmation email to the tenant
    const sendConfirmationEmail = async (tenantEmail, booking) => {
      try {
        console.log("Sending email to: ", tenantEmail);
        console.log("Booking: ", booking);

        const mailResponse = await mailSender(
          tenantEmail,
          `Updates to your application for ${listing.title}`,
          `<h3>Congratulations!</h3>
           <p>Your application for the listing <b>${
             listing.title
           }</b> hosted by <b>${host.firstname}</b> has been accepted!
           <br/>To finalize the booking, please open the following <a href=${"http://localhost:5173/overview"}>link</a> and complete the booking payment.
           <br/><p>Booking ID: ${booking._id}</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    };
    await sendConfirmationEmail(tenant.email, booking);

    listing.status = "PENDING";
    await listing.save();

    res.status(201).json({
      message: "Booking created successfully",
      success: true,
      booking,
    });
    next();
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Booking already exists for this host, tenant, and application.",
      });
    }

    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the booking." });
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    // Find the booking by ID
    const booking = await Booking.findById(id)
      .populate("host", "email name") 
      .populate("tenant", "email name") 
      .populate("application"); 

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({
      message: "Booking retrieved successfully",
      success: true,
      booking,
    });
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the booking." });
  }
};

export const getBookingsByTenantId = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    // Validate the tenant ID
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ message: "Invalid tenant ID." });
    }

    // Find bookings by tenant ID
    const bookings = await Booking.find({ tenant: tenantId })
      .populate({
        path: "host",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "tenant",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "application",
        populate: {
          path: "listing",
          model: "Listing",
          select: "availableFrom availableTo address attachments price title",
          populate: {
            path: "address",
            model: "Address",
          },
        },
      })
      .populate({
        path: "paymentFromTenant",
        mmodel: "Payment",
        select: "total status",
      });

    // sort bookings
    bookings.sort((a, b) => b.createdAt - a.createdAt).reverse();

    res.status(200).json({
      message: "Bookings retrieved successfully",
      success: true,
      bookings,
    });
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the bookings." });
  }
};


export const getBookingsByHostId = async (req, res, next) => {
  try {
    const { hostId } = req.params;

    // Validate the host ID
    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(400).json({ message: "Invalid host ID." });
    }

    // Find bookings by host ID
    const bookings = await Booking.find({ host: hostId })
      .populate({
        path: "host",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "tenant",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "application",
        populate: {
          path: "listing",
          model: "Listing",
          select: "availableFrom availableTo address attachments price title",
          populate: {
            path: "address",
            model: "Address",
          },
        },
      })
      .populate({
        path: "paymentFromTenant",
        mmodel: "Payment",
        select: "total status",
      })
      .populate({
        path: "paymentToHost",
        mmodel: "Payment",
        select: "total status",
      });

    // sort bookings
    bookings.sort((a, b) => b.createdAt - a.createdAt).reverse();

    res.status(200).json({
      message: "Bookings retrieved successfully",
      success: true,
      bookings,
    });
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the bookings." });
  }
};

export const getAllBookings = async () => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "host",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "tenant",
        model: "User",
        select: "firstname lastname email phoneNumber",
      })
      .populate({
        path: "application",
        populate: {
          path: "listing",
          model: "Listing",
          select: "availableFrom availableTo address attachments price title",
          populate: {
            path: "address",
            model: "Address",
          },
        },
      })
      .populate({
        path: "paymentFromTenant",
        model: "Payment",
        select: "total status",
      })
      .populate({
        path: "paymentToHost",
        model: "Payment",
        select: "total status",
      });

    return bookings;
  } catch (error) {
    return [];
  }
};

export const deleteBookingById = async (req, res, next) => {
  /**
   * Deletes the booking with the specified booking-ID
   */
  try {
    const { bookingId } = req.body;

    // Validate the booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    // delete booking by ID
    await Booking.findByIdAndDelete(bookingId)
      .then((deletedBooking) => {
        if (deletedBooking && deletedBooking.id === bookingId) {
          return res.status(200).json({
            message: "Booking deleted successfully",
            success: true,
            deletedBooking,
          });
        } else {
          return res.status(400).json({
            message: "something went wrong while deleting the booking.",
            success: false,
          })
        }
      })
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the booking." });
  }
};
