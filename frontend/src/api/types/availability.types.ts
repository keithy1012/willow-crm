import { Doctor } from './doctor.types';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  startTime: string; // Format: "09:00"
  endTime: string;   // Format: "17:00"
  isBooked: boolean;
  appointmentId?: string;
}

export interface Availability {
  _id?: string;
  doctor: string;
  type: 'Recurring' | 'Single';
  dayOfWeek?: DayOfWeek;
  date?: Date | string;
  timeSlots: TimeSlot[];
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface WeeklyScheduleItem {
  dayOfWeek: DayOfWeek;
  timeSlots: TimeSlot[];
}

export interface DoctorAvailabilityResponse {
  date: string;
  dayOfWeek: string;
  available: boolean;
  type?: 'Recurring' | 'Single';
  timeSlots: TimeSlot[];
}

export interface AvailableDoctorResult {
  doctor: Doctor;
  availabilityType: 'Recurring' | 'Single';
  timeSlots: TimeSlot[];
}

export interface SearchAvailabilityResponse {
  date?: string;
  dayOfWeek?: string;
  nameFilter?: string;
  count: number;
  doctors: AvailableDoctorResult[];
}