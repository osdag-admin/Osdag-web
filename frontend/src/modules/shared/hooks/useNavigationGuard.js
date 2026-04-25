import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Navigation guard for unsaved work/back button handling.
 * Keeps UI state for confirmation modal and pending navigation.
 */
export const useNavigationGuard = (hasUnsavedWork, routePath) => {
  const navigate = useNavigate();

  // Modal State
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState("reset"); // 'reset' | 'navigation'

  // Navigation State
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [navigationSource, setNavigationSource] = useState(null); // 'home' | 'back'

  // Browser Guard (Refresh / Close Tab) and Back Button Guard
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedWork) {
        const message = "You have unsaved design progress. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePopState = () => {
      if (hasUnsavedWork && !allowNavigation) {
        try {
          // Preserve the full current path (including projectId) so we don't
          // lose the project context when trapping the back button.
          const currentPath = window.location.pathname;
          window.history.pushState(null, "", currentPath);
        } catch (e) {
          // pushState can throw "The operation is insecure" in some contexts (e.g. post-login redirect, iframe)
          if (e?.name !== "SecurityError") throw e;
        }
        setConfirmationType("navigation");
        setNavigationSource("back");
        setShowConfirmation(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [allowNavigation, hasUnsavedWork, routePath]);

  // Ensure there's a history entry to trap back navigation when work is unsaved
  useEffect(() => {
    if (!hasUnsavedWork) return;
    try {
      const path = window.location.pathname;
      if (path && window.location.origin) {
        window.history.pushState(null, "", path);
      }
    } catch (e) {
      // pushState can throw "The operation is insecure" (e.g. post-login, iframe, or restricted context)
      if (e?.name !== "SecurityError") throw e;
    }
  }, [hasUnsavedWork]);

  const confirmNavigation = (type, source) => {
    setConfirmationType(type);
    setNavigationSource(source || null);
    setShowConfirmation(true);
  };

  const performNavigation = () => {
    setAllowNavigation(true);
    setShowConfirmation(false);
    setConfirmationType("reset");

    setTimeout(() => {
      if (navigationSource === "home") {
        navigate("/home");
      } else if (navigationSource === "back") {
        navigate(-1);
      }
      setAllowNavigation(false);
      setNavigationSource(null);
    }, 100);
  };

  const cancelNavigation = () => {
    setShowConfirmation(false);
    setConfirmationType("reset");
    setNavigationSource(null);
  };

  return {
    showConfirmation,
    setShowConfirmation,
    confirmationType,
    setConfirmationType,
    navigationSource,
    confirmNavigation,
    performNavigation,
    cancelNavigation,
  };
};

