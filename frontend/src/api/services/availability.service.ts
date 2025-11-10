import { apiClient } from '../client';
import {
  WeeklyScheduleItem,
  DoctorAvailabilityResponse,
  SearchAvailabilityResponse,
  TimeSlot
} from '../types/availability.types';

export const availabilityService = {
  // Set recurring availability for a doctor
  setRecurring: (doctorId: string, weeklySchedule: WeeklyScheduleItem[]) =>
    apiClient.post(`/availability/doctor/${doctorId}/recurring`, { weeklySchedule }),

  // Set availability for a specific date
  setForDate: (doctorId: string, date: string, timeSlots: TimeSlot[]) =>
    apiClient.post(`/availability/doctor/${doctorId}/date`, { date, timeSlots }),

  // Remove availability for a specific date
  removeForDate: (doctorId: string, date: string) =>
    apiClient.delete(`/availability/doctor/${doctorId}/date`, { date }),

  // Remove a specific time slot
  removeTimeSlot: (availabilityId: string, slotIndex: number) =>
    apiClient.delete(`/availability/slot/${availabilityId}/${slotIndex}`),

  // Get doctor's availability for a specific date
  getDoctorForDate: (doctorId: string, date: string) =>
    apiClient.get<DoctorAvailabilityResponse>(
      `/availability/doctor/${doctorId}?date=${date}`
    ),

  // Search doctors by date/time availability
  searchByDateTime: (params: { date?: string; name?: string }) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.name) query.append('name', params.name);
    
    return apiClient.get<SearchAvailabilityResponse>(
      `/availability/search?${query.toString()}`
    );
  },
};