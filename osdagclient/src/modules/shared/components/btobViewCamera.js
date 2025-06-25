import { useMemo } from "react";

export default function useViewCamera(moduleName, selectedView, connectivity = null) {
  const cameraSettings = useMemo(
    () => ({
      BeamBeamEndPlate: {
        Model: { position: [10, 8, 10], fov: 40 },
        Beam: { position: [9, 7, 9], fov: 40 },
        Connector: { position: [-10, 8, -10], fov: 35 },
      },
      CoverPlateBolted: {
        Model: { position: [12, 10, 12], fov: 25 },
        Beam: { position: [11, 9, 11], fov: 24 },
        Connector: { position: [-11, 9, -11], fov: 18 },
      },
      FinPlate: {
        Model: { position: [10, 8, 10], fov: 40 },
        Beam: { position: [9, 7, 9], fov: 40 },
        Column: { position: [8, 6, 8], fov: 42 },
        Plate: { position: [-8, 6, -8], fov: 38 },
        
        connectivitySettings: {
          "Column Flange-Beam-Web": {
            Model: { position: [10, 8, 10], fov: 40 },
            Beam: { position: [9, 7, 9], fov: 40 },
            Column: { position: [8, 6, 8], fov: 42 },
            Plate: { position: [-8, 6, -8], fov: 38 },
          },
          "Column Web-Beam-Web": {
            Model: { position: [12, 10, 8], fov: 38 },
            Beam: { position: [10, 8, 7], fov: 38 },
            Column: { position: [9, 7, 6], fov: 40 },
            Plate: { position: [-9, 7, -6], fov: 36 },
          },
          "Beam-Beam": {
            Model: { position: [8, 6, 12], fov: 42 },
            Beam: { position: [7, 5, 10], fov: 42 },
            Column: { position: [6, 4, 9], fov: 44 },
            Plate: { position: [-6, 4, -9], fov: 40 },
          },
        },
      },
      default: {
        Model: { position: [10, 8, 10], fov: 40 },
        Beam: { position: [9, 7, 9], fov: 40 },
        Connector: { position: [-10, 8, -10], fov: 35 },
      },
    }),
    []
  );

  // Get base module settings
  const moduleSettings = cameraSettings[moduleName] || cameraSettings.default;
  
  // Handle FinPlate connectivity-specific settings
  if (moduleName === "FinPlate" && connectivity && moduleSettings.connectivitySettings) {
    const connectivitySettings = moduleSettings.connectivitySettings[connectivity];
    
    if (connectivitySettings) {
      const viewSettings = connectivitySettings[selectedView] || connectivitySettings.Model;
      
      // Log if using fallback view for connectivity
      if (!connectivitySettings[selectedView]) {
        console.warn(
          `Camera settings not found for view: ${selectedView} in connectivity: ${connectivity}, using Model view`
        );
      }
      
      return viewSettings;
    } else {
      console.warn(
        `Camera settings not found for connectivity: ${connectivity}, using default FinPlate settings`
      );
    }
  }
  
  // Default handling for non-FinPlate modules or when no connectivity is provided
  const viewSettings = moduleSettings[selectedView] || moduleSettings.Model;

  // Log warning if using fallback
  if (!cameraSettings[moduleName]) {
    console.warn(
      `Camera settings not found for module: ${moduleName}, using default settings`
    );
  }
  
  if (!cameraSettings[moduleName]?.[selectedView]) {
    console.warn(
      `Camera settings not found for view: ${selectedView} in module: ${moduleName}, using Model view`
    );
  }

  return viewSettings;
}