import { lazy } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router";
import { RouterProvider } from "react-router/dom";


import { GlobalProvider } from "./context/GlobalState";
import { ModuleProvider } from "./context/ModuleState";
import { ShortcutProvider } from "./utils/shortcuts/ShortcutProvider";

// User components
import LoginPage from "./Auth/LoginPage";

// Homepage components
import Homepage from "./homepage/pages/Homepage";
import SelectModulePage from "./homepage/pages/SelectModulePage";

import "./App.css";
import { ToastContainer } from "react-toastify";
import ShortcutHelpModal from "./components/ShortcutHelpModal";
import ErrorPage from "./components/ErrorPage";
import ProjectAuthGuard from "./components/ProjectAuthGuard";
import PrivacyTab from "./homepage/components/tabs/PrivacyTab";
import CaveatsTab from "./homepage/components/tabs/CaveatsTab";
import ModulePage from "./modules/ModulePage";
import { MODULES } from "./modules/registry";

// Route pages are lazy-loaded so the login/home bundle stays small
const MyDataPage = lazy(() => import("./homepage/pages/MyDataPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Homepage />} />

      {/* Privacy Policy */}
      <Route path="/privacy-policy" element={<PrivacyTab />} />
      <Route path="/caveats" element={<CaveatsTab />} />
      <Route path="/:moduleName" element={<SelectModulePage />} />

      <Route element={<ProjectAuthGuard />}>
        <Route path="/my-data" element={<MyDataPage />} />
        {MODULES.map((module) => (
          <Route key={module.id} path={`${module.path}/:projectId?`} element={<ModulePage module={module} />} />
        ))}
      </Route>
    </Route>
  )
);

function App() {
  return (
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
  );
}

export default App;
