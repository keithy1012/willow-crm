import { AppointmentDocument } from 'api/types/appointment.types';
import { apiClient } from '../client';

export interface BookAppointmentData {
  doctorId: string;
  patientId: string;
  date: string;        // YYYY-MM-DD format
  startTime: string;   // HH:MM format (24-hour)
  endTime: string;     // HH:MM format (24-hour)
  summary?: string;
  notes?: string;
  symptoms?: string[];
  duration?: number;   // in minutes
  isEmergency?: boolean;
  patientEmail?: string;
  doctorEmail?: string;
}

export const appointmentService = {
  // Book an appointment
  book: (data: BookAppointmentData) =>
    apiClient.post('/appointments/book', data),

  // Cancel an appointment
  cancel: (appointmentId: string) =>
    apiClient.put(`/appointments/${appointmentId}/cancel`),

  // Get doctor's appointments
  getDoctorAppointments: (doctorId: string, date?: string, status?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/appointments/doctor/${doctorId}${query}`);
  },

  // Get patient's appointments
  getPatientAppointments: (patientId: string, upcoming?: boolean) => {
    const query = upcoming ? '?upcoming=true' : '';
    return apiClient.get(`/appointments/patient/${patientId}${query}`);
  },

  // Update appointment status
  updateStatus: (appointmentId: string, status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'In-Progress') =>
    apiClient.put(`/appointments/${appointmentId}/status`, { status }),

  // Get appointment by ID
  getAppointmentById: (appointmentId: string) =>
    apiClient.get(`/appointments/${appointmentId}?includeDocuments=true`),

  // Test email service (if you have this endpoint)
  testEmail: (data: any) =>
    apiClient.post('/appointments/test-email', data),

    updateAppointmentDocuments: (appointmentId: string, documents: AppointmentDocument) =>
    apiClient.put(`/appointments/${appointmentId}/documents`, documents),

  // Get appointment documents
  getAppointmentDocuments: (appointmentId: string) =>
    apiClient.get(`/appointments/${appointmentId}/documents`),

  // Notify patient when document is uploaded
  notifyPatientOfDocument: (appointmentId: string, notification: {
    documentType: 'afterVisitSummary' | 'notesAndInstructions';
    patientEmail?: string;
    patientName?: string;
    doctorName?: string;
    appointmentDate?: string;
  }) =>
    apiClient.post(`/appointments/${appointmentId}/notify-document`, notification),

  // Download specific document
  downloadDocument: (appointmentId: string, documentType: 'afterVisitSummary' | 'notesAndInstructions') =>
    apiClient.get(`/appointments/${appointmentId}/documents/${documentType}`),

  cancelWithReason: async (
    appointmentId: string, 
    reason: string, 
    cancelledBy: "patient" | "doctor"
  ) => {
    return await apiClient.post(
      `/appointments/${appointmentId}/cancel-with-reason`,
      { reason, cancelledBy }
    );
  },

  // Mark as no-show with reason
  markNoShowWithReason: async (appointmentId: string, reason: string) => {
    return await apiClient.post(
      `/appointments/${appointmentId}/no-show-with-reason`,
      { reason }
    );
  },
};
