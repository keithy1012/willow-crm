import Invoice from "../../models/finance/Invoice.js";
import Patient from "../../models/patients/Patient.js";
import { logEvent, getClientIp } from "../../utils/logger.js";
// Get invoices for a specific patient
export const getPatientInvoices = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { patientId } = req.params;
    logEvent(
      "Invoice",
      `Get patient invoices - Patient: ${patientId}`,
      patientId,
      ip
    );

    const invoices = await Invoice.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate("patient");
    logEvent(
      "Invoice",
      `Patient invoices retrieved - Patient: ${patientId}, Count: ${invoices.length}`,
      patientId,
      ip
    );

    res.status(200).json(invoices);
  } catch (error) {
    logEvent(
      "Invoice",
      `Get patient invoices error - Patient: ${req.params?.patientId}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all invoices
export const getAllInvoices = async (req, res) => {
  const ip = getClientIp(req);
  try {
    logEvent("Invoice", "Get all invoices initiated", req.user?._id, ip);

    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("patient");
    logEvent(
      "Invoice",
      `All invoices retrieved - Count: ${invoices.length}`,
      req.user?._id,
      ip
    );

    res.status(200).json(invoices);
  } catch (error) {
    logEvent(
      "Invoice",
      `Get all invoices error - Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new invoice
export const createInvoice = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { patientId, doctorName, appointmentDate, amount, description } =
      req.body;
    logEvent(
      "Invoice",
      `Invoice creation initiated - Patient: ${patientId}, Doctor: ${doctorName}, Amount: ${amount}, Date: ${appointmentDate}`,
      req.user?._id,
      ip
    );
    // Verify patient exists and get patient name
    const patient = await Patient.findById(patientId).populate("user");
    if (!patient) {
      logEvent(
        "Invoice",
        `Invoice creation failed - Patient ${patientId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientName = `${patient.user.firstName} ${patient.user.lastName}`;

    // Generate unique invoice ID
    const invoiceCount = await Invoice.countDocuments();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(
      invoiceCount + 1
    ).padStart(4, "0")}`;
    logEvent(
      "Invoice",
      `Invoice ID generated - Invoice ID: ${invoiceId}, Patient: ${patientId}`,
      req.user?._id,
      ip
    );

    // Create new invoice with patient reference
    const invoice = new Invoice({
      invoiceId,
      patient: patientId,
      patientName,
      doctorName,
      doctorUsername: req.body.doctorUsername || "",
      appointmentDate,
      amount: parseFloat(amount),
      description,
      status: "pending",
    });

    const savedInvoice = await invoice.save();
    logEvent(
      "Invoice",
      `Invoice created successfully - Invoice ID: ${invoiceId}, MongoDB ID: ${savedInvoice._id}, Patient: ${patientId}, Amount: ${amount}`,
      req.user?._id,
      ip
    );
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    logEvent(
      "Invoice",
      `Invoice creation error - Patient: ${req.body?.patientId}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send invoice to external billing system
export const sendInvoiceToExternal = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { id } = req.params;
    logEvent(
      "Invoice",
      `Send to external billing initiated - Invoice: ${id}`,
      req.user?._id,
      ip
    );
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      logEvent(
        "Invoice",
        `Send to external failed - Invoice ${id} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "sent";
    await invoice.save();

    logEvent(
      "Invoice",
      `Invoice sent to external billing - Invoice: ${id}, Invoice ID: ${invoice.invoiceId}, Status changed: ${previousStatus} -> sent, Patient: ${invoice.patient}, Amount: ${invoice.amount}`,
      req.user?._id,
      ip
    );

    res.status(200).json({
      success: true,
      message: "Invoice sent to external billing system successfully",
    });
  } catch (error) {
    logEvent(
      "Invoice",
      `Send to external error - Invoice: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "sent", "paid", "overdue"];
    if (!validStatuses.includes(status)) {
      logEvent(
        "Invoice",
        `Status update failed - Invalid status "${status}" for Invoice ${id}`,
        req.user?._id,
        ip
      );
      return res.status(400).json({ message: "Invalid status" });
    }
    logEvent(
      "Invoice",
      `Invoice status update initiated - Invoice: ${id}, New status: ${status}`,
      req.user?._id,
      ip
    );
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      logEvent(
        "Invoice",
        `Status update failed - Invoice ${id} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ message: "Invoice not found" });
    }

    logEvent(
      "Invoice",
      `Invoice status updated - Invoice: ${id}, Invoice ID: ${invoice.invoiceId}, Status: ${status}, Patient: ${invoice.patient}, Amount: ${invoice.amount}`,
      req.user?._id,
      ip
    );
    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    logEvent(
      "Invoice",
      `Status update error - Invoice: ${req.params?.id}, Status: ${req.body?.status}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
