import { User } from './user.types';

export interface Doctor {
  _id: string;
  user: string | User;
  profilePic?: string;
  bioContent: string;
  education: string;
  graduationDate: Date | string;
  speciality: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  gender?: string;
  password: string;
  phoneNumber?: string;
  profilePic?: string;
  bioContent: string;
  education: string;
  graduationDate: Date | string;
  speciality: string;
  availability?: any[];
}

export interface DoctorSearchResult {
  _id: string;
  user: User;
  bioContent: string;
  education: string;
  graduationDate: string;
  speciality: string;
}