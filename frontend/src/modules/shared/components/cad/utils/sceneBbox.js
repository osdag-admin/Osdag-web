import * as THREE from "three";

/**
 * Compute world-space bounding box of all meshes in the scene.
 * Updates scene matrices first so bbox matches current transform/scale.
 * Returns { center: Vector3, size: Vector3 } or null if no meshes.
 */
export function computeSceneBoundingBox(scene) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let hasMesh = false;
  scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry) {
      if (obj.geometry.boundingBox == null) {
        obj.geometry.computeBoundingBox();
      }
      const meshBox = obj.geometry.boundingBox.clone();
      meshBox.applyMatrix4(obj.matrixWorld);
      box.union(meshBox);
      hasMesh = true;
    }
  });
  if (!hasMesh) return null;
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  return { center, size };
}

export const DEFAULT_DISTANCE = 20;
/** Extra margin so full model (including height) is in frame (multiplier on FOV-based distance). */
export const PADDING_FACTOR = 2.2;

/**
 * Distance so the full bounding box fits in frame from any view angle.
 * Uses bounding-sphere radius (half diagonal) so iso/side/top all capture full model.
 * distance = (halfDiagonal / tan(fov/2)) * padding
 */
export function distanceForFov(size, fovDeg, paddingFactor = PADDING_FACTOR) {
  const halfFovRad = (fovDeg * Math.PI / 180) / 2;
  const tanHalf = Math.tan(halfFovRad);
  if (tanHalf <= 0) return DEFAULT_DISTANCE;
  const sx = size.x || 0;
  const sy = size.y || 0;
  const sz = size.z || 0;
  const halfDiagonal = Math.max(0.5 * Math.sqrt(sx * sx + sy * sy + sz * sz), 0.1);
  return (halfDiagonal / tanHalf) * paddingFactor;
}
