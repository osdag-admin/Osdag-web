import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function CameraController({ cameraDirection }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const positions = {
      "top": { pos: [0, 10, 0.01], target: [0, 0, 0] },
      "bottom": { pos: [0, -10, 0.01], target: [0, 0, 0] },
      "left": { pos: [-10, 0, 0], target: [0, 0, 0] },
      "right": { pos: [10, 0, 0], target: [0, 0, 0] },
      "front": { pos: [0, 0, 10], target: [0, 0, 0] },
      "back": { pos: [0, 0, -10], target: [0, 0, 0] },
      "iso-nw": { pos: [-10, 10, 10], target: [0, 0, 0] },
      "iso-ne": { pos: [10, 10, 10], target: [0, 0, 0] },
      "iso-sw": { pos: [-10, -10, 10], target: [0, 0, 0] },
      "iso-se": { pos: [10, -10, 10], target: [0, 0, 0] },
      "home": { pos: [10, 10, 10], target: [0, 0, 0] }
    };
    const view = positions[cameraDirection] || positions["home"];
    camera.position.set(...view.pos);
    camera.lookAt(...view.target);
    if (controlsRef.current) {
      controlsRef.current.target.set(...view.target);
      controlsRef.current.update();
    }
  }, [cameraDirection, camera]);

  return <OrbitControls ref={controlsRef} enableDamping={true} target={[0, 0, 0]} />;
} 