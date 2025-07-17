import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, handleRedirectResult } from '../firebase';
import { tripService } from '../services/tripService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for redirect result on mount (for mobile auth)
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result.success && result.user) {
          console.log('📱 Redirect auth successful:', result.user);
        }
      } catch (error) {
        console.error('Redirect check error:', error);
      }
    };
    
    checkRedirectResult();
    
    // Check URL params for auth completion
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'true') {
      console.log('🔄 Auth redirect detected, checking auth state...');
      // Force a refresh of auth state
      auth.currentUser?.reload();
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('🔍 Firebase auth state changed:', !!firebaseUser);
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
          };
          
          console.log('✅ Setting user data:', userData);
          setUser(userData);
          
          // Auto-migrate local trips on first login - temporarily disabled
          // await tripService.migrateLocalTrips(firebaseUser.uid);
        } else {
          console.log('❌ No firebase user, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signOutUser();
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};