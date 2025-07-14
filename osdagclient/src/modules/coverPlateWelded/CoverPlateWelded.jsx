import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateWeldedConfig } from './configs/coverPlateWeldedConfig';
import CoverPlateWeldedOutputDock from './components/CoverPlateWeldedOutputDock';

// Menu items for the navigation
const MenuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Download Input", shortcut: "Ctrl+D" },
      { name: "Save Input", shortcut: "Alt+N" },
      { name: "Save Log Messages", shortcut: "Alt+M" },
      { name: "Create Design Report", shortcut: "Alt+C" },
      { name: "Save 3D Model", shortcut: "Alt+3" },
      { name: "Save Cad Image", shortcut: "Alt+1" },
      { name: "Save Front View", shortcut: "Alt+Shift+F" },
      { name: "Save Top View", shortcut: "Alt+Shift+T" },
      { name: "Save Side View", shortcut: "Alt+Shift+S" },
      { name: "Quit", shortcut: "Shift+Q" },
    ],
  },
  {
    label: "Edit",
    dropdown: [{ name: "Design Preferences", shortcut: "Alt+P" }],
  },
  {
    label: "Graphics",
    dropdown: [
      { name: "Zoom In", shortcut: "Ctrl+I" },
      { name: "Zoom Out", shortcut: "Ctrl+O" },
      { name: "Pan", shortcut: "Ctrl+P" },
      { name: "Rotate 3D Model", shortcut: "Ctrl+R" },
      { name: "Model" },
      { name: "Beam" },
      { name: "Column" },
      { name: "FinePlate" },
      { name: "Change Background" },
    ],
  },
  {
    label: "Database",
    dropdown: [
      { name: "Downloads", options: ["Column", "Beam", "Angle", "Channel"] },
      { name: "Reset" },
    ],
  },
  {
    label: "Help",
    dropdown: [
      { name: "Video Tutorials" },
      { name: "Design Examples" },
      { name: "Ask us a question" },
      { name: "About Osdag" },
    ],
  },
];

const CoverPlateWelded = () => {
  return (
    <EngineeringModule
      moduleConfig={coverPlateWeldedConfig}
      OutputDockComponent={CoverPlateWeldedOutputDock}
      menuItems={MenuItems}
      title="Beam-to-Beam Cover Plate Welded Connection"
    />
  );
};

export default CoverPlateWelded;
