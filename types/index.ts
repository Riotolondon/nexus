export * from './routes'; 

// User interface
export interface User {
  uid: string;
  email: string | null;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  university?: string;
  interests?: string[];
  profilePicture?: string;
  bio?: string;
  createdAt?: Date;
}

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'message' | 'announcement' | 'event' | 'other';
  userId: string;
}

// Collaboration Space interface
export interface CollaborationSpace {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  imageUrl?: string;
}

// Career Opportunity interface
export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'internship' | 'full-time' | 'part-time' | 'contract';
  postedAt: Date;
  deadline?: Date;
  salary?: string;
  contactEmail?: string;
  applicationUrl?: string;
  imageUrl?: string;
}

// Academic Resource interface
export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'book' | 'other';
  url: string;
  author?: string;
  createdAt: Date;
  tags: string[];
  imageUrl?: string;
} 