// models/finance/BillingReport.js
import mongoose from "mongoose";

const billingReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    reportType: {
      type: String,
      required: true,
    },
    dateRange: {
      type: String,
      required: true,
    },
    generatedDate: {
      type: String,
      required: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    outstandingReceivables: {
      type: Number,
      default: 0,
    },
    paymentCollectionRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "completed",
    },
    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const BillingReport = mongoose.model("BillingReport", billingReportSchema);
export default BillingReport;