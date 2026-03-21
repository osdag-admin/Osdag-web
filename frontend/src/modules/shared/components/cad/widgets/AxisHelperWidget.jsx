import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const AxisHelperWidget = ({ orthographicView }) => {
  const { camera, gl } = useThree();
  const axisGroupRef = useRef();
  const rendererRef = useRef();
  const axisSceneRef = useRef();
  const axisCameraRef = useRef();

  useEffect(() => {
    // Create a separate renderer for the axis widget
    const axisRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    axisRenderer.setSize(150, 150); // Increased size from 100x100 to 150x150
    axisRenderer.setClearColor(0x000000, 0); // Transparent background
    axisRenderer.domElement.style.position = "absolute";
    axisRenderer.domElement.style.bottom = "10px";
    axisRenderer.domElement.style.right = "10px";
    axisRenderer.domElement.style.pointerEvents = "none";
    axisRenderer.domElement.style.zIndex = "1000";

    gl.domElement.parentElement.appendChild(axisRenderer.domElement);
    rendererRef.current = axisRenderer;

    const axisScene = new THREE.Scene();
    const axisCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    axisCamera.position.set(0, 0, 3);

    axisSceneRef.current = axisScene;
    axisCameraRef.current = axisCamera;

    const axisGroup = new THREE.Group();

    const xArrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const xArrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xArrow = new THREE.Mesh(xArrowGeometry, xArrowMaterial);
    xArrow.position.set(0.7, 0, 0);
    xArrow.rotation.z = -Math.PI / 2;

    const xLineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8);
    const xLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xLine = new THREE.Mesh(xLineGeometry, xLineMaterial);
    xLine.position.set(0.3, 0, 0);
    xLine.rotation.z = Math.PI / 2;

    const yArrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const yArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yArrow = new THREE.Mesh(yArrowGeometry, yArrowMaterial);
    yArrow.position.set(0, 0.7, 0);

    const yLineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8);
    const yLineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yLine = new THREE.Mesh(yLineGeometry, yLineMaterial);
    yLine.position.set(0, 0.3, 0);

    const zArrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const zArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zArrow = new THREE.Mesh(zArrowGeometry, zArrowMaterial);
    zArrow.position.set(0, 0, -0.7);
    zArrow.rotation.x = -Math.PI / 2;

    const zLineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8);
    const zLineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zLine = new THREE.Mesh(zLineGeometry, zLineMaterial);
    zLine.position.set(0, 0, -0.3);
    zLine.rotation.x = Math.PI / 2;

    // Create simple text sprites for labels
    const createTextSprite = (text, color, position) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 64;
      canvas.height = 64;

      context.fillStyle = color;
      context.font = "Bold 40px Arial";
      context.textAlign = "center";
      context.fillText(text, 32, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(0.3, 0.3, 1);

      return sprite;
    };

    const xLabel = createTextSprite(
      "X",
      "#ff0000",
      new THREE.Vector3(0.9, 0, 0)
    );
    const yLabel = createTextSprite(
      "Y",
      "#00ff00",
      new THREE.Vector3(0, 0.9, 0)
    );
    const zLabel = createTextSprite(
      "Z",
      "#0000ff",
      new THREE.Vector3(0, 0, -0.9)
    );

    axisGroup.add(
      xArrow,
      xLine,
      xLabel,
      yArrow,
      yLine,
      yLabel,
      zArrow,
      zLine,
      zLabel
    );

    axisScene.add(axisGroup);
    axisGroupRef.current = axisGroup;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 1, 1);
    axisScene.add(ambientLight, directionalLight);

    return () => {
      if (rendererRef.current && rendererRef.current.domElement.parentElement) {
        rendererRef.current.domElement.parentElement.removeChild(
          rendererRef.current.domElement
        );
      }
    };
  }, [gl]);

  useFrame(() => {
    if (
      axisGroupRef.current &&
      axisCameraRef.current &&
      rendererRef.current &&
      axisSceneRef.current
    ) {
      if (orthographicView) {
        switch (orthographicView) {
          // Original orthographic views
          case "XY":
            axisGroupRef.current.rotation.set(0, 0, 0);
            break;
          case "YZ":
            axisGroupRef.current.rotation.set(0, Math.PI / 2, 0);
            break;
          case "ZX":
            axisGroupRef.current.rotation.set(-Math.PI / 2, 0, 0);
            break;

          // NEW: 6 random angle rotations to match camera positions
          case "ANGLE1":
            axisGroupRef.current.rotation.set(-0.4, 0.6, 0.2);
            break;
          case "ANGLE2":
            axisGroupRef.current.rotation.set(-0.5, -0.8, -0.1);
            break;
          case "ANGLE3":
            axisGroupRef.current.rotation.set(0.3, 0.9, 0.4);
            break;
          case "ANGLE4":
            axisGroupRef.current.rotation.set(0.6, -1.1, -0.3);
            break;
          case "ANGLE5":
            axisGroupRef.current.rotation.set(-0.8, 0.3, 3.0);
            break;
          case "ANGLE6":
            axisGroupRef.current.rotation.set(0.2, -1.4, 2.8);
            break;

          default:
            axisGroupRef.current.quaternion.copy(camera.quaternion);
        }
      } else {
        // Default behavior: follow camera rotation
        axisGroupRef.current.quaternion.copy(camera.quaternion);
      }

      // Keep the axis camera in a fixed position
      axisCameraRef.current.position.set(0, 0, 3);
      axisCameraRef.current.lookAt(0, 0, 0);

      // Render the axis widget
      rendererRef.current.render(axisSceneRef.current, axisCameraRef.current);
    }
  });

  return null;
};

export default AxisHelperWidget;
