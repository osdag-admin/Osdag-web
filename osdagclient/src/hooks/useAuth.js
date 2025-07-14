import { useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../context/UserState';
import { 
  checkAutoLogin, 
  clearTokens, 
  isAuthenticated,
  getAccessToken 
} from '../utils/auth';

/**
 * Custom hook for authentication management
 */
export const useAuth = () => {
  const { isLoggedIn, userLogin, setIsLoggedIn } = useContext(UserContext);

  // Auto-login check
  useEffect(() => {
    const userData = checkAutoLogin();
    if (userData && !isLoggedIn) {
      if (userData.isGuest) {
        // For guest mode, don't call userLogin which would trigger server call
        // Guest mode is handled by the userType in localStorage
        console.log('Guest user detected');
      } else {
        // For regular users with valid tokens
        userLogin(userData.username, "", false, true);
      }
    }
  }, [userLogin, isLoggedIn]);

  // Logout function
  const logout = useCallback(() => {
    clearTokens();
    setIsLoggedIn(false);
    // Redirect to login page
    window.location.href = '/';
  }, [setIsLoggedIn]);

  // Check if user is authenticated (including guest mode)
  const checkAuth = useCallback(() => {
    const userType = localStorage.getItem('userType');
    return isLoggedIn || userType === 'guest' || isAuthenticated();
  }, [isLoggedIn]);

  // Get current token
  const getCurrentToken = useCallback(() => {
    return getAccessToken();
  }, []);

  return {
    isLoggedIn,
    isAuthenticated: checkAuth(),
    logout,
    checkAuth,
    getCurrentToken,
  };
}; 