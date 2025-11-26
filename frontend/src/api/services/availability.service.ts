import { apiClient } from '../client';
import {
  Availability,
  WeeklyScheduleItem,
  DoctorAvailabilityResponse,
  SearchAvailabilityResponse,
  TimeSlot
} from '../types/availability.types';

export const availabilityService = {
  // Get all availabilities for a doctor (both recurring and single)
  getDoctorAvailabilities: (doctorId: string) =>
    apiClient.get<{
      availabilities: Availability[];
    }>(`/availability/doctor/${doctorId}/all`),

  // Set recurring availability for a doctor
  setRecurring: (doctorId: string, weeklySchedule: WeeklyScheduleItem[]) =>
    apiClient.post<{
      message: string;
      availabilities: Availability[];
    }>(`/availability/doctor/${doctorId}/recurring`, { weeklySchedule }),

  // Set availability for a specific date
  setForDate: (doctorId: string, date: string, timeSlots: TimeSlot[]) =>
    apiClient.post<{
      message: string;
      availability?: Availability;
      date: string;
    }>(`/availability/doctor/${doctorId}/date`, { date, timeSlots }),

  // Remove availability for a specific date (blocks the date)
  removeForDate: (doctorId: string, date: string) =>
    apiClient.post<{
      message: string;
      date: string;
    }>(`/availability/doctor/${doctorId}/remove-date`, { date }),

  // Remove a specific time slot
  removeTimeSlot: (availabilityId: string, slotIndex: number) =>
    apiClient.delete<{
      message: string;
      availability: Availability;
    }>(`/availability/${availabilityId}/slot/${slotIndex}`),

  // Get doctor's availability for a specific date
  getForDate: (doctorId: string, date: string) =>
    apiClient.get<DoctorAvailabilityResponse>(
      `/availability/doctor/${doctorId}?date=${date}`
    ),

  // Get doctor's availability for a date range (for calendar display)
  getForDateRange: (doctorId: string, startDate: string, endDate: string) =>
    apiClient.get<{
      dates: Array<{
        date: string;
        available: boolean;
        timeSlots: TimeSlot[];
      }>;
    }>(`/availability/doctor/${doctorId}/range?startDate=${startDate}&endDate=${endDate}`),

  // Search doctors by date/time availability
  searchByDateTime: (params: { date?: string; name?: string; time?: string }) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.name) query.append('name', params.name);
    if (params.time) query.append('time', params.time);
    
    return apiClient.get<SearchAvailabilityResponse>(
      `/availability/search?${query.toString()}`
    );
  },
};