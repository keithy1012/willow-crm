import express from "express";
import { authController } from "../../controllers/auth/authController.js";

const router = express.Router();

router.post("/request-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

export default router;
