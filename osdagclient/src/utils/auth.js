// Authentication utilities with improved security
import jwt_decode from 'jwt-decode';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

/**
 * Securely store tokens (consider using httpOnly cookies in production)
 */
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    // In production, this should be an httpOnly cookie
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
};

/**
 * Get access token from storage
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('access');
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_KEY) || localStorage.getItem('refresh');
};

/**
 * Remove all tokens from storage
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('userType');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
};

/**
 * Check if token is valid and not expired
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired (with 30 second buffer)
    return decoded.exp > (currentTime + 30);
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
};

/**
 * Get user info from valid token
 */
export const getUserFromToken = (token) => {
  if (!isTokenValid(token)) return null;
  
  try {
    const decoded = jwt_decode(token);
    // Return only safe user info, never include password
    return {
      username: decoded.username,
      email: decoded.email,
      userId: decoded.user_id,
      exp: decoded.exp
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if user is a guest
 */
export const isGuestUser = () => {
  const userType = localStorage.getItem('userType');
  return userType === 'guest';
};

/**
 * Get current user email
 */
export const getCurrentUserEmail = () => {
  const email = localStorage.getItem('email') || '';
  console.log('getCurrentUserEmail called, email from localStorage:', email);
  return email;
};

/**
 * Check if user is authenticated (including guest mode)
 */
export const isAuthenticated = () => {
  // Check for guest mode first
  const userType = localStorage.getItem('userType');
  if (userType === 'guest') {
    return true; // Guest users are considered authenticated for access
  }

  // Check for regular token authentication
  const token = getAccessToken();
  return isTokenValid(token);
};

/**
 * Auto-login check on app startup
 */
export const checkAutoLogin = () => {
  // Check for guest mode
  const userType = localStorage.getItem('userType');
  if (userType === 'guest') {
    return { 
      username: 'Guest User', 
      email: '', 
      isGuest: true 
    };
  }

  // Check for regular token
  const token = getAccessToken();
  if (isTokenValid(token)) {
    return getUserFromToken(token);
  }
  
  // Clear invalid tokens
  clearTokens();
  return null;
}; 