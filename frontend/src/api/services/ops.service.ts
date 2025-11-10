import { apiClient } from '../client';
import { OpsMember, CreateOpsMemberData } from '../types/ops.types';
import { AuthResponse } from '../types/user.types';

export const opsService = {
  // Create new Ops member
  create: (data: CreateOpsMemberData) => 
    apiClient.post<AuthResponse & { opsMember: OpsMember }>('/opsMembers', data),

  // Get all Ops members
  getAll: () => 
    apiClient.get<OpsMember[]>('/opsMembers'),

  // Get Ops member by user ID
  getByUserId: (userId: string) => 
    apiClient.get<OpsMember>(`/opsMembers/${userId}`),

  // Update Ops member by user ID
  updateByUserId: (userId: string, data: Partial<CreateOpsMemberData>) => 
    apiClient.put<{ user: any }>(`/opsMembers/${userId}`, data),

  // Delete Ops member by user ID
  deleteByUserId: (userId: string) => 
    apiClient.delete<{ message: string }>(`/opsMembers/${userId}`),
};