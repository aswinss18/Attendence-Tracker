// src/lib/auth.js

import { initializeApp } from "firebase/app"; // ✅ correct module for initializeApp
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { firebaseConfig } from "@/config/firebase";

const app = initializeApp(firebaseConfig);

// List of allowed email addresses
const ALLOWED_EMAILS = ["aswinss0018@gmail.com", "exapmple@dffg.com"];

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
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

export const signOut = async () => {
  try {
    await firebaseSignOut(auth); // <-- no return value here
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
