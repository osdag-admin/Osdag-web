function buildPitchList(numBoltsWeb, pitch, midPitch) {
  const list = [0, 0, 0, 0];
  const n = Math.max(0, Math.round(numBoltsWeb) || 0);
  for (let i = 1; i < n; i += 1) {
    let value;
    if (n % 2 === 0) {
      value = i !== n / 2 ? pitch : midPitch;
    } else {
      const mid = Math.floor(n / 2);
      value = i !== mid && i !== mid + 1 ? pitch : midPitch;
    }
    if (i - 1 < 4) list[i - 1] = value;
  }
  return list;
}

const dimColor = '#6b7280';
const lineColor = '#f97316';
const boltColor = '#2563eb';
const plateColor = '#111827';
const stiffenerColor = '#ef4444';

const arrowPath = (x1, y1, x2, y2, isVertical) => {
  const sz = 5;
  if (isVertical) {
    return `M${x1},${y1} L${x2},${y2}
            M${x1 - sz / 2},${y1 + sz} L${x1},${y1} L${x1 + sz / 2},${y1 + sz}
            M${x2 - sz / 2},${y2 - sz} L${x2},${y2} L${x2 + sz / 2},${y2 - sz}`;
  }
  return `M${x1},${y1} L${x2},${y2}
          M${x1 + sz},${y1 - sz / 2} L${x1},${y1} L${x1 + sz},${y1 + sz / 2}
          M${x2 - sz},${y2 - sz / 2} L${x2},${y2} L${x2 - sz},${y2 + sz / 2}`;
};

const HorizDim = ({ x1, y, x2, label }) => (
  <g>
    <path d={arrowPath(x1, y, x2, y, false)} stroke={dimColor} strokeWidth="1" fill="none" />
    <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={dimColor} strokeWidth="1" />
    <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={dimColor} strokeWidth="1" />
    <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="9" fill={dimColor}>{label}</text>
  </g>
);

const VertDim = ({ x, y1, y2, label, side = 'left' }) => (
  <g>
    <path d={arrowPath(x, y1, x, y2, true)} stroke={dimColor} strokeWidth="1" fill="none" />
    <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} stroke={dimColor} strokeWidth="1" />
    <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke={dimColor} strokeWidth="1" />
    <text
      x={side === 'left' ? x - 8 : x + 8}
      y={(y1 + y2) / 2}
      textAnchor="middle"
      fontSize="9"
      fill={dimColor}
    >
      {label}
    </text>
  </g>
);

const ColumnEndPlateBoltDiagram = ({
  view = 'web', // 'web' | 'flange'
  plateLength = 300,
  plateHeight = 300,
  stiffenerWidth = 0,
  stiffenerThickness = 0,
  webThickness = 8,
  flangeThickness = 12,
  holeDia = 22,
  pitch = 60,
  midPitch = 60,
  endDist = 40,
  numBoltsWeb = 2,
  nbfTotal = 4,
}) => {
  const VB_W = 620;
  const VB_H = 460;
  const margin = 110;

  const pitchList = buildPitchList(numBoltsWeb, pitch, midPitch);

  // Real (mm) drawing extents, matching createDrawing's per-view formulas.
  const W = plateLength;
  const H = view === 'web' ? plateHeight - 2 * stiffenerWidth : plateHeight / 2;

  const availW = VB_W - 2 * margin;
  const availH = VB_H - 2 * margin;
  const scale = Math.min(availW / Math.max(W, 1), availH / Math.max(H, 1), 1.4);

  const offsetX = (VB_W - W * scale) / 2;
  const offsetY = (VB_H - H * scale) / 2;
  const sx = (mm) => offsetX + mm * scale;
  const sy = (mm) => offsetY + mm * scale;

  const centerX = W / 2;
  const elements = [];
  const bolts = [];
  const dims = [];

  // ---- shared row-drawing (both views place 2 columns straddling the web) ----
  const drawRows = (numRows, yStart, xLeft, xRight) => {
    let yPos = yStart;
    for (let row = 0; row < numRows; row += 1) {
      bolts.push(
        <circle key={`bl-${row}`} cx={sx(xLeft)} cy={sy(yPos)} r={(holeDia / 2) * scale} fill="none" stroke={boltColor} strokeWidth="1.5" />,
        <circle key={`br-${row}`} cx={sx(xRight)} cy={sy(yPos)} r={(holeDia / 2) * scale} fill="none" stroke={boltColor} strokeWidth="1.5" />
      );
      yPos += pitchList[row % 4];
    }
    return yPos;
  };

  if (view === 'web') {
    const xLeft = centerX - webThickness / 2 - endDist;
    const xRight = centerX + webThickness / 2 + endDist;

    // Plate outline
    elements.push(<rect key="plate" x={sx(0)} y={sy(0)} width={W * scale} height={H * scale} fill="none" stroke={plateColor} strokeWidth="1.5" />);

    // Flange/web profile lines (orange), top and bottom
    const profile = [
      [0, 0, W, 0],
      [0, flangeThickness, centerX - webThickness / 2, flangeThickness],
      [centerX + webThickness / 2, flangeThickness, W, flangeThickness],
      [0, 0, 0, flangeThickness],
      [W, 0, W, flangeThickness],
      [0, H, W, H],
      [0, H - flangeThickness, centerX - webThickness / 2, H - flangeThickness],
      [centerX + webThickness / 2, H - flangeThickness, W, H - flangeThickness],
      [0, H - flangeThickness, 0, H],
      [W, H - flangeThickness, W, H],
      [centerX - webThickness / 2, flangeThickness, centerX - webThickness / 2, H - flangeThickness],
      [centerX + webThickness / 2, flangeThickness, centerX + webThickness / 2, H - flangeThickness],
    ];
    profile.forEach(([x1, y1, x2, y2], i) => {
      elements.push(<line key={`p-${i}`} x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke={lineColor} strokeWidth="1.5" />);
    });

    const numRows = Math.max(1, Math.round(numBoltsWeb));
    drawRows(numRows, flangeThickness + endDist, xLeft, xRight);

    // Overall dims
    dims.push(<HorizDim key="dW" x1={sx(0)} y={sy(0) - 24} x2={sx(W)} label={`${Math.round(W)} mm`} />);
    dims.push(<VertDim key="dH" x={sx(W) + 24} y1={sy(0)} y2={sy(H)} label={`${Math.round(H)} mm`} side="right" />);
    dims.push(<HorizDim key="dEnd" x1={sx(centerX + webThickness / 2)} y={sy(H) + 20} x2={sx(centerX + webThickness / 2 + endDist)} label={`${Math.round(endDist)}`} />);

    // Left-side pitch dimension chain (end distance + each real gap, stopping at a zero pitch)
    let yCur = flangeThickness + endDist;
    dims.push(<VertDim key="dEndV" x={sx(0) - 22} y1={sy(yCur - endDist)} y2={sy(yCur)} label={`${Math.round(endDist)}`} />);
    for (let i = 0; i < 4; i += 1) {
      const p = pitchList[i];
      if (!p) break;
      const yNext = yCur + p;
      dims.push(<VertDim key={`dP-${i}`} x={sx(0) - 22} y1={sy(yCur)} y2={sy(yNext)} label={`${Math.round(p)}`} />);
      yCur = yNext;
    }
  } else {
    // Flange view
    const stiffLen = stiffenerWidth;
    const stiffThick = stiffenerThickness;
    const totalBolts = nbfTotal / 2;

    elements.push(<rect key="plate" x={sx(0)} y={sy(0)} width={W * scale} height={H * scale} fill="none" stroke={plateColor} strokeWidth="1.5" />);

    if (stiffLen > 0) {
      elements.push(
        <rect
          key="stiffener"
          x={sx(centerX - stiffThick / 2)}
          y={sy(0)}
          width={Math.max(stiffThick * scale, 2)}
          height={stiffLen * scale}
          fill={stiffenerColor}
        />
      );
    }

    const profile = [
      [0, stiffLen, W, stiffLen],
      [0, stiffLen + flangeThickness, centerX - webThickness / 2, stiffLen + flangeThickness],
      [centerX + webThickness / 2, stiffLen + flangeThickness, W, stiffLen + flangeThickness],
      [0, stiffLen, 0, stiffLen + flangeThickness],
      [W, stiffLen, W, stiffLen + flangeThickness],
      [centerX - webThickness / 2, stiffLen + flangeThickness, centerX - webThickness / 2, H],
      [centerX + webThickness / 2, stiffLen + flangeThickness, centerX + webThickness / 2, H],
    ];
    profile.forEach(([x1, y1, x2, y2], i) => {
      elements.push(<line key={`fp-${i}`} x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke={lineColor} strokeWidth="1.5" />);
    });

    if (stiffLen > 0 && totalBolts > 2) {
      const leftX = centerX - webThickness / 2 - endDist;
      const rightX = centerX + webThickness / 2 + endDist;
      bolts.push(
        <circle key="bl-extra" cx={sx(leftX)} cy={sy(endDist)} r={(holeDia / 2) * scale} fill="none" stroke={boltColor} strokeWidth="1.5" />,
        <circle key="br-extra" cx={sx(rightX)} cy={sy(endDist)} r={(holeDia / 2) * scale} fill="none" stroke={boltColor} strokeWidth="1.5" />
      );
    }

    const xLeft = centerX - webThickness / 2 - endDist;
    const xRight = centerX + webThickness / 2 + endDist;
    const numRowsFlange = Math.max(1, Math.floor((numBoltsWeb * 2) / 4));
    drawRows(numRowsFlange, flangeThickness + endDist + stiffLen, xLeft, xRight);

    dims.push(<HorizDim key="dW" x1={sx(0)} y={sy(0) - 24} x2={sx(W)} label={`${Math.round(W)} mm`} />);
    dims.push(<VertDim key="dH" x={sx(W) + 24} y1={sy(0)} y2={sy(H)} label={`${Math.round(H)} mm`} side="right" />);
    dims.push(<HorizDim key="dEnd" x1={sx(centerX + webThickness / 2)} y={sy(H) + 20} x2={sx(centerX + webThickness / 2 + endDist)} label={`${Math.round(endDist)}`} />);

    let yCur = stiffLen > 0 ? endDist : flangeThickness + endDist;
    dims.push(<VertDim key="dEndV" x={sx(0) - 22} y1={sy(yCur - endDist)} y2={sy(yCur)} label={`${Math.round(endDist)}`} />);
    for (let i = 0; i < 4; i += 1) {
      const p = pitchList[i];
      if (!p) break;
      const yNext = yCur + p;
      dims.push(<VertDim key={`dP-${i}`} x={sx(0) - 22} y1={sy(yCur)} y2={sy(yNext)} label={`${Math.round(p)}`} />);
      yCur = yNext;
    }
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ maxHeight: 400 }} xmlns="http://www.w3.org/2000/svg">
      {elements}
      {bolts}
      {dims}
    </svg>
  );
};

export default ColumnEndPlateBoltDiagram;
