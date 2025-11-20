// controllers/finances/invoiceController.js
import Invoice from "../../models/finance/Invoice.js";
import Patient from "../../models/patients/Patient.js";

// Get invoices for a specific patient
export const getPatientInvoices = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const invoices = await Invoice.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate("patient");
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching patient invoices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("patient");
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new invoice
export const createInvoice = async (req, res) => {
  try {
    const {
      patientId,
      doctorName,
      appointmentDate,
      amount,
      description,
    } = req.body;

    // Verify patient exists and get patient name
    const patient = await Patient.findById(patientId).populate("user");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientName = `${patient.user.firstName} ${patient.user.lastName}`;

    // Generate unique invoice ID
    const invoiceCount = await Invoice.countDocuments();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(
      invoiceCount + 1
    ).padStart(4, "0")}`;

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

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send invoice to external billing system
export const sendInvoiceToExternal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "sent";
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice sent to external billing system successfully",
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "sent", "paid", "overdue"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};