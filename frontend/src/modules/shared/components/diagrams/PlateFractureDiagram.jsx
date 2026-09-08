/* eslint-disable react/prop-types */

/**
 * PlateFractureDiagram replicates desktop's 4 cover-plate fracture-pattern
 * dialogs (plate_fracture_digram/*.py): BeamWebFractureDialog,
 * BeamFlangeFractureDialog, ColWebFractureDialog, ColFlangeFractureDialog.
 *
 * All 4 are the SAME schematic drawing, driven purely by bolt row/column
 * counts (no real mm values) - the column variants are explicitly
 * documented in desktop's source as "the beam diagram rotated 90 degrees".
 *
 * Props:
 *  - rows, cols: real bolt row/column counts (bolts_one_line / bolt_line)
 *  - orientation: "landscape" (beam) | "portrait" (column, 90deg rotated)
 *  - variant: "web" (3 patterns) | "flange" (4 patterns)
 *  - pattern: 1-3 (web) or 1-4 (flange)
 */

const toInt = (v, fallback = 1) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const PlateFractureDiagram = ({
  rows,
  cols,
  orientation = "landscape",
  variant = "web",
  pattern = 1,
  className = "",
}) => {
  const numRows = toInt(rows, 2);
  const numCols = toInt(cols, 2);

  const CANVAS_W = orientation === "landscape" ? 340 : 220;
  const CANVAS_H = orientation === "landscape" ? 220 : 340;
  const MX = 20, MY = 20;
  const pw = CANVAS_W - 2 * MX;
  const ph = CANVAS_H - 2 * MY;

  let boltCx = [];
  let boltCy = [];
  let half;

  if (orientation === "landscape") {
    half = Math.max(1, Math.floor(numCols / 2));
    const padX = pw * 0.12, padY = ph * 0.15;
    const availW = pw - 2 * padX;
    const gauge = half > 1 ? availW / (2 * (half - 1) + 1.5) : availW / 2.5;
    const midGap = gauge * 1.5;
    const availH = ph - 2 * padY;
    const pitch = numRows > 1 ? availH / (numRows - 1) : availH;
    const halfSpan = (half - 1) * gauge;
    const totalBoltW = halfSpan * 2 + midGap;
    const hOffset = MX + (pw - totalBoltW) / 2;
    for (let c = 0; c < numCols; c += 1) {
      boltCx.push(c < half ? hOffset + c * gauge : hOffset + halfSpan + midGap + (c - half) * gauge);
    }
    const vOffset = MY + padY;
    for (let r = 0; r < numRows; r += 1) boltCy.push(vOffset + r * pitch);
  } else {
    // portrait: rows->vertical columns (num_vcols), cols->horizontal rows (num_hrows)
    const numVcols = numRows;
    const numHrows = numCols;
    half = Math.max(1, Math.floor(numHrows / 2));
    const padX = pw * 0.15, padY = ph * 0.12;
    const availW = pw - 2 * padX;
    const gaugeX = numVcols > 1 ? availW / (numVcols - 1) : availW;
    const availH = ph - 2 * padY;
    const gaugeY = half > 1 ? availH / (2 * (half - 1) + 1.5) : availH / 2.5;
    const midGap = gaugeY * 1.5;
    const hOffset = MX + padX;
    for (let c = 0; c < numVcols; c += 1) boltCx.push(hOffset + c * gaugeX);
    const halfSpan = (half - 1) * gaugeY;
    const totalBoltH = halfSpan * 2 + midGap;
    const vOffset = MY + (ph - totalBoltH) / 2;
    for (let r = 0; r < numHrows; r += 1) {
      boltCy.push(r < half ? vOffset + r * gaugeY : vOffset + halfSpan + midGap + (r - half) * gaugeY);
    }
  }

  const gaugeForR = orientation === "landscape"
    ? (boltCx.length > 1 ? Math.abs(boltCx[1] - boltCx[0]) : pw)
    : (boltCx.length > 1 ? Math.abs(boltCx[1] - boltCx[0]) : pw);
  const pitchForR = boltCy.length > 1 ? Math.abs(boltCy[1] - boltCy[0]) : ph;
  const r = Math.max(2, Math.min(gaugeForR, pitchForR) * 0.28);

  const leftX = boltCx[0];
  const rightX = boltCx[boltCx.length - 1];
  const topY = boltCy[0];
  const botY = boltCy[boltCy.length - 1];
  const cornerX = boltCx[half - 1];
  const cornerY = boltCy[half - 1];
  const firstX = boltCx[0];
  const firstY = boltCy[0];

  const lines = [];
  const push = (x1, y1, x2, y2, key) => lines.push(
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3A7FD5" strokeWidth="1.5" strokeDasharray="6,4" />
  );

  if (orientation === "landscape" && variant === "web") {
    if (pattern === 1) {
      push(MX, topY, cornerX, topY, "a"); push(cornerX, topY, cornerX, botY, "b"); push(cornerX, botY, MX, botY, "c");
    } else if (pattern === 2) {
      push(leftX, topY, rightX, topY, "a"); push(leftX, botY, rightX, botY, "b");
      push(leftX, topY, leftX, botY, "c"); push(rightX, topY, rightX, botY, "d");
    } else {
      push(MX, topY, cornerX, topY, "a"); push(cornerX, topY, cornerX, MY, "b");
      push(MX, botY, cornerX, botY, "c"); push(cornerX, botY, cornerX, MY + ph, "d");
    }
  } else if (orientation === "landscape" && variant === "flange") {
    if (pattern === 1) {
      push(MX, topY, cornerX, topY, "a"); push(cornerX, topY, cornerX, botY, "b"); push(cornerX, botY, MX, botY, "c");
    } else if (pattern === 2) {
      push(MX, topY, cornerX, topY, "a"); push(cornerX, topY, cornerX, MY, "b");
      push(MX, botY, cornerX, botY, "c"); push(cornerX, botY, cornerX, MY + ph, "d");
    } else if (pattern === 3) {
      push(MX, botY, cornerX, botY, "a"); push(cornerX, botY, cornerX, MY, "b");
    } else {
      push(firstX, topY, firstX, MY, "a"); push(firstX, topY, cornerX, topY, "b");
      push(firstX, botY, firstX, MY + ph, "c"); push(firstX, botY, cornerX, botY, "d");
    }
  } else if (orientation === "portrait" && variant === "web") {
    if (pattern === 1) {
      push(leftX, MY, leftX, cornerY, "a"); push(leftX, cornerY, rightX, cornerY, "b"); push(rightX, cornerY, rightX, MY, "c");
    } else if (pattern === 2) {
      push(leftX, topY, rightX, topY, "a"); push(leftX, botY, rightX, botY, "b");
      push(leftX, topY, leftX, botY, "c"); push(rightX, topY, rightX, botY, "d");
    } else {
      push(leftX, MY, leftX, cornerY, "a"); push(leftX, cornerY, MX, cornerY, "b");
      push(rightX, MY, rightX, cornerY, "c"); push(rightX, cornerY, MX + pw, cornerY, "d");
    }
  } else {
    // portrait + flange
    if (pattern === 1) {
      push(leftX, MY, leftX, cornerY, "a"); push(leftX, cornerY, rightX, cornerY, "b"); push(rightX, cornerY, rightX, MY, "c");
    } else if (pattern === 2) {
      push(leftX, MY, leftX, cornerY, "a"); push(leftX, cornerY, MX, cornerY, "b");
      push(rightX, MY, rightX, cornerY, "c"); push(rightX, cornerY, MX + pw, cornerY, "d");
    } else if (pattern === 3) {
      push(rightX, MY, rightX, cornerY, "a"); push(rightX, cornerY, MX, cornerY, "b");
    } else {
      push(leftX, firstY, MX, firstY, "a"); push(leftX, firstY, leftX, cornerY, "b");
      push(rightX, firstY, MX + pw, firstY, "c"); push(rightX, firstY, rightX, cornerY, "d");
    }
  }

  const fg = "#000";
  const bolts = [];
  for (let c = 0; c < boltCx.length; c += 1) {
    for (let ri = 0; ri < boltCy.length; ri += 1) {
      bolts.push(<circle key={`${c}-${ri}`} cx={boltCx[c]} cy={boltCy[ri]} r={r} fill="none" stroke={fg} strokeWidth="1.5" />);
    }
  }

  return (
    <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} width="100%" height="100%" style={{ maxHeight: 260 }} xmlns="http://www.w3.org/2000/svg">
      <rect x={MX} y={MY} width={pw} height={ph} fill="#fff" stroke={fg} strokeWidth="2" />
      {bolts}
      {lines}
    </svg>
  );
};

export default PlateFractureDiagram;
