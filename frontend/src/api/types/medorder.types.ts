export interface MedorderRequest {
  patientID: string;
  doctorID: string;
  medicationName: string;
  dosage?: string;
  instruction: string;
  recurringEvery?: string;
  duration?: string;
  quantity?: string;
  refillCount?: number;
}

export interface MedorderResponse {
  orderID: string;
  patientID: {
    _id: string;
    name: string;
    email: string;
    dateOfBirth?: Date;
  };
  doctorID: {
    _id: string;
    name: string;
    email: string;
    specialty?: string;
  };
  prescribedOn: Date;
  medicationName: string;
  dosage?: string;
  instruction: string;
  recurringEvery?: string;
  duration?: string;
  quantity?: string;
  refillCount: number;
  lastRefillDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMedorderResponse {
  success: boolean;
  message: string;
  medorder: MedorderResponse;
}

export interface GetMedordersResponse {
  success: boolean;
  medorders: MedorderResponse[];
}

export interface GetMedorderResponse {
  success: boolean;
  medorder: MedorderResponse;
}

export interface UpdateMedorderResponse {
  success: boolean;
  message: string;
  medorder: MedorderResponse;
}

export interface ProcessRefillResponse {
  success: boolean;
  message: string;
  medorder: MedorderResponse;
}

export interface DeleteMedorderResponse {
  success: boolean;
  message: string;
}