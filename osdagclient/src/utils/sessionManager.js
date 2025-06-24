// Session management utilities for module cookies

/**
 * List of all module session cookies
 */
const MODULE_COOKIES = [
  'fin_plate_connection_session',
  'end_plate_connection_session', 
  'cleat_angle_connection_session',
  'seated_angle_connection',
  'cover_plate_bolted_connection_session',
  'beam_beam_end_plate_connection_session',
  'cover_plate_welded_connection_session',
  'beam_to_column_end_plate_connection_session',
  'tension_member_bolted_design_session'
];

/**
 * Module ID to cookie name mapping
 */
const MODULE_COOKIE_MAP = {
  "Fin Plate Connection": "fin_plate_connection_session",
  "End Plate Connection": "end_plate_connection_session",
  "Cleat Angle Connection": "cleat_angle_connection_session",
  "Seated Angle Connection": "seated_angle_connection",
  "Cover Plate Bolted Connection": "cover_plate_bolted_connection_session",
  "Beam Beam End Plate Connection": "beam_beam_end_plate_connection_session",
  "Cover Plate Welded Connection": "cover_plate_welded_connection_session",
  "Beam-to-Column End Plate Connection": "beam_to_column_end_plate_connection_session",
  "Tension Member Bolted Design": "tension_member_bolted_design_session"
};

/**
 * Clear all module session cookies
 */
export const clearAllModuleCookies = () => {
  MODULE_COOKIES.forEach(cookieName => {
    // Clear cookie by setting expiration to past date
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure;`;
  });
  console.log('All module session cookies cleared');
};

/**
 * Clear specific module cookie
 */
export const clearModuleCookie = (cookieName) => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure;`;
  console.log(`Module cookie cleared: ${cookieName}`);
};

/**
 * Get the current active module cookie
 */
export const getActiveModuleCookie = () => {
  for (const cookieName of MODULE_COOKIES) {
    if (getCookie(cookieName)) {
      return cookieName;
    }
  }
  return null;
};

/**
 * Helper function to get cookie value
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Delete session via API call
 */
export const deleteSessionAPI = async (moduleId) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/sessions/delete', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ module_id: moduleId }),
    });

    if (response.status === 200) {
      console.log(`Session deleted for module: ${moduleId}`);
      // Also clear the cookie from frontend
      const cookieName = MODULE_COOKIE_MAP[moduleId];
      if (cookieName) {
        clearModuleCookie(cookieName);
      }
    } else {
      console.error(`Error deleting session for ${moduleId}:`, response.status);
    }
  } catch (error) {
    console.error(`Error deleting session for ${moduleId}:`, error);
  }
};

/**
 * Clear all sessions when navigating away from modules
 */
export const clearSessionsOnNavigation = async () => {
  const activeCookie = getActiveModuleCookie();
  if (activeCookie) {
    // Find the module ID for the active cookie
    const moduleId = Object.keys(MODULE_COOKIE_MAP).find(
      key => MODULE_COOKIE_MAP[key] === activeCookie
    );
    
    if (moduleId) {
      await deleteSessionAPI(moduleId);
    }
  }
  
  // Clear all cookies as backup
  clearAllModuleCookies();
}; 