import mongoose from "mongoose";
import { docTransform } from "../utils/mongoDocTransform.js";

const applicationSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACCEPTED", "PENDING", "REJECTED"],
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    attachments: {
      type: Array,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true, versionKey: false, transform: docTransform },
    toJSON: { virtuals: true, versionKey: false, transform: docTransform },
  }
);

export const Application = mongoose.model("Application", applicationSchema);
