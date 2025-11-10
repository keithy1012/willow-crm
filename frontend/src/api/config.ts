export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
};