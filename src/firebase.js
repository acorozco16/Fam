import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBttEMyJ5vw9RGP6HuZh6aX1jeAKxr8eIU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "famapp-d7bf4.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://famapp-d7bf4-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "famapp-d7bf4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "famapp-d7bf4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1047866984314",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1047866984314:web:51f2bcb0de89911e9278c3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N239T49PQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('❌ Error setting auth persistence:', error);
  });

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Real-time Database
export const rtdb = getDatabase(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure the provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Add additional parameters for better mobile support
  access_type: 'offline',
  include_granted_scopes: 'true'
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    // Always use popup for now - redirect has issues with Firebase config
    const result = await signInWithPopup(auth, googleProvider);
    
    // Extract user information
    const user = result.user;
    const userData = {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      isGoogleUser: true
    };
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // If popup was blocked, try redirect as fallback
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, pending: true };
      } catch (redirectError) {
        console.error('Redirect fallback also failed:', redirectError);
        return { 
          success: false, 
          error: redirectError.message || 'Failed to sign in with Google' 
        };
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to sign in with Google' 
    };
  }
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      const userData = {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL,
        isGoogleUser: true
      };
      return { success: true, user: userData };
    }
    return { success: false, noResult: true };
  } catch (error) {
    console.error('Redirect result error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

export default app;