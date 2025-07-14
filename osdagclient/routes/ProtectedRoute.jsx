import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../src/context/UserState";
import { isAuthenticated } from "../src/utils/auth";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  const location = useLocation();

  // Check if user is a guest user
  const userType = localStorage.getItem("userType");
  const isGuest = userType === "guest";
  
  // Use both context and token validation for security
  // Allow access if user is logged in OR if they are a guest
  const userIsAuthenticated = isLoggedIn || isGuest || isAuthenticated();

  if (!userIsAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
