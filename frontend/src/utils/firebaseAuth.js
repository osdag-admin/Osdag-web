/**
 * Firebase Authentication Utilities
 * Handles all Firebase auth operations: signup, login, password reset, etc.
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../Auth/firebase";
import { firebaseLoginWithToken } from '../datasources/authDataSource';

/**
 * Get user-friendly error messages for Firebase auth errors
 */
export const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please log in or use "Login with Google".',
        'auth/invalid-email': 'Invalid email address. Please check and try again.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
        'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/user-not-found': 'No account found with this email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
        'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    };
    return errorMessages[errorCode] || `Authentication error: ${errorCode || 'Unknown error'}`;
};

/**
 * Sync Firebase user to Django backend
 * Backend syncs user to Django User model and returns user info
 */
export const syncUserToBackend = async (firebaseUser) => {
    try {
        const idToken = await firebaseUser.getIdToken();
        console.log("Syncing user to backend. Token length:", idToken?.length || 0);
        
        const data = await firebaseLoginWithToken(idToken);
        console.log("Backend sync response payload:", data);
        
        // Store user info for convenience
        localStorage.setItem("userType", "user");
        localStorage.setItem("email", firebaseUser.email || "");
        const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
        localStorage.setItem("username", displayName);
        
        return data;
    } catch (error) {
        console.error("Error syncing user to backend:", error);
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
        });
        
        // Re-throw the error so the caller can handle it
        throw error;
    }
};

/**
 * Sign up with email and password
 */
export const signupWithFirebase = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    
    // Sync to backend
    await syncUserToBackend(user);

    // Reload user to get latest verification status
    await user.reload();
    
    return { user, emailVerified: user.emailVerified };
};

/**
 * Sign in with email and password
 */
export const loginWithFirebase = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Sync to backend
    await syncUserToBackend(user);

    // Reload user to get latest verification status
    await user.reload();
    
    return { user, emailVerified: user.emailVerified };
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
    try {
        console.log("Initiating Google sign-in popup...");
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Google sign-in successful. User:", user.email);

        // Sync to backend
        console.log("Syncing user to backend...");
        await syncUserToBackend(user);
        console.log("Backend sync completed");
        
        return { user, emailVerified: user.emailVerified };
    } catch (error) {
        console.error("Error in loginWithGoogle:", error);
        throw error; // Re-throw so caller can handle it
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async (user) => {
    await sendEmailVerification(user);
};

