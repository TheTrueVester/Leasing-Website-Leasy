import mongoose from "mongoose";
import { docTransform } from "../utils/mongoDocTransform.js";

const listingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    availableTo: {
      type: Date,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "RENTED", "PENDING"],
      required: true,
      default: "INACTIVE",
    },
    dormType: {
      type: String,
      enum: ["SINGLE_APARTMENT", "SHARED_APARTMENT", "STUDENT_DORMITORY"],
      required: true,
      default: "SINGLE_APARTMENT",
    },
    listingAttributes: {
      type: Array,
      required: false,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true, versionKey: false, transform: docTransform },
    toJSON: { virtuals: true, versionKey: false, transform: docTransform },
  }
);

// potential functions here

export const Listing = mongoose.model("Listing", listingSchema);
