import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export const checkAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: "Authorization token required" });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // Set the user object in the request
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      status: false,
      message: "Something went wrong when verifying token.",
    });
  }
};

// Function to test authentication and send status and user data
export const testAuth = async (req, res) => {
  try {
    const bearer = req.headers.authorization;
    let token = bearer.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized: No token set." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (user) {
      return res.status(200).json({ status: true, user });
    } else {
      return res.status(400).json({ message: "User does not exist" });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized: expired token." });
    }
    return res.status(500).json({
      status: false,
      message: "Something went wrong when verifying token.",
    });
  }
};
