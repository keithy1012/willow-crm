import { apiClient } from '../client';
import { User, UserSearchResult } from '../types/user.types';

export const userService = {
  // Get current authenticated user
  getCurrentUser: () => 
    apiClient.get<{ success: boolean; user: User }>('/users/me'),

  // Check if email exists
  checkEmail: (email: string) => 
    apiClient.get<{ exists: boolean }>(`/users/email-check?email=${email}`),

  // Search users
  search: (query: string) => 
    apiClient.get<{ 
      success: boolean; 
      count: number; 
      users: UserSearchResult[] 
    }>(`/users/search?query=${query}`),

  // Search users by role
  searchByRole: (role: string, query?: string) => {
    const params = new URLSearchParams({ role });
    if (query) params.append('query', query);
    return apiClient.get<{
      success: boolean;
      count: number;
      users: UserSearchResult[];
    }>(`/users/search/role?${params}`);
  },

  // Get user by ID
  getById: (id: string) => 
    apiClient.get<{ success: boolean; user: User }>(`/users/${id}`),
};