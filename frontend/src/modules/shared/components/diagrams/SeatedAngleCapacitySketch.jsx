/* eslint-disable react/prop-types */

/**
 * SeatedAngleCapacitySketch replicates desktop's SeatedAngleCapacityDetails
 * createShearDrawing()/createMomentDrawing() exactly: a plate rectangle with
 * a top thickness strip and exactly 2 REFERENCE bolts (not a real bolt grid -
 * real row/column counts beyond cols<=1-vs->1 are never used for placement).
 */

const toNum = (v, fallback = 0) => {
  // gauge (etc.) may arrive as an array when the config uses a
  // [primary, fallback] key list (resolveDiagramProps resolves each entry) -
  // take the first defined value, matching how SpacingDiagram consumes it.
  if (Array.isArray(v)) {
    v = v.find((item) => item !== null && item !== undefined && item !== "");
  }
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const dimColor = "#000";

const arrowPath = (x1, y1, x2, y2, isVertical) => {
  const sz = 4;
  if (isVertical) {
    return `M${x1},${y1} L${x2},${y2}
            M${x1 - sz / 2},${y1 + sz} L${x1},${y1} L${x1 + sz / 2},${y1 + sz}
            M${x2 - sz / 2},${y2 - sz} L${x2},${y2} L${x2 + sz / 2},${y2 - sz}`;
  }
  return `M${x1},${y1} L${x2},${y2}
          M${x1 + sz},${y1 - sz / 2} L${x1},${y1} L${x1 + sz},${y1 + sz / 2}
          M${x2 - sz},${y2 - sz / 2} L${x2},${y2} L${x2 - sz},${y2 + sz / 2}`;
};

const HorizDim = ({ x1, x2, y, label, above = true }) => (
  <g>
    <path d={arrowPath(x1, y, x2, y, false)} stroke={dimColor} strokeWidth="1" fill="none" />
    <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={dimColor} strokeWidth="1" />
    <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={dimColor} strokeWidth="1" />
    <text x={(x1 + x2) / 2} y={above ? y - 5 : y + 12} textAnchor="middle" fontSize="9" fill={dimColor}>{label}</text>
  </g>
);

const VertDim = ({ x, y1, y2, label, right = true }) => (
  <g>
    <path d={arrowPath(x, y1, x, y2, true)} stroke={dimColor} strokeWidth="1" fill="none" />
    <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} stroke={dimColor} strokeWidth="1" />
    <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} stroke={dimColor} strokeWidth="1" />
    <text x={right ? x + 6 : x - 6} y={(y1 + y2) / 2 + 3} textAnchor={right ? "start" : "end"} fontSize="9" fill={dimColor}>{label}</text>
  </g>
);

const SeatedAngleCapacitySketch = ({
  plateWidth,
  plateHeight,
  holeDia,
  end,
  edge,
  gauge,
  cols,
  mode = "shear", // "shear" | "moment"
  className = "",
}) => {
  const w = toNum(plateWidth);
  const h = toNum(plateHeight);
  const hole = toNum(holeDia, 20);
  const rEnd = toNum(end);
  const rEdge = toNum(edge);
  const rGauge = toNum(gauge);
  const numCols = Math.max(1, Math.round(toNum(cols, 1)));

  if (w <= 0 || h <= 0) {
    return (
      <div className={`flex min-h-[240px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 ${className}`}>
        Plate dimensions unavailable
      </div>
    );
  }

  // Desktop's _get_reference_bolts() exactly.
  let leftX;
  let rightX;
  if (numCols <= 1) {
    leftX = w / 2;
    rightX = w / 2;
  } else {
    leftX = rEdge;
    rightX = rEdge + rGauge;
    const maxRight = w - rEdge;
    if (rightX > maxRight || rightX <= leftX) {
      leftX = w * 0.25;
      rightX = w * 0.75;
    }
  }
  const boltY = mode === "moment" ? h * 0.5 : rEnd;

  const topMargin = 35, bottomMargin = 55, leftMargin = 35, rightMargin = 45;
  const sceneX = -leftMargin, sceneY = -topMargin;
  const sceneW = w + leftMargin + rightMargin, sceneH = h + topMargin + bottomMargin;

  const VB_W = 500, VB_H = 420, margin = 10;
  const scale = Math.min((VB_W - 2 * margin) / sceneW, (VB_H - 2 * margin) / sceneH);
  const offX = (VB_W - sceneW * scale) / 2 - sceneX * scale;
  const offY = (VB_H - sceneH * scale) / 2 - sceneY * scale;
  const sx = (x) => offX + x * scale;
  const sy = (y) => offY + y * scale;
  const holeR = Math.max((hole / 2) * scale, 2);

  const stripH = h * 0.12;

  const fractureLines = [];
  if (mode === "shear") {
    fractureLines.push(
      <line key="h" x1={sx(leftX)} y1={sy(boltY)} x2={sx(rightX)} y2={sy(boltY)} stroke="#000" strokeWidth="1.4" strokeDasharray="5,4" />,
      <line key="vl" x1={sx(leftX)} y1={sy(boltY)} x2={sx(leftX)} y2={sy(h)} stroke="#000" strokeWidth="1.4" strokeDasharray="5,4" />,
      <line key="vr" x1={sx(rightX)} y1={sy(boltY)} x2={sx(rightX)} y2={sy(h)} stroke="#000" strokeWidth="1.4" strokeDasharray="5,4" />
    );
  } else {
    fractureLines.push(
      <line key="h" x1={sx(0)} y1={sy(boltY)} x2={sx(rightX)} y2={sy(boltY)} stroke="#000" strokeWidth="1.4" strokeDasharray="5,4" />,
      <line key="vr" x1={sx(rightX)} y1={sy(boltY)} x2={sx(rightX)} y2={sy(h)} stroke="#000" strokeWidth="1.4" strokeDasharray="5,4" />
    );
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ maxHeight: 360 }} xmlns="http://www.w3.org/2000/svg">
      <rect x={sx(0)} y={sy(0)} width={w * scale} height={h * scale} fill="none" stroke="#000" strokeWidth="1.4" />
      <rect x={sx(0)} y={sy(0)} width={w * scale} height={stripH * scale} fill="#C0C0C0" stroke="#000" strokeWidth="1.4" />

      <circle cx={sx(leftX)} cy={sy(boltY)} r={holeR} fill="none" stroke="#1E2BFF" strokeWidth="1.6" />
      <circle cx={sx(rightX)} cy={sy(boltY)} r={holeR} fill="none" stroke="#1E2BFF" strokeWidth="1.6" />

      {fractureLines}

      <HorizDim x1={sx(0)} x2={sx(rEdge)} y={sy(-20)} label={`${rEdge.toFixed(1)}`} />
      <HorizDim x1={sx(rEdge)} x2={sx(rEdge + rGauge)} y={sy(-20)} label={`${rGauge.toFixed(1)}`} />
      <HorizDim x1={sx(rEdge + rGauge)} x2={sx(w)} y={sy(-20)} label={`${Math.max(0, w - rEdge - rGauge).toFixed(1)}`} />
      <HorizDim x1={sx(0)} x2={sx(w)} y={sy(h + 30)} label={`${w.toFixed(1)} mm`} above={false} />
      <VertDim x={sx(w + 30)} y1={sy(0)} y2={sy(rEnd)} label={`${rEnd.toFixed(1)}`} />
      <VertDim x={sx(w + 30)} y1={sy(rEnd)} y2={sy(h)} label={`${Math.max(0, h - rEnd).toFixed(1)}`} />
      <VertDim x={sx(-30)} y1={sy(0)} y2={sy(h)} label={`${h.toFixed(1)}`} right={false} />
    </svg>
  );
};

export default SeatedAngleCapacitySketch;
