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
 * Check if user is a guest (no Firebase user)
 */
export const isGuestUser = () => {
  return !auth.currentUser;
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
 * Subscribe to Firebase auth state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      await syncUserToBackend(firebaseUser);
    }
    callback(firebaseUser);
  });
};
