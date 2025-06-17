import { 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  getDocument, 
  queryDocuments, 
  subscribeToCollection,
  subscribeToDocument
} from './firestoreService';
import { getCurrentUser } from './authService';
import { 
  where as firestoreWhere, 
  orderBy as firestoreOrderBy, 
  limit as firestoreLimit,
  QueryConstraint
} from 'firebase/firestore';

// Helper functions to create Firestore query constraints
const where = (field: string, operator: any, value: any): QueryConstraint => {
  return firestoreWhere(field, operator, value);
};

const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint => {
  return firestoreOrderBy(field, direction);
};

const limit = (value: number): QueryConstraint => {
  return firestoreLimit(value);
};

// Academic Resources
export const addAcademicResource = async (resourceData: {
  title: string;
  description: string;
  fileUrl?: string;
  category: string;
  tags: string[];
  universityId: string;
}) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDocument('academicResources', {
    ...resourceData,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    views: 0,
    downloads: 0,
    likes: 0,
  });
};

export const getAcademicResources = async (filters: {
  universityId?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) => {
  const constraints: QueryConstraint[] = [];
  
  if (filters.universityId) {
    constraints.push(where('universityId', '==', filters.universityId));
  }
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    // Get resources that have at least one of the specified tags
    constraints.push(where('tags', 'array-contains-any', filters.tags));
  }
  
  // Order by creation date, newest first
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  return queryDocuments('academicResources', constraints);
};

export const getAcademicResourceById = async (id: string) => {
  return getDocument('academicResources', id);
};

export const subscribeToAcademicResources = (
  filters: {
    universityId?: string;
    category?: string;
    tags?: string[];
    limit?: number;
  },
  callback: (data: any[]) => void
) => {
  const constraints: QueryConstraint[] = [];
  
  if (filters.universityId) {
    constraints.push(where('universityId', '==', filters.universityId));
  }
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    constraints.push(where('tags', 'array-contains-any', filters.tags));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  return subscribeToCollection('academicResources', constraints, callback);
};

// Collaboration Spaces
export const addCollaborationSpace = async (collaborationData: {
  title: string;
  description: string;
  category: string;
  universityId: string;
  maxParticipants?: number;
  meetingLink?: string;
  meetingTime?: Date;
  tags: string[];
}) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDocument('collaborationSpaces', {
    ...collaborationData,
    creatorId: user.uid,
    creatorName: user.displayName || 'Anonymous',
    participants: [{ id: user.uid, name: user.displayName || 'Anonymous' }],
    participantCount: 1,
  });
};

export const getCollaborationSpaces = async (filters: {
  universityId?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) => {
  const constraints: QueryConstraint[] = [];
  
  if (filters.universityId) {
    constraints.push(where('universityId', '==', filters.universityId));
  }
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    constraints.push(where('tags', 'array-contains-any', filters.tags));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  return queryDocuments('collaborationSpaces', constraints);
};

export const joinCollaborationSpace = async (spaceId: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const space = await getDocument('collaborationSpaces', spaceId) as any;
  if (!space) throw new Error('Collaboration space not found');
  
  // Check if user is already a participant
  const isParticipant = space.participants.some((p: any) => p.id === user.uid);
  if (isParticipant) return spaceId;
  
  // Check if space is full
  if (space.maxParticipants && space.participantCount >= space.maxParticipants) {
    throw new Error('This collaboration space is full');
  }
  
  // Add user to participants
  const newParticipants = [
    ...space.participants,
    { id: user.uid, name: user.displayName || 'Anonymous' }
  ];
  
  await updateDocument('collaborationSpaces', spaceId, {
    participants: newParticipants,
    participantCount: newParticipants.length
  });
  
  return spaceId;
};

// Career Opportunities
export const addCareerOpportunity = async (opportunityData: {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  type: string; // internship, part-time, full-time, etc.
  applicationUrl?: string;
  applicationDeadline?: Date;
  tags: string[];
}) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDocument('careerOpportunities', {
    ...opportunityData,
    posterId: user.uid,
    posterName: user.displayName || 'Anonymous',
  });
};

export const getCareerOpportunities = async (filters: {
  type?: string;
  location?: string;
  tags?: string[];
  limit?: number;
}) => {
  const constraints: QueryConstraint[] = [];
  
  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }
  
  if (filters.location) {
    constraints.push(where('location', '==', filters.location));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    constraints.push(where('tags', 'array-contains-any', filters.tags));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  return queryDocuments('careerOpportunities', constraints);
}; 