import { apiClient } from '../client';

interface Patient {
  _id: string;
  user: string;
  birthday: Date;
  address: string;
  bloodtype: string;
  allergies: string[];
  medicalHistory: string[];
  insuranceCardFront?: string;
  insuranceCardBack?: string;
}

interface InsuranceCards {
  insuranceCardFront: string | null;
  insuranceCardBack: string | null;
}

export const patientService = {
  create: (data: any) => 
    apiClient.post<any>('/patients', data),
  
  getAll: () => 
    apiClient.get<Patient[]>('/patients'),
  
  // Get by User ID (original)
  getById: (id: string) => 
    apiClient.get<Patient>(`/patients/${id}`),
  
  // NEW: Get by Patient ID
  getByPatientId: (patientId: string) => 
    apiClient.get<Patient>(`/patients/patient/${patientId}`),
  
  update: (id: string, data: Partial<Patient>) => 
    apiClient.put<Patient>(`/patients/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/patients/${id}`),
  
  getInsuranceCards: (userId: string) => 
    apiClient.get<InsuranceCards>(`/patients/${userId}/insuranceCards`),

  searchByName: (name: string) =>
    apiClient.get<{ 
      searchTerm: string; 
      count: number; 
      patients: any[] 
    }>(`/patients/search?name=${encodeURIComponent(name)}`),
};