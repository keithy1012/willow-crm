import express from "express";
import { chatController } from "../../controllers/chat/chatController.js";

const router = express.Router();

router.post("/", chatController.sendMessage);

export default router;
