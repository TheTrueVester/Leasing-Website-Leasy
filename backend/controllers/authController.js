import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { OTP } from "../models/otpModel.js";
import { User } from "../models/userModel.js";
import { createSecretToken } from "../utils/secretToken.js";

export const Signup = async (req, res, next) => {
  try {
    const { email, password, firstname, lastname, otp } = req.body;

    if (!email) {
      return res
        .status(404)
        .json({ message: "Please enter a valid email address." });
    }
    if (!password) {
      return res.status(404).json({ message: "Password not entered" });
    }
    if (!firstname) {
      return res.status(404).json({ message: "Firstname not entered" });
    }
    if (!lastname) {
      return res.status(404).json({ message: "Lastname not entered" });
    }
    if (!otp) {
      return res
        .status(404)
        .json({ message: "Please enter the OTP sent to your email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `The email ${email} is already taken by an existing user.`,
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "Please enter the OTP sent to your email",
      });
    }
    const otpDoc = await OTP.find({ email });
    if (otpDoc.length === 0) {
      return res.status(400).json({
        message: "The email is not verified, please verify your email first.",
      });
    }

    const registrationOTPs = otpDoc.filter(
      (otp) => otp.otpType === "register_otp"
    );

    // get the last OTP associated with the email
    const foundOTP = registrationOTPs[registrationOTPs.length - 1];

    const plainOTP = otp;
    const hashedOTP = foundOTP.otp;

    const isOTPValid = await bcrypt.compare(plainOTP, hashedOTP);

    if (isOTPValid) {
      const user = await User.create({ email, password, firstname, lastname });
      const token = createSecretToken(user._id);

      // delete OTP documents associated with the registration email
      await OTP.deleteMany({ email: foundOTP.email });

      // res.cookie("token", token, {
      //   withCredentials: true,
      //   httpOnly: false,
      // });
      res.status(201).json({
        message: "User sign up successful",
        success: true,
        user,
        token,
      });
      next();
    }
  } catch (error) {
    console.error(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    // body validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect password or email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ message: "Incorrect password or email" });
    }

    // create token, set as cookie
    const token = createSecretToken(user._id);

    const {
      password: userPassword,
      listings,
      __v,
      _id: id,
      ...rest
    } = user._doc;
    res.status(201).json({
      message: "User logged in successfully",
      success: true,
      token,
      user: {
        id,
        ...rest,
      },
    });
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred while logging in",
      error,
      success: false,
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ message: "email field is required", success: false });

    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // creates a new OTP document which will trigger the pre-save hook
    const _ = await OTP.create({
      email,
      otp,
      otpType: "register_otp",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(404).json({
      success: false,
      error: error.message,
      message: "An error occurred while sending OTP",
    });
  }
};
