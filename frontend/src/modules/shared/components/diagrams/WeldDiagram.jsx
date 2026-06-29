/* eslint-disable react/prop-types */
import { useMemo } from "react";

/**
 * WeldDiagram renders an SVG representation of a splice plate weld layout.
 * Matches the B2BCoverPlateWeldedDetails desktop GUI drawing:
 *  - Rectangle (plate outline)
 *  - A center stripe showing plate thickness (blue) — horizontal for web, vertical for flange
 *  - Red weld strips outside plate edges (top/bottom full-width, left/right split by weld gap)
 *
 * Props:
 *  - plateWidth:     overall plate width (horizontal extent in mm)
 *  - plateHeight:    overall plate height (vertical extent in mm)
 *  - plateThickness: thickness of the splice plate (mm) — shown as center stripe
 *  - weldSize:       weld throat size (mm) — used as thickness of red weld strips
 *  - weldGap:        gap at center of vertical sides (mm)
 *  - isWebPlate:     true = horizontal center stripe (web), false = vertical (flange)
 *  - className:      optional CSS class
 */

const VIEWBOX_W = 500;
const VIEWBOX_H = 340;
const MARGIN = 60;

const toNum = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const WeldDiagram = ({
  plateWidth,
  plateHeight,
  plateThickness,
  weldSize,
  weldGap,
  isWebPlate = true,
  className = "",
}) => {
  const params = useMemo(() => {
    const pw = toNum(plateWidth);
    const ph = toNum(plateHeight);
    const pt = toNum(plateThickness);
    const ws = toNum(weldSize, 6);
    const wg = toNum(weldGap, 0);
    return { pw, ph, pt, ws, wg };
  }, [plateWidth, plateHeight, plateThickness, weldSize, weldGap]);

  const { pw, ph, pt, ws, wg } = params;

  if (pw <= 0 || ph <= 0) {
    return (
      <div
        className={`flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 ${className}`}
      >
        Plate dimensions unavailable
      </div>
    );
  }

  // Scale to fit in viewport
  const usableW = VIEWBOX_W - 2 * MARGIN;
  const usableH = VIEWBOX_H - 2 * MARGIN;
  const scale = Math.min(usableW / pw, usableH / ph);

  const ox = (VIEWBOX_W - pw * scale) / 2; // plate origin x
  const oy = (VIEWBOX_H - ph * scale) / 2; // plate origin y
  const W = pw * scale;  // plate width in svg units
  const H = ph * scale;  // plate height in svg units
  const ws_px = ws * scale;
  const wg_px = wg * scale;
  const pt_px = pt * scale;
  const halfHeight = (H - wg_px) / 2;

  // Dimension label helpers
  const dimColor = "#444";
  const labelStyle = { fontSize: 11, fill: dimColor, fontFamily: "monospace" };

  const HorizDim = ({ x1, x2, y, label }) => {
    const mid = (x1 + x2) / 2;
    return (
      <g>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={dimColor} strokeWidth="1" markerStart="url(#weld-arr-s)" markerEnd="url(#weld-arr-e)" />
        <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={dimColor} strokeWidth="1" />
        <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={dimColor} strokeWidth="1" />
        <text x={mid} y={y - 6} textAnchor="middle" style={labelStyle}>{label}</text>
      </g>
    );
  };

  const VertDim = ({ x, y1, y2, label }) => {
    const mid = (y1 + y2) / 2;
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={dimColor} strokeWidth="1" />
        <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} stroke={dimColor} strokeWidth="1" />
        <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke={dimColor} strokeWidth="1" />
        <text x={x + 7} y={mid + 4} textAnchor="start" style={labelStyle}>{label}</text>
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className={`h-auto w-full max-w-xl ${className}`}
      role="img"
      aria-label="Weld layout diagram"
    >
      <defs>
        <marker id="weld-arr-s" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto-start-reverse">
          <path d="M6 3 L0 0 L0 6Z" fill={dimColor} />
        </marker>
        <marker id="weld-arr-e" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M0 3 L6 0 L6 6Z" fill={dimColor} />
        </marker>
      </defs>

      {/* Plate outline */}
      <rect
        x={ox}
        y={oy}
        width={W}
        height={H}
        fill="#e8e8d0"
        stroke="#333"
        strokeWidth="2"
      />

      {/* Center stripe — plate thickness */}
      {pt_px > 0 && isWebPlate && (
        <rect
          x={ox}
          y={oy + (H - pt_px) / 2}
          width={W}
          height={pt_px}
          fill="#4a80c4"
          opacity="0.7"
          stroke="#2a60a4"
          strokeWidth="1"
        />
      )}
      {pt_px > 0 && !isWebPlate && (
        <rect
          x={ox + (W - pt_px) / 2}
          y={oy}
          width={pt_px}
          height={H}
          fill="#4a80c4"
          opacity="0.7"
          stroke="#2a60a4"
          strokeWidth="1"
        />
      )}

      {/* TOP weld strip */}
      {ws_px > 0 && (
        <rect x={ox} y={oy - ws_px} width={W} height={ws_px} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
      )}

      {/* BOTTOM weld strip */}
      {ws_px > 0 && (
        <rect x={ox} y={oy + H} width={W} height={ws_px} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
      )}

      {/* LEFT weld strips (split by gap) */}
      {ws_px > 0 && halfHeight > 0 && (
        <>
          <rect x={ox - ws_px} y={oy} width={ws_px} height={halfHeight} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
          <rect x={ox - ws_px} y={oy + H - halfHeight} width={ws_px} height={halfHeight} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
        </>
      )}

      {/* RIGHT weld strips (split by gap) */}
      {ws_px > 0 && halfHeight > 0 && (
        <>
          <rect x={ox + W} y={oy} width={ws_px} height={halfHeight} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
          <rect x={ox + W} y={oy + H - halfHeight} width={ws_px} height={halfHeight} fill="rgba(210,30,50,0.6)" stroke="rgba(200,20,40,0.8)" strokeWidth="1" />
        </>
      )}

      {/* Dimensions: width (top) */}
      <HorizDim x1={ox} x2={ox + W} y={oy - ws_px - 16} label={`${pw} mm`} />

      {/* Dimensions: height (right) */}
      <VertDim x={ox + W + ws_px + 10} y1={oy} y2={oy + H} label={`${ph} mm`} />

      {/* Legend */}
      <rect x={MARGIN - 10} y={VIEWBOX_H - 26} width={12} height={12} fill="rgba(210,30,50,0.6)" />
      <text x={MARGIN + 6} y={VIEWBOX_H - 17} style={{ fontSize: 10, fill: "#555" }}>Weld ({ws} mm)</text>
      {pt_px > 0 && (
        <>
          <rect x={MARGIN + 80} y={VIEWBOX_H - 26} width={12} height={12} fill="#4a80c4" opacity="0.7" />
          <text x={MARGIN + 96} y={VIEWBOX_H - 17} style={{ fontSize: 10, fill: "#555" }}>Plate thickness ({pt} mm)</text>
        </>
      )}
    </svg>
  );
};

export default WeldDiagram;
