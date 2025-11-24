import { User } from "./user.types";

export interface FinanceMember {
  _id: string;
  user: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFinanceMemberData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  gender?: string;
  password: string;
  phoneNumber?: string;
  profilePic?: string;
}

// Invoice types
// api/types/finance.types.ts

export interface Invoice {
  _id: string;
  patient: string;
  patientName: string;
  doctorName: string;
  doctorUsername: string;
  appointmentDate: string;
  amount: number;
  description: string;
  status: "pending" | "sent" | "paid" | "overdue";
  createdAt: string;
}

export interface CreateInvoiceData {
  patientId: string;
  doctorName: string;
  appointmentDate: string;
  amount: string;
  description: string;
}

// Report types
export interface BillingReport {
  _id: string;
  reportId: string;
  reportType: string;
  dateRange: string;
  generatedDate: string;
  totalRevenue?: number;
  outstandingReceivables?: number;
  paymentCollectionRate?: number;
  status?: string;
  summary?: string;
}

export interface GenerateReportData {
  reportType: string;
  dateRange: {
    start: string;
    end: string;
  };
}