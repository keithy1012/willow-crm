import { apiClient } from '../client';
import { FinanceMember, CreateFinanceMemberData, CreateInvoiceData, Invoice, BillingReport, GenerateReportData } from '../types/finance.types';
import { AuthResponse } from '../types/user.types';

export const financeService = {
  // ===== Finance Member Management =====
  create: (data: CreateFinanceMemberData) => 
    apiClient.post<AuthResponse & { financeMember: FinanceMember }>('/financeMembers', data),

  getAll: () => 
    apiClient.get<FinanceMember[]>('/financeMembers'),

  getById: (id: string) => 
    apiClient.get<FinanceMember>(`/financeMembers/${id}`),

  update: (id: string, data: Partial<CreateFinanceMemberData>) => 
    apiClient.put<{ message: string; user: any }>(`/financeMembers/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<{ message: string }>(`/financeMembers/${id}`),

  // ===== Invoice Management =====
  getPatientInvoices: (patientId: string) =>
    apiClient.get<Invoice[]>(`/financeMembers/patients/${patientId}/invoices`),

  getAllInvoices: () =>
    apiClient.get<Invoice[]>('/financeMembers/invoices'),

  createInvoice: (data: CreateInvoiceData) =>
    apiClient.post<{ message: string; invoice: Invoice }>('/financeMembers/invoices/create', data),

  sendInvoiceToExternal: (invoiceId: string) =>
    apiClient.post<{ message: string }>(`/financeMembers/invoices/${invoiceId}/send`),

  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) =>
    apiClient.patch<{ message: string; invoice: Invoice }>(`/financeMembers/invoices/${invoiceId}/status`, { status }),

  // ===== Reports Management =====
  getRecentReports: (): Promise<BillingReport[]> =>
    apiClient.get<BillingReport[]>('/financeMembers/reports/recent'),

  getReportById: (reportId: string): Promise<BillingReport> =>
    apiClient.get<BillingReport>(`/financeMembers/reports/${reportId}`),

  exportReport: async (reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> => {
    const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5050/api'}/financeMembers/reports/${reportId}/export?format=${format}`;
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user?.token || localStorage.getItem("token") || "";
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    
    return response.blob();
  },

  generateReport: (data: GenerateReportData) =>
    apiClient.post<{ message: string; report: BillingReport }>('/financeMembers/reports/generate', data),
};