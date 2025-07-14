import { OrbitControls, useTexture } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useEffect, useState, useMemo } from "react";

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
        c.material.map = texture;
        c.material.needsUpdate = true;
        g = c.geometry;
      }
    });
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
  const geometryColumn = useMemo(
    () => (parsedModels?.Column ? getGeometry(parsedModels.Column) : null),
    [parsedModels, texture]
  );
  const geometryPlate = useMemo(
    () => (parsedModels?.Plate ? getGeometry(parsedModels.Plate) : null),
    [parsedModels, texture]
  );
  const geometryCleatAngle = useMemo(
    () =>
      (parsedModels?.cleatAngle ? getGeometry(parsedModels.cleatAngle) : null),
    [parsedModels, texture]
  );
  const geometrySeatedAngle = useMemo(
    () => (parsedModels?.SeatAngle ? getGeometry(parsedModels.SeatAngle) : null),
    [parsedModels, texture]
  );
  const geometryConnector = useMemo(
    () => (parsedModels?.Connector ? getGeometry(parsedModels.Connector) : null),
    [parsedModels, texture]
  );
  const geometryMember = useMemo(
    () => (parsedModels?.Member ? getGeometry(parsedModels.Member) : null),
    [parsedModels, texture]
  );
  const geometryEndplate = useMemo(
    () => (parsedModels?.Endplate ? getGeometry(parsedModels.Endplate) : null),
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
        <mesh
          geometry={geometryModel}
          scale={0.008}
          rotation={[Math.PI / -2, 0, 0]}
          position={[0, -4, 0]}
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
      )}

      {/* Beam Section */}
      {selectedView === "Beam" && geometryBeam && (
        <mesh
          geometry={geometryBeam}
          scale={0.008}
          position={[-2, -3, -1]}
          rotation={[Math.PI / -2, 0, 0]}
        >
          <meshPhysicalMaterial
            color="gray"
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
      )}

      {/* Column Section */}
      {selectedView === "Column" && geometryColumn && (
        <mesh
          geometry={geometryColumn}
          scale={0.008}
          position={[1, -4, -1]}
          rotation={[Math.PI / -2, 0, 0]}
        >
          <meshPhysicalMaterial
            color="#B87333"
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
      )}

      {/* Plate Section */}
      {selectedView === "Plate" && geometryPlate && (
        <mesh
          geometry={geometryPlate}
          scale={0.008}
          position={[-2, -3, 2]}
          rotation={[Math.PI / -2, 0, 0]}
        >
          <meshPhysicalMaterial
            color="#3268a8"
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
      )}

      {/* Cleat Angle Section */}
      {selectedView === "cleatAngle" && geometryCleatAngle && (
        <mesh
          geometry={geometryCleatAngle}
          scale={0.008}
          position={[0, -4, 0]}
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
      )}

      {/* Cleat Angle Section */}
      {selectedView === "SeatedAngle" && geometrySeatedAngle && (
        <mesh
          geometry={geometrySeatedAngle}
          scale={0.008}
          position={[0, -4, 0]}
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
      )}

      {/* Connector Section */}
      {selectedView === "Connector" && geometryConnector && (
        <mesh
          geometry={geometryConnector}
          scale={0.008}
          position={[0, -4, 0]}
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
      )}

      {/* Member Section */}
      {selectedView === "Member" && geometryMember && (
        <mesh
          geometry={geometryMember}
          scale={0.008}
          position={[0, -4, 0]}
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
      )}
      {/* Endplate Section */}
      {selectedView === "Endplate" && geometryEndplate && (
        <mesh
          geometry={geometryEndplate}
          scale={0.008}
          position={[0, -4, 0]}
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
      )}

      {/* Controls */}
      <OrbitControls enableDamping={true} target={[0, 0, 0]} />
      
    </group>
  );
}

export default Model;
