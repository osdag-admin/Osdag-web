/* eslint-disable react/no-unknown-property, react/prop-types */
import { OrbitControls } from "@react-three/drei";
import { useMemo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ViewCube } from "@geo-mpy/viewcube-react";
import { getPartColor, getRenderOrder } from "./config/partConfig";
import { createViewMapper } from "./config/viewMappings";
import { SceneManager } from "./SceneManager";
import { useCadSceneContext } from "./context/CadSceneContext";

function CadScene({
  modelPaths,
  selectedView,
  selectedViews = null,
  cameraSettings,
  hoverDict = {},
  onHoverLabel,
  onHoverEnd,
  moduleCadConfig = null,
}) {
  const GRID_VIEWS = [
    "XY", "YZ", "ZX", "ANGLE1", "ANGLE2", "ANGLE3", "ANGLE4", "ANGLE5", "ANGLE6"
  ];

  // 1. Prepare View Logic
  const activeViews = useMemo(() => {
    return selectedViews && Array.isArray(selectedViews) ? selectedViews : [selectedView];
  }, [selectedViews, selectedView]);
  const primaryView = activeViews[0] || selectedView;

  // 2. Prepare Position Logic
  const useGridCenteredPosition = GRID_VIEWS.includes(primaryView);
  const modelPosition = useGridCenteredPosition ? [0, 0, 0] : (cameraSettings?.modelPosition ?? [0, 0, 0]);
  const modelScale = cameraSettings?.modelScale || 0.008;
  const orthographicView = cameraSettings?.orthographicView || null;
  const connectivity = cameraSettings?.connectivity || null;
  const isColumnWebBeamWeb = connectivity === "Column Web-Beam-Web";

  // 3. Helpers (Memoized to prevent reload loops)
  const shouldShowPart = useMemo(() => {
    const mapper = createViewMapper(moduleCadConfig);
    return (partName) => mapper(partName, activeViews);
  }, [moduleCadConfig, activeViews]);

  const getPartRenderOrder = useMemo(() => {
    return (partName) => getRenderOrder(partName, moduleCadConfig);
  }, [moduleCadConfig]);

  const getColorForPart = useMemo(() => {
    return (partName) => getPartColor(partName, moduleCadConfig);
  }, [moduleCadConfig]);

  const { orbitTarget } = useCadSceneContext();
  const target = orbitTarget && orbitTarget.length === 3 ? orbitTarget : [0, 0, 0];
  const controlsRef = useRef();
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });


  const modelRef = useRef();

  useEffect(() => {
    const handleAction = (e) => {
      const controls = controlsRef.current;
      if (!controls) return;

      const camera = controls.object; // Correct
      const target = controls.target.clone();

      const distance = camera.position.distanceTo(target);

      switch (e.detail) {
        case "zoom-in":
          controls.dollyOut(1.2);
          controls.update();
          break;

        case "zoom-out":
          controls.dollyIn(1.2);
          controls.update();
          break;

        case "pan-up":
          controls.target.y += 0.05;
          camera.position.y += 0.05;
          controls.update();
          break;

        case "pan-down":
          controls.target.y -= 0.05;
          camera.position.y -= 0.05;
          controls.update();
          break;

        case "pan-left":
          controls.target.x -= 0.05;
          camera.position.x -= 0.05;
          controls.update();
          break;

        case "pan-right":
          controls.target.x += 0.05;
          camera.position.x += 0.05;
          controls.update();
          break;

        case "auto-rotate":
          setIsAutoRotate((prev) => !prev);
          break;

        // FRONT VIEW
        case "front-view":
          camera.position.set(
            target.x,
            target.y,
            target.z + distance
          );
          camera.up.set(0, 1, 0);
          camera.lookAt(target);
          controls.update();
          break;

        // TOP VIEW
        case "top-view":
          camera.position.set(
            target.x,
            target.y + distance,
            target.z
          );
          camera.up.set(0, 0, -1);
          camera.lookAt(target);
          controls.update();
          break;

        // SIDE VIEW
        case "side-view":
          camera.position.set(
            target.x + distance,
            target.y,
            target.z
          );
          camera.up.set(0, 1, 0);
          camera.lookAt(target);
          controls.update();
          break;

        default:
          break;
      }
    };

    document.addEventListener("cad-camera-action", handleAction);

    return () => {
      document.removeEventListener("cad-camera-action", handleAction);
    };
  }, []);

  return (
    <group name="scene">
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 10, 10]} intensity={1.0} />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} />

      <ViewCube controlsRef={controlsRef} focusRef={modelRef} placement="top-right" showPan={false} showRotate={false} showZoom={false} showViewCube={false} />

      <group ref={modelRef}>
        <SceneManager
          modelPaths={modelPaths}
          activeViews={activeViews}
          modelPosition={modelPosition}
          modelScale={modelScale}
          modelRotation={[Math.PI / -2, 0, 0]}
          orthographicView={orthographicView}
          hoverDict={hoverDict}
          onHoverLabel={onHoverLabel}
          onHoverEnd={onHoverEnd}
          moduleCadConfig={moduleCadConfig}
          shouldShowPart={shouldShowPart}
          getPartRenderOrder={getPartRenderOrder}
          getColorForPart={getColorForPart}
          isColumnWebBeamWeb={isColumnWebBeamWeb}
          GRID_VIEWS={GRID_VIEWS}
          primaryView={primaryView}
        />
      </group>

      <OrbitControls ref={controlsRef} enableDamping={false} enableRotate={true} autoRotate={isAutoRotate} target={target} />
    </group>
  );
}

export default CadScene;
