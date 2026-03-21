import { OrbitControls } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import ViewCubeWidget from "./widgets/ViewCubeWidget";
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
  const activeViews = selectedViews && Array.isArray(selectedViews) ? selectedViews : [selectedView];
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

  useEffect(() => {
    const handleAction = (e) => {
      const controls = controlsRef.current;
      if (!controls) return;

      const { camera } = controls.object;

      if (e.detail === 'zoom-in') {
        // Dolly in (zoom in)
        controls.dollyIn(1.2);
        controls.update();
      } else if (e.detail === 'zoom-out') {
        // Dolly out (zoom out)
        controls.dollyOut(1.2);
        controls.update();
      } else if (e.detail === 'pan-up') {
        // Actually, panning via OrbitControls needs mouse events, but we can shift the target slightly.
        controls.target.y += 0.05;
        camera.position.y += 0.05;
        controls.update();
      } else if (e.detail === 'pan-down') {
        controls.target.y -= 0.05;
        camera.position.y -= 0.05;
        controls.update();
      } else if (e.detail === 'pan-left') {
        controls.target.x -= 0.05;
        camera.position.x -= 0.05;
        controls.update();
      } else if (e.detail === 'pan-right') {
        controls.target.x += 0.05;
        camera.position.x += 0.05;
        controls.update();
      }
    };

    document.addEventListener('cad-camera-action', handleAction);
    return () => document.removeEventListener('cad-camera-action', handleAction);
  }, []);

  return (
    <group name="scene">
      <ambientLight intensity={2.0} />
      <directionalLight position={[5, 5, 5]} intensity={2.0} />
      <directionalLight position={[-5, -5, -5]} intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={1.5} />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1.0} />

      <ViewCubeWidget controlsRef={controlsRef} />

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

      <OrbitControls ref={controlsRef} enableDamping={false} enableRotate={false} target={target} />
    </group>
  );
}

export default CadScene;
