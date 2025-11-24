import { apiClient } from '../client';

export interface BookAppointmentData {
  doctorId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  summary?: string;
}

export const appointmentService = {
  // Book an appointment
  book: (data: BookAppointmentData) =>
    apiClient.post('/appointments/book', data),

  // Cancel an appointment
  cancel: (appointmentId: string) =>
    apiClient.put(`/appointments/${appointmentId}/cancel`),

  // Get doctor's appointments
  getDoctorAppointments: (doctorId: string, date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiClient.get(`/appointments/doctor/${doctorId}${query}`);
  },

  // Get patient's appointments
  getPatientAppointments: (patientId: string, upcoming?: boolean) => {
    const query = upcoming ? '?upcoming=true' : '';
    return apiClient.get(`/appointments/patient/${patientId}${query}`);
  },

  // Update appointment status
  updateStatus: (appointmentId: string, status: string) =>
    apiClient.put(`/appointments/${appointmentId}/status`, { status }),
};