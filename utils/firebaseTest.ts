/**
 * Firebase Mock Implementation Test
 * 
 * This file provides functions to test the mock Firebase implementation.
 * Run these tests to verify that the mock is working correctly.
 */

import { auth, db } from './firebase';
import { 
  registerUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser 
} from './authService';
import {
  addDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments
} from './firestoreService';

// Test authentication
export const testAuthentication = async () => {
  console.log("=== TESTING AUTHENTICATION ===");
  
  try {
    // Test registration
    console.log("Testing user registration...");
    const testUser = await registerUser("test@example.com", "password123", "Test User");
    console.log("User registered:", testUser);
    
    // Test current user
    console.log("Testing getCurrentUser...");
    const currentUser = getCurrentUser();
    console.log("Current user:", currentUser);
    
    // Test sign out
    console.log("Testing sign out...");
    await signOutUser();
    console.log("User signed out");
    
    // Verify user is signed out
    const userAfterSignOut = getCurrentUser();
    console.log("User after sign out:", userAfterSignOut);
    
    // Test sign in
    console.log("Testing sign in...");
    const signedInUser = await signInUser("test@example.com", "password123");
    console.log("User signed in:", signedInUser);
    
    console.log("Authentication tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Authentication test failed:", error);
    return false;
  }
};

// Test Firestore
export const testFirestore = async () => {
  console.log("=== TESTING FIRESTORE ===");
  
  try {
    // Test adding a document
    console.log("Testing addDocument...");
    const docId = await addDocument("testCollection", { 
      name: "Test Document", 
      value: 123 
    });
    console.log("Document added with ID:", docId);
    
    // Test getting a document
    console.log("Testing getDocument...");
    const doc = await getDocument("testCollection", docId);
    console.log("Retrieved document:", doc);
    
    // Test updating a document
    console.log("Testing updateDocument...");
    await updateDocument("testCollection", docId, { value: 456 });
    
    // Verify update
    const updatedDoc = await getDocument("testCollection", docId);
    console.log("Updated document:", updatedDoc);
    
    // Test querying documents
    console.log("Testing queryDocuments...");
    const docs = await queryDocuments("testCollection");
    console.log("Query results:", docs);
    
    // Test deleting a document
    console.log("Testing deleteDocument...");
    await deleteDocument("testCollection", docId);
    
    // Verify deletion
    const deletedDoc = await getDocument("testCollection", docId);
    console.log("Document after deletion:", deletedDoc);
    
    console.log("Firestore tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Firestore test failed:", error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log("==============================");
  console.log("STARTING FIREBASE MOCK TESTS");
  console.log("==============================");
  
  const authResult = await testAuthentication();
  console.log("\n");
  const firestoreResult = await testFirestore();
  
  console.log("\n==============================");
  console.log("TEST RESULTS:");
  console.log("Authentication:", authResult ? "PASSED" : "FAILED");
  console.log("Firestore:", firestoreResult ? "PASSED" : "FAILED");
  console.log("==============================");
  
  return authResult && firestoreResult;
};

// Export a function to run tests from components
export const testFirebaseMock = () => {
  console.log("Running Firebase mock tests...");
  runAllTests().then(success => {
    console.log("Tests completed with result:", success ? "SUCCESS" : "FAILURE");
  });
}; 