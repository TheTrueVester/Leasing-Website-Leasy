import express from "express";
import {
  createBooking, deleteBookingById,
  getBookingById,
  getBookingsByHostId,
  getBookingsByTenantId,
} from "../controllers/bookingController.js";
import {
  bookingCheckoutSession,
  processAfterPayment,
} from "../controllers/paymentController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", checkAuth, createBooking);
router.get("/:id", checkAuth, getBookingById);
router.get("/tenant/:tenantId", checkAuth, getBookingsByTenantId);
router.get("/host/:hostId", checkAuth, getBookingsByHostId);

router.post("/create-checkout-session", bookingCheckoutSession);
router.post("/process/:bookingId", processAfterPayment);

router.delete("/:id", checkAuth, deleteBookingById);

export default router;
