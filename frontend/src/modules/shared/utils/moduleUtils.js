// Utility functions for module operations
import { getMenuShortcutLabel } from "../../../constants/shortcuts";

export const menuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Create Project", shortcut: getMenuShortcutLabel("Create Project") },
      { name: "Load Input", shortcut: getMenuShortcutLabel("Load Input") },
      { name: "Download Osi" },
      // { name: "Download Input", shortcut: "Alt+D" },
      { name: "Save Log Messages" },
      { name: "Create Design Report", shortcut: getMenuShortcutLabel("Create Design Report") },
      {
        name: "Save 3D Model",
        shortcut: getMenuShortcutLabel("Save 3D Model"),
      },
      { name: "Save Cad Image" },
      { name: "Quit" }
    ],
  },
  {
    label: "Graphics",
    dropdown: [
      { name: "Zoom In", shortcut: getMenuShortcutLabel("Zoom In") },
      { name: "Zoom Out", shortcut: getMenuShortcutLabel("Zoom Out") },
      { name: "Pan" },
      { name: "Rotate 3D Model" },
      { name: "Show Front View", shortcut: getMenuShortcutLabel("Show front view") },
      { name: "Show Top View", shortcut: getMenuShortcutLabel("Show top view") },
      { name: "Show Side View", shortcut: getMenuShortcutLabel("Show side view") },
      { name: "Show Optimization Graph", shortcut: getMenuShortcutLabel("Show optimization graph") },
    ],
  },
  {
    label: "Database",
    dropdown: [
      { name: "Save Inputs (.csv)" },
      { name: "Save Outputs (.csv)" },
      { name: "Save Inputs (.osi)" },
      { name: "Download Database", options: ["Column", "Beam", "Angle", "Channel"] },
      { name: "Reset", shortcut: getMenuShortcutLabel("Reset") },
    ],
  },
  {
    label: "Help",
    dropdown: [
      { name: "Design Examples" },
      { name: "Ask us a question" },
      { name: "About Osdag" }
    ],
  },
];