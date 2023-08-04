import React, { useState, useContext, useEffect } from 'react';
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
import { UserContext, UserProvider } from './context/UserState';
import UserAccount from './components/userAccount/UserAccount';
import { useSelector } from 'react-redux';
// New component for the login page
import LoginPage from './components/userAuth/LoginPage';

function App() {
  // State to track user authentication status
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // using redux variables 
  const {isLoggedIn} = useContext(UserContext)
  
  console.log('isLoggedIn : ' , isLoggedIn)

  useEffect(() => {
    console.log('isLogged in useEffect : ' , isLoggedIn)
  } , [isLoggedIn])


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root isLoggedIn={isLoggedIn} />}>
        <Route index element={<Mainwindow />} />
        <Route path='/design-type/:designType' element={<Window />} />
        {/* Wrap FinePlate with a route that checks authentication */}
        <Route
          path='/design/:designType/:item'
          element={
            isLoggedIn ? <FinePlate /> : <Navigate to="/login" />
          }
        />
      <Route path='/user' element={<UserAccount />} />
      </Route>
      
    )
  );

  return (
    <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
      <UserProvider>
        <GlobalProvider>
          <ModuleProvider>
            <div className="app">
              {/* Show the login page when not authenticated */}
              {!isLoggedIn && <LoginPage />}
              {/* Render the router when authenticated */}
              {isLoggedIn && <RouterProvider router={router} />}
            </div>
          </ModuleProvider>
        </GlobalProvider>
      </UserProvider>
    </Worker>
  );
}

const Root = ( isLoggedIn ) => {
  console.log('isLoggedIn in root : ' , isLoggedIn)
  const navigate = useNavigate();

  // Check if the current pathname matches the specified path
  const isDesignPage = window.location.pathname.startsWith('/design/');
  const isUserProfilePage = window.location.pathname.startsWith('/useraccount/');

  return (
    <>
      {/* Show Sidebar when authenticated and not on a design page */}
      {isLoggedIn && !isDesignPage && !isUserProfilePage && (
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
