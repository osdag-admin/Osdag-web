import React, { useState, useContext, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  RouterProvider,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Worker } from "@react-pdf-viewer/core";

import Sidebar from "./components/Sidebar";
import Mainwindow from "./components/Mainwindow";
import Window from "./components/Window";
import { GlobalProvider } from "./context/GlobalState";
import { ModuleProvider } from "./context/ModuleState";
import { UserContext, UserProvider } from "./context/UserState";
import UserAccount from "./components/userAccount/UserAccount";
// New component for the login page
import LoginPage from "./components/userAuth/LoginPage";

// jwt imports
import jwt_decode from "jwt-decode";
import EndPlate from "./components/shearConnection/EndPlate";
import SeatedAngle from "./components/shearConnection/SeatedAngle";
import CoverPlateBolted from "./modules/coverPlateBolted/CoverPlateBolted";
import BeamBeamEndPlate from "./modules/beamBeamEndPlate/BeamBeamEndPlate";
import BoltedToEnd from "./modules/TensionMembers/BoltedToEnd/BoltedToEnd";

// module imports
import CoverPlateWelded from "./modules/coverPlateWelded/CoverPlateWelded";

import BeamToColumnEndPlate from "./components/momentConnection/BeamToColumnEndPlate";
import Homepage from "./homepage/pages/Homepage";
import FinPlate from "./modules/shearConnection/endPlate/FinPlate";
import CleatAngle from "./modules/shearConnection/cleatAngle/CleatAngle";

let renderedOnce = false

function App() {
  // State to track user authentication status
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // using redux variables
  const { isLoggedIn, userLogin } = useContext(UserContext);
  let loggedIn = false;
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root loggedIn={loggedIn} />}>
        <Route path="/home" element={<Mainwindow />} />
        {/* <Route path="/home" element={<Homepage />} /> */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/design-type/:designType" element={<Window />} />
        {/* Wrap FinePlate with a route that checks authentication */}
        <Route path="/design/:designType/fin_plate" element={<FinPlate />} />
        <Route path="/design/:designType/end_plate" element={<EndPlate />} />
        <Route
          path="/design/:designType/cleat_angle"
          element={<CleatAngle />}
        />
        <Route
          path="/design/:designType/seated_angle"
          element={<SeatedAngle />}
        />
        <Route
          path="/design/:designType/beam-to-beam-splice/cover_plate_bolted"
          element={<CoverPlateBolted />}
        />
        <Route
          path="/design/:designType/beam-to-beam-splice/end_plate"
          element={<BeamBeamEndPlate />}
        />
        <Route
          path='/design/:designType/bolted_to_end_gusset'
          element={<BoltedToEnd />}
        />
        <Route
          path="/design/:designType/beam-to-beam-splice/cover_plate_welded"
          element={<CoverPlateWelded />}
        />
        <Route
          path="/design/connections/beam-to-column/end_plate"
          element={<BeamToColumnEndPlate />}
        />
        <Route path='/user' element={<UserAccount />} />
      </Route>
    )
  );

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
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

const Root = (loggedIn) => {
  const { userLogin } = useContext(UserContext);
  const navigate = useNavigate();

  // Clear sessions when route changes
  useEffect(() => {
    const currentPath = window.location.pathname;

    // Clear sessions when navigating to non-design pages
    if (currentPath === '/' || currentPath === '/home' || currentPath.startsWith('/user')) {
      
    }
  }, []);

  if (!renderedOnce) {
    // obtain the access token from the localStorage, when the user is on the main application page
    // and the user nagivates to login page, the user should not have to login again
    // then, implemented access_token checking and decoding
    if (localStorage.getItem("access")) {
      const decodedAccessToken = jwt_decode(localStorage.getItem("access"));
     
      // check expiration
      if (
        decodedAccessToken.exp > Date.now() / 1000 &&
        decodedAccessToken.username &&
        decodedAccessToken.email
      ) {
        // the user should automatically be logged in
        loggedIn = true;
        
        userLogin(
          decodedAccessToken.username,
          "", // Don't pass password for security
          false,
          true
        );
      } else {
        // login again
        loggedIn = false;
      }

    } else {
      // login again
      loggedIn = false;
    }

    renderedOnce = true;
  }

  // Check if the current pathname matches the specified path
  const isDesignPage = window.location.pathname.startsWith("/design/");
  const isUserProfilePage =
    window.location.pathname.startsWith("/user");
  const isLoginPage = window.location.pathname === "/";

  return (
    <>
      {/* Show Sidebar when authenticated and not on a design page */}
      {!isLoginPage && !isDesignPage && !isUserProfilePage && <Sidebar />}
      <Outlet />
    </>
  );
};

export default App;