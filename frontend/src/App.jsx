import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  RouterProvider,
} from "react-router-dom";

import { Worker } from "@react-pdf-viewer/core";

import { GlobalProvider } from "./context/GlobalState";
import { ModuleProvider } from "./context/ModuleState";
import { ShortcutProvider } from "./utils/shortcuts/ShortcutProvider";

// User components
import LoginPage from "./Auth/LoginPage";

// Homepage components
import Homepage from "./homepage/pages/Homepage";
import SelectModulePage from "./homepage/pages/SelectModulePage";
import MyDataPage from "./homepage/pages/MyDataPage";


// Shear connection modules
import FinPlate from "./modules/shearConnection/finPlate/FinPlate";
import CleatAngle from "./modules/shearConnection/cleatAngle/CleatAngle";
import EndPlate from "./modules/shearConnection/endPlate/EndPlate";
import SeatedAngle from "./modules/shearConnection/seatAngle/SeatedAngle";

// Simple connection modules
import ButtJointWelded from "./modules/SimpleConnection/ButtJointWelded/ButtJointWelded";
import ButtJointBolted from "./modules/SimpleConnection/ButtJointBolted/ButtJointBolted";
import LapJointWelded from "./modules/SimpleConnection/LapJointWelded/LapJointWelded";
import LapJointBolted from "./modules/SimpleConnection/LapJointBolted/LapJointBolted";

// Tension members modules
import BoltedToEnd from "./modules/TensionMembers/BoltedToEnd/BoltedToEnd";
import WeldedToEnd from "./modules/TensionMembers/WeldedToEnd/WeldedToEnd";

// Compression members modules
import CompressionMember from "./modules/compressionMember/CompressionMember";
import StrutsBolted from "./modules/compressionMember/StrutsBolted";
import StrutsWelded from "./modules/compressionMember/StrutsWelded";
import AxiallyLoadedColumn from "./modules/compressionMember/AxiallyLoadedColumn";

// Beam modules
import SimplySupportedBeam from "./modules/flexuralMember/simplySupportedBeam";
import OnCantilever from "./modules/flexuralMember/onCantilever";
import Purlin from "./modules/flexuralMember/purlin";
import PlateGirder from "./modules/flexuralMember/plateGirder";
import ColumnColumnEndPlate from "./modules/columnColumnEndPlate/ColumnColumnEndPlate";
import BeamBeamEndPlate from "./modules/beamBeamEndPlate/BeamBeamEndPlate";

// Cover plate modules
import ColumnColumnCoverPlateBolted from "./modules/columnColumnCoverPlateBolted/CoverPlateBolted";
import ColumnColumnCoverPlateWelded from "./modules/columnColumnCoverPlateWelded/CoverPlateWelded";
import CoverPlateBolted from "./modules/coverPlateBolted/CoverPlateBolted";
import CoverPlateWelded from "./modules/coverPlateWelded/CoverPlateWelded";
import BasePlate from "./modules/basePlate/BasePlate";

import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BeamToColumnEndPlate from "./modules/beamToColumnEndPlate/BeamToColumnEndPlate";
import ShortcutHelpModal from "./components/ShortcutHelpModal";

import ErrorPage from "./components/ErrorPage";
import ProjectAuthGuard from "./components/ProjectAuthGuard";
import PrivacyTab from "./homepage/components/tabs/PrivacyTab";
import CaveatsTab from "./homepage/components/tabs/CaveatsTab";

function App() {
  let loggedIn = false;
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root loggedIn={loggedIn} />} errorElement={<ErrorPage />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Homepage />} />

        {/* Privacy Policy */}
        <Route path="/privacy-policy" element={<PrivacyTab />} />
        <Route path="/caveats" element={<CaveatsTab />} />
        <Route path="/:moduleName" element={<SelectModulePage />} />

        <Route element={<ProjectAuthGuard />}>
          <Route path="/my-data" element={<MyDataPage />} />
          <Route path="/design/:designType/shear/fin_plate/:projectId?" element={<FinPlate />} />
          <Route path="/design/:designType/shear/end_plate/:projectId?" element={<EndPlate />} />
          <Route path="/design/:designType/shear/seatAngle/:projectId?" element={<SeatedAngle />} />
          <Route path="/design/:designType/shear/cleat_angle/:projectId?" element={<CleatAngle />} />
          <Route path="/design/:designType/column-to-column-splice/cover_plate_bolted/:projectId?" element={<ColumnColumnCoverPlateBolted />} />
          <Route path="/design/:designType/column-to-column-splice/cover_plate_welded/:projectId?" element={<ColumnColumnCoverPlateWelded />} />
          <Route path="/design/:designType/column-to-column-splice/end_plate/:projectId?" element={<ColumnColumnEndPlate />} />
          <Route path="/design/:designType/beam-to-beam-splice/cover_plate_bolted/:projectId?" element={<CoverPlateBolted />} />
          <Route path="/design/:designType/beam-to-beam-splice/cover_plate_welded/:projectId?" element={<CoverPlateWelded />} />
          <Route path="/design/:designType/beam-to-beam-splice/end_plate/:projectId?" element={<BeamBeamEndPlate />} />
          <Route path="/design/:designType/base_plate/:projectId?" element={<BasePlate />} />
          <Route path="/design/:designType/simple/butt_joint_welded/:projectId?" element={<ButtJointWelded />} />
          <Route path="/design/:designType/simple/butt_joint_bolted/:projectId?" element={<ButtJointBolted />} />
          <Route path="/design/:designType/simple/lap_joint_welded/:projectId?" element={<LapJointWelded />} />
          <Route path="/design/:designType/simple/lap_joint_bolted/:projectId?" element={<LapJointBolted />} />
          <Route path="/design/:designType/simply_supported_beam/:projectId?" element={<SimplySupportedBeam />} />
          <Route path="/design/:designType/on_cantilever/:projectId?" element={<OnCantilever />} />
          <Route path="/design/:designType/purlin/:projectId?" element={<Purlin />} />
          <Route path="/design/:designType/plate_girder/:projectId?" element={<PlateGirder />} />
          <Route path="/design/:designType/bolted_to_end_gusset/:projectId?" element={<BoltedToEnd />} />
          <Route path="/design/:designType/welded_to_end_gusset/:projectId?" element={<WeldedToEnd />} />
          <Route path="/design/:designType/tension-member/bolted_to_end_gusset/:projectId?" element={<BoltedToEnd />} />
          <Route path="/design/:designType/tension-member/welded_to_end_gusset/:projectId?" element={<WeldedToEnd />} />
          <Route path="/design/:designType/tension_member/bolted_to_end_gusset/:projectId?" element={<BoltedToEnd />} />
          <Route path="/design/:designType/tension_member/welded_to_end_gusset/:projectId?" element={<WeldedToEnd />} />

          <Route path="/design/:designType/column-beam/:projectId?" element={<BeamToColumnEndPlate />} />

          {/* Compression Members */}
          <Route path="/design/:designType/struts_in_trusses/:projectId?" element={<CompressionMember />} />
          <Route path="/design/:designType/struts_bolted_to_end_gusset/:projectId?" element={<StrutsBolted />} />
          <Route path="/design/:designType/struts_welded_to_end_gusset/:projectId?" element={<StrutsWelded />} />
          <Route path="/design/:designType/axially_loaded_column/:projectId?" element={<AxiallyLoadedColumn />} />
        </Route>
      </Route>
    )
  );

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <GlobalProvider>
        <ModuleProvider>
          <ShortcutProvider>
            <div className="app">
              <ShortcutHelpModal />
              <ToastContainer position="top-right" autoClose={3000} />
              <RouterProvider router={router} />
            </div>
          </ShortcutProvider>
        </ModuleProvider>
      </GlobalProvider>
    </Worker>
  );
}

const Root = () => {
  return <Outlet />;
};

export default App;