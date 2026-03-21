import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCadSceneContext } from "./context/CadSceneContext";
import { computeSceneBoundingBox, distanceForFov, DEFAULT_DISTANCE } from "./utils/sceneBbox";

const GRID_VIEWS = [
  "XY", "YZ", "ZX", "ANGLE1", "ANGLE2", "ANGLE3", "ANGLE4", "ANGLE5", "ANGLE6"
];

const ISO_DIRECTION = new THREE.Vector3(1, 1, 1).normalize();

/**
 * Computes scene bbox, sets orbit target to center, and (for non-grid views)
 * sets initial camera position to center + direction * distance.
 * Must run inside Canvas and inside CadSceneProvider.
 */
export function CadSceneBbox({ modelKey, selectedCameraView }) {
  const { scene, camera } = useThree();
  const { setOrbitTarget } = useCadSceneContext();
  const rafId = useRef(null);

  useEffect(() => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const bbox = computeSceneBoundingBox(scene);
      if (!bbox) {
        setOrbitTarget([0, 0, 0]);
        return;
      }
      const { center, size } = bbox;
      setOrbitTarget([center.x, center.y, center.z]);

      const isGridView = selectedCameraView && GRID_VIEWS.includes(selectedCameraView);
      if (!isGridView) {
        const fovDeg = typeof camera.fov === "number" ? camera.fov : 13;
        const computedDistance = distanceForFov(size, fovDeg);
        const distance = Math.max(computedDistance, DEFAULT_DISTANCE);
        camera.position.set(
          center.x + ISO_DIRECTION.x * distance,
          center.y + ISO_DIRECTION.y * distance,
          center.z + ISO_DIRECTION.z * distance
        );
        camera.lookAt(center.x, center.y, center.z);
        camera.updateProjectionMatrix();
      }
    });
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [modelKey, selectedCameraView, scene, camera, setOrbitTarget]);

  return null;
}
