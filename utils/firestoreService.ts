import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  DocumentData as FirestoreDocumentData,
  QueryConstraint as FirestoreQueryConstraint,
  Timestamp
} from 'firebase/firestore';

// Define types for Firestore data
export type DocumentData = Record<string, any>;
export type QueryConstraint = FirestoreQueryConstraint;

// Add a document to a collection with auto-generated ID
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const collectionRef = collection(db, collectionName);
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collectionRef, documentData);
    return docRef.id;
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Set a document with a specific ID
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, documentData);
    return docId;
  } catch (error: any) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
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
    const collectionRef = collection(db, collectionName);
    let queryRef = query(collectionRef, ...constraints);
    
    const querySnapshot = await getDocs(queryRef);
    
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
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document ${docId} in ${collectionName}:`, error);
    callback(null);
  });
};

// Subscribe to a collection
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: DocumentData[]) => void
) => {
  try {
    const collectionRef = collection(db, collectionName);
    let queryRef = query(collectionRef, ...constraints);
    
    return onSnapshot(queryRef, (querySnapshot) => {
      const documents: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    }, (error) => {
      console.error(`Error subscribing to collection ${collectionName}:`, error);
      callback([]);
    });
  } catch (error) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    return () => {}; // Return empty unsubscribe function
  }
}; 