import { useMemo } from "react";

export default function useViewCamera(moduleName, selectedView) {
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
      },
      // Add default fallback settings
      default: {
        Model: { position: [10, 8, 10], fov: 40 },
        Beam: { position: [9, 7, 9], fov: 40 },
        Connector: { position: [-10, 8, -10], fov: 35 },
      },
    }),
    []
  );

  // Defensive programming - check if moduleName and selectedView exist
  const moduleSettings = cameraSettings[moduleName] || cameraSettings.default;
  const viewSettings = moduleSettings[selectedView] || moduleSettings.Model;

  // Log warning if using fallback
  if (!cameraSettings[moduleName]) {
    console.warn(`Camera settings not found for module: ${moduleName}, using default settings`);
  }
  
  if (!cameraSettings[moduleName]?.[selectedView]) {
    console.warn(`Camera settings not found for view: ${selectedView} in module: ${moduleName}, using Model view`);
  }

  return viewSettings;
}