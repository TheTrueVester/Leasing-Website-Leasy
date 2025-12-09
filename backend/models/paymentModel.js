import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["REQUESTED", "REFUSED", "SETTLED", "PENDING"],
    default: "REQUESTED",
  },
  paymentRequestCreated: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  paymentDate: {
    type: Date,
  },
  paymentType: {
    type: String,
    enum: ["PAYPAL", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER"],
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Payment = mongoose.model("Payment", paymentSchema);
