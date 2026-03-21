import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  VC_OFFSET,
  VC_FACE_W,
  VC_EDGE_LENGTH,
  VC_EDGE_W,
  VC_DEPTH,
  VC_CORNER_R,
  VC_COL_EDGE,
  VC_COL_CORNER,
  VC_COL_HOVER,
  VC_LABELS,
  makeLabelTexture,
  snapFromCoord,
} from "./viewCubeUtils";
import { useCadSceneContext } from "../context/CadSceneContext";

const VC_ORTHO_SIZE = 3.1;
const DRAG_THRESHOLD_PX = 5;
const SNAP_LERP = 0.12;
const SNAP_EPS = 0.001;

/**
 * ViewCubeWidget — 26-piece chamfered navigation cube (AIS_ViewCube-style).
 * Uses correct geometry orientation (top/bottom up, edge up, corner rotateX),
 * emissive hover, drag-vs-click disambiguation, sync with main camera, and click-to-snap.
 */
const ViewCubeWidget = ({ controlsRef = null }) => {
  const { gl, camera: mainCamera } = useThree();
  const { orbitTarget } = useCadSceneContext();

  const orbitTargetRef = useRef(orbitTarget);
  useEffect(() => {
    orbitTargetRef.current = orbitTarget;
  }, [orbitTarget]);

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeGroupRef = useRef(null);
  const piecesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const qDeltaYRef = useRef(new THREE.Quaternion());
  const qDeltaXRef = useRef(new THREE.Quaternion());
  const axisYRef = useRef(new THREE.Vector3(0, 1, 0));
  const axisXRef = useRef(new THREE.Vector3(1, 0, 0));

  const hoveredRef = useRef(null);
  const dragRef = useRef(null);
  const dragDistRef = useRef(0);
  const isDraggingRef = useRef(false);
  const snapTargetRef = useRef(null);

  useEffect(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "80px";
    container.style.right = "15px";
    container.style.width = "150px";
    container.style.height = "150px";
    container.style.pointerEvents = "auto";
    container.style.zIndex = "1000";
    container.style.background = "transparent";

    parent.style.position = parent.style.position || "relative";
    parent.appendChild(container);
    containerRef.current = container;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = "transparent";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const cam = new THREE.OrthographicCamera(
      -VC_ORTHO_SIZE,
      VC_ORTHO_SIZE,
      VC_ORTHO_SIZE,
      -VC_ORTHO_SIZE,
      0.1,
      100
    );
    cam.position.set(0, 0, 10);
    cam.lookAt(0, 0, 0);
    cameraRef.current = cam;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(4, 6, 5);
    scene.add(sun);

    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;
    scene.add(cubeGroup);

    const allPieces = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;

          const sum = Math.abs(x) + Math.abs(y) + Math.abs(z);
          const type = sum === 1 ? "face" : sum === 2 ? "edge" : "corner";

          let geo;
          if (type === "face") {
            geo = new THREE.BoxGeometry(VC_FACE_W, VC_FACE_W, VC_DEPTH);
          } else if (type === "edge") {
            geo = new THREE.BoxGeometry(VC_EDGE_W, VC_EDGE_LENGTH, VC_DEPTH);
          } else {
            geo = new THREE.CylinderGeometry(VC_CORNER_R, VC_CORNER_R, VC_DEPTH, 3);
            geo.rotateX(Math.PI / 2);
          }

          let mat;
          if (type === "face") {
            const key = `${x},${y},${z}`;
            const label = VC_LABELS[key] || "";
            mat = new THREE.MeshStandardMaterial({
              map: makeLabelTexture(label),
              roughness: 0.3,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            });
          } else {
            mat = new THREE.MeshStandardMaterial({
              color: type === "edge" ? VC_COL_EDGE : VC_COL_CORNER,
              roughness: 0.5,
              emissive: new THREE.Color(0x000000),
            });
          }

          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x * VC_OFFSET, y * VC_OFFSET, z * VC_OFFSET);
          mesh.userData = { type, coord: [x, y, z] };

          if (type === "face") {
            if (y !== 0 && x === 0 && z === 0) {
              mesh.up.set(0, 0, y > 0 ? -1 : 1);
            }
          } else if (type === "edge") {
            if (x === 0) mesh.up.set(1, 0, 0);
            else if (y === 0) mesh.up.set(0, 1, 0);
            else if (z === 0) mesh.up.set(0, 0, 1);
          }

          const outward = new THREE.Vector3(x, y, z).normalize().multiplyScalar(100);
          mesh.lookAt(outward);

          cubeGroup.add(mesh);
          allPieces.push(mesh);
        }
      }
    }

    piecesRef.current = allPieces;

    const el = renderer.domElement;

    const ndc = (e) => {
      const r = el.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        ((e.clientY - r.top) / r.height) * -2 + 1
      );
    };

    const hit = (e) => {
      raycasterRef.current.setFromCamera(ndc(e), cam);
      const hits = raycasterRef.current.intersectObjects(allPieces, false);
      return hits.length ? hits[0].object : null;
    };

    const setHover = (mesh, on) => {
      if (!mesh?.material?.emissive) return;
      mesh.material.emissive.set(on ? VC_COL_HOVER : 0x000000);
    };

    const onMove = (e) => {
      const h = hit(e);
      if (h !== hoveredRef.current) {
        setHover(hoveredRef.current, false);
        hoveredRef.current = h;
        setHover(hoveredRef.current, true);
        el.style.cursor = h ? "pointer" : "default";
      }
      // Only rotate while button is actually down (stops rotation when trackpad/mouse released elsewhere)
      if (e.buttons === 0) {
        if (dragRef.current) {
          dragRef.current = null;
          isDraggingRef.current = false;
        }
        return;
      }
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;
        // World Y then world X (arcball); premultiply applies argument before current rotation
        qDeltaYRef.current.setFromAxisAngle(axisYRef.current, -dx * 0.012);
        qDeltaXRef.current.setFromAxisAngle(axisXRef.current, -dy * 0.012);
        cubeGroup.quaternion.premultiply(qDeltaYRef.current).premultiply(qDeltaXRef.current);
        dragRef.current.x = e.clientX;
        dragRef.current.y = e.clientY;
        dragDistRef.current += Math.hypot(dx, dy);
        isDraggingRef.current = dragDistRef.current > 3;
      }
    };

    const onDown = (e) => {
      e.stopPropagation();
      dragRef.current = { x: e.clientX, y: e.clientY };
      dragDistRef.current = 0;
      isDraggingRef.current = false;
    };

    const endDrag = () => {
      dragRef.current = null;
      isDraggingRef.current = false;
    };

    const onUp = () => {
      endDrag();
    };

    // Catch release when it happens outside the ViewCube (e.g. trackpad release)
    const onUpGlobal = () => {
      if (dragRef.current) endDrag();
    };

    const onClick = (e) => {
      e.stopPropagation();
      if (dragDistRef.current > DRAG_THRESHOLD_PX) return;
      const h = hit(e);
      if (!h) return;
      const { type, coord } = h.userData;
      const key = coord.join(",");
      const name = VC_LABELS[key] || key;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(`ViewCube → ${type.toUpperCase()} [${coord.join(", ")}] (${name})`);
      }
      const ot = orbitTargetRef.current;
      const target =
        Array.isArray(ot) && ot.length === 3
          ? new THREE.Vector3(ot[0], ot[1], ot[2])
          : new THREE.Vector3(0, 0, 0);
      const radius = mainCamera.position.distanceTo(target);
      const { position, up } = snapFromCoord(coord);
      snapTargetRef.current = {
        targetPosition: position.clone().multiplyScalar(radius).add(target),
        targetUp: up.clone(),
        lookAt: target,
      };
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("click", onClick);
    window.addEventListener("mouseup", onUpGlobal);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight);
      const aspect = clientWidth / clientHeight || 1;
      const S = VC_ORTHO_SIZE;
      const c = cameraRef.current;
      c.left = -S * aspect;
      c.right = S * aspect;
      c.top = S;
      c.bottom = -S;
      c.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mouseup", onUpGlobal);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClick);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        }
      });
      if (containerRef.current?.parentElement) {
        containerRef.current.parentElement.removeChild(containerRef.current);
      }
      containerRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      cubeGroupRef.current = null;
      piecesRef.current = [];
    };
  }, [gl, mainCamera]);

  useFrame(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const vcCam = cameraRef.current;
    const group = cubeGroupRef.current;
    if (!renderer || !scene || !vcCam || !group) return;

    const snap = snapTargetRef.current;
    if (snap) {
      const controls = controlsRef?.current;
      if (controls) {
        controls.target.copy(snap.lookAt);
        controls.object.position.lerp(snap.targetPosition, SNAP_LERP);
        controls.object.up.lerp(snap.targetUp, SNAP_LERP);
        controls.update();
        if (
          controls.object.position.distanceTo(snap.targetPosition) < SNAP_EPS &&
          controls.object.up.angleTo(snap.targetUp) < SNAP_EPS
        ) {
          controls.object.position.copy(snap.targetPosition);
          controls.object.up.copy(snap.targetUp);
          snapTargetRef.current = null;
        }
      } else {
        mainCamera.position.lerp(snap.targetPosition, SNAP_LERP);
        mainCamera.up.lerp(snap.targetUp, SNAP_LERP);
        mainCamera.lookAt(snap.lookAt);
        if (
          mainCamera.position.distanceTo(snap.targetPosition) < SNAP_EPS &&
          mainCamera.up.angleTo(snap.targetUp) < SNAP_EPS
        ) {
          mainCamera.position.copy(snap.targetPosition);
          mainCamera.up.copy(snap.targetUp);
          mainCamera.lookAt(snap.lookAt);
          snapTargetRef.current = null;
        }
      }
    } else if (isDraggingRef.current) {
      // User is dragging the cube: drive main camera so STL rotates with the cube
      const controls = controlsRef?.current;
      if (controls) {
        controls.object.quaternion.copy(group.quaternion);
        controls.update();
      } else {
        mainCamera.quaternion.copy(group.quaternion);
      }
    } else {
      // Idle: sync cube to main camera
      group.quaternion.copy(mainCamera.quaternion);
    }

    renderer.render(scene, vcCam);
  });

  return null;
};

export default ViewCubeWidget;
