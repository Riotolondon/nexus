// Mock Firebase implementation
console.log("Using mock Firebase implementation");

// Define types for our mock implementation
export type MockUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
};

// Mock user data
const mockUser: MockUser = {
  uid: "mock-user-123",
  email: "test@example.com",
  displayName: "Test User",
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

// Mock auth state listeners
let authListeners: Array<(user: MockUser | null) => void> = [];
let currentUser: MockUser | null = null;

// Mock auth service
const auth = {
  currentUser,
  
  // Mock sign in
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log(`Mock sign in with email: ${email}`);
    currentUser = { ...mockUser, email };
    notifyAuthListeners(currentUser);
    return { user: currentUser };
  },
  
  // Mock sign up
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log(`Mock sign up with email: ${email}`);
    currentUser = { ...mockUser, email };
    notifyAuthListeners(currentUser);
    return { user: currentUser };
  },
  
  // Mock sign out
  signOut: async () => {
    console.log("Mock sign out");
    currentUser = null;
    notifyAuthListeners(null);
    return Promise.resolve();
  },
  
  // Mock password reset
  sendPasswordResetEmail: async (email: string) => {
    console.log(`Mock password reset email sent to: ${email}`);
    return Promise.resolve();
  },
  
  // Mock auth state change listener
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    console.log("Adding auth state listener");
    authListeners.push(callback);
    // Call with current state immediately
    callback(currentUser);
    // Return unsubscribe function
    return () => {
      console.log("Removing auth state listener");
      authListeners = authListeners.filter(listener => listener !== callback);
    };
  }
};

// Helper to notify all auth listeners
const notifyAuthListeners = (user: MockUser | null) => {
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error("Error in auth listener:", error);
    }
  });
};

// Types for Firestore mock
export type MockDocumentData = Record<string, any>;

// Mock Firestore data
const mockData: Record<string, Record<string, MockDocumentData>> = {
  users: {},
  academicResources: {},
  collaborationSpaces: {},
  careerOpportunities: {}
};

// Mock document reference
const createDocRef = (collection: string, id: string) => ({
  id,
  collection: collection,
  get: async () => ({
    exists: !!mockData[collection][id],
    id,
    data: () => mockData[collection][id] || null
  }),
  set: async (data: MockDocumentData) => {
    mockData[collection][id] = { ...data };
    return Promise.resolve();
  },
  update: async (data: MockDocumentData) => {
    mockData[collection][id] = { ...mockData[collection][id], ...data };
    return Promise.resolve();
  },
  delete: async () => {
    delete mockData[collection][id];
    return Promise.resolve();
  }
});

// Mock collection reference
const createCollectionRef = (collection: string) => ({
  doc: (id: string) => createDocRef(collection, id),
  add: async (data: MockDocumentData) => {
    const id = `mock-${Date.now()}`;
    mockData[collection][id] = { ...data };
    return { id };
  },
  where: () => createCollectionRef(collection),
  orderBy: () => createCollectionRef(collection),
  limit: () => createCollectionRef(collection),
  get: async () => ({
    docs: Object.keys(mockData[collection]).map(id => ({
      id,
      exists: true,
      data: () => mockData[collection][id]
    }))
  })
});

// Mock Firestore service
const db = {
  collection: (name: string) => createCollectionRef(name)
};

// Mock Firebase app
const app = {};
const firebase = { app };
const analytics = null;

// Mock functions that were previously lazy-loaded
const getAuth = () => auth;
const getFirestore = () => db;

// Helper for profile updates
const updateProfile = (user: MockUser, data: Partial<MockUser>) => {
  currentUser = { ...currentUser, ...data } as MockUser;
  return Promise.resolve();
};

export { firebase, app, auth, db, analytics, getAuth, getFirestore, updateProfile }; 