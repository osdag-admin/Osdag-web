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
    }),
    []
  );

  return cameraSettings[moduleName][selectedView];
}
