import { apiClient } from '../client';
import { ITMember, CreateITMemberData } from '../types/it.types';
import { AuthResponse } from '../types/user.types';

export const itService = {
  // Create new IT member
  create: (data: CreateITMemberData) => 
    apiClient.post<AuthResponse & { itMember: ITMember }>('/itMembers', data),

  // Get all IT members
  getAll: () => 
    apiClient.get<ITMember[]>('/itMembers'),

  // Get IT member by ID
  getById: (id: string) => 
    apiClient.get<ITMember>(`/itMembers/${id}`),

  // Update IT member by ID
  update: (id: string, data: Partial<CreateITMemberData>) => 
    apiClient.put<{ message: string; user: any }>(`/itMembers/${id}`, data),

  // Delete IT member by ID
  delete: (id: string) => 
    apiClient.delete<{ message: string }>(`/itMembers/${id}`),
};