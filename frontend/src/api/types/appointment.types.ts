import { Patient } from './patient.types';
import { Doctor } from './doctor.types';

export interface Appointment {
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

export interface EnhancedAppointment {
  _id: string;
  appointmentID: string;
  patientID: string;
  doctorID: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  patient?: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePic?: string;
    dateOfBirth?: string;
    medicalRecordNumber?: string;
  };
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