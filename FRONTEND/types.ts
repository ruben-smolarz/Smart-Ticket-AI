export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  skills?: string[];
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

// CORRECTION 1: Values must match Backend validation
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Helper to show nice text in UI (optional, for badges)
export const TicketStatusLabel: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Open',
  [TicketStatus.IN_PROGRESS]: 'In Progress',
  [TicketStatus.RESOLVED]: 'Resolved',
  [TicketStatus.CLOSED]: 'Closed',
};

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  
  // CORRECTION 2: The backend (Mongoose) usually returns 'createdBy', not 'user'
  // We put both for safety or adjust based on your actual JSON response.
  createdBy?: User | string; 
  user?: User | string; // Mantener por si acaso alguna parte vieja lo usa

  assignedTo?: User | string;
  status: TicketStatus;
  priority?: Priority;
  category?: string;
  helpfulNotes?: string; 
  moderatorMessage?: string;
  aiNotes?: string;
  relatedSkills?: string[];
  skills?: string[]; // Fallback for some components
  createdAt: string;
  updatedAt: string;
}