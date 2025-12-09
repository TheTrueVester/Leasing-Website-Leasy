import mongoose from "mongoose";

const chatMessageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    file: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true
  }
);

export const Message = mongoose.model("Message", chatMessageSchema);