import BillingReport from "../../models/finance/BillingReport.js";
import Invoice from "../../models/finance/Invoice.js";
import PDFDocument from "pdfkit";
import { createObjectCsvWriter } from "csv-writer";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { logEvent } from "../../utils/logger.js";

// Get recent reports
export const getRecentReports = async (req, res) => {
  try {
    logEvent("BillingReport", "Get recent reports initiated");

    // Query using BillingReport model
    const reports = await BillingReport.find()
      .sort({ generatedDate: -1 })
      .limit(20);
    logEvent(
      "BillingReport",
      `Recent reports retrieved - Count: ${reports.length}`
    );
    res.status(200).json(reports);
  } catch (error) {
    logEvent(
      "BillingReport",
      `Get recent reports error - Error: ${error.message}`
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    logEvent("BillingReport", `Get report by ID - Report: ${id}`);

    // Find using BillingReport model
    const report = await BillingReport.findById(id);

    if (!report) {
      logEvent("BillingReport", `Get report failed - Report ${id} not found`);
      return res.status(404).json({ message: "Report not found" });
    }

    logEvent(
      "BillingReport",
      `Report retrieved - Report: ${id}, Report ID: ${report.reportId}, Type: ${report.reportType}`
    );
    res.status(200).json(report);
  } catch (error) {
    logEvent(
      "BillingReport",
      `Get report error - Report: ${req.params?.id}, Error: ${error.message}`
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export report
export const exportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    logEvent(
      "BillingReport",
      `Export report initiated - Report: ${id}, Format: ${format}`,
      req.user?._id
    );
    const report = await BillingReport.findById(id);
    if (!report) {
      logEvent(
        "BillingReport",
        `Export failed - Report ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ message: "Report not found" });
    }

    const validFormats = ["pdf", "csv", "xlsx"];
    if (!validFormats.includes(format)) {
      logEvent(
        "BillingReport",
        `Export failed - Invalid format "${format}" for Report ${id}`,
        req.user?._id
      );
      return res.status(400).json({ message: "Invalid format" });
    }
    logEvent(
      "BillingReport",
      `Exporting report - Report: ${id}, Report ID: ${report.reportId}, Format: ${format}, Type: ${report.reportType}`,
      req.user?._id
    );
    switch (format) {
      case "pdf":
        return exportAsPDF(report, res, req.user?._id);
      case "csv":
        return exportAsCSV(report, res, req.user?._id);
      case "xlsx":
        return exportAsXLSX(report, res, req.user?._id);
      default:
        return res.status(400).json({ message: "Invalid format" });
    }
  } catch (error) {
    logEvent(
      "BillingReport",
      `Export error - Report: ${req.params?.id}, Format: ${req.query?.format}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate new report
export const generateReport = async (req, res) => {
  try {
    const { reportType, dateRange } = req.body;
    logEvent(
      "BillingReport",
      `Report generation initiated - Type: ${reportType}, Range: ${dateRange?.start} to ${dateRange?.end}`,
      req.user?._id
    );
    // Generate unique report ID
    const reportCount = await BillingReport.countDocuments();
    const reportId = `RPT-${new Date().getFullYear()}-${String(
      reportCount + 1
    ).padStart(4, "0")}`;

    logEvent(
      "BillingReport",
      `Report ID generated - Report ID: ${reportId}, Type: ${reportType}`,
      req.user?._id
    );
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
        reportData.outstandingReceivables =
          await calculateOutstandingReceivables();
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(
          dateRange
        );
        reportData.summary = `${reportType} report for ${dateRange.start} to ${
          dateRange.end
        }. Total revenue: $${reportData.totalRevenue.toLocaleString()}`;
        logEvent(
          "BillingReport",
          `Revenue metrics calculated - Report ID: ${reportId}, Revenue: $${reportData.totalRevenue}, Outstanding: $${reportData.outstandingReceivables}, Collection Rate: ${reportData.paymentCollectionRate}%`,
          req.user?._id
        );
        break;

      case "aging-report":
        reportData.outstandingReceivables =
          await calculateOutstandingReceivables();
        reportData.summary = `Aging analysis of unpaid invoices as of ${
          reportData.generatedDate
        }. Total outstanding: $${reportData.outstandingReceivables.toLocaleString()}`;
        logEvent(
          "BillingReport",
          `Aging metrics calculated - Report ID: ${reportId}, Outstanding: $${reportData.outstandingReceivables}`,
          req.user?._id
        );
        break;

      case "collection-rate":
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(
          dateRange
        );
        reportData.totalRevenue = await calculateTotalRevenue(dateRange);
        reportData.summary = `Payment collection efficiency for ${dateRange.start} to ${dateRange.end}. Collection rate: ${reportData.paymentCollectionRate}%`;
        logEvent(
          "BillingReport",
          `Collection metrics calculated - Report ID: ${reportId}, Collection Rate: ${reportData.paymentCollectionRate}%, Revenue: $${reportData.totalRevenue}`,
          req.user?._id
        );

        break;

      case "outstanding-receivables":
        reportData.outstandingReceivables =
          await calculateOutstandingReceivables();
        reportData.summary = `Total outstanding receivables as of ${
          reportData.generatedDate
        }: $${reportData.outstandingReceivables.toLocaleString()}`;
        logEvent(
          "BillingReport",
          `Receivables metrics calculated - Report ID: ${reportId}, Outstanding: $${reportData.outstandingReceivables}`,
          req.user?._id
        );
        break;

      default:
        reportData.totalRevenue = await calculateTotalRevenue(dateRange);
        reportData.outstandingReceivables =
          await calculateOutstandingReceivables();
        reportData.paymentCollectionRate = await calculatePaymentCollectionRate(
          dateRange
        );
        reportData.summary = `Financial report for ${dateRange.start} to ${dateRange.end}`;
        logEvent(
          "BillingReport",
          `General metrics calculated - Report ID: ${reportId}, Revenue: $${reportData.totalRevenue}, Outstanding: $${reportData.outstandingReceivables}, Collection Rate: ${reportData.paymentCollectionRate}%`,
          req.user?._id
        );
    }

    const report = new BillingReport(reportData);
    const savedReport = await report.save();
    logEvent(
      "BillingReport",
      `Report generated successfully - Report ID: ${reportId}, MongoDB ID: ${
        savedReport._id
      }, Type: ${reportType}, Revenue: $${
        reportData.totalRevenue || 0
      }, Outstanding: $${reportData.outstandingReceivables || 0}`,
      req.user?._id
    );
    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      report: savedReport,
    });
  } catch (error) {
    logEvent(
      "BillingReport",
      `Report generation error - Type: ${req.body?.reportType}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: Export as PDF
function exportAsPDF(report, res, userId) {
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
  logEvent(
    "BillingReport",
    `Report exported as PDF - Report ID: ${report.reportId}, Filename: ${filename}`,
    userId
  );
}

// Helper: Export as CSV
async function exportAsCSV(report, res, userId) {
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

  logEvent(
    "BillingReport",
    `Report exported as CSV - Report ID: ${report.reportId}, Filename: ${filename}`,
    userId
  );
}

// Helper: Export as XLSX
function exportAsXLSX(report, res, userId) {
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
  worksheet["!cols"] = [
    { wch: 25 }, // Field column
    { wch: 50 }, // Value column
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

  logEvent(
    "BillingReport",
    `Report exported as XLSX - Report ID: ${report.reportId}, Filename: ${filename}`,
    userId
  );
}

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

    const total = invoices.reduce(
      (total, invoice) => total + invoice.amount,
      0
    );

    logEvent(
      "BillingReport",
      `Total revenue calculated - Range: ${dateRange.start} to ${dateRange.end}, Invoices: ${invoices.length}, Total: $${total}`
    );

    return total;
  } catch (error) {
    logEvent(
      "BillingReport",
      `Total revenue calculation error - Range: ${dateRange?.start} to ${dateRange?.end}, Error: ${error.message}`
    );
    return 0;
  }
}

// Helper function using Invoice model
async function calculateOutstandingReceivables() {
  try {
    const invoices = await Invoice.find({
      status: { $in: ["pending", "sent", "overdue"] },
    });

    const total = invoices.reduce(
      (total, invoice) => total + invoice.amount,
      0
    );

    logEvent(
      "BillingReport",
      `Outstanding receivables calculated - Invoices: ${invoices.length}, Total: $${total}`
    );

    return total;
  } catch (error) {
    logEvent(
      "BillingReport",
      `Outstanding receivables calculation error - Error: ${error.message}`
    );
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

    if (allInvoices.length === 0) {
      logEvent(
        "BillingReport",
        `Payment collection rate calculated - Range: ${dateRange.start} to ${dateRange.end}, No invoices found, Rate: 0%`
      );
      return 0;
    }

    const rate = Math.round((paidInvoices.length / allInvoices.length) * 100);

    logEvent(
      "BillingReport",
      `Payment collection rate calculated - Range: ${dateRange.start} to ${dateRange.end}, Total: ${allInvoices.length}, Paid: ${paidInvoices.length}, Rate: ${rate}%`
    );

    return rate;
  } catch (error) {
    logEvent(
      "BillingReport",
      `Payment collection rate calculation error - Range: ${dateRange?.start} to ${dateRange?.end}, Error: ${error.message}`
    );
    return 0;
  }
}
