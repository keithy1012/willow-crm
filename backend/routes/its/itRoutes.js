// routes/itRoutes.js

import express from "express";
import {
  createITMember,
  getAllITMembers,
  getITMemberById,
  deleteITMember,
  updateITMember
} from "../../controllers/its/itController.js";

const router = express.Router();

// Creates an ITMember
router.post("/", createITMember);

// Get all IT members
router.get("/", getAllITMembers);

// Get IT member by ID
router.get("/:id", getITMemberById);

// Update IT member by ID
router.put("/:id", updateITMember);

// Delete IT member by ID
router.delete("/:id", deleteITMember);

export default router;