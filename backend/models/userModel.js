import mongoose from "mongoose";
import { docTransform } from "../utils/mongoDocTransform.js";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const { SALT_WORK_FACTOR } = process.env;

//User attriutes
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: { unique: true },
      validate: {
        validator: (value) => {
          //email whitelist for certain Universivsty emails
          return /^[\w-]+(?:\.[\w-]+)*@(lmu\.de|tum\.de|hm\.edu|adbk\.de|musikhochschule-muenchen\.de|hfph\.de|unibw\.de|ksfh\.de|hs-furtwangen\.de|fh-aachen\.de|jacobs-university\.de|mytum\.de)$/.test(
            value
          );
        },
      },
    },
    password: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    userBioAttributes: {
      type: Map,
      of: String,
      default: {},
    },
    listings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: false,
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: false,
      },
    ],
    profilePicture: {
      type: String,
      required: false,
    },
    documents: [
      {
        type: String,
        required: false,
      },
    ],
    unreadMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      }
    ]

  },
  {
    toObject: { virtuals: true, versionKey: false, transform: docTransform },
    toJSON: { virtuals: true, versionKey: false, transform: docTransform },
  }
);

// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
// hash the password before saving it to the database
// ONLY use save() to update passwords
userSchema.pre("save", function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(Number(SALT_WORK_FACTOR), function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// password verification
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export const User = mongoose.model("User", userSchema);
