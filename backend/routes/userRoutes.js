import express from "express";
import { register, login, getCurrentUser, createUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route (requires authentication)
router.get("/me", authenticate, getCurrentUser);

// Keep for backward compatibility
router.post("/", createUser);

export default router;
