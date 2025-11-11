// controllers/finances/reportController.js
import BillingReport from "../../models/finance/BillingReport.js";
import Invoice from "../../models/finance/Invoice.js";
import PDFDocument from "pdfkit";
import { createObjectCsvWriter } from "csv-writer";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Get recent reports
export const getRecentReports = async (req, res) => {
  try {
    // Query using BillingReport model
    const reports = await BillingReport.find()
      .sort({ generatedDate: -1 })
      .limit(20);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find using BillingReport model
    const report = await BillingReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export report
export const exportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    const report = await BillingReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const validFormats = ["pdf", "csv", "xlsx"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    switch (format) {
      case "pdf":
        return exportAsPDF(report, res);
      case "csv":
        return exportAsCSV(report, res);
      case "xlsx":
        return exportAsXLSX(report, res);
      default:
        return res.status(400).json({ message: "Invalid format" });
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate new report
export const generateReport = async (req, res) => {
  try {
    const { reportType, dateRange } = req.body;

    // Generate unique report ID
    const reportCount = await BillingReport.countDocuments();
    const reportId = `RPT-${new Date().getFullYear()}-${String(
      reportCount + 1
    ).padStart(4, "0")}`;

    let reportData = {
      reportId,
      reportType,
      dateRange: `${dateRange.start} to ${dateRange.end}`,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "completed",
    };

    // Generate different metrics based on report type
    switch (reportType) {
      case "monthly-revenue":
      case "quarterly-summary":
        reportData.totalRevenue = await calculateTotalRevenue(dateRange);
        reportData.outstandingReceivables = await calculateOutstandingReceivables();
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(dateRange);
        reportData.summary = `${reportType} report for ${dateRange.start} to ${dateRange.end}. Total revenue: $${reportData.totalRevenue.toLocaleString()}`;
        break;

      case "aging-report":
        reportData.outstandingReceivables = await calculateOutstandingReceivables();
        reportData.summary = `Aging analysis of unpaid invoices as of ${reportData.generatedDate}. Total outstanding: $${reportData.outstandingReceivables.toLocaleString()}`;
        break;

      case "collection-rate":
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(dateRange);
        reportData.totalRevenue = await calculateTotalRevenue(dateRange);
        reportData.summary = `Payment collection efficiency for ${dateRange.start} to ${dateRange.end}. Collection rate: ${reportData.paymentCollectionRate}%`;
        break;

      case "outstanding-receivables":
        reportData.outstandingReceivables = await calculateOutstandingReceivables();
        reportData.summary = `Total outstanding receivables as of ${reportData.generatedDate}: $${reportData.outstandingReceivables.toLocaleString()}`;
        break;

      default:
        reportData.totalRevenue = await calculateTotalRevenue(dateRange);
        reportData.outstandingReceivables = await calculateOutstandingReceivables();
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(dateRange);
        reportData.summary = `Financial report for ${dateRange.start} to ${dateRange.end}`;
    }

    const report = new BillingReport(reportData);
    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      report: savedReport,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== Helper Functions for Export =====

// Helper: Export as PDF
function exportAsPDF(report, res) {
  const doc = new PDFDocument();
  const filename = `report_${report.reportId}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Add content to PDF
  doc.fontSize(24).text("Billing Report", { align: "center" });
  doc.moveDown();
  
  doc.fontSize(14).text(`Report ID: ${report.reportId}`, { bold: true });
  doc.fontSize(12).text(`Report Type: ${report.reportType}`);
  doc.text(`Date Range: ${report.dateRange}`);
  doc.text(`Generated: ${report.generatedDate}`);
  doc.text(`Status: ${report.status || "Completed"}`);
  doc.moveDown();

  // Financial Metrics Section
  doc.fontSize(14).text("Financial Metrics", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);

  if (report.totalRevenue !== undefined) {
    doc.text(`Total Revenue: $${report.totalRevenue.toLocaleString()}`);
  }
  if (report.outstandingReceivables !== undefined) {
    doc.text(
      `Outstanding Receivables: $${report.outstandingReceivables.toLocaleString()}`
    );
  }
  if (report.paymentCollectionRate !== undefined) {
    doc.text(`Collection Rate: ${report.paymentCollectionRate}%`);
  }

  if (report.summary) {
    doc.moveDown();
    doc.fontSize(14).text("Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(report.summary, { align: "left" });
  }

  doc.end();
}

// Helper: Export as CSV
async function exportAsCSV(report, res) {
  const filename = `report_${report.reportId}.csv`;
  const filepath = path.join(process.cwd(), "temp", filename);

  // Ensure temp directory exists
  if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
    fs.mkdirSync(path.join(process.cwd(), "temp"));
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: "field", title: "Field" },
      { id: "value", title: "Value" },
    ],
  });

  const records = [
    { field: "Report ID", value: report.reportId },
    { field: "Report Type", value: report.reportType },
    { field: "Date Range", value: report.dateRange },
    { field: "Generated Date", value: report.generatedDate },
    { field: "Status", value: report.status || "Completed" },
  ];

  if (report.totalRevenue !== undefined) {
    records.push({
      field: "Total Revenue",
      value: `$${report.totalRevenue.toLocaleString()}`,
    });
  }
  if (report.outstandingReceivables !== undefined) {
    records.push({
      field: "Outstanding Receivables",
      value: `$${report.outstandingReceivables.toLocaleString()}`,
    });
  }
  if (report.paymentCollectionRate !== undefined) {
    records.push({
      field: "Collection Rate",
      value: `${report.paymentCollectionRate}%`,
    });
  }
  if (report.summary) {
    records.push({ field: "Summary", value: report.summary });
  }

  await csvWriter.writeRecords(records);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);
  fileStream.on("end", () => {
    fs.unlinkSync(filepath); // Clean up temp file
  });
}

// Helper: Export as XLSX
function exportAsXLSX(report, res) {
  const filename = `report_${report.reportId}.xlsx`;

  const data = [
    ["Field", "Value"],
    ["Report ID", report.reportId],
    ["Report Type", report.reportType],
    ["Date Range", report.dateRange],
    ["Generated Date", report.generatedDate],
    ["Status", report.status || "Completed"],
  ];

  if (report.totalRevenue !== undefined) {
    data.push(["Total Revenue", `$${report.totalRevenue.toLocaleString()}`]);
  }
  if (report.outstandingReceivables !== undefined) {
    data.push([
      "Outstanding Receivables",
      `$${report.outstandingReceivables.toLocaleString()}`,
    ]);
  }
  if (report.paymentCollectionRate !== undefined) {
    data.push(["Collection Rate", `${report.paymentCollectionRate}%`]);
  }
  if (report.summary) {
    data.push(["Summary", report.summary]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Field column
    { wch: 50 }  // Value column
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  res.send(buffer);
}

// ===== Helper Functions for Calculations =====

// Helper function using Invoice model
async function calculateTotalRevenue(dateRange) {
  try {
    const invoices = await Invoice.find({
      appointmentDate: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end),
      },
      status: "paid",
    });

    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    return 0;
  }
}

// Helper function using Invoice model
async function calculateOutstandingReceivables() {
  try {
    const invoices = await Invoice.find({
      status: { $in: ["pending", "sent", "overdue"] },
    });

    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  } catch (error) {
    console.error("Error calculating outstanding receivables:", error);
    return 0;
  }
}

// Helper function using Invoice model
async function calculatePaymentCollectionRate(dateRange) {
  try {
    const allInvoices = await Invoice.find({
      appointmentDate: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end),
      },
    });

    const paidInvoices = allInvoices.filter(
      (invoice) => invoice.status === "paid"
    );

    if (allInvoices.length === 0) return 0;

    return Math.round((paidInvoices.length / allInvoices.length) * 100);
  } catch (error) {
    console.error("Error calculating payment collection rate:", error);
    return 0;
  }
}