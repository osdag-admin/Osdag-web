/**
 * Firebase Authentication Utilities
 * Handles authentication state and user info using Firebase Auth
 */

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Auth/firebase';
import { syncUserToBackend } from './firebaseAuth';

/**
 * Get current Firebase user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if current user's email is verified
 */
export const isEmailVerified = () => {
  return auth.currentUser?.emailVerified || false;
};

/**
 * Get current user email from Firebase
 * Returns empty string if no user or no email
 */
export const getCurrentUserEmail = () => {
  return auth.currentUser?.email || '';
};

/**
 * Get Firebase ID token for API calls.
 */
export const getAccessToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (Firebase user exists or guest mode)
 */
export const isAuthenticated = () => {
  // Check for guest mode first
  const userType = localStorage.getItem('userType');
  if (userType === 'guest') {
    return true; // Guest users are considered authenticated for access
  }

  // Check for Firebase user
  return !!auth.currentUser;
};

/**
 * Check if user is a guest
 */
export const isGuestUser = () => {
  const userType = localStorage.getItem('userType');
  return userType === 'guest';
};

/**
 * Check if user can create/save projects
 * Both guests and unverified users cannot create projects
 */
export const canCreateProjects = () => {
  if (isGuestUser()) return false;
  if (!isEmailVerified()) return false;
  return true;
};

/**
 * Check if user can save projects
 */
export const canSaveProjects = () => {
  return canCreateProjects(); // Same restrictions
};

/**
 * Clear auth storage (for logout)
 * Removes guest mode and other auth-related localStorage items
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('userType');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  // Note: Firebase handles its own auth state, no need to clear tokens
};


/**
 * Subscribe to Firebase auth state changes
 * Useful for components that need to react to login/logout
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Sync to backend when user logs in
      await syncUserToBackend(firebaseUser);
    }
    callback(firebaseUser);
  });
};
