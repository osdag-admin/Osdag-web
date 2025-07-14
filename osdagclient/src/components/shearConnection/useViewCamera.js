import { useMemo } from "react";

export default function useViewCamera(selectedView) {
    const cameraSettings = useMemo(() => ({
        Model: { position: [-8, 8, 10], fov: 31 },
        Plate: { position: [-6, 2, 10], fov: 15 },
        Beam: { position: [-10, 5, 10], fov: 20 },
        Column: { position: [12, 7, -10], fov: 30 },
        cleatAngle: { position: [10, 2, 3], fov: 14 },
        SeatAngle: { position: [10, 10, 5], fov: 52 },
    }), []);

    return cameraSettings[selectedView] || cameraSettings["Model"];
}