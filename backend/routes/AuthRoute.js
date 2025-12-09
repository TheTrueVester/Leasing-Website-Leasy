import express from "express";
import {
  Login,
  sendOTP,
  Signup,
  // Logout,
} from "../controllers/authController.js";
import { testAuth } from "../middleware/authMiddleware.js";
import { updateUser } from "../controllers/userController.js";
// import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
// router.post("/logout", checkAuth, Logout);
router.post("/otp", sendOTP);
router.get("/", testAuth);
router.put("/me", updateUser);

export default router;
