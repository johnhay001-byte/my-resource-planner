// src/firebase.js
// This file will configure the connection to your Firebase project.

// 1. Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. TODO: Replace the following with your app's Firebase project configuration
// You can find this in your Firebase project settings.
// Go to Project Settings > General > Your apps > Web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Get a reference to the Firestore database service
export const db = getFirestore(app);
