import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  streetNumber: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  // Adressezusatz
  additionalInfo: {
    type: String,
    required: false,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: false,
  },
});

// potential functions here

export const Address = mongoose.model("Address", addressSchema);
