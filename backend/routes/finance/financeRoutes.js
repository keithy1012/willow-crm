// routes/financeRoutes.js

import express from "express";
import {
  createFinanceMember,
  getAllFinanceMembers,
  getFinanceMemberById, 
  updateFinanceMember,
  deleteFinanceMember
} from "../../controllers/its/financeController.js";

const router = express.Router();

// Creates an Finance Member
router.post("/", createFinanceMember);

// Get all Finance members
router.get("/", getAllFinanceMembers);

// Get Finance member by ID
router.get("/:id", getFinanceMemberById);

// Update Finance member by ID
router.put("/:id", updateFinanceMember);

// Delete Finance member by ID
router.delete("/:id", deleteFinanceMember);

export default router;