import type { Tournament, TournamentTeam } from './tournament';
import type { User } from './user';

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  tournament: Pick<Tournament, 'id' | 'name' | 'slug' | 'game' | 'status'>;
  type: RegistrationType;
  teamId?: string;
  team?: TournamentTeam;
  userId?: string;
  user?: Pick<User, 'id' | 'username' | 'nickname' | 'avatar'>;
  status: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  checkedInAt?: string;
  registeredAt: string;
  updatedAt: string;
  notes?: string;
  registrationData: RegistrationData;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface RegistrationData {
  answers?: RegistrationAnswer[];
  documents?: RegistrationDocument[];
  customFields?: Record<string, any>;
  acceptedRules: boolean;
  acceptedTerms: boolean;
  contactInfo?: ContactInfo;
}

export interface RegistrationAnswer {
  questionId: string;
  question: string;
  answer: string | string[] | boolean | number;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'number' | 'boolean';
}

export interface RegistrationDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  discord?: string;
  telegram?: string;
  preferredContact: 'email' | 'phone' | 'discord' | 'telegram';
}

export type RegistrationType = 'individual' | 'team';

export type RegistrationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn'
  | 'disqualified';

export type PaymentStatus = 
  | 'free'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed';

export type DocumentType = 
  | 'id_card'
  | 'student_card'
  | 'medical_certificate'
  | 'parental_consent'
  | 'team_roster'
  | 'other';

export interface RegistrationSettings {
  requireApproval: boolean;
  requirePayment: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
  requireDocuments: boolean;
  requiredDocuments?: DocumentType[];
  customQuestions?: RegistrationQuestion[];
  allowWithdrawal: boolean;
  withdrawalDeadline?: string;
  maxParticipants?: number;
  waitlistEnabled: boolean;
}

export interface RegistrationQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  maxLength?: number;
  placeholder?: string;
  description?: string;
}

export interface RegistrationStats {
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
  waitlistedRegistrations: number;
  individualRegistrations: number;
  teamRegistrations: number;
  totalRevenue?: number;
}
