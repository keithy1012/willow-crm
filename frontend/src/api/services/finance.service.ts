import { apiClient } from '../client';
import { FinanceMember, CreateFinanceMemberData } from '../types/finance.types';
import { AuthResponse } from '../types/user.types';

export const financeService = {
  // Create new Finance member
  create: (data: CreateFinanceMemberData) => 
    apiClient.post<AuthResponse & { financeMember: FinanceMember }>('/financeMembers', data),

  // Get all Finance members
  getAll: () => 
    apiClient.get<FinanceMember[]>('/financeMembers'),

  // Get Finance member by ID
  getById: (id: string) => 
    apiClient.get<FinanceMember>(`/financeMembers/${id}`),

  // Update Finance member by ID
  update: (id: string, data: Partial<CreateFinanceMemberData>) => 
    apiClient.put<{ message: string; user: any }>(`/financeMembers/${id}`, data),

  // Delete Finance member by ID
  delete: (id: string) => 
    apiClient.delete<{ message: string }>(`/financeMembers/${id}`),
};