import { User } from './user.types';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface EmergencyContact {
  _id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface Patient {
  _id: string;
  user: string | User;
  birthday: Date | string;
  address: string;
  bloodtype: BloodType;
  allergies: string[];
  medicalHistory: string[];
  emergencyContact: string[] | EmergencyContact[];
  insuranceCardFront?: Buffer | string;
  insuranceCardBack?: Buffer | string;
  createdAt?: string;
  updatedAt?: string;
}


export interface CreatePatientData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  sex?: string;
  password: string;
  phone?: string;
  profilePic?: string;
  ec_name?: string;
  ec_phone?: string;
  ec_relationship?: string;
  birthdate: Date | string;
  address: string;
  bloodtype: BloodType;
  allergies?: string[];
  medicalHistory?: string[];
  insuranceCardFront?: string;
  insuranceCardBack?: string;
}

export interface InsuranceCards {
  insuranceCardFront: string | null;
  insuranceCardBack: string | null;
  success?: boolean;
}

