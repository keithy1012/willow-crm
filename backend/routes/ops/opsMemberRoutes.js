// routes/opsMemberRoutes.js
import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  createOpsMember,
  getAllOpsMembers,
  getOpsMemberById,
  deleteOpsMember,
  updateOpsMember,
} from "../../controllers/ops/opsMemberController.js";

const router = express.Router();

// Apply authenticate middleware to all routes
router.use(authenticate);

// Creates an OpsMember
router.post("/", createOpsMember);

// Get all ops members
router.get("/", getAllOpsMembers);

// Get ops member by user ID
router.get("/:userId", getOpsMemberById);

// Update ops member by user ID
router.put("/:userId", updateOpsMember);

// Delete ops member by user ID
router.delete("/:userId", deleteOpsMember);

export default router;
