import { apiClient } from '../client';
import {
  MedorderRequest,
  CreateMedorderResponse,
  GetMedordersResponse,
  GetMedorderResponse,
  UpdateMedorderResponse,
  ProcessRefillResponse,
  DeleteMedorderResponse,
} from "../types/medorder.types";

export const medorderService = {
  // Create a new medication order
  createMedorder: async (
    medorderData: MedorderRequest
  ): Promise<CreateMedorderResponse> => {
    return await apiClient.post<CreateMedorderResponse>(
      `/medorders`,
      medorderData
    );
  },

  // Get all medication orders for a patient
  getMedordersByPatient: async (
    patientID: string
  ): Promise<GetMedordersResponse> => {
    return await apiClient.get<GetMedordersResponse>(
      `/medorders/patient/${patientID}`
    );
  },

  // Get all medication orders prescribed by a doctor
  getMedordersByDoctor: async (
    doctorID: string
  ): Promise<GetMedordersResponse> => {
    return await apiClient.get<GetMedordersResponse>(
      `/medorders/doctor/${doctorID}`
    );
  },

  // Get a single medication order by ID
  getMedorderById: async (orderID: string): Promise<GetMedorderResponse> => {
    return await apiClient.get<GetMedorderResponse>(
      `/medorders/${orderID}`
    );
  },

  // Update a medication order
  updateMedorder: async (
    orderID: string,
    updates: Partial<MedorderRequest>
  ): Promise<UpdateMedorderResponse> => {
    return await apiClient.put<UpdateMedorderResponse>(
      `/medorders/${orderID}`,
      updates
    );
  },

  // Process a refill
  processRefill: async (orderID: string): Promise<ProcessRefillResponse> => {
    return await apiClient.post<ProcessRefillResponse>(
      `/medorders/${orderID}/refill`
    );
  },

  // Delete a medication order
  deleteMedorder: async (orderID: string): Promise<DeleteMedorderResponse> => {
    return await apiClient.delete<DeleteMedorderResponse>(
      `/medorders/${orderID}`
    );
  },
};