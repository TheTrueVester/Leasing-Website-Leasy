import express from "express";
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsByListingId,
  getApplicationsByUserId,
  updateApplication,
  uploadDocument
} from "../controllers/applicationController.js";
import { checkAuth } from "../middleware/authMiddleware.js";
import { upload } from '../middleware/fileUpload.js';
const router = express.Router();

router.post("/", createApplication);
router.get("/", (req, res) => {
  const { applicationId, userId, listingId } = req.query;

  if (applicationId) {
    return getApplicationById(req, res);
  } else if (userId) {
    return getApplicationsByUserId(req, res);
  } else if (listingId) {
    return getApplicationsByListingId(req, res);
  } else {
    return res
      .status(400)
      .send("Bad Request: Missing required query parameter.");
  }
});
router.delete("/:applicationId", deleteApplication);
router.put("/:applicationId", updateApplication);
router.post("/upload/documents", checkAuth, upload.array('documents', 10), uploadDocument);

export default router;
