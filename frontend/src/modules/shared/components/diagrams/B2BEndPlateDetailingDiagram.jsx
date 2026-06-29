/* eslint-disable react/prop-types */

const B2BEndPlateDetailingDiagram = ({
  plateHeight = 400,
  plateThickness = 12,
  beamDepth = 300,
  beamFlangeThick = 14,
  stiffenerHeight = 60,
  stiffenerThickness = 10,
  endplateType = 'Flushed - Reversible Moment (Symmetric)',
}) => {
  const W = 520;
  const H = 420;
  const margin = 60;

  const isFlushed = String(endplateType).startsWith('Flushed');
  const isOneWay  = String(endplateType).startsWith('Extended One');

  const availH = H - 2 * margin;
  const scale  = Math.min(availH / plateHeight, 1.0);

  const pH  = plateHeight * scale;
  const pT  = Math.max(plateThickness * scale, 4);
  const bD  = beamDepth * scale;
  const bfT = beamFlangeThick * scale;
  const sH  = stiffenerHeight * scale;
  const sT  = Math.max(stiffenerThickness * scale, 4);

  const cx     = W / 2;
  const startX = cx - pT;
  const startY = (H - pH) / 2;

  const beamDisplayWidth  = Math.min(bD * 0.45, 120);
  const beamY             = isFlushed ? startY + 12.5 * scale : startY + sH;
  const beamHeight        = isFlushed
    ? pH - 2 * 12.5 * scale
    : (isOneWay ? pH - sH - 12.5 * scale : pH - 2 * sH);

  const flangeTopY    = beamY + bfT;
  const flangeBottomY = beamY + beamHeight - bfT;

  const rightPlateRightEdge = startX + 2 * pT;
  const leftBeamLeftEdge    = startX - beamDisplayWidth;
  const rightBeamRightEdge  = rightPlateRightEdge + beamDisplayWidth;
  const halfST = sT / 2;

  const plateColor    = '#3b82f6';
  const beamColor     = '#f97316';
  const stiffenerColor = '#ef4444';
  const dimColor      = '#6b7280';

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
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={dimColor} strokeWidth="1" />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={dimColor} strokeWidth="1" />
      <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fontSize="9" fill={dimColor}>{label}</text>
    </g>
  );

  const VertDim = ({ x, y1, y2, label }) => (
    <g>
      <path d={arrowPath(x, y1, x, y2, true)} stroke={dimColor} strokeWidth="1" fill="none" />
      <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} stroke={dimColor} strokeWidth="1" />
      <line x1={x - 6} y1={y2} x2={x + 6} y2={y2} stroke={dimColor} strokeWidth="1" />
      <text
        x={x - 12}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        fontSize="9"
        fill={dimColor}
        transform={`rotate(-90, ${x - 12}, ${(y1 + y2) / 2})`}
      >
        {label}
      </text>
    </g>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ maxHeight: 360 }} xmlns="http://www.w3.org/2000/svg">
      <rect x={leftBeamLeftEdge} y={beamY} width={beamDisplayWidth} height={beamHeight} fill="none" stroke={beamColor} strokeWidth="1.5" />
      <line x1={leftBeamLeftEdge} y1={flangeTopY}    x2={startX} y2={flangeTopY}    stroke={beamColor} strokeWidth="1.5" />
      <line x1={leftBeamLeftEdge} y1={flangeBottomY} x2={startX} y2={flangeBottomY} stroke={beamColor} strokeWidth="1.5" />

      <rect x={rightPlateRightEdge} y={beamY} width={beamDisplayWidth} height={beamHeight} fill="none" stroke={beamColor} strokeWidth="1.5" />
      <line x1={rightPlateRightEdge} y1={flangeTopY}    x2={rightBeamRightEdge} y2={flangeTopY}    stroke={beamColor} strokeWidth="1.5" />
      <line x1={rightPlateRightEdge} y1={flangeBottomY} x2={rightBeamRightEdge} y2={flangeBottomY} stroke={beamColor} strokeWidth="1.5" />

      {isFlushed && (
        <>
          <rect x={startX - sT}          y={startY + 12.5 * scale} width={sT} height={pH - 2 * 12.5 * scale} fill={stiffenerColor} />
          <rect x={rightPlateRightEdge}  y={startY + 12.5 * scale} width={sT} height={pH - 2 * 12.5 * scale} fill={stiffenerColor} />
        </>
      )}

      {isOneWay && (
        <>
          <rect x={startX - halfST}     y={startY}      width={halfST} height={sH}       fill={stiffenerColor} />
          <rect x={startX - sT}         y={startY + sH} width={sT}     height={pH - sH}  fill={stiffenerColor} />
          <rect x={rightPlateRightEdge} y={startY}      width={halfST} height={sH}       fill={stiffenerColor} />
          <rect x={rightPlateRightEdge} y={startY + sH} width={sT}     height={pH - sH}  fill={stiffenerColor} />
        </>
      )}

      {!isFlushed && !isOneWay && (
        <>
          <rect x={startX - halfST}     y={startY}              width={halfST} height={sH}           fill={stiffenerColor} />
          <rect x={startX - sT}         y={startY + sH}         width={sT}     height={pH - 2 * sH}  fill={stiffenerColor} />
          <rect x={startX - halfST}     y={startY + pH - sH}    width={halfST} height={sH}           fill={stiffenerColor} />
          <rect x={rightPlateRightEdge} y={startY}              width={halfST} height={sH}           fill={stiffenerColor} />
          <rect x={rightPlateRightEdge} y={startY + sH}         width={sT}     height={pH - 2 * sH}  fill={stiffenerColor} />
          <rect x={rightPlateRightEdge} y={startY + pH - sH}    width={halfST} height={sH}           fill={stiffenerColor} />
        </>
      )}

      <rect x={startX}      y={startY} width={pT} height={pH} fill="none" stroke={plateColor} strokeWidth="2" />
      <rect x={startX + pT} y={startY} width={pT} height={pH} fill="none" stroke={plateColor} strokeWidth="2" />

      <VertDim x={rightBeamRightEdge + 22} y1={startY} y2={startY + pH} label={`${Math.round(plateHeight)} mm`} />
      <HorizDim x1={startX} y={startY + pH + 18} x2={startX + pT} label={`${Math.round(plateThickness)}`} />

      {!isFlushed && sH > 8 && (
        <VertDim x={rightPlateRightEdge + sT + 18} y1={startY} y2={startY + sH} label={`${Math.round(stiffenerHeight)} mm`} />
      )}

      <text x={startX + pT / 2}                            y={startY - 8} textAnchor="middle" fontSize="9" fill={plateColor} fontWeight="bold">End Plates</text>
      <text x={(leftBeamLeftEdge + startX) / 2}            y={beamY - 6}  textAnchor="middle" fontSize="8" fill={beamColor}>Beam</text>
      <text x={(rightPlateRightEdge + rightBeamRightEdge) / 2} y={beamY - 6}  textAnchor="middle" fontSize="8" fill={beamColor}>Beam</text>
    </svg>
  );
};

export default B2BEndPlateDetailingDiagram;
