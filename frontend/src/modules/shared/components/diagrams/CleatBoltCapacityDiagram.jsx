/* eslint-disable react/prop-types */

/**
 * CleatBoltCapacityDiagram replicates desktop's CleatAngleCapacityDetails
 * exactly. Desktop draws TWO side-by-side plates (mirror images of each
 * other) with 4 bolts always at fixed schematic positions (never derived
 * from real row/column count beyond an on/off check) - only the dashed
 * fracture-line routing and the two bolt-row Y positions change per
 * leg ("supported"|"supporting") x mode ("shear"|"tension") combination.
 * Note: desktop's own source has a shadowed duplicate definition for the
 * "supporting" leg - the actually-active methods (_draw_supporting_leg_shear
 * / _draw_supporting_leg_tension, defined later in the class, overriding an
 * earlier stub) are the ones ported here.
 */

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const PLATE_W = 180;
const PLATE_H = 290;
const STRIP_W = 14;
const START_Y = 40;
const LEFT_X = 110;
const RIGHT_X = 480;
const VB_W = 900, VB_H = 460;

const dimColor = "#000";

const HorizDim = ({ x1, x2, y, label, above = true }) => {
  if (Math.abs(x2 - x1) < 4) return null;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={dimColor} strokeWidth="1" />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={dimColor} strokeWidth="1" />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={dimColor} strokeWidth="1" />
      <text x={(x1 + x2) / 2} y={above ? y - 8 : y + 16} textAnchor="middle" fontSize="11" fontWeight="bold" fill={dimColor}>{label}</text>
    </g>
  );
};

const VertDim = ({ x, y1, y2, label }) => {
  if (Math.abs(y2 - y1) < 4) return null;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={dimColor} strokeWidth="1" />
      <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} stroke={dimColor} strokeWidth="1" />
      <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke={dimColor} strokeWidth="1" />
      <text x={x + 8} y={(y1 + y2) / 2 + 4} textAnchor="start" fontSize="11" fontWeight="bold" fill={dimColor}>{label}</text>
    </g>
  );
};

const BlueBolt = ({ cx, cy }) => (
  <ellipse cx={cx} cy={cy} rx={11} ry={11} stroke="#1E2DFF" strokeWidth="2.5" fill="white" />
);

const PlatePair = ({ leftStripRight = true }) => (
  <g>
    <rect x={LEFT_X} y={START_Y} width={PLATE_W} height={PLATE_H} fill="#F2F2F2" stroke="#000" strokeWidth="2" />
    <rect x={leftStripRight ? LEFT_X + PLATE_W - STRIP_W : LEFT_X} y={START_Y} width={STRIP_W} height={PLATE_H} fill="#9A9A9A" stroke="#000" strokeWidth="2" />
    <rect x={RIGHT_X} y={START_Y} width={PLATE_W} height={PLATE_H} fill="#F2F2F2" stroke="#000" strokeWidth="2" />
    <rect x={RIGHT_X} y={START_Y} width={STRIP_W} height={PLATE_H} fill="#9A9A9A" stroke="#000" strokeWidth="2" />
  </g>
);

const CleatBoltCapacityDiagram = ({
  leg = "supported",
  plateHeight,
  boltRows,
  boltCols,
  end,
  pitch,
  edge,
  gauge1,
  angleDesignation = "",
  mode = "shear", // "shear" | "tension"
  className = "",
}) => {
  const height = toNum(plateHeight);
  const rEnd = toNum(end);
  const rPitch = toNum(pitch);
  const rEdge = toNum(edge);
  const rGauge1 = toNum(gauge1);
  const cols = Math.max(1, Math.round(toNum(boltCols, 1)));

  // Desktop parses leg length from the angle designation string
  // (e.g. "80 80 8" -> chars[0:2] for supported, chars[5:7] for supporting).
  const desigStr = String(angleDesignation);
  const length = toNum(leg === "supported" ? desigStr.slice(0, 2) : desigStr.slice(5, 7));

  const boltXLeft = LEFT_X + PLATE_W * 0.5;
  const boltXRight = RIGHT_X + PLATE_W * 0.5;

  let topBoltY, botBoltY;
  if (leg === "supporting" && mode === "shear") {
    topBoltY = START_Y + 90;
    botBoltY = START_Y + 240;
  } else {
    topBoltY = START_Y + 60;
    botBoltY = START_Y + 210;
  }

  const fractureLines = [];
  if (leg === "supported") {
    if (mode === "shear") {
      fractureLines.push(
        <line key="l1" x1={boltXLeft} y1={START_Y} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="l2" x1={LEFT_X} y1={botBoltY} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="r1" x1={boltXRight} y1={START_Y} x2={boltXRight} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="r2" x1={boltXRight} y1={botBoltY} x2={RIGHT_X + PLATE_W} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />
      );
    } else {
      fractureLines.push(
        <line key="l1" x1={boltXLeft} y1={topBoltY} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="l2" x1={LEFT_X} y1={topBoltY} x2={boltXLeft} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="l3" x1={LEFT_X} y1={botBoltY} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="r1" x1={boltXRight} y1={topBoltY} x2={boltXRight} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="r2" x1={boltXRight} y1={topBoltY} x2={RIGHT_X + PLATE_W} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
        <line key="r3" x1={boltXRight} y1={botBoltY} x2={RIGHT_X + PLATE_W} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />
      );
    }
  } else if (mode === "shear") {
    fractureLines.push(
      <line key="l1" x1={LEFT_X} y1={topBoltY} x2={boltXLeft} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="l2" x1={boltXLeft} y1={topBoltY} x2={boltXLeft} y2={START_Y + PLATE_H} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="r1" x1={boltXRight} y1={topBoltY} x2={RIGHT_X + PLATE_W} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="r2" x1={boltXRight} y1={topBoltY} x2={boltXRight} y2={START_Y + PLATE_H} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />
    );
  } else {
    fractureLines.push(
      <line key="l1" x1={boltXLeft} y1={topBoltY} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="l2" x1={LEFT_X} y1={topBoltY} x2={boltXLeft} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="l3" x1={LEFT_X} y1={botBoltY} x2={boltXLeft} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="r1" x1={boltXRight} y1={topBoltY} x2={boltXRight} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="r2" x1={boltXRight} y1={topBoltY} x2={RIGHT_X + PLATE_W} y2={topBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />,
      <line key="r3" x1={boltXRight} y1={botBoltY} x2={RIGHT_X + PLATE_W} y2={botBoltY} stroke="#000" strokeWidth="2" strokeDasharray="8,5" />
    );
  }

  const dimXRight = LEFT_X + PLATE_W + 26;
  const dimXLeft = LEFT_X - 48;
  const dimYTop = START_Y - 26;
  const dimYBot = START_Y + PLATE_H + 34;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ maxHeight: 420 }} xmlns="http://www.w3.org/2000/svg">
      <PlatePair leftStripRight={leg === "supported"} />
      <BlueBolt cx={boltXLeft} cy={topBoltY} />
      <BlueBolt cx={boltXLeft} cy={botBoltY} />
      <BlueBolt cx={boltXRight} cy={topBoltY} />
      <BlueBolt cx={boltXRight} cy={botBoltY} />
      {fractureLines}

      {rEnd > 0 && <VertDim x={dimXRight} y1={START_Y} y2={topBoltY} label={rEnd.toFixed(0)} />}
      {rPitch > 0 && <VertDim x={dimXRight} y1={topBoltY} y2={botBoltY} label={rPitch.toFixed(0)} />}
      {rEnd > 0 && <VertDim x={dimXRight} y1={botBoltY} y2={START_Y + PLATE_H} label={rEnd.toFixed(0)} />}
      {length > 0 && <HorizDim x1={LEFT_X} x2={LEFT_X + PLATE_W} y={dimYTop} label={length.toFixed(0)} />}
      {height > 0 && <VertDim x={dimXLeft} y1={START_Y} y2={START_Y + PLATE_H} label={height.toFixed(0)} />}
      {rEdge > 0 && <HorizDim x1={LEFT_X} x2={boltXLeft} y={dimYBot} label={rEdge.toFixed(0)} above={false} />}
      {cols > 1 && rGauge1 > 0 && (
        <HorizDim x1={LEFT_X + PLATE_W - rEdge - rGauge1} x2={LEFT_X + PLATE_W - rEdge} y={START_Y - 46} label={`g=${rGauge1.toFixed(0)}`} />
      )}
    </svg>
  );
};

export default CleatBoltCapacityDiagram;
