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