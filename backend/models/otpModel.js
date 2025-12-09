import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import { mailSender } from "../utils/sendMail.js";

const { SALT_WORK_FACTOR } = process.env;

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 15, // TOTP code valid for 15 minutes
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    console.log("Sending email to: ", email);
    console.log("OTP: ", otp);
    // TODO: mail formatting
    const mailResponse = await mailSender(
      email,
      "Your Leasy Verification Code",
      `<h1>Please confirm your OTP</h1>
       <p>Your OTP code: <b>${otp}</b></p>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

// Only send an email when a new document is saved to the database
otpSchema.pre("save", async function (next) {
  console.log("New OTP document saved to DB");
  if (this.isNew) {
    // hash the OTP before saving it to the database
    bcrypt.genSalt(Number(SALT_WORK_FACTOR), (err, salt) => {
      if (err) return next(err);

      // hash the OTP using salt
      bcrypt.hash(this.otp, salt, (err, hash) => {
        if (err) return next(err);
        // override the cleartext otp with the hashed one
        this.otp = hash;
      });
    });

    // Send an email to the user
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

export const OTP = mongoose.model("OTP", otpSchema);
