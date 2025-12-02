import express from "express";
import { chatController } from "../../controllers/chat/chatController.js";
import { authenticate } from "../../middleware/authentication.js";

const router = express.Router();

router.use(authenticate);

router.post("/", chatController.sendMessage);

export default router;
