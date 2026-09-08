/* eslint-disable react/prop-types */

/**
 * EndPlateCapacitySketch replicates desktop's EndPlateCapacityDetails /
 * EndPlateSectionDetails._draw_common() exactly: a stylized (NOT to real
 * proportions) I-beam elevation with a splice plate on each side of the
 * web, one centered bolt column per plate, and exactly 2 bolt rows at
 * fixed proportional positions (22%/78% of plate height) - regardless of
 * the module's real row/column count. Only the dimension LABELS reflect
 * real end/pitch/edge values; bolt positions themselves are schematic.
 */

const toNum = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const dimColor = "#444";

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

const EndPlateCapacitySketch = ({
  plateWidth,
  plateHeight,
  holeDia,
  end,
  pitch,
  edge,
  mode = "shear", // "shear" | "tension" | "section"
  className = "",
}) => {
  const rWidth = toNum(plateWidth);
  const rHeight = toNum(plateHeight);
  const hole = toNum(holeDia, 20);
  const rEnd = toNum(end);
  const rPitch = toNum(pitch);
  const rEdge = toNum(edge);

  if (rWidth <= 0 || rHeight <= 0) {
    return (
      <div className={`flex min-h-[280px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 ${className}`}>
        Plate dimensions unavailable
      </div>
    );
  }

  // Exact desktop sequence (_draw_common) - order matters, pw/ph reassigned progressively.
  let pw = rWidth;
  let ph = rHeight;
  pw = Math.min(pw, ph * 0.72);
  ph = Math.max(ph, pw * 1.45);

  const flangeW = pw * 2.7;
  const flangeH = ph * 0.12;
  const webW = ph * 0.07;
  const webTotalH = ph * 1.85;

  const webX = (flangeW - webW) / 2;
  const plateTop = flangeH;
  ph = Math.min(ph, webTotalH * 0.52);

  const leftPlateX = webX - pw;
  const rightPlateX = webX + webW;
  const weldStripW = Math.max(webW * 0.3, 2);

  const leftColX = leftPlateX + pw / 2;
  const rightColX = rightPlateX + pw / 2;

  const topEdge = ph * 0.22;
  const botEdge = ph * 0.78;
  const yTopB = plateTop + topEdge;
  const yBotB = plateTop + botEdge;

  // Desktop's scene rect (fitInView bounding box).
  const padTop = 55, padSide = 75, padBot = 50;
  const sceneX = -padSide;
  const sceneY = -flangeH - padTop;
  const sceneW = flangeW + 2 * padSide;
  const sceneH = webTotalH + flangeH * 2 + padTop + padBot;

  const VB_W = 620, VB_H = 500, margin = 12;
  const scale = Math.min((VB_W - 2 * margin) / sceneW, (VB_H - 2 * margin) / sceneH);
  const offX = (VB_W - sceneW * scale) / 2 - sceneX * scale;
  const offY = (VB_H - sceneH * scale) / 2 - sceneY * scale;
  const sx = (x) => offX + x * scale;
  const sy = (y) => offY + y * scale;
  const holeR = (hole / 2) * scale;

  const boltCircle = (cx, cy, key) => (
    <circle key={key} cx={sx(cx)} cy={sy(cy)} r={Math.max(holeR, 2)} fill="#fff" stroke="#1E2BFF" strokeWidth="1.6" />
  );

  const dashLine = (x1, y1, x2, y2, key) => (
    <line key={key} x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke="#c0392b" strokeWidth="1.6" strokeDasharray="5,4" />
  );

  const fractureLines = [];
  if (mode === "shear") {
    fractureLines.push(dashLine(leftColX, plateTop, leftColX, yBotB, "l-v"));
    fractureLines.push(dashLine(leftColX, yBotB, leftPlateX, yBotB, "l-h"));
    fractureLines.push(dashLine(rightColX, plateTop, rightColX, yBotB, "r-v"));
    fractureLines.push(dashLine(rightColX, yBotB, rightPlateX + pw, yBotB, "r-h"));
  } else if (mode === "tension") {
    fractureLines.push(dashLine(leftColX, yTopB, leftColX, yBotB, "l-v"));
    fractureLines.push(dashLine(leftPlateX, yTopB, leftColX, yTopB, "l-h-top"));
    fractureLines.push(dashLine(leftPlateX, yBotB, leftColX, yBotB, "l-h-bot"));
    fractureLines.push(dashLine(rightColX, yTopB, rightColX, yBotB, "r-v"));
    fractureLines.push(dashLine(rightColX, yTopB, rightPlateX + pw, yTopB, "r-h-top"));
    fractureLines.push(dashLine(rightColX, yBotB, rightPlateX + pw, yBotB, "r-h-bot"));
  } else if (mode === "section") {
    fractureLines.push(dashLine(leftColX, yTopB, leftColX, yBotB, "l-v"));
    fractureLines.push(dashLine(leftColX, yTopB, webX, yTopB, "l-h-top"));
    fractureLines.push(dashLine(leftColX, yBotB, webX, yBotB, "l-h-bot"));
    fractureLines.push(dashLine(rightColX, yTopB, rightColX, yBotB, "r-v"));
    fractureLines.push(dashLine(webX + webW, yTopB, rightColX, yTopB, "r-h-top"));
    fractureLines.push(dashLine(webX + webW, yBotB, rightColX, yBotB, "r-h-bot"));
  }

  const dimYTop = -flangeH - padTop * 0.55;
  const dimYBot = plateTop + ph + padBot * 0.5;
  const dimXLeft = leftPlateX - padSide * 0.65;
  const dimXRight = rightPlateX + pw + padSide * 0.65;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ maxHeight: 420 }} xmlns="http://www.w3.org/2000/svg">
      {/* Beam */}
      <rect x={sx(0)} y={sy(-flangeH)} width={flangeW * scale} height={flangeH * scale} fill="#A0A0A0" stroke="#555" strokeWidth="1" />
      <rect x={sx(0)} y={sy(webTotalH)} width={flangeW * scale} height={flangeH * scale} fill="#A0A0A0" stroke="#555" strokeWidth="1" />
      <rect x={sx(webX)} y={sy(0)} width={webW * scale} height={webTotalH * scale} fill="#A0A0A0" stroke="#555" strokeWidth="1" />

      {/* Plates */}
      <rect x={sx(leftPlateX)} y={sy(plateTop)} width={pw * scale} height={ph * scale} fill="#fff" stroke="#444" strokeWidth="1.2" />
      <rect x={sx(rightPlateX)} y={sy(plateTop)} width={pw * scale} height={ph * scale} fill="#fff" stroke="#444" strokeWidth="1.2" />

      {/* Weld strips */}
      <rect x={sx(webX - weldStripW)} y={sy(plateTop)} width={weldStripW * scale} height={ph * scale} fill="#D2905A" stroke="#C07840" strokeWidth="0.5" />
      <rect x={sx(webX + webW)} y={sy(plateTop)} width={weldStripW * scale} height={ph * scale} fill="#D2905A" stroke="#C07840" strokeWidth="0.5" />

      {/* Bolts */}
      {boltCircle(leftColX, yTopB, "bl-t")}
      {boltCircle(leftColX, yBotB, "bl-b")}
      {boltCircle(rightColX, yTopB, "br-t")}
      {boltCircle(rightColX, yBotB, "br-b")}

      {fractureLines}

      {/* Dimensions */}
      <HorizDim x1={sx(leftPlateX)} x2={sx(leftPlateX + pw)} y={sy(dimYTop)} label={`${rWidth.toFixed(1)}`} />
      <HorizDim x1={sx(rightPlateX)} x2={sx(rightPlateX + pw)} y={sy(dimYTop)} label={`${rWidth.toFixed(1)}`} />
      <VertDim x={sx(dimXLeft)} y1={sy(plateTop)} y2={sy(plateTop + ph)} label={`${rHeight.toFixed(1)}`} right={false} />
      <VertDim x={sx(dimXRight)} y1={sy(plateTop)} y2={sy(yTopB)} label={`${rEnd.toFixed(1)}`} />
      <VertDim x={sx(dimXRight)} y1={sy(yTopB)} y2={sy(yBotB)} label={`${rPitch.toFixed(1)}`} />
      <VertDim x={sx(dimXRight)} y1={sy(yBotB)} y2={sy(plateTop + ph)} label={`${rEnd.toFixed(1)}`} />
      <HorizDim x1={sx(leftPlateX)} x2={sx(leftColX)} y={sy(dimYBot)} label={`${rEdge.toFixed(1)}`} above={false} />
      <HorizDim x1={sx(leftColX)} x2={sx(leftPlateX + pw)} y={sy(dimYBot)} label={`${(rWidth - rEdge).toFixed(1)}`} above={false} />
      <HorizDim x1={sx(rightPlateX)} x2={sx(rightColX)} y={sy(dimYBot)} label={`${(rWidth - rEdge).toFixed(1)}`} above={false} />
      <HorizDim x1={sx(rightColX)} x2={sx(rightPlateX + pw)} y={sy(dimYBot)} label={`${rEdge.toFixed(1)}`} above={false} />
    </svg>
  );
};

export default EndPlateCapacitySketch;
