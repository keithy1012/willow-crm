export type TicketStatus = 'Pending' | 'In Progress' | 'Completed' | 'Approved' | 'Rejected';

export interface BaseTicket {
  _id: string;
  status: TicketStatus;
  dateCreated: string;
  dateCompleted?: string;
  description: string;
}

export interface PatientTicket extends BaseTicket {
  patientName: string;
  ticketName: string;
  requestedBy: string;
  responsibleMember?: string;
  approvedBy?: string;
  additionalNotes?: string;
}

export interface DoctorTicket extends BaseTicket {
  doctorName: string;
  ticketName: string;
  requestedBy: string;
  responsibleMember?: string;
  approvedBy?: string;
  additionalNotes?: string;
}

export interface BugTicket extends BaseTicket {
  title: string;
  submitter: string;
  assignedTo?: string;
  content: string;
  isResolved: boolean;
}

export interface EnrichedBugTicket extends BugTicket {
  requestedBy: string;      
  requestedByType?: string;  
  ticketName?: string; 
  description: string;       
}

export interface EnrichedTicket {
  _id: string;
  title: string;
  requestedBy: string;
  description: string;
  ticketName?: string;
  requestedByType?: string;
  dateCreated?: string;  
}

export interface DoctorAccountCreationTicket {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username?: string;
  password: string;
  gender?: string;
  bioContent: string;
  education: string;
  graduationDate: Date;
  speciality: string;
  status: TicketStatus;
  reviewedBy?: string;
  notes?: string;
  profilePic?: string;
}