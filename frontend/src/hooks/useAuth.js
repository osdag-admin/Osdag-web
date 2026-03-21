import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../Auth/firebase';
import { syncUserToBackend } from '../utils/firebaseAuth';
import { clearAuthStorage, isGuestUser } from '../utils/auth';

/**
 * Custom hook for Firebase authentication management.
 * Exposes Firebase user, guest mode, and logout helpers.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setEmailVerified(firebaseUser?.emailVerified || false);
      setIsLoggedIn(!!firebaseUser || isGuestUser());
      setLoading(false);
      
      // Sync to backend if authenticated
      if (firebaseUser) {
        try {
          await syncUserToBackend(firebaseUser);
        } catch (error) {
          console.error('Error syncing user to backend:', error);
          // Don't block auth if backend sync fails
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Logout function using Firebase signOut
  const logout = useCallback(async () => {
    try {
      // Check if it's a guest user
      if (isGuestUser()) {
        clearAuthStorage();
        setIsLoggedIn(false);
        navigate('/');
        return;
      }

      // Firebase user logout
      await signOut(auth);
      clearAuthStorage();
      setIsLoggedIn(false);
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if Firebase logout fails
      clearAuthStorage();
      setIsLoggedIn(false);
      navigate('/');
    }
  }, [navigate]);

  // Get current Firebase token for API calls
  const getCurrentToken = useCallback(async () => {
    if (!user) {
      return null;
    }
    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }, [user]);

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    return isLoggedIn || !!user || isGuestUser();
  }, [isLoggedIn, user]);

  return {
    user,
    emailVerified,
    loading,
    isLoggedIn,
    isAuthenticated: checkAuth(),
    logout,
    checkAuth,
    getCurrentToken,
  };
};
