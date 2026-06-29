/* eslint-disable react/prop-types */

/**
 * CleatBoltCapacityDiagram renders the bolt-capacity failure pattern drawing
 * that matches the desktop GUI's CleatAngleCapacityDetails dialog.
 *
 * Shows TWO bolt-grid sketches stacked vertically:
 *   1. Shear failure — dashed lines going from top-bolt to bottom plate edge
 *   2. Tension failure — dashed lines between top and bottom bolts
 *
 * Props:
 *  - leg: "supported" | "supporting" — controls which pattern is drawn
 *  - plateHeight: height (mm) of the cleat angle leg (Plate.Height)
 *  - boltRows: number of bolt rows
 *  - boltCols: number of bolt columns
 *  - pitch: bolt pitch distance (mm)
 *  - end: bolt end distance (mm)
 *  - edge: bolt edge distance (mm)
 *  - gauge1: first gauge distance from leg root (mm)
 *  - gauge2: second gauge / pitch perpendicular (mm)
 *  - holeDiameter: bolt hole diameter (mm)
 *  - angleDesignation: e.g. "75 75 6" — leg lengths from first two digits
 */

const PLATE_W = 160;
const PLATE_H = 230;
const STRIP_W = 14;
const START_Y = 30;

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Minimal annotation arrow


const VertDim = ({ x, y1, y2, label }) => {
  if (Math.abs(y2 - y1) < 4) return null;
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#555" strokeWidth="1" />
      <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} stroke="#555" strokeWidth="1" />
      <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke="#555" strokeWidth="1" />
      <text x={x + 8} y={mid + 4} textAnchor="start" fontSize="10" fill="#444" fontFamily="monospace">{label}</text>
    </g>
  );
};

const PlatePanel = ({ x, stripOnLeft = false }) => (
  <g>
    <rect x={x} y={START_Y} width={PLATE_W} height={PLATE_H} fill="#f0ede0" stroke="#444" strokeWidth="2" />
    {stripOnLeft
      ? <rect x={x} y={START_Y} width={STRIP_W} height={PLATE_H} fill="#888" stroke="#444" strokeWidth="1.5" />
      : <rect x={x + PLATE_W - STRIP_W} y={START_Y} width={STRIP_W} height={PLATE_H} fill="#888" stroke="#444" strokeWidth="1.5" />
    }
  </g>
);

const BlueBolt = ({ cx, cy }) => (
  <ellipse cx={cx} cy={cy} rx={9} ry={9} stroke="#1E2DFF" strokeWidth="3" fill="white" />
);

function BoltGrid({ x, topBoltY, botBoltY, rows }) {
  const bolts = [];
  const boltX = x + PLATE_W / 2;
  if (rows >= 1) bolts.push(<BlueBolt key="t" cx={boltX} cy={topBoltY} />);
  if (rows >= 2) bolts.push(<BlueBolt key="b" cx={boltX} cy={botBoltY} />);
  return <g>{bolts}</g>;
}

function ShearFailureLines({ x, topBoltY, botBoltY, leg }) {
  const boltX = x + PLATE_W / 2;
  const bottomEdge = START_Y + PLATE_H;
  const dashStyle = { stroke: "#222", strokeWidth: 2, strokeDasharray: "8 5" };
  if (leg === "supported") {
    // Vertical from top-bolt to bottom edge, horizontal to plate edge
    return (
      <g>
        <line x1={boltX} y1={START_Y} x2={boltX} y2={botBoltY} style={dashStyle} />
        <line x1={x} y1={botBoltY} x2={boltX} y2={botBoltY} style={dashStyle} />
      </g>
    );
  } else {
    // Supporting: horizontal from top-bolt to leg side, vertical to bottom edge
    return (
      <g>
        <line x1={x} y1={topBoltY} x2={boltX} y2={topBoltY} style={dashStyle} />
        <line x1={boltX} y1={topBoltY} x2={boltX} y2={bottomEdge} style={dashStyle} />
      </g>
    );
  }
}

function TensionFailureLines({ x, topBoltY, botBoltY, leg }) {
  const boltX = x + PLATE_W / 2;
  const dashStyle = { stroke: "#222", strokeWidth: 2, strokeDasharray: "8 5" };
  const leftEdge = x;
  const rightEdge = x + PLATE_W;
  // Both legs: vertical between bolts, horizontals at both bolt levels
  if (leg === "supported") {
    return (
      <g>
        <line x1={boltX} y1={topBoltY} x2={boltX} y2={botBoltY} style={dashStyle} />
        <line x1={leftEdge} y1={topBoltY} x2={boltX} y2={topBoltY} style={dashStyle} />
        <line x1={leftEdge} y1={botBoltY} x2={boltX} y2={botBoltY} style={dashStyle} />
      </g>
    );
  } else {
    return (
      <g>
        <line x1={boltX} y1={topBoltY} x2={boltX} y2={botBoltY} style={dashStyle} />
        <line x1={boltX} y1={topBoltY} x2={rightEdge} y2={topBoltY} style={dashStyle} />
        <line x1={boltX} y1={botBoltY} x2={rightEdge} y2={botBoltY} style={dashStyle} />
      </g>
    );
  }
}

function CapPanel({ mode, leg, topBoltY, botBoltY, leftX, rightX }) {
  const stripOnRight = leg === "supported";  // supported: strip on right (plate connects to beam)
  return (
    <g>
      {/* Left angle representation */}
      <PlatePanel x={leftX} stripOnLeft={!stripOnRight} />
      {/* Right angle representation */}
      <PlatePanel x={rightX} stripOnLeft={stripOnRight} />

      {mode === "shear"
        ? <>
            <ShearFailureLines x={leftX} topBoltY={topBoltY} botBoltY={botBoltY} leg={leg} />
            <ShearFailureLines x={rightX} topBoltY={topBoltY} botBoltY={botBoltY}
              leg={leg === "supported" ? "supporting" : "supported"} />
          </>
        : <>
            <TensionFailureLines x={leftX} topBoltY={topBoltY} botBoltY={botBoltY} leg={leg} />
            <TensionFailureLines x={rightX} topBoltY={topBoltY} botBoltY={botBoltY}
              leg={leg === "supported" ? "supporting" : "supported"} />
          </>
      }

      <BoltGrid x={leftX} topBoltY={topBoltY} botBoltY={botBoltY} rows={2} />
      <BoltGrid x={rightX} topBoltY={topBoltY} botBoltY={botBoltY} rows={2} />
    </g>
  );
}

const CleatBoltCapacityDiagram = ({
  leg = "supported",
  boltRows,
  pitch,
  end,
  className = "",
}) => {
  const rows = toNum(boltRows, 2);
  const endV = toNum(end, 40);
  const pitchV = toNum(pitch, 60);

  // Clamp bolt positions into fixed sketch space
  const topBoltY = START_Y + 60;
  const botBoltY = rows >= 2 ? START_Y + 170 : topBoltY;

  const leftX = 30;
  const rightX = 270;
  const FULL_W = rightX + PLATE_W + 60;
  const PANEL_H = START_Y + PLATE_H + 50;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Shear failure panel */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern due to Shear</p>
        <svg viewBox={`0 0 ${FULL_W} ${PANEL_H}`} className="w-full max-w-xl h-auto">
          <CapPanel mode="shear" leg={leg} topBoltY={topBoltY} botBoltY={botBoltY} leftX={leftX} rightX={rightX} />
          {/* Dim annotations */}
          {endV > 0 && <VertDim x={rightX + PLATE_W + 18} y1={START_Y} y2={topBoltY} label={`${endV}`} />}
          {pitchV > 0 && rows >= 2 && <VertDim x={rightX + PLATE_W + 18} y1={topBoltY} y2={botBoltY} label={`${pitchV}`} />}
        </svg>
      </div>

      {/* Tension failure panel */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern due to Tension</p>
        <svg viewBox={`0 0 ${FULL_W} ${PANEL_H}`} className="w-full max-w-xl h-auto">
          <CapPanel mode="tension" leg={leg} topBoltY={topBoltY} botBoltY={botBoltY} leftX={leftX} rightX={rightX} />
          {endV > 0 && <VertDim x={rightX + PLATE_W + 18} y1={START_Y} y2={topBoltY} label={`${endV}`} />}
          {pitchV > 0 && rows >= 2 && <VertDim x={rightX + PLATE_W + 18} y1={topBoltY} y2={botBoltY} label={`${pitchV}`} />}
          {endV > 0 && <VertDim x={rightX + PLATE_W + 18} y1={botBoltY} y2={START_Y + PLATE_H} label={`${endV}`} />}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg width="28" height="12"><line x1="0" y1="6" x2="28" y2="6" stroke="#222" strokeWidth="2" strokeDasharray="6 4"/></svg>
          <span>Failure path</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="16"><ellipse cx="8" cy="8" rx="6" ry="6" stroke="#1E2DFF" strokeWidth="2.5" fill="white"/></svg>
          <span>Bolt</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#888"/></svg>
          <span>Angle thickness</span>
        </div>
      </div>
    </div>
  );
};

export default CleatBoltCapacityDiagram;
