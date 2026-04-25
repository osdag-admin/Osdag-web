import { useMemo } from "react";

export default function useViewCamera(_moduleName, selectedView, _connectivity = null) {
  const viewSettings = useMemo(() => {
    const GRID_POSITIONS = {
      XY: [0, 40, 0],
      YZ: [40, 0, 0],
      ZX: [0, 0, 40],
      ANGLE1: [30, 30, 30],
      ANGLE2: [-30, 30, 30],
      ANGLE3: [30, -30, 30],
      ANGLE4: [-30, -30, 30],
      ANGLE5: [30, 30, -30],
      ANGLE6: [-30, 30, -30],
    };

    const DEFAULT_POSITION = [30, 30, 30];

    // If a grid angle is selected, use its fixed camera position
    if (selectedView && GRID_POSITIONS[selectedView]) {
      return { position: GRID_POSITIONS[selectedView] };
    }

    // For all other views/sections (Model, Beam, Column, Plate, etc.), use one default
    return { position: DEFAULT_POSITION };
  }, [selectedView]);

  return viewSettings;
}
