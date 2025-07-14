import { OrbitControls, useTexture } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

function Model({ modelPaths, selectedView }) {
  const [parsedModels, setParsedModels] = useState(null);
  const texture = useTexture("/texture.png");
  texture.needsUpdate = true;

  useEffect(() => {
    if (modelPaths) {
      console.log("Received modelPaths in ThreeRender.jsx:", modelPaths);
      try {
        const loader = new OBJLoader();
        const parsedData = Object.fromEntries(
          Object.entries(modelPaths).map(([key, objData]) => {
            console.log(`Parsing ${key}...`);
            return [key, loader.parse(objData)];
          })
        );

        console.log("Successfully parsed models:", parsedData);
        setParsedModels(parsedData);
      } catch (error) {
        console.error("Error parsing .obj data:", error);
      }
    }
  }, [modelPaths]);

  const getGeometry = (obj) => {
    let g;
    obj.traverse((c) => {
      if (c.type === "Mesh") {
        console.log("Found mesh in:", obj);
        c.material.map = texture;
        c.material.needsUpdate = true;
        g = c.geometry;
      }
    });
    if (!g) console.warn("No geometry found in object:", obj);
    return g;
  };

  const geometryModel = useMemo(
    () => (parsedModels?.Model ? getGeometry(parsedModels.Model) : null),
    [parsedModels, texture]
  );
  const geometryBeam = useMemo(
    () => (parsedModels?.Beam ? getGeometry(parsedModels.Beam) : null),
    [parsedModels, texture]
  );
  const geometryConnector = useMemo(
    () =>
      parsedModels?.Connector ? getGeometry(parsedModels.Connector) : null,
    [parsedModels, texture]
  );

  if (!parsedModels) {
    return null;
  }

  return (
    <group name="scene">
      <axesHelper args={[200]} />
      {/* Lighting to ensure visibility */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />

      {/* Model Section */}
      {selectedView === "Model" && geometryModel && (
        <>
          <mesh
            geometry={geometryModel}
            scale={0.008}
            rotation={[Math.PI / -2, 0, 0]}
            position={[0, 0, 4]}
          >
            <meshPhysicalMaterial
              attach="material"
              map={texture}
              metalness={0.25}
              roughness={0.1}
              opacity={1.0}
              transparent={true}
              transmission={0.99}
              clearcoat={1.0}
              clearcoatRoughness={0.25}
            />
          </mesh>
          <primitive
            object={
              new THREE.LineSegments(
                new THREE.EdgesGeometry(geometryModel, 15),
                new THREE.LineBasicMaterial({ color: "black" })
              )
            }
            scale={0.008}
            rotation={[Math.PI / -2, 0, 0]}
            position={[0, 0, 4]}
          />
        </>
      )}

      {/* Beam Section */}
      {selectedView === "Beam" && geometryBeam && (
        <>
          <mesh
            geometry={geometryBeam}
            scale={0.008}
            position={[0, 0, 4]}
            rotation={[Math.PI / -2, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#594100"
              attach="material"
              metalness={0.25}
              roughness={0.3}
              opacity={1.0}
              transparent={true}
              transmission={0.008}
              clearcoat={1.0}
              clearcoatRoughness={0.25}
            />
          </mesh>
          {/* Beam outline */}
          <primitive
            object={
              new THREE.LineSegments(
                new THREE.EdgesGeometry(geometryBeam, 15),
                new THREE.LineBasicMaterial({ color: "black" })
              )
            }
            scale={0.008}
            rotation={[Math.PI / -2, 0, 0]}
            position={[0, 0, 4]}
          />
        </>
      )}

      {/* Connector Section */}
      {selectedView === "Connector" && geometryConnector && (
        <>
          <mesh
            geometry={geometryConnector}
            scale={0.008}
            position={[0, 0, 5]}
            rotation={[Math.PI / -2, 0, 0]}
          >
            <meshPhysicalMaterial
              map={texture}
              attach="material"
              metalness={0.25}
              roughness={0.3}
              opacity={1.0}
              transparent={true}
              transmission={0.99}
              clearcoat={1.0}
              clearcoatRoughness={0.25}
            />
          </mesh>
          {/* Connector outline */}
          <primitive
            object={
              new THREE.LineSegments(
                new THREE.EdgesGeometry(geometryConnector, 15),
                new THREE.LineBasicMaterial({ color: "black" })
              )
            }
            scale={0.008}
            rotation={[Math.PI / -2, 0, 0]}
            position={[0, 0, 5]}
          />
        </>
      )}

      {/* Controls */}
      <OrbitControls enableDamping={true} target={[0, 0, 0]} />
    </group>
  );
}

export default Model;
