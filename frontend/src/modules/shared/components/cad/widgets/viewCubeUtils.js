import * as THREE from "three";

/**
 * ViewCube constants and helpers (aligned with reference ViewCube / demo).
 * Used by ViewCubeWidget for geometry, orientation, labels, and snap math.
 */

export const VC_OFFSET = 1.15;
export const VC_FACE_W = 1.58;
export const VC_EDGE_LENGTH = 1.58;
export const VC_EDGE_W = 0.3;
export const VC_DEPTH = 0.26;
export const VC_CORNER_R = 0.3;

export const VC_COL_EDGE = 0xcccccc;
export const VC_COL_CORNER = 0x999999;
export const VC_COL_HOVER = 0x00c8ff;

export const VC_LABELS = {
  "0,1,0": "TOP",
  "0,-1,0": "BOTTOM",
  "0,0,1": "FRONT",
  "0,0,-1": "BACK",
  "1,0,0": "RIGHT",
  "-1,0,0": "LEFT",
};

/**
 * Face label texture (white/light grey background, dark text).
 */
export function makeLabelTexture(text) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  if (text) {
    const fontSize = text.length > 4 ? 17 : 22;
    ctx.fillStyle = "#333333";
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 2;
    ctx.fillText(text, size / 2, size / 2);
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * From piece coord [cx, cy, cz], compute target camera position (unit) and up vector
 * for snapping the main camera. Caller multiplies position by radius.
 */
export function snapFromCoord(coord) {
  const [cx, cy, cz] = coord;
  const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
  const nx = cx / len;
  const ny = cy / len;
  const nz = cz / len;

  const position = new THREE.Vector3(nx, ny, nz);
  let up;
  if (cx === 0 && cz === 0) {
    up = new THREE.Vector3(0, 0, cy > 0 ? -1 : 1);
  } else {
    up = new THREE.Vector3(0, 1, 0);
  }
  return { position, up };
}
