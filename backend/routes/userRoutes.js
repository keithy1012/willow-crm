import express from "express";
import {
  register,
  login,
  checkEmail,
  getCurrentUser,
  searchUsers,
  searchUsersByRole,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/email-check", checkEmail);
// Protected route (requires authentication)
router.get("/me", authenticate, getCurrentUser);
router.get("/search", authenticate, searchUsers);
router.get("/search/role", authenticate, searchUsersByRole);

export default router;
