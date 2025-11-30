export type UserRole = 'Doctor' | 'Patient' | 'Ops' | 'IT' | 'Finance';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  _id: string;
  userID?: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  gender?: Gender;
  phoneNumber?: string;
  profilePic?: string;
  role: UserRole;
  isOnline?: boolean;
  lastActive?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface UserSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username?: string;
  email: string;
  role: UserRole;
  profilePic?: string;
  isOnline: boolean;
  lastActive?: Date;
}

