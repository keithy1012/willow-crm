import { apiClient } from '../client';
import { Doctor, DoctorSearchResult } from '../types/doctor.types';

export const doctorService = {
  // Get all doctors
  getAll: () => 
    apiClient.get<Doctor[]>('/doctors'),
  
  // Get doctors by speciality
  getBySpeciality: (speciality: string) => 
    apiClient.get<Doctor[]>(`/doctors/speciality/${speciality}`),
  
  // Search doctors by name only (different from availability search)
  searchByName: (name: string) => 
    apiClient.get<{
      searchTerm: string;
      count: number;
      doctors: DoctorSearchResult[];
    }>(`/doctors/search?name=${name}`),

  getByUserId: (userId: string) =>
    apiClient.get<Doctor>(`/doctors/user/${userId}`),
};