// Utility functions for module operations

export const convertToCSV = (data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const csvData = keys.map((key, index) => {
    const escapedValue = values[index].toString().replace(/"/g, '\"');
    return `"${key}","${escapedValue}"`;
  });
  return csvData.join("\n");
};

export const menuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Create Project", shortcut: "Ctrl+N" },
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Download Osi", shortcut: "Ctrl+S" },
      // { name: "Download Input", shortcut: "Alt+D" },
      { name: "Save Log Messages", shortcut: "Alt+M" },
      { name: "Create Design Report", shortcut: "Alt+C" },
      { name: "Save 3D Model", shortcut: "Alt+3" },
      { name: "Save Cad Image", shortcut: "Alt+I" },
      { name: "Quit", shortcut: "Shift+Q" }
    ],
  },
  // {
  //  label: "Edit",
  //  dropdown: [{ name: "Design Preferences", shortcut: "Alt+P" }],
  // },
  {
    label: "Graphics",
    dropdown: [
      { name: "Zoom In", shortcut: "Ctrl+I" },
      { name: "Zoom Out", shortcut: "Ctrl+O" },
      { name: "Pan", shortcut: "Ctrl+P" },
      { name: "Rotate 3D Model", shortcut: "Ctrl+R" },
      { name: "Show front view", shortcut: "Alt+Shift+F" },
      { name: "Show top view", shortcut: "Alt+Shift+T" },
      { name: "Show side view", shortcut: "Alt+Shift+S" },
      { name: "Model" },
      { name: "Beam" },
      { name: "Column" },
      { name: "Seated Angle" },
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
      { name: "Check For Update" }
    ],
  },
];

// ...other utility functions as needed