import dotenv from "dotenv";
import cron from "node-cron";
import { getAllBookings } from "../controllers/bookingController.js";
import { sendMoneyToHost } from "../controllers/paymentController.js";
import { mailSender } from "../utils/sendMail.js";

dotenv.config();

const sendNotificationEmailToAdmin = async (adminEmail, booking) => {
  try {
    console.log("Sending email to: ", adminEmail);
    console.log("Booking: ", booking);
    const mailResponse = await mailSender(
      adminEmail,
      `Payment for ${booking.application.listing.title} is due`,
      `<p>System is now conducting payment to ${booking.host.firstname} ${booking.host.lastname}.</p>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
};

// Run the cron job at midnight
const cronExpression = "0 0 * * *";

// Start the cron job.
// The function runs at midnight and checks if a payment is due for the host (5 days after the booking period ends)
// If payment is due, the system will make the payment to the host and send an email to the admin to notify them about the payment.
const start = () => {
  cron.schedule(cronExpression, async () => {
    console.log("Running daily task at midnight");
    // Get all bookings and check if the payment to host is already made
    const bookings = await getAllBookings();
    const filtered = (bookings || [])
      .filter(
        (booking) =>
          booking.paymentFromTenant?.status === "SETTLED" &&
          booking.paymentToHost?.status === "PENDING"
      )
      .forEach(async (booking) => {
        console.log(booking);
        // If payment is not made, send email to admin to remind them to make payment
        const availableTo = new Date(booking.application.listing.availableTo);
        availableTo.setDate(availableTo.getDate() + 5);
        console.log("Available to limit: ", availableTo);

        if (availableTo < new Date()) {
          console.log(
            "Payment is due for booking: ",
            booking._id,
            ". Making payment now."
          );

          // Make payment to host
          await sendMoneyToHost(booking._id).then(({ success }) => {
            if (success) {
              console.log("Payment to host is successful.");
              // send email to admin
              sendNotificationEmailToAdmin(
                process.env.MAIL_USER,
                booking
              ).catch((error) => {
                console.log("Error occurred while sending email: ", error);
              });
            } else {
              console.log("Payment to host is unsuccessful.");
            }
          });
        }
      });
  });
};

export { start };
