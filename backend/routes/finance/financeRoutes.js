// routes/financeRoutes.js

import express from "express";

// Finance Member routes
import {
  createFinanceMember,
  getAllFinanceMembers,
  getFinanceMemberById, 
  updateFinanceMember,
  deleteFinanceMember
} from "../../controllers/finances/financeController.js";

// Invoice routes
import {
  getAllInvoices,
  createInvoice,
  getPatientInvoices,
  updateInvoiceStatus,
  sendInvoiceToExternal
} from "../../controllers/finances/invoiceController.js";

// Report routes
import {
  getRecentReports,
  getReportById,
  generateReport,
  exportReport,
} from "../../controllers/finances/reportController.js";

const router = express.Router();

// ===== Invoice Routes (must be before /:id) =====
router.get("/invoices", getAllInvoices);
router.post("/invoices/create", createInvoice);
router.post("/invoices/:id/send", sendInvoiceToExternal);
router.patch("/invoices/:id/status", updateInvoiceStatus);
router.get("/patients/:patientId/invoices", getPatientInvoices);

// ===== Report Routes (must be before /:id) =====
router.get("/reports/recent", getRecentReports);
router.get("/reports/:id", getReportById);
router.get("/reports/:id/export", exportReport);
router.post("/reports/generate", generateReport);

// ===== Finance Member Routes (parameterized routes go last) =====
router.post("/", createFinanceMember);
router.get("/", getAllFinanceMembers);
router.get("/:id", getFinanceMemberById);
router.put("/:id", updateFinanceMember);
router.delete("/:id", deleteFinanceMember);

export default router;