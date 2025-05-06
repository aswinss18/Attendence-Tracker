// src/lib/auth.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore
import { firebaseConfig } from "@/config/firebase";

// Firebase app and services
let app;
let auth;
let db; // ✅ Firestore instance

// Initialize Firebase only on client-side
if (typeof window !== "undefined") {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  auth = getAuth(app);
  db = getFirestore(app); // ✅ Initialize Firestore
}

// List of allowed email addresses
const ALLOWED_EMAILS = ["aswinss0018@gmail.com", "exapmple@dffg.com"];

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 * @returns {Promise<UserCredential>} Firebase user credential
 */
export const signInWithGoogle = async () => {
  if (!auth) return null;

  try {
    const result = await signInWithPopup(auth, googleProvider);

    if (!ALLOWED_EMAILS.includes(result.user.email)) {
      await firebaseSignOut(auth);
      throw new Error("Unauthorized email address");
    }

    return result;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  if (!auth) return null;

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function to call on auth state change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 * @returns {Object|null} The current user or null if no user is signed in
 */
export const getCurrentUser = () => {
  if (!auth) return null;
  return auth.currentUser;
};

/**
 * Check if a user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  if (!auth) return false;
  return !!auth.currentUser;
};

// Export auth and db objects for direct access if needed
export { auth, db };
