import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  DocumentData as FirebaseDocumentData,
  QueryConstraint as FirebaseQueryConstraint,
  WhereFilterOp,
  OrderByDirection,
  Query,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';

// Define types for Firestore data
export type DocumentData = Record<string, any>;
export type QueryConstraint = {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  operator?: WhereFilterOp;
  value?: any;
  direction?: OrderByDirection;
};

// Add a document to a collection with auto-generated ID
export const addDocument = async (collectionName: string, data: any) => {
  try {
    console.log(`Adding document to ${collectionName}:`, data);
    
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const documentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, documentData);
    console.log(`Document added successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Set a document with a specific ID
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    console.log(`Setting document in ${collectionName} with ID ${docId}:`, data);
    
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const documentData = {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, documentData);
    
    console.log(`Document ${docId} set successfully in ${collectionName}`);
    return docId;
  } catch (error: any) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updateData);
    return docId;
  } catch (error: any) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Query documents with filters
export const queryDocuments = async (
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  try {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const collectionRef = collection(db, collectionName);
    
    // Build query constraints
    const queryConstraints: FirebaseQueryConstraint[] = [];
    
    for (const constraint of constraints) {
      if (constraint.type === 'where' && constraint.field && constraint.operator) {
        queryConstraints.push(where(constraint.field, constraint.operator, constraint.value));
      } else if (constraint.type === 'orderBy' && constraint.field && constraint.direction) {
        queryConstraints.push(orderBy(constraint.field, constraint.direction));
      } else if (constraint.type === 'limit' && constraint.value) {
        queryConstraints.push(limit(constraint.value));
      }
    }
    
    // Create and execute query
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error: any) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

// Subscribe to a document
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
) => {
  if (!db) {
    console.error("Firestore is not initialized");
    callback(null);
    return () => {};
  }
  
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to document ${docId} in ${collectionName}:`, error);
      callback(null);
    }
  );
};

// Subscribe to a collection
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: DocumentData[]) => void
) => {
  try {
    if (!db) {
      console.error("Firestore is not initialized");
      callback([]);
      return () => {};
    }
    
    const collectionRef = collection(db, collectionName);
    
    // Build query constraints
    const queryConstraints: FirebaseQueryConstraint[] = [];
    
    for (const constraint of constraints) {
      if (constraint.type === 'where' && constraint.field && constraint.operator) {
        queryConstraints.push(where(constraint.field, constraint.operator, constraint.value));
      } else if (constraint.type === 'orderBy' && constraint.field && constraint.direction) {
        queryConstraints.push(orderBy(constraint.field, constraint.direction));
      } else if (constraint.type === 'limit' && constraint.value) {
        queryConstraints.push(limit(constraint.value));
      }
    }
    
    // Create query
    const q = query(collectionRef, ...queryConstraints);
    
    // Subscribe to query
    return onSnapshot(
      q,
      (querySnapshot) => {
        const documents: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      },
      (error) => {
        console.error(`Error subscribing to collection ${collectionName}:`, error);
        callback([]);
      }
    );
  } catch (error) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    return () => {}; // Return empty unsubscribe function
  }
}; 