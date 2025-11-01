import express from "express";
import {
  register,
  login,
  checkEmail,
  getCurrentUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/email-check", checkEmail);
// Protected route (requires authentication)
router.get("/me", authenticate, getCurrentUser);

export default router;
