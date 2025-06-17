import { db } from './firebase';

// Define types for Firestore data
export type DocumentData = Record<string, any>;
export type QueryConstraint = any;

// Add a document to a collection with auto-generated ID
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const collectionRef = db.collection(collectionName);
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await collectionRef.add(documentData);
    return docRef.id;
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Set a document with a specific ID
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await docRef.set(documentData);
    return docId;
  } catch (error: any) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    return docId;
  } catch (error: any) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    await docRef.delete();
    return true;
  } catch (error: any) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
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
    let queryRef = db.collection(collectionName);
    
    // Apply constraints (not fully implemented in mock)
    // In the mock, these just return the collection reference
    constraints.forEach(constraint => {
      if (typeof constraint === 'function') {
        queryRef = constraint(queryRef);
      }
    });
    
    const querySnapshot = await queryRef.get();
    
    const documents: DocumentData[] = [];
    querySnapshot.docs.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error: any) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

// Subscribe to a document (mock implementation)
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
) => {
  // Initial read
  getDocument(collectionName, docId).then(callback).catch(console.error);
  
  // Return unsubscribe function
  return () => {};
};

// Subscribe to a collection (mock implementation)
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: DocumentData[]) => void
) => {
  // Initial read
  queryDocuments(collectionName, constraints).then(callback).catch(console.error);
  
  // Return unsubscribe function
  return () => {};
}; 