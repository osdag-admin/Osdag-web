// appRoutes.js
import React from "react";
import Mainwindow from "../src/components/Mainwindow";
import SelectModulePage from "../src/homepage/pages/SelectModulePage";
import LoginPage from "../src/components/userAuth/LoginPage";
import Window from "../src/components/Window";
import FinePlate from "../src/components/shearConnection/FinePlate";
import EndPlate from "../src/components/shearConnection/EndPlate";
import CleatAngle from "../src/components/shearConnection/CleatAngle";
import SeatedAngle from "../src/components/shearConnection/SeatedAngle";
import CoverPlateBolted from "../src/components/momentConnection/beamToBeamSplice/CoverPlateBolted";
import BeamBeamEndPlate from "../src/components/momentConnection/beamToBeamSplice/BeamBeamEndPlate";
import BoltedToEnd from "../src/modules/TensionMembers/BoltedToEnd/BoltedToEnd";
import CoverPlateWelded from "../src/components/momentConnection/beamToBeamSplice/CoverPlateWelded";
import BeamToColumnEndPlate from "../src/components/momentConnection/BeamToColumnEndPlate";
import UserAccount from "../src/components/userAccount/UserAccount";
import ProtectedRoute from "./ProtectedRoute";
import SimplySupportedBeam from '../src/modules/flexuralMember/simplySupportedBeam';

// Group routes by type for better organization
const publicRoutes = [
  { path: "/", element: <LoginPage /> },
  { path: "/home", element: <Mainwindow /> }, // This should be accessible for guest mode
];

const protectedRoutes = [
  { path: "/:moduleName", element: <SelectModulePage /> },
  { path: "/design-type/:designType", element: <Window /> },
  { path: "/user", element: <UserAccount /> },
];

const shearConnectionRoutes = [
  { path: "/design/:designType/fin_plate", element: <FinePlate /> },
  { path: "/design/:designType/end_plate", element: <EndPlate /> },
  { path: "/design/:designType/cleat_angle", element: <CleatAngle /> },
  { path: "/design/:designType/seated_angle", element: <SeatedAngle /> },
];

const momentConnectionRoutes = [
  { path: "/design/:designType/beam-to-beam-splice/cover_plate_bolted", element: <CoverPlateBolted /> },
  { path: "/design/:designType/beam-to-beam-splice/end_plate", element: <BeamBeamEndPlate /> },
  { path: "/design/:designType/beam-to-beam-splice/cover_plate_welded", element: <CoverPlateWelded /> },
  { path: "/design/connections/beam-to-column/end_plate", element: <BeamToColumnEndPlate /> },
];

const tensionMemberRoutes = [
  { path: "/design/:designType/bolted_to_end_gusset", element: <BoltedToEnd /> },
];

const flexuralMemberRoutes = [
  { path: "/design/:designType/simply_supported_beam", element: <SimplySupportedBeam /> },
];

// Combine all routes
const routes = [
  ...publicRoutes, // Public routes don't need protection
  ...protectedRoutes.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })),
  ...shearConnectionRoutes.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })),
  ...momentConnectionRoutes.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })),
  ...tensionMemberRoutes.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })),
  ...flexuralMemberRoutes.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })),
];

export default routes;
