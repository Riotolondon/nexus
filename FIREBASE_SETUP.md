# Firebase Setup for Solus Nexus

This guide will help you set up Firebase for the Solus Nexus app.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "Solus Nexus")
4. Enable Google Analytics if desired
5. Click "Create project"

## Step 2: Register Your App with Firebase

1. In the Firebase console, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Solus Nexus Web")
3. Check the option to set up Firebase Hosting if desired
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Update Firebase Configuration in the App

1. Open the file `utils/firebase.ts` in your project
2. Replace the placeholder values in the `firebaseConfig` object with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};
```

## Step 4: Enable Authentication Methods

1. In the Firebase console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" authentication
3. Optionally, enable other authentication methods like Google, Facebook, etc.
4. Save your changes

## Step 5: Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode (you can change this later)
4. Choose a database location closest to your users
5. Click "Enable"

## Step 6: Set Up Firestore Security Rules

1. In the Firebase console, go to "Firestore Database" > "Rules"
2. Update the security rules to secure your data. Here's a basic example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read academic resources
    match /academicResources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Allow authenticated users to read collaboration spaces
    match /collaborationSpaces/{spaceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read career opportunities
    match /careerOpportunities/{opportunityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.posterId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Set Up Firebase Storage (Optional)

If you plan to allow users to upload files:

1. In the Firebase console, go to "Storage"
2. Click "Get started"
3. Choose production mode or test mode
4. Select a location for your storage bucket
5. Click "Done"
6. Update the Storage Rules as needed

## Step 8: Install Firebase CLI (Optional)

If you want to use Firebase Hosting or Functions:

1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project:
   ```
   firebase init
   ```

## Step 9: Deploy to Firebase Hosting (Optional)

1. Build your app:
   ```
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```
   firebase deploy
   ```

## Troubleshooting

- If you encounter CORS issues, make sure to set up proper CORS rules in your Firebase Storage
- For authentication issues, check that your Firebase config is correct and that the authentication methods are enabled
- For Firestore permission issues, review your security rules

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage) 