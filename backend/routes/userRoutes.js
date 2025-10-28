import express from "express";
import { register, login, getCurrentUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route (requires authentication)
router.get("/me", authenticate, getCurrentUser);

export default router;
