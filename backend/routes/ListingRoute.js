import express from "express";
import { getListingsWithAds } from '../controllers/listingController.js';

import {
  CreateListing, DeactivateListing, EditListing,
  GetListingsCreatedByUser,
  SearchListingById,
  SearchListings,
} from "../controllers/listingController.js";
import { checkAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/fileUpload.js";

const router = express.Router();

router.post("/create", checkAuth, upload.array("attachments"), CreateListing);
router.put("/edit/:listingId", checkAuth, upload.array("attachments"), EditListing);
router.delete("/:listingId", DeactivateListing);
router.get("/", SearchListings);
router.get("/:id", SearchListingById);
router.get("/my-listings/:userId", GetListingsCreatedByUser);

router.get('/listings', getListingsWithAds);

export default router;
