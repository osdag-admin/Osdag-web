// src/Root.jsx
import React, { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UserContext } from "./context/UserState";
import Sidebar from "./components/Sidebar";

const Root = () => {
    const { isLoggedIn } = useContext(UserContext);
    const location = useLocation();

    // Determine which pages should not show the sidebar
    const isDesignPage = location.pathname.startsWith("/design/");
    const isUserProfilePage = location.pathname.startsWith("/user");
    const isLoginPage = location.pathname === "/";

    return (
        <>
            {isLoggedIn && !isDesignPage && !isUserProfilePage && !isLoginPage && (
                <Sidebar />
            )}
            <Outlet />
        </>
    );
};

export default Root;
