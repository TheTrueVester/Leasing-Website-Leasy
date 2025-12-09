import express from "express";
import {
  createChat, createMessage,
  deleteChat, getChatByChatId, getChatsByUserId,
} from "../controllers/chatController.js";
import {upload} from "../middleware/fileUpload.js";

const router = express.Router();

router.post("/create", createChat);
router.get("/get/c/:chatId", getChatByChatId);
router.get("/get/u/:userId", getChatsByUserId);
router.put("/delete/:chatId", deleteChat);
router.post("/send", upload.single("file"), createMessage)


export default router;
