import React, { useState } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  RouterProvider,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { Worker } from '@react-pdf-viewer/core';

import Sidebar from './components/Sidebar';
import Mainwindow from './components/Mainwindow';
import Window from './components/Window';
import FinePlate from './components/shearConnection/FinePlate';
import { GlobalProvider } from './context/GlobalState';
import { ModuleProvider } from './context/ModuleState';
import UserAccount from './components/userAccount/UserAccount';

// New component for the login page
import LoginPage from './components/userAuth/LoginPage';

function App() {
  // State to track user authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root isAuthenticated={isAuthenticated} />}>
        <Route index element={<Mainwindow />} />
        <Route path='/design-type/:designType' element={<Window />} />
        {/* Wrap FinePlate with a route that checks authentication */}
        <Route
          path='/design/:designType/:item'
          element={
            isAuthenticated ? <FinePlate /> : <Navigate to="/login" />
          }
        />
      <Route path='/user' element={<UserAccount />} />
      </Route>
      
    )
  );

  return (
    <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
      <GlobalProvider>
        <ModuleProvider>
          <div className="app">
            {/* Show the login page when not authenticated */}
            {!isAuthenticated && <LoginPage onLogin={handleLogin} />}
            {/* Render the router when authenticated */}
            {isAuthenticated && <RouterProvider router={router} />}
          </div>
        </ModuleProvider>
      </GlobalProvider>
    </Worker>
  );
}

const Root = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  // Check if the current pathname matches the specified path
  const isDesignPage = window.location.pathname.startsWith('/design/');
  const isUserProfilePage = window.location.pathname.startsWith('/useraccount/');

  return (
    <>
      {/* Show Sidebar when authenticated and not on a design page */}
      {isAuthenticated && !isDesignPage && !isUserProfilePage && (
        <div>
          <Sidebar />
        </div>
      )}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default App;
