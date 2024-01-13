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

// jwt imports 
import jwt_decode from 'jwt-decode';

let renderedOnce = false

function App() {
  // State to track user authentication status
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // using redux variables 
  const {isLoggedIn , userLogin} = useContext(UserContext)
  let loggedIn = false
  
  console.log('isLoggedIn : ' , isLoggedIn)

  useEffect(() => {
    console.log('isLogged in useEffect : ' , isLoggedIn)
  } , [isLoggedIn])


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root loggedIn={loggedIn} />}>
        <Route path="/home" element={<Mainwindow />} />
        <Route path="/" element={<LoginPage />} />
        <Route path='/design-type/:designType' element={<Window />} />
        {/* Wrap FinePlate with a route that checks authentication */}
        <Route
          path='/design/:designType/:item'
          element={
             <FinePlate /> 
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
              {/* {!isLoggedIn && <LoginPage />} */}
              
              {/* Render the router when authenticated */}
              <RouterProvider router={router} />
            </div>
          </ModuleProvider>
        </GlobalProvider>
      </UserProvider>
    </Worker>
  );
}

const Root = ( loggedIn ) => {
  const {userLogin} = useContext(UserContext)
  if(!renderedOnce){
      
    // obtain the access token from the localStorage, when the user is on the main application page 
    // and the user nagivates to login page, the user should not have to login again
    // then, implemented access_token checking and decoding
    if(localStorage.getItem('access')){
      const decodedAccessToken = jwt_decode(localStorage.getItem('access'))
      console.log('decodedAccessToken : ' , decodedAccessToken)
      console.log('Date.now() / 1000 : ' , Date.now()/1000)
      // check expiration
      if(decodedAccessToken.exp > Date.now() / 1000 && decodedAccessToken.username && decodedAccessToken.password && decodedAccessToken.email ){
        // the user should automatically be logged in 
        loggedIn = true
        console.log('loggedIn : ' , loggedIn)
        userLogin(decodedAccessToken.username , decodedAccessToken.password , false , true)
      }else{
        // login again
        loggedIn = false
        console.log('loggedIn : ' , loggedIn)
      }

      console.log('isLoggedIn in root : ' , loggedIn)
    }else{
      // login again
      loggedIn = false
      console.log('loggedIn : ' , loggedIn)
    }
    
    renderedOnce = true
  }
  
  const navigate = useNavigate();

  // Check if the current pathname matches the specified path
  const isDesignPage = window.location.pathname.startsWith('/design/');
  const isUserProfilePage = window.location.pathname.startsWith('/useraccount/');
  const isLoginPage = window.location.pathname === '/';

  return (
    <>
      {/* Show Sidebar when authenticated and not on a design page */}
      {!isLoginPage && !isDesignPage && !isUserProfilePage &&(
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
