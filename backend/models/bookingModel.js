import mongoose from "mongoose";
import { docTransform } from "../utils/mongoDocTransform.js";

const bookingSchema = mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    paymentFromTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentToHost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    toObject: { virtuals: true, versionKey: false, transform: docTransform },
    toJSON: { virtuals: true, versionKey: false, transform: docTransform },
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
