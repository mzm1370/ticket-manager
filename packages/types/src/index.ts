export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: number;
  title: string;
  status: TicketStatus;
  createdAt: string;
}

export type UserRole = 'PO' | 'PM' | 'DEVELOPER' | 'QA';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
