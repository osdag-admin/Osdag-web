import React, { useEffect, useState, useRef, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { SmartPart } from './SmartPart';
import { getPartColor, VALID_PART_KEYS } from './config/partConfig';

export const SceneManager = forwardRef(({
  modelPaths,
  activeViews,
  modelPosition = [0, 0, 0],
  modelScale = 0.008,
  modelRotation = [Math.PI / -2, 0, 0],
  orthographicView = null,
  hoverDict = {},
  onHoverLabel = null,
  onHoverEnd = null,
  moduleCadConfig = null,
  shouldShowPart = null,
  getPartRenderOrder = null,
  getColorForPart = null,
  isColumnWebBeamWeb = false,
  GRID_VIEWS = [],
  primaryView = null,
  onModelsLoaded = null,
}, ref) => {
  const [parsedModels, setParsedModels] = useState(null);
  const [hoveredMeshId, setHoveredMeshId] = useState(null);
  
  // Refs for internal state
  const groupRef = useRef();
  const activeMeshRef = useRef(null);

  // Expose the group ref to the parent
  useImperativeHandle(ref, () => groupRef.current);

  // --- 1. MODEL LOADING & MEMORY MANAGEMENT ---
  useEffect(() => {
    let isMounted = true;
    const disposables = []; 

    const loadModels = () => {
      try {
        const stlLoader = new STLLoader();
        const objLoader = new OBJLoader();
        const parsedData = {};
        const partsGroup = new THREE.Group();

        Object.entries(modelPaths).forEach(([key, dataUrl]) => {
          if (!dataUrl) return;
          
          if (key === 'Model' && Object.keys(modelPaths).length > 1) return;

          try {
            // STL Handling
            if (typeof dataUrl === 'string' && dataUrl.startsWith('data:application')) {
              const base64 = dataUrl.split(',')[1];
              const binary = atob(base64);
              const arrayBuffer = new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i)).buffer;
              
              const geometry = stlLoader.parse(arrayBuffer);
              
              const mesh = new THREE.Mesh(geometry);
              mesh.name = key;
              // Don't pre-bake hoverLabel at load time: hoverDict may be empty.
              // SmartPart will look up the label from hoverDict at render time.
              mesh.userData.hoverLabel = null;

              parsedData[key] = mesh;
              disposables.push(geometry);

              if (VALID_PART_KEYS.has(key)) partsGroup.add(mesh);
            } 
            // OBJ Handling
            else if (typeof dataUrl === 'string' && dataUrl.includes('v ')) {
              const objGroup = objLoader.parse(dataUrl);
              parsedData[key] = objGroup;
              
              objGroup.traverse(c => {
                if (c.geometry) disposables.push(c.geometry);
                if (c.material) disposables.push(c.material);
              });
            }
          } catch (e) {
            console.warn(`[SceneManager] Failed to load section ${key}:`, e);
          }
        });

        // Build parsedData.Model from the individual named-part meshes so that
        // the Model view inherits per-part colors and hover labels.
        if (parsedData.Model && partsGroup.children.length > 0) {
          parsedData.Model = partsGroup;
        }
        else if (!parsedData.Model && partsGroup.children.length > 0) {
          parsedData.Model = partsGroup;
        }
        
        if (isMounted) setParsedModels(parsedData);
      } catch (error) {
        console.error('[SceneManager] Error parsing model data:', error);
      }
    };

    loadModels();

    return () => {
      isMounted = false;
      disposables.forEach(d => d.dispose());
      setParsedModels(null);
    };
  }, [modelPaths, moduleCadConfig]); 


  // --- 2. OPTIMIZED HELPERS ---
  
  const getGeometry = useCallback((obj) => {
    let g = null;
    if (obj) {
      obj.traverse((c) => {
        if (c.isMesh && !g) g = c.geometry; 
      });
    }
    return g;
  }, []);

  const getMeshes = useCallback((obj) => {
    const meshes = [];
    if (!obj) return meshes;
    obj.traverse((c) => {
      if (c.isMesh && c.geometry) {
        const meshName = c.name || "";
        const label = c.userData?.hoverLabel || meshName;
        meshes.push({ name: meshName, geometry: c.geometry, hoverLabel: label });
      }
    });
    return meshes;
  }, []);

  // --- 3. MEMOIZED GEOMETRIES ---
  
  const modelMeshes = useMemo(() => {
    if (!parsedModels?.Model) return [];
    return getMeshes(parsedModels.Model);
  }, [parsedModels, getMeshes]); 

  const geometries = useMemo(() => ({
    beam: getGeometry(parsedModels?.Beam),
    column: getGeometry(parsedModels?.Column),
    plate: getGeometry(parsedModels?.Plate),
    bolt: getGeometry(parsedModels?.Bolt),
    bolts: getGeometry(parsedModels?.Bolts),
    connector: getGeometry(parsedModels?.Connector),
    cleatAngle: getGeometry(parsedModels?.cleatAngle),
    seatedAngle: getGeometry(parsedModels?.SeatedAngle),
    coverPlate: getGeometry(parsedModels?.CoverPlate || parsedModels?.["Cover Plate"]),
    member: getGeometry(parsedModels?.Member),
    endplate: getGeometry(parsedModels?.Endplate || parsedModels?.EndPlate),
  }), [parsedModels, getGeometry]);

  // Part names already rendered from Model group; skip dedicated geometry to avoid duplicates (e.g. CleatAngle)
  const modelPartNamesLower = useMemo(
    () => new Set(modelMeshes.map((m) => (m.name || "").toLowerCase())),
    [modelMeshes]
  );

  // --- 4. NOTIFY PARENT ---
  useEffect(() => {
    if (parsedModels && onModelsLoaded) {
      onModelsLoaded(geometries, modelMeshes);
    }
  }, [parsedModels, geometries, modelMeshes, onModelsLoaded]);

  // --- 5. EVENTS ---
  const handlePartHover = useCallback((label, clientX, clientY, renderOrder, meshId, meshObject) => {
    if (onHoverLabel) onHoverLabel(label, clientX, clientY);
    setHoveredMeshId(meshId);
    activeMeshRef.current = meshObject;
  }, [onHoverLabel]);

  const handlePartHoverEnd = useCallback((meshId) => {
    if (hoveredMeshId === meshId) {
      if (onHoverEnd) onHoverEnd();
      setHoveredMeshId(null);
      activeMeshRef.current = null;
    }
  }, [hoveredMeshId, onHoverEnd]);

  // --- 6. RENDER ---
  const finalRotation = isColumnWebBeamWeb ? [0, Math.PI / -2, 0] : modelRotation;
  const useGridCenteredPosition = GRID_VIEWS.includes(primaryView);
  const finalPosition = useGridCenteredPosition ? [0, 0, 0] : modelPosition;

  if (!parsedModels) return null;

  return (
    <group name="scene" ref={groupRef}>
      {/* Render per-part meshes from partsGroup (Model view shows all; individual views filter by shouldShowPart).
           These meshes carry their real names (Beam, Connector, etc.) so colors and hover work correctly. */}
      {modelMeshes.length > 0 && (
        <>
          {modelMeshes.map((m, idx) => {
            const name = m.name || "";
            if (shouldShowPart && !shouldShowPart(name)) return null;

            let color = getColorForPart ? getColorForPart(name) : getPartColor(name, moduleCadConfig);
            if (name.toLowerCase().startsWith("weld") && color === "#888888") {
              color = getColorForPart ? getColorForPart("Weld") : getPartColor("Weld", moduleCadConfig);
            }

            const meshId = `${name}-${idx}`;
            const renderOrder = getPartRenderOrder ? getPartRenderOrder(name) : 0;

            let partPosition = finalPosition;
            if (name === "Member" || name === "EndPlate" || name === "Endplate") {
               partPosition = [0, 0, 0];
            }
            else if (["CleatAngle", "SeatedAngle", "Connector", "CoverPlate"].includes(name)) {
               partPosition = [finalPosition[0], finalPosition[1], finalPosition[2]];
            }

            return (
              <SmartPart
                key={meshId}
                meshId={meshId}
                geometry={m.geometry}
                name={name}
                color={color}
                renderOrder={renderOrder}
                position={partPosition} 
                rotation={finalRotation}
                scale={modelScale}
                hoverDict={hoverDict}
                hoverLabel={null}
                isHovered={hoveredMeshId === meshId}
                onHover={handlePartHover}
                onHoverEnd={handlePartHoverEnd}
                showEdges={true}
              />
            );
          })}
        </>
      )}

      {/* Render dedicated geometries when present (fallback if Model group missing or for clarity) */}
      {Object.entries(geometries).map(([keyName, geom]) => {
        if (!geom) return null;
        const partNameMap = {
          beam: "Beam",
          column: "Column",
          plate: "Plate",
          bolt: "Bolt",
          bolts: "Bolts",
          connector: "Connector",
          cleatAngle: "CleatAngle",
          seatedAngle: "SeatedAngle",
          coverPlate: "CoverPlate",
          member: "Member",
          endplate: "EndPlate",
        };
        const name = partNameMap[keyName] || keyName;
        if (modelPartNamesLower.has(name.toLowerCase())) return null;
        if (shouldShowPart && !shouldShowPart(name)) return null;

        let color = getColorForPart ? getColorForPart(name) : getPartColor(name, moduleCadConfig);
        if (name.toLowerCase().startsWith("weld") && color === "#888888") {
          color = getColorForPart ? getColorForPart("Weld") : getPartColor("Weld", moduleCadConfig);
        }

        const meshId = `${name}-geom`;
        const renderOrder = getPartRenderOrder ? getPartRenderOrder(name) : 0;

        // All parts share the same coordinate system from the backend.
        const partPosition = finalPosition;

        return (
          <SmartPart
            key={meshId}
            meshId={meshId}
            geometry={geom}
            name={name}
            color={color}
            renderOrder={renderOrder}
            position={partPosition}
            rotation={finalRotation}
            scale={modelScale}
            hoverDict={hoverDict}
            hoverLabel={null}
            isHovered={hoveredMeshId === meshId}
            onHover={handlePartHover}
            onHoverEnd={handlePartHoverEnd}
            showEdges={true}
          />
        );
      })}
    </group>
  );
});