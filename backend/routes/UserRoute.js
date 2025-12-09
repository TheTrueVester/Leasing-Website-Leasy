import express from "express";
import {
  AddUnreadMessage,
  EditUser,
  GetUserFavoriteListings,
  RemoveUnreadMessage,
  SearchUserById,
  updateUser,
  uploadDocument,
  uploadProfilePicture, 
  deleteDocument,
} from "../controllers/userController.js";
import { checkAuth } from "../middleware/authMiddleware.js";
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

router.get("/:id", SearchUserById);
router.get("/:id/favorites", checkAuth, GetUserFavoriteListings);
router.put("/edit", checkAuth, EditUser);


router.put("/me", checkAuth, updateUser);
router.post("/me", checkAuth, updateUser); 
router.delete("/me", checkAuth, updateUser); 

router.post("/me/upload/profilePicture", checkAuth, upload.single('profilePicture'), uploadProfilePicture);
//router.post("/me/upload/document", checkAuth, upload.single("document"), uploadDocument);
router.post("/me/upload/documents", checkAuth, upload.array('documents', 10), uploadDocument);
router.delete("/me/upload/documents", checkAuth, deleteDocument)

router.put("/addUnread", AddUnreadMessage);
router.put("/removeUnread", RemoveUnreadMessage);


export default router;
