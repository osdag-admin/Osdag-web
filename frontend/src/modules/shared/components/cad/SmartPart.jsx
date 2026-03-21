import React, { useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useCursor } from '@react-three/drei';

/**
 * SmartPart - Individual 3D part with hover handling
 * Optimized for performance:
 * 1. Memoized Geometry calculations (prevents re-instantiation on every frame)
 * 2. Separated PointerOver (State) from PointerMove (Coordinates)
 * 3. Declarative Edge Rendering
 */
export const SmartPart = ({
  geometry,
  name,
  color,
  renderOrder,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  hoverDict = {},
  hoverLabel = null,
  isHovered = false,
  onHover = null, // (label, clientX, clientY, renderOrder, meshId, meshObject) => void
  onHoverEnd = null, // (meshId) => void
  meshId,
  showEdges = true,
  materialProps = {},
}) => {
  const [localHovered, setLocalHovered] = useState(false);

  // 1. MEMOIZATION: Prevent creating new geometry on every render
  // This was the main cause of the "flicker" and memory leak
  const edgesVisuals = useMemo(() => {
    if (!showEdges || !geometry) return null;
    try {
      // Threshold angle 15 degrees
      const edgeGeo = new THREE.EdgesGeometry(geometry, 15);
      const edgeMat = new THREE.LineBasicMaterial({ color: "black", linewidth: 1 });
      return { geometry: edgeGeo, material: edgeMat };
    } catch (e) {
      console.warn("Failed to generate edges for", name);
      return null;
    }
  }, [geometry, showEdges, name]);

  useCursor(localHovered || isHovered);

  // 2. LABEL RESOLUTION
  // Your original complex logic preserved exactly as requested
  const resolvedLabel = useMemo(() => {
    if (hoverLabel) return hoverLabel;

    const lower = name?.toLowerCase() || '';
    const capitalized = name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

    // Try multiple key variations in hoverDict first
    let label = null;
    if (hoverDict && typeof hoverDict === 'object' && Object.keys(hoverDict).length > 0) {
      // Try exact match first
      label = hoverDict[name];

      // Try lowercase
      if (!label) {
        label = hoverDict[lower];
      }

      // Try capitalized (first letter uppercase, rest lowercase)
      if (!label) {
        label = hoverDict[capitalized];
      }

      // Try singular if plural (e.g., "Bolts" -> "Bolt")
      if (!label && lower.endsWith('s') && lower.length > 1) {
        const singular = name.slice(0, -1);
        label = hoverDict[singular] || hoverDict[singular.toLowerCase()];
      }

      // Try plural if singular (e.g., "Bolt" -> "Bolts")
      if (!label && !lower.endsWith('s')) {
        const plural = name + 's';
        label = hoverDict[plural] || hoverDict[plural.toLowerCase()];
      }
    }

    // Final safety check: if resolved label contains Plate info but mesh is Bolt, try harder
    if (lower.includes('bolt') && label?.toLowerCase().includes('plate') && !label?.toLowerCase().includes('bolt')) {
      label = hoverDict?.['Bolt'] || hoverDict?.['Bolts'] || hoverDict?.['bolt'] || hoverDict?.['bolts'] || name;
    }

    return label || name;
  }, [name, hoverDict, hoverLabel]);

  // 3. OPTIMIZED EVENT HANDLERS

  // Handle "Entry" separately to prevent infinite re-renders
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation(); // Stop raycast from hitting internal/backend objects
    setLocalHovered(true);
  }, []);

  const handlePointerOut = useCallback((e) => {
    setLocalHovered(false);
    if (onHoverEnd) {
      onHoverEnd(meshId);
    }
  }, [onHoverEnd, meshId]);

  // Handle "Movement" purely for coordinate updates (State updates removed from here)
  const handlePointerMove = useCallback((e) => {
    e.stopPropagation();

    const clientX = e.nativeEvent?.clientX;
    const clientY = e.nativeEvent?.clientY;

    if (onHover) {
      onHover(resolvedLabel, clientX, clientY, renderOrder, meshId, e.object);
    }
  }, [onHover, resolvedLabel, renderOrder, meshId]);

  // 4. MATERIAL MEMOIZATION
  // Prevents material recompilation on every frame
  const displayColor = isHovered || localHovered ? "#8cc480" : color;

  const meshMaterial = useMemo(() => (
    <meshPhysicalMaterial
      color={displayColor}
      metalness={materialProps.metalness ?? 0.3}
      roughness={materialProps.roughness ?? 0.4}
      opacity={materialProps.opacity ?? 1.0}
      transparent={materialProps.transparent ?? false}
      clearcoat={materialProps.clearcoat ?? 0.8}
      clearcoatRoughness={materialProps.clearcoatRoughness ?? 0.2}
      transmission={materialProps.transmission}
      emissive={isHovered || localHovered ? "#8cc480" : undefined}
      emissiveIntensity={isHovered || localHovered ? 0.2 : 0}
      depthWrite={!(isHovered || localHovered)}
      map={materialProps.map || null} // Support texture if passed
    />
  ), [displayColor, isHovered, localHovered, materialProps]);

  return (
    <group>
      <mesh
        geometry={geometry}
        scale={scale}
        rotation={rotation}
        position={position}
        renderOrder={renderOrder}
        userData={{
          hoverLabel: resolvedLabel,
          renderOrder,
          meshName: name,
          meshId,
        }}
        onPointerOver={handlePointerOver} // Trigger state change ONCE
        onPointerOut={handlePointerOut}   // Trigger state change ONCE
        onPointerMove={handlePointerMove} // Trigger coord updates CONTINUOUSLY
      >
        {meshMaterial}
      </mesh>

      {/* 5. OPTIMIZED EDGES RENDERING */}
      {showEdges && edgesVisuals && (
        <lineSegments
          geometry={edgesVisuals.geometry}
          scale={scale}
          rotation={rotation}
          position={position}
        >
          {/* Declarative material allows color updates without rebuilding geometry */}
          <lineBasicMaterial
            attach="material"
            color={localHovered || isHovered ? "#9fda90" : "black"}
            linewidth={localHovered || isHovered ? 2 : 1}
          />
        </lineSegments>
      )}
    </group>
  );
};
