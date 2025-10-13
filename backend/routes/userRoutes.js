import express from "express";
import { protect } from "../middleware/authentication.js";
import { createUser, loginUser, getCurrentUser } from "../controllers/userController.js";

const router = express.Router();

// User registration
router.post("/", createUser);

// User login
router.post("/login", loginUser);

// Get current user profile (protected)
router.get("/me", protect, getCurrentUser);

export default router;
