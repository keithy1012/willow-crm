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
  
  getById: (id: string) => 
    apiClient.get<Patient>(`/patients/${id}`),
  
  update: (id: string, data: Partial<Patient>) => 
    apiClient.put<Patient>(`/patients/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/patients/${id}`),
  
  getInsuranceCards: (userId: string) => 
    apiClient.get<InsuranceCards>(`/patients/${userId}/insuranceCards`),
};