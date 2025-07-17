import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBttEMyJ5vw9RGP6HuZh6aX1jeAKxr8eIU",
  authDomain: "famapp-d7bf4.firebaseapp.com",
  projectId: "famapp-d7bf4",
  storageBucket: "famapp-d7bf4.firebasestorage.app",
  messagingSenderId: "1047866984314",
  appId: "1:1047866984314:web:51f2bcb0de89911e9278c3",
  measurementId: "G-N239T49PQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure the provider to force account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    // Use redirect on mobile devices for better compatibility
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Use redirect flow
      await signInWithRedirect(auth, googleProvider);
      // The redirect result will be handled in AuthContext
      return { success: true, pending: true };
    } else {
      // Desktop: Use popup flow
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
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
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