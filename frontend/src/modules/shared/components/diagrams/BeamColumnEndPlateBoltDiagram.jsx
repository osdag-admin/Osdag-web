/* eslint-disable react/prop-types */

const dimColor = '#6b7280';
const lineColor = '#f97316';
const boltColor = '#2563eb';
const midBoltColor = '#dc2626';
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

// Desktop's bolt-column stepper is hardcoded for exactly 4 columns
// (2 gauge segments flanking a single cross-gauge segment); columns
// beyond index 2 do not advance x further.
const colX = (col, edge, gauge, crossGauge) => {
  let x = edge;
  for (let c = 0; c <= col; c += 1) {
    if (c === 0) continue;
    if (c === 1 || c === 3) x += gauge;
    else if (c === 2) x += crossGauge;
  }
  return x;
};

const BeamColumnEndPlateBoltDiagram = ({
  endplateType = 'Flushed - Reversible Moment',
  plateWidth = 300,
  plateHeight = 500,
  webThickness = 8,
  flangeThickness = 12,
  stiffenerLength = 0,
  stiffenerThickness = 0,
  rows = 4,
  cols = 2,
  pitch = 60,
  gauge = 90,
  crossGauge = 140,
  end = 40,
  edge: edgeProp = 40,
  holeDia = 22,
  middleBolts = 0,
}) => {
  const VB_W = 620;
  const VB_H = 500;
  const margin = 110;

  const isFlushed = String(endplateType).startsWith('Flushed');
  const isOneWay = String(endplateType).startsWith('Extended One');

  const W = plateWidth;
  const H = plateHeight;

  const availW = VB_W - 2 * margin;
  const availH = VB_H - 2 * margin;
  const scale = Math.min(availW / Math.max(W, 1), availH / Math.max(H, 1), 1.3);

  const offsetX = (VB_W - W * scale) / 2;
  const offsetY = (VB_H - H * scale) / 2;
  const sx = (mm) => offsetX + mm * scale;
  const sy = (mm) => offsetY + mm * scale;

  const centerX = W / 2;
  const numCols = Math.max(1, Math.round(cols));
  const numRows = Math.max(1, Math.round(rows));
  const gaugeVal = Number.isFinite(gauge) && gauge > 0 ? gauge : crossGauge;
  const hasMiddleBolt = Math.round(middleBolts) === 1;

  // Bolt-group horizontal centering (mirrors desktop's total_span/edge adjustment).
  const extraPerSide = Math.max(0, Math.floor((numCols - 2) / 2));
  const totalSpan = 2 * edgeProp + crossGauge + extraPerSide * 2 * gaugeVal;
  const edge = totalSpan <= W ? edgeProp + (W - totalSpan) / 2 : edgeProp;

  const elements = [];
  const bolts = [];
  const dims = [];

  const drawBoltRow = (y, key, color = boltColor) => {
    for (let c = 0; c < numCols; c += 1) {
      const x = colX(c, edge, gaugeVal, crossGauge);
      bolts.push(
        <circle key={`${key}-${c}`} cx={sx(x)} cy={sy(y)} r={(holeDia / 2) * scale} fill="none" stroke={color} strokeWidth="1.5" />
      );
    }
  };

  const drawStiffener = (yTop, height, key) => {
    if (height <= 0) return;
    const halfT = stiffenerThickness / 2;
    elements.push(
      <rect key={`${key}-c`} x={sx(centerX - halfT)} y={sy(yTop)} width={Math.max(stiffenerThickness * scale, 2)} height={height * scale} fill={stiffenerColor} />,
      <rect key={`${key}-l`} x={sx(centerX - webThickness / 2 - halfT)} y={sy(yTop)} width={Math.max(halfT * scale, 2)} height={height * scale} fill={stiffenerColor} opacity="0.55" />,
      <rect key={`${key}-r`} x={sx(centerX + webThickness / 2)} y={sy(yTop)} width={Math.max(halfT * scale, 2)} height={height * scale} fill={stiffenerColor} opacity="0.55" />
    );
  };

  const drawFlangeProfile = (yTop, key) => {
    const yBottom = yTop + flangeThickness;
    const lines = [
      [0, yTop, W, yTop],
      [0, yBottom, centerX - webThickness / 2, yBottom],
      [centerX + webThickness / 2, yBottom, W, yBottom],
      [0, yTop, 0, yBottom],
      [W, yTop, W, yBottom],
    ];
    lines.forEach(([x1, y1, x2, y2], i) => {
      elements.push(<line key={`${key}-${i}`} x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke={lineColor} strokeWidth="1.5" />);
    });
    return yBottom;
  };

  const drawWebLines = (yTop, yBottom, key) => {
    elements.push(
      <line key={`${key}-l`} x1={sx(centerX - webThickness / 2)} y1={sy(yTop)} x2={sx(centerX - webThickness / 2)} y2={sy(yBottom)} stroke={lineColor} strokeWidth="1.5" />,
      <line key={`${key}-r`} x1={sx(centerX + webThickness / 2)} y1={sy(yTop)} x2={sx(centerX + webThickness / 2)} y2={sy(yBottom)} stroke={lineColor} strokeWidth="1.5" />
    );
  };

  // Plate outline (shared by all 3 modes).
  elements.unshift(<rect key="plate" x={sx(0)} y={sy(0)} width={W * scale} height={H * scale} fill="none" stroke={plateColor} strokeWidth="1.5" />);

  // Horizontal edge/gauge/crossGauge dimension chain, placed either above or below the plate.
  const drawHorizChain = (y) => {
    let xCur = 0;
    dims.push(<HorizDim key="hEdge0" x1={sx(xCur)} y={sy(y)} x2={sx(edge)} label={`${Math.round(edge)}`} />);
    xCur = edge;
    for (let c = 1; c < numCols; c += 1) {
      const xNext = colX(c, edge, gaugeVal, crossGauge);
      const label = c === 2 ? `${Math.round(crossGauge)}` : `${Math.round(gaugeVal)}`;
      dims.push(<HorizDim key={`hSeg${c}`} x1={sx(xCur)} y={sy(y)} x2={sx(xNext)} label={label} />);
      xCur = xNext;
    }
    dims.push(<HorizDim key="hEdge1" x1={sx(xCur)} y={sy(y)} x2={sx(W)} label={`${Math.round(edge)}`} />);
  };

  const boltRowKeys = [];
  let rowIdx = 0;

  if (isFlushed) {
    const hGap = 12.5;
    const vGap = 12.5;

    drawWebLines(vGap + flangeThickness, H - vGap - flangeThickness, 'web');
    drawFlangeProfile(vGap, 'ftop');
    const bottomFlangeTop = H - vGap - flangeThickness;
    drawFlangeProfile(bottomFlangeTop, 'fbot');
    elements.push(
      <line key="fl-l" x1={sx(hGap)} y1={sy(vGap)} x2={sx(hGap)} y2={sy(vGap + flangeThickness)} stroke={lineColor} strokeWidth="1.5" />,
      <line key="fl-r" x1={sx(W - hGap)} y1={sy(vGap)} x2={sx(W - hGap)} y2={sy(vGap + flangeThickness)} stroke={lineColor} strokeWidth="1.5" />,
      <line key="fl-bl" x1={sx(hGap)} y1={sy(H - vGap - flangeThickness)} x2={sx(hGap)} y2={sy(H - vGap)} stroke={lineColor} strokeWidth="1.5" />,
      <line key="fl-br" x1={sx(W - hGap)} y1={sy(H - vGap - flangeThickness)} x2={sx(W - hGap)} y2={sy(H - vGap)} stroke={lineColor} strokeWidth="1.5" />
    );

    const rowsTop = Math.floor(numRows / 2);
    const rowsBottom = numRows - rowsTop;
    const yStartTop = vGap + flangeThickness + end;
    for (let r = 0; r < rowsTop; r += 1) {
      const y = yStartTop + r * pitch;
      drawBoltRow(y, `bt-${rowIdx}`);
      boltRowKeys.push({ y, side: 'top' });
      rowIdx += 1;
    }
    const yStartBottom = H - (vGap + flangeThickness + end);
    for (let r = 0; r < rowsBottom; r += 1) {
      const y = yStartBottom - r * pitch;
      drawBoltRow(y, `bb-${rowIdx}`);
      boltRowKeys.push({ y, side: 'bottom' });
      rowIdx += 1;
    }

    drawHorizChain(-16);
    dims.push(<HorizDim key="hW" x1={sx(0)} y={sy(H) + 20} x2={sx(W)} label={`${Math.round(W)} mm`} />);

    // Left vertical chain: flange thickness + end + (rowsTop-1) pitch, top half.
    let yCur = vGap;
    dims.push(<VertDim key="vFlT" x={sx(0) - 20} y1={yCur === vGap ? sy(vGap) : sy(yCur)} y2={sy(vGap + flangeThickness)} label={`${Math.round(flangeThickness)}`} />);
    yCur = vGap + flangeThickness;
    dims.push(<VertDim key="vEndT" x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + end)} label={`${Math.round(end)}`} />);
    yCur += end;
    for (let r = 0; r < rowsTop - 1; r += 1) {
      dims.push(<VertDim key={`vPT-${r}`} x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + pitch)} label={`${Math.round(pitch)}`} />);
      yCur += pitch;
    }

    // Right vertical chain, bottom half, mirrored.
    let yCurB = H - vGap;
    dims.push(<VertDim key="vFlB" x={sx(W) + 20} y1={sy(H - vGap - flangeThickness)} y2={sy(yCurB)} label={`${Math.round(flangeThickness)}`} side="right" />);
    yCurB = H - vGap - flangeThickness;
    dims.push(<VertDim key="vEndB" x={sx(W) + 20} y1={sy(yCurB - end)} y2={sy(yCurB)} label={`${Math.round(end)}`} side="right" />);
    yCurB -= end;
    for (let r = 0; r < rowsBottom - 1; r += 1) {
      dims.push(<VertDim key={`vPB-${r}`} x={sx(W) + 20} y1={sy(yCurB - pitch)} y2={sy(yCurB)} label={`${Math.round(pitch)}`} side="right" />);
      yCurB -= pitch;
    }

    dims.push(<VertDim key="vH" x={sx(W) + 44} y1={sy(0)} y2={sy(H)} label={`${Math.round(H)} mm`} side="right" />);
  } else if (isOneWay) {
    const vGap = 12.5;
    const endPlusPitchPlusEnd = end + pitch + end;
    const effectiveStiffenerHeight = endPlusPitchPlusEnd < stiffenerLength ? endPlusPitchPlusEnd : 2 * end;
    const rowsAboveStiff = endPlusPitchPlusEnd < stiffenerLength ? 2 : 1;

    drawStiffener(0, effectiveStiffenerHeight, 'stiff');

    const topFlangeTop = effectiveStiffenerHeight;
    drawFlangeProfile(topFlangeTop, 'ftop');
    const bottomFlangeTop = H - vGap - flangeThickness;
    drawFlangeProfile(bottomFlangeTop, 'fbot');
    drawWebLines(topFlangeTop + flangeThickness, bottomFlangeTop, 'web');
    elements.push(
      <line key="fl-bl" x1={sx(vGap)} y1={sy(bottomFlangeTop)} x2={sx(vGap)} y2={sy(H - vGap)} stroke={lineColor} strokeWidth="1.5" />,
      <line key="fl-br" x1={sx(W - vGap)} y1={sy(bottomFlangeTop)} x2={sx(W - vGap)} y2={sy(H - vGap)} stroke={lineColor} strokeWidth="1.5" />
    );

    // Bottom bolt row (inside bottom flange).
    const yBottomBolt = H - vGap - end - flangeThickness;
    drawBoltRow(yBottomBolt, `bb-${rowIdx}`);
    rowIdx += 1;

    // Optional middle bolt row.
    if (hasMiddleBolt) {
      const yMidBolt = (topFlangeTop + flangeThickness + yBottomBolt) / 2;
      drawBoltRow(yMidBolt, `bm-${rowIdx}`, midBoltColor);
      rowIdx += 1;
    }

    // Top bolt row(s), above/at the stiffener.
    drawBoltRow(end, `bt-${rowIdx}`);
    rowIdx += 1;
    if (rowsAboveStiff === 2) {
      drawBoltRow(end + pitch, `bt-${rowIdx}`);
      rowIdx += 1;
    }

    const remainingRows = Math.max(0, numRows - 1 - (hasMiddleBolt ? 1 : 0) - rowsAboveStiff);
    let yRem = effectiveStiffenerHeight + flangeThickness + end;
    for (let r = 0; r < remainingRows; r += 1) {
      drawBoltRow(yRem, `br-${rowIdx}`);
      rowIdx += 1;
      yRem += pitch;
    }

    drawHorizChain(-16);
    dims.push(<HorizDim key="hW" x1={sx(0)} y={sy(H) + 20} x2={sx(W)} label={`${Math.round(W)} mm`} />);

    if (effectiveStiffenerHeight > 4) {
      dims.push(<VertDim key="vStiff" x={sx(0) - 20} y1={sy(0)} y2={sy(effectiveStiffenerHeight)} label={`${Math.round(effectiveStiffenerHeight)}`} />);
    }

    // Right-side stacked chain: end, [pitch], end, flangeThickness, end, (remainingRows-1) pitches, end.
    let yCur = 0;
    dims.push(<VertDim key="vEnd0" x={sx(W) + 20} y1={sy(yCur)} y2={sy(yCur + end)} label={`${Math.round(end)}`} side="right" />);
    yCur += end;
    if (rowsAboveStiff === 2) {
      dims.push(<VertDim key="vPitch0" x={sx(W) + 20} y1={sy(yCur)} y2={sy(yCur + pitch)} label={`${Math.round(pitch)}`} side="right" />);
      yCur += pitch;
    }
    dims.push(<VertDim key="vEnd1" x={sx(W) + 20} y1={sy(yCur)} y2={sy(effectiveStiffenerHeight)} label={`${Math.round(effectiveStiffenerHeight - yCur)}`} side="right" />);
    yCur = effectiveStiffenerHeight;
    dims.push(<VertDim key="vFlange" x={sx(W) + 20} y1={sy(yCur)} y2={sy(yCur + flangeThickness)} label={`${Math.round(flangeThickness)}`} side="right" />);
    yCur += flangeThickness;
    dims.push(<VertDim key="vEnd2" x={sx(W) + 20} y1={sy(yCur)} y2={sy(yCur + end)} label={`${Math.round(end)}`} side="right" />);
    yCur += end;
    for (let r = 0; r < remainingRows - 1; r += 1) {
      dims.push(<VertDim key={`vPitchR-${r}`} x={sx(W) + 20} y1={sy(yCur)} y2={sy(yCur + pitch)} label={`${Math.round(pitch)}`} side="right" />);
      yCur += pitch;
    }
    dims.push(<VertDim key="vEndBottom" x={sx(W) + 20} y1={sy(yCur)} y2={sy(H)} label={`${Math.round(H - yCur)}`} side="right" />);

    dims.push(<VertDim key="vH" x={sx(W) + 68} y1={sy(0)} y2={sy(H)} label={`${Math.round(H)} mm`} side="right" />);
  } else {
    // Extended Two-Way.
    const endPlusPitchPlusEnd = end + pitch + end;
    const effectiveStiffenerHeight = endPlusPitchPlusEnd < stiffenerLength ? endPlusPitchPlusEnd : 2 * end;
    const rowsAboveStiff = endPlusPitchPlusEnd < stiffenerLength ? 2 : 1;

    drawStiffener(0, effectiveStiffenerHeight, 'stiffTop');
    drawStiffener(H - effectiveStiffenerHeight, effectiveStiffenerHeight, 'stiffBot');

    const topFlangeTop = effectiveStiffenerHeight;
    const bottomFlangeTop = H - effectiveStiffenerHeight;
    drawFlangeProfile(topFlangeTop, 'ftop');
    drawFlangeProfile(bottomFlangeTop, 'fbot');
    drawWebLines(topFlangeTop + flangeThickness, bottomFlangeTop, 'web');

    // Top bolt row(s).
    drawBoltRow(end, `bt-${rowIdx}`);
    rowIdx += 1;
    if (rowsAboveStiff === 2) {
      drawBoltRow(end + pitch, `bt-${rowIdx}`);
      rowIdx += 1;
    }
    // Bottom bolt row(s).
    drawBoltRow(H - end, `bb-${rowIdx}`);
    rowIdx += 1;
    if (rowsAboveStiff === 2) {
      drawBoltRow(H - end - pitch, `bb-${rowIdx}`);
      rowIdx += 1;
    }
    // Optional middle row.
    if (hasMiddleBolt) {
      drawBoltRow(H / 2, `bm-${rowIdx}`, midBoltColor);
      rowIdx += 1;
    }

    const remainingRows = Math.max(0, numRows - 2 * rowsAboveStiff - (hasMiddleBolt ? 1 : 0));
    const topRows = Math.ceil(remainingRows / 2);
    const bottomRows = Math.floor(remainingRows / 2);

    let lastTopY = topFlangeTop + flangeThickness + end;
    for (let r = 0; r < topRows; r += 1) {
      drawBoltRow(lastTopY, `brt-${rowIdx}`);
      rowIdx += 1;
      lastTopY += pitch;
    }
    let lastBottomY = bottomFlangeTop - end;
    for (let r = 0; r < bottomRows; r += 1) {
      drawBoltRow(lastBottomY, `brb-${rowIdx}`);
      rowIdx += 1;
      lastBottomY -= pitch;
    }

    // Horizontal chain drawn below the plate, referenced off the bottom bolt row.
    drawHorizChain(H + 20);

    if (effectiveStiffenerHeight > 4) {
      dims.push(<VertDim key="vStiffTop" x={sx(0) - 20} y1={sy(0)} y2={sy(effectiveStiffenerHeight)} label={`${Math.round(effectiveStiffenerHeight)}`} />);
    }

    // Left vertical chain: end, [pitch], end, flangeThickness, end, (topRows-1) pitches.
    let yCur = 0;
    dims.push(<VertDim key="vEnd0" x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + end)} label={`${Math.round(end)}`} />);
    yCur += end;
    if (rowsAboveStiff === 2) {
      dims.push(<VertDim key="vPitch0" x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + pitch)} label={`${Math.round(pitch)}`} />);
      yCur += pitch;
    }
    dims.push(<VertDim key="vEnd1" x={sx(0) - 20} y1={sy(yCur)} y2={sy(effectiveStiffenerHeight)} label={`${Math.round(effectiveStiffenerHeight - yCur)}`} />);
    yCur = effectiveStiffenerHeight;
    dims.push(<VertDim key="vFlange" x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + flangeThickness)} label={`${Math.round(flangeThickness)}`} />);
    yCur += flangeThickness;
    dims.push(<VertDim key="vEnd2" x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + end)} label={`${Math.round(end)}`} />);
    yCur += end;
    for (let r = 0; r < topRows - 1; r += 1) {
      dims.push(<VertDim key={`vPitchR-${r}`} x={sx(0) - 20} y1={sy(yCur)} y2={sy(yCur + pitch)} label={`${Math.round(pitch)}`} />);
      yCur += pitch;
    }

    dims.push(<VertDim key="vH" x={sx(W) + 24} y1={sy(0)} y2={sy(H)} label={`${Math.round(H)} mm`} side="right" />);
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ maxHeight: 440 }} xmlns="http://www.w3.org/2000/svg">
      {elements}
      {bolts}
      {dims}
    </svg>
  );
};

export default BeamColumnEndPlateBoltDiagram;
