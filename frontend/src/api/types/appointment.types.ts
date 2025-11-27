import { Patient } from './patient.types';
import { Doctor } from './doctor.types';

// Document interface for PDF uploads
export interface AppointmentDocument {
  afterVisitSummary?: string;
  afterVisitSummaryName?: string;
  afterVisitSummaryUploadDate?: string | Date;
  notesAndInstructions?: string;
  notesAndInstructionsName?: string;
  notesAndInstructionsUploadDate?: string | Date;
  hasAfterVisitSummary?: boolean;
  hasNotesAndInstructions?: boolean;
}

// Update base Appointment interface to include document fields
export interface Appointment extends AppointmentDocument {
  _id: string;
  appointmentID: string;
  patientID: string | Patient;  
  doctorID: string | Doctor;    
  summary?: string;
  startTime: Date | string;
  endTime: Date | string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'In-Progress';
  createdAt?: string;
  updatedAt?: string;
}

// Update EnhancedAppointment to include document fields
export interface EnhancedAppointment extends AppointmentDocument {
  _id: string;
  appointmentID: string;
  patientID: Patient;
  doctorID: Doctor;   
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  notes?: string;
  appointmentReason?: string;
  insuranceVerified?: boolean;
  copayAmount?: number;
  reminderSent?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PopulatedAppointment extends Omit<Appointment, 'patientID' | 'doctorID'> {
  patientID: Patient;
  doctorID: Doctor;
}

export interface CreateAppointmentDto {
  patientID: string;
  doctorID: string;
  summary?: string;
  startTime: Date | string;
  endTime: Date | string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'In-Progress';
}

export interface UpdateAppointmentDto {
  summary?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'In-Progress';
}

export interface BookAppointmentData {
  doctorId: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  summary?: string;
  notes?: string;
  symptoms?: string[];
  duration?: number;
  isEmergency?: boolean;
  patientEmail?: string;
  doctorEmail?: string;
}

// New type for document notification
export interface DocumentNotification {
  documentType: 'afterVisitSummary' | 'notesAndInstructions';
  patientEmail?: string;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
}