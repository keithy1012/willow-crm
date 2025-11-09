import { apiClient } from '../client';
import { 
  PatientTicket, 
  DoctorTicket, 
  BugTicket, 
  DoctorAccountCreationTicket, 
  EnrichedBugTicket
} from '../types/ticket.types';

export const ticketService = {
  // Patient Change Tickets
  patient: {
    create: (data: Partial<PatientTicket>) => 
      apiClient.post<PatientTicket>('/tickets/patientChange', data),
    
    getPending: () => 
      apiClient.get<PatientTicket[]>('/tickets/patientChange/pending'),
    
    getById: (id: string) => 
      apiClient.get<PatientTicket>(`/tickets/patientChange/${id}`),
    
    getInProgressByOpsId: (opsId: string) => 
      apiClient.get<PatientTicket[]>(`/tickets/patientChange/${opsId}/inprogress`),
    
    getAllByOpsId: (opsId: string) => 
      apiClient.get<PatientTicket[]>(`/tickets/patientChange/${opsId}/all`),
    
    start: (ticketId: string) => 
      apiClient.patch(`/tickets/patientChange/${ticketId}/start`),
    
    complete: (ticketId: string) => 
      apiClient.patch(`/tickets/patientChange/${ticketId}/complete`),
  },

  // Doctor Change Tickets
  doctor: {
    create: (data: Partial<DoctorTicket>) => 
      apiClient.post<DoctorTicket>('/tickets/doctorChange', data),
    
    getPending: () => 
      apiClient.get<DoctorTicket[]>('/tickets/doctorChange/pending'),
    
    getById: (id: string) => 
      apiClient.get<DoctorTicket>(`/tickets/doctorChange/${id}`),
    
    getInProgressByOpsId: (opsId: string) => 
      apiClient.get<DoctorTicket[]>(`/tickets/doctorChange/${opsId}/inprogress`),
    
    getAllByOpsId: (opsId: string) => 
      apiClient.get<DoctorTicket[]>(`/tickets/doctorChange/${opsId}/all`),
    
    start: (ticketId: string) => 
      apiClient.patch(`/tickets/doctorChange/${ticketId}/start`),
    
    complete: (ticketId: string) => 
      apiClient.patch(`/tickets/doctorChange/${ticketId}/complete`),
  },

  // Bug Tickets
  bug: {
    create: (data: Partial<BugTicket>) => 
      apiClient.post<BugTicket>('/tickets/bugTicket', data),
    
    getPending: () => 
      apiClient.get<EnrichedBugTicket[]>('/tickets/bugTicket/pending'),
    
    getInProgressByItId: (itId: string) => 
      apiClient.get<EnrichedBugTicket[]>(`/tickets/bugTicket/${itId}/inprogress`),
    
    getAllByItId: (itId: string) => 
      apiClient.get<EnrichedBugTicket[]>(`/tickets/bugTicket/${itId}/all`),
    
    getById: (id: string) => 
      apiClient.get<BugTicket>(`/tickets/bugTicket/${id}`),
    
    start: (ticketId: string) => 
      apiClient.patch(`/tickets/bugTicket/${ticketId}/start`),
    
    complete: (ticketId: string) => 
      apiClient.patch(`/tickets/bugTicket/${ticketId}/complete`),
    
  },

  // Doctor Account Creation
  doctorCreation: {
    submit: (data: Partial<DoctorAccountCreationTicket>) => 
      apiClient.post('/tickets/doctorCreate', data),
    
    getPending: () => 
      apiClient.get<DoctorAccountCreationTicket[]>('/tickets/doctorCreate/pending'),
    
    approve: (ticketId: string) => 
      apiClient.patch(`/tickets/doctorCreate/${ticketId}/approve`),
    
    getCompletedByUserId: (userId: string) => 
      apiClient.get<DoctorAccountCreationTicket[]>(`/tickets/doctorCreate/completed/${userId}`),
  },
};