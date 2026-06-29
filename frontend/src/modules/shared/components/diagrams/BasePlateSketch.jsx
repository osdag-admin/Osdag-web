/* eslint-disable react/prop-types */
import { useMemo } from "react";

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;
const MARGIN = 80;

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const DimensionText = ({ x, y, text, anchor = "middle", rotation = 0 }) => (
  <text
    x={x}
    y={y}
    fontSize="12"
    fontWeight="500"
    textAnchor={anchor}
    fill="#000"
    fontFamily="Arial, sans-serif"
    transform={rotation ? `rotate(${rotation}, ${x}, ${y})` : undefined}
  >
    {text}
  </text>
);

const BasePlateSketch = ({
  plateLength,
  plateWidth,
  plateThickness,
  columnDepth,
  columnWidth,
  columnTf,
  columnTw,
  noOcfBolts,
  diaOcfBolt,
  edgeOcf,
  endOcf,
  noIcfBolts,
  diaIcfBolt,
  edgeIcf,
  endIcf,
  memberDesignation = "",
  className = "",
}) => {
  const params = useMemo(() => {
    const pL = toNumber(plateLength);
    const pW = toNumber(plateWidth);
    const colD = toNumber(columnDepth);
    const colB = toNumber(columnWidth);
    const colTf = toNumber(columnTf);
    const colTw = toNumber(columnTw);

    if (pL <= 0 || pW <= 0) {
      return { error: "Missing base plate dimensions" };
    }

    // Pedestal has a default 100mm padding around base plate
    const pedL = pL + 200;
    const pedW = pW + 200;

    // Detect column type from designation
    const des = String(memberDesignation).toUpperCase();
    let colType = "I-Section";
    if (des.includes("SHS")) {
      colType = "SHS";
    } else if (des.includes("RHS")) {
      colType = "RHS";
    } else if (des.includes("CHS")) {
      colType = "CHS";
    }

    return {
      pL,
      pW,
      colD,
      colB,
      colTf,
      colTw,
      pedL,
      pedW,
      colType,
    };
  }, [plateLength, plateWidth, columnDepth, columnWidth, columnTf, columnTw, memberDesignation]);

  if (params.error) {
    return (
      <div className={`flex min-h-[280px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 ${className}`}>
        Dimensions Unavailable
      </div>
    );
  }

  // Scaling
  const usableWidth = VIEWBOX_WIDTH - 2 * MARGIN;
  const usableHeight = VIEWBOX_HEIGHT - 2 * MARGIN;
  const scaleX = usableWidth / params.pedL;
  const scaleY = usableHeight / params.pedW;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (VIEWBOX_WIDTH - params.pedL * scale) / 2;
  const offsetY = (VIEWBOX_HEIGHT - params.pedW * scale) / 2;

  // Center of base plate & pedestal
  const cX = offsetX + (params.pedL * scale) / 2;
  const cY = offsetY + (params.pedW * scale) / 2;

  // Base Plate box
  const bpX = offsetX + 100 * scale;
  const bpY = offsetY + 100 * scale;
  const bpW = params.pL * scale;
  const bpH = params.pW * scale;

  // Bolts positioning helper
  const getBolts = (count, edge, end) => {
    const num = toNumber(count);
    const ed = toNumber(edge);
    const en = toNumber(end);
    if (num <= 0 || ed <= 0 || en <= 0) return [];

    const positions = [];
    if (num === 2) {
      positions.push({ x: params.pL / 2, y: en });
      positions.push({ x: params.pL / 2, y: params.pW - en });
    } else if (num >= 4) {
      positions.push({ x: ed, y: en });
      positions.push({ x: params.pL - ed, y: en });
      positions.push({ x: ed, y: params.pW - en });
      positions.push({ x: params.pL - ed, y: params.pW - en });

      if (num === 6) {
        positions.push({ x: params.pL / 2, y: en });
        positions.push({ x: params.pL / 2, y: params.pW - en });
      } else if (num === 8) {
        positions.push({ x: params.pL / 2, y: en });
        positions.push({ x: params.pL / 2, y: params.pW - en });
        positions.push({ x: ed, y: params.pW / 2 });
        positions.push({ x: params.pL - ed, y: params.pW / 2 });
      }
    }
    return positions;
  };

  const ocfBolts = getBolts(noOcfBolts, edgeOcf, endOcf, true);
  const icfBolts = getBolts(noIcfBolts, edgeIcf, endIcf, false);

  // Render anchor bolt graphic
  const renderAnchor = (x, y, dia, key) => {
    const r = Math.max(4, (toNumber(dia, 20) / 2) * scale);
    const cx = bpX + x * scale;
    const cy = bpY + y * scale;
    return (
      <g key={key}>
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={r} fill="#dc2626" stroke="#000" strokeWidth="1.5" />
        <line x1={cx - r - 2} y1={cy} x2={cx + r + 2} y2={cy} stroke="#000" strokeWidth="1" />
        <line x1={cx} y1={cy - r - 2} x2={cx} y2={cy + r + 2} stroke="#000" strokeWidth="1" />
      </g>
    );
  };

  // Dimension lines helper

  return (
    <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className={`h-auto w-full ${className}`} role="img">
      <defs>
        <marker id="baseplate-arrow-start" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 12 6 L 0 0 L 0 12 Z" fill="#000" />
        </marker>
        <marker id="baseplate-arrow-end" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 12 6 L 0 0 L 0 12 Z" fill="#000" />
        </marker>
      </defs>

      {/* Concrete Pedestal Outer Box */}
      <rect
        x={offsetX}
        y={offsetY}
        width={params.pedL * scale}
        height={params.pedW * scale}
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeDasharray="5,5"
      />

      {/* Base Plate */}
      <rect
        x={bpX}
        y={bpY}
        width={bpW}
        height={bpH}
        fill="#cbd5e1"
        stroke="#334155"
        strokeWidth="2"
      />

      {/* Column Shape */}
      {params.colType === "CHS" && params.colD > 0 && (
        <g>
          {/* Outer circle */}
          <circle cx={cX} cy={cY} r={(params.colD / 2) * scale} fill="#475569" stroke="#000" strokeWidth="2" />
          {/* Inner circle */}
          {params.colTw > 0 && (
            <circle cx={cX} cy={cY} r={((params.colD - 2 * params.colTw) / 2) * scale} fill="#cbd5e1" stroke="#000" strokeWidth="1" />
          )}
        </g>
      )}

      {params.colType === "SHS" && params.colD > 0 && (
        <g>
          {/* Outer box */}
          <rect
            x={cX - (params.colD / 2) * scale}
            y={cY - (params.colD / 2) * scale}
            width={params.colD * scale}
            height={params.colD * scale}
            fill="#475569"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Inner offset box */}
          {params.colTw > 0 && (
            <rect
              x={cX - (params.colD / 2 - params.colTw) * scale}
              y={cY - (params.colD / 2 - params.colTw) * scale}
              width={(params.colD - 2 * params.colTw) * scale}
              height={(params.colD - 2 * params.colTw) * scale}
              fill="#cbd5e1"
              stroke="#000"
              strokeWidth="1"
            />
          )}
        </g>
      )}

      {params.colType === "RHS" && params.colD > 0 && params.colB > 0 && (
        <g>
          {/* Outer box */}
          <rect
            x={cX - (params.colB / 2) * scale}
            y={cY - (params.colD / 2) * scale}
            width={params.colB * scale}
            height={params.colD * scale}
            fill="#475569"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Inner box */}
          {params.colTw > 0 && (
            <rect
              x={cX - (params.colB / 2 - params.colTw) * scale}
              y={cY - (params.colD / 2 - params.colTw) * scale}
              width={(params.colB - 2 * params.colTw) * scale}
              height={(params.colD - 2 * params.colTw) * scale}
              fill="#cbd5e1"
              stroke="#000"
              strokeWidth="1"
            />
          )}
        </g>
      )}

      {params.colType === "I-Section" && params.colD > 0 && params.colB > 0 && (
        <g>
          {/* Web */}
          <rect
            x={cX - (params.colTw / 2) * scale}
            y={cY - (params.colD / 2 - params.colTf) * scale}
            width={params.colTw * scale}
            height={(params.colD - 2 * params.colTf) * scale}
            fill="#475569"
            stroke="#000"
            strokeWidth="1"
          />
          {/* Top flange */}
          <rect
            x={cX - (params.colB / 2) * scale}
            y={cY - (params.colD / 2) * scale}
            width={params.colB * scale}
            height={params.colTf * scale}
            fill="#475569"
            stroke="#000"
            strokeWidth="1.5"
          />
          {/* Bottom flange */}
          <rect
            x={cX - (params.colB / 2) * scale}
            y={cY + (params.colD / 2 - params.colTf) * scale}
            width={params.colB * scale}
            height={params.colTf * scale}
            fill="#475569"
            stroke="#000"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Anchor Bolts */}
      {ocfBolts.map((b, i) => renderAnchor(b.x, b.y, diaOcfBolt, `ocf-${i}`))}
      {icfBolts.map((b, i) => renderAnchor(b.x, b.y, diaIcfBolt, `icf-${i}`))}

      {/* Dimensions & Labels */}
      {/* Horizontal length of plate */}
      <line x1={bpX} y1={bpY + bpH + 30} x2={bpX + bpW} y2={bpY + bpH + 30} stroke="#000" strokeWidth="1" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
      <line x1={bpX} y1={bpY + bpH + 5} x2={bpX} y2={bpY + bpH + 35} stroke="#000" strokeWidth="0.8" />
      <line x1={bpX + bpW} y1={bpY + bpH + 5} x2={bpX + bpW} y2={bpY + bpH + 35} stroke="#000" strokeWidth="0.8" />
      <DimensionText x={bpX + bpW / 2} y={bpY + bpH + 44} text={`${params.pL.toFixed(0)} mm`} />

      {/* Vertical width of plate */}
      <line x1={bpX - 30} y1={bpY} x2={bpX - 30} y2={bpY + bpH} stroke="#000" strokeWidth="1" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
      <line x1={bpX - 35} y1={bpY} x2={bpX + 5} y2={bpY} stroke="#000" strokeWidth="0.8" />
      <line x1={bpX - 35} y1={bpY + bpH} x2={bpX + 5} y2={bpY + bpH} stroke="#000" strokeWidth="0.8" />
      <DimensionText x={bpX - 38} y={bpY + bpH / 2 + 4} text={`${params.pW.toFixed(0)} mm`} anchor="end" />

      {/* Outside Anchor Spacing Labels */}
      {ocfBolts.length > 0 && (
        <g>
          {/* End distance vertical label */}
          <line x1={bpX + bpW + 15} y1={bpY} x2={bpX + bpW + 15} y2={bpY + endOcf * scale} stroke="#000" strokeWidth="0.8" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
          <line x1={bpX + bpW + 10} y1={bpY + endOcf * scale} x2={bpX + bpW + 20} y2={bpY + endOcf * scale} stroke="#000" strokeWidth="0.8" />
          <DimensionText x={bpX + bpW + 24} y={bpY + (endOcf * scale) / 2 + 4} text={`${toNumber(endOcf).toFixed(0)}`} anchor="start" />

          {/* Edge distance horizontal label */}
          <line x1={bpX} y1={bpY - 15} x2={bpX + edgeOcf * scale} y2={bpY - 15} stroke="#000" strokeWidth="0.8" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
          <line x1={bpX + edgeOcf * scale} y1={bpY - 20} x2={bpX + edgeOcf * scale} y2={bpY - 10} stroke="#000" strokeWidth="0.8" />
          <DimensionText x={bpX + (edgeOcf * scale) / 2} y={bpY - 22} text={`${toNumber(edgeOcf).toFixed(0)}`} />
        </g>
      )}

      {/* Pedestal description label */}
      <text x={offsetX + 10} y={offsetY + 20} fontSize="11" fill="#64748b" fontFamily="Arial, sans-serif" fontWeight="bold">
        Concrete Pedestal: {params.pedL.toFixed(0)}x{params.pedW.toFixed(0)} mm
      </text>
      <text x={bpX + 10} y={bpY + 20} fontSize="11" fill="#334155" fontFamily="Arial, sans-serif" fontWeight="bold">
        Base Plate: {params.pL.toFixed(0)}x{params.pW.toFixed(0)}x{toNumber(plateThickness).toFixed(0)} mm
      </text>
    </svg>
  );
};

export default BasePlateSketch;
