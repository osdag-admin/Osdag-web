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
  gaugeOcf,
  noIcfBolts,
  diaIcfBolt,
  edgeIcf,
  endIcf,
  stiffAlongLength,
  stiffAlongThickness,
  stiffAcrossLength,
  stiffAcrossThickness,
  stiffFlangeLength,
  stiffFlangeThickness,
  stiffDThickness,
  stiffBThickness,
  stiffODThickness,
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

    // Desktop (base_plate.py) overrides column_len from the along-web
    // stiffener span when that stiffener exists, instead of using the raw
    // column depth - this feeds both the drawing AND the OCF bolt edge formula.
    const alongLenNum = Number(stiffAlongLength);
    const hasAlongStiff = Number.isFinite(alongLenNum) && alongLenNum > 0;
    const colLenEff = hasAlongStiff ? pL - 2 * colTf - 2 * alongLenNum : colD;

    const acrossLenNum = Number(stiffAcrossLength);
    const hasAcrossStiff = Number.isFinite(acrossLenNum) && acrossLenNum > 0;
    const acrossThickNum = Number(stiffAcrossThickness);

    const flangeLenNum = Number(stiffFlangeLength);
    const hasFlangeStiff = Number.isFinite(flangeLenNum) && flangeLenNum > 0;

    return {
      pL,
      pW,
      colD,
      colB,
      colTf,
      colTw,
      colType,
      colLenEff,
      hasAlongStiff,
      alongThickNum: Number(stiffAlongThickness),
      hasAcrossStiff,
      acrossLenNum,
      acrossThickNum,
      hasFlangeStiff,
      flangeLenNum,
      flangeThickNum: Number(stiffFlangeThickness),
    };
  }, [
    plateLength, plateWidth, columnDepth, columnWidth, columnTf, columnTw, memberDesignation,
    stiffAlongLength, stiffAlongThickness, stiffAcrossLength, stiffAcrossThickness,
    stiffFlangeLength, stiffFlangeThickness,
  ]);

  // Hollow (SHS/RHS/CHS) stiffener thickness - desktop's base_plate_hollow.py
  // reuses stiff_OD_thickness for the "B" (left/right) stiffeners on CHS
  // columns too (the SHS/RHS-only reassignment to stiff_B_thickness never
  // triggers for CHS), so replicate that exact quirk rather than a separate value.
  const isCHS = params.colType === "CHS";
  const dThick = isCHS ? toNumber(stiffODThickness) : toNumber(stiffDThickness);
  const bThick = isCHS ? toNumber(stiffODThickness) : toNumber(stiffBThickness);

  if (params.error) {
    return (
      <div className={`flex min-h-[280px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 ${className}`}>
        Dimensions Unavailable
      </div>
    );
  }

  // Scaling - plate drawn in its own local (0,0)-(pL,pW) coordinate system,
  // matching desktop's createDrawing() coordinate space exactly (no pedestal
  // box - desktop's base_plate.py / base_plate_hollow.py never draw one).
  const usableWidth = VIEWBOX_WIDTH - 2 * MARGIN;
  const usableHeight = VIEWBOX_HEIGHT - 2 * MARGIN;
  const scale = Math.min(usableWidth / params.pL, usableHeight / params.pW, 1.4);
  const offsetX = (VIEWBOX_WIDTH - params.pL * scale) / 2;
  const offsetY = (VIEWBOX_HEIGHT - params.pW * scale) / 2;
  const sx = (mm) => offsetX + mm * scale;
  const sy = (mm) => offsetY + mm * scale;

  const centerX = params.pL / 2;
  const centerY = params.pW / 2;

  // ---- OCF (outside column flange) anchor bolts ----
  // I-Section: desktop (base_plate.py) recomputes its own "effective edge"
  // from geometry rather than using the raw Detailing.EdgeDistanceOut value,
  // and steps bolts inward by `gauge` per extra column, mirrored from both
  // plate ends - always a multiple of 4 (4 or 8 bolts), never a midpoint bolt.
  // Hollow (base_plate_hollow.py): always exactly 4 bolts, plain corners.
  const getOcfBolts = () => {
    const nBolts = Math.round(toNumber(noOcfBolts));
    const end = toNumber(endOcf);
    if (nBolts <= 0 || end <= 0) return [];

    if (params.colType !== "I-Section") {
      const edge = toNumber(edgeOcf);
      if (edge <= 0) return [];
      return [
        { x: edge, y: end },
        { x: params.pL - edge, y: end },
        { x: edge, y: params.pW - end },
        { x: params.pL - edge, y: params.pW - end },
      ];
    }

    const cols = Math.floor(nBolts / 4);
    if (cols <= 0) return [];
    const gauge = toNumber(gaugeOcf);
    const edge = cols === 1
      ? (params.pL - params.colLenEff - 2 * params.colTf) / 4
      : ((params.pL - params.colLenEff) / 2 - params.colTf - gauge) / 2;
    if (!Number.isFinite(edge)) return [];

    const positions = [];
    for (let col = 0; col < cols; col += 1) {
      const x = edge + col * gauge;
      positions.push({ x, y: end });
      positions.push({ x, y: params.pW - end });
    }
    for (let col = 0; col < cols; col += 1) {
      const x = params.pL - edge - col * gauge;
      positions.push({ x, y: end });
      positions.push({ x, y: params.pW - end });
    }
    return positions;
  };

  // ---- ICF (inside column flange / uplift) anchor bolts ----
  // I-Section only - desktop never draws these for hollow sections.
  const getIcfBolts = () => {
    if (params.colType !== "I-Section") return [];
    const nBolts = Math.round(toNumber(noIcfBolts));
    if (nBolts === 0) return [];
    const edge = toNumber(edgeIcf);
    const end = toNumber(endIcf);
    const webThickness = params.colTw;

    if (nBolts === 4 && params.hasAcrossStiff) {
      const xMidLeft = centerX - params.acrossThickNum / 2;
      const xMidRight = centerX + params.acrossThickNum / 2;
      const yMidTop = centerY - webThickness / 2;
      const yMidBot = centerY + webThickness / 2;
      return [
        { x: xMidLeft - edge, y: yMidTop - end },
        { x: xMidLeft - edge, y: yMidBot + end },
        { x: xMidRight + edge, y: yMidTop - end },
        { x: xMidRight + edge, y: yMidBot + end },
      ];
    }
    if (nBolts === 2 && !params.hasAcrossStiff) {
      return [
        { x: centerX, y: centerY - end },
        { x: centerX, y: centerY + end },
      ];
    }
    return [];
  };

  const ocfBolts = getOcfBolts();
  const icfBolts = getIcfBolts();

  // Render anchor bolt graphic
  const renderAnchor = (x, y, dia, key) => {
    const r = Math.max(3, (toNumber(dia, 20) / 2) * scale);
    const cx = sx(x);
    const cy = sy(y);
    return (
      <g key={key}>
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={r} fill="#dc2626" stroke="#000" strokeWidth="1.5" />
        <line x1={cx - r - 2} y1={cy} x2={cx + r + 2} y2={cy} stroke="#000" strokeWidth="1" />
        <line x1={cx} y1={cy - r - 2} x2={cx} y2={cy + r + 2} stroke="#000" strokeWidth="1" />
      </g>
    );
  };

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

      {/* Base Plate */}
      <rect x={sx(0)} y={sy(0)} width={params.pL * scale} height={params.pW * scale} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />

      {/* Column Shape - SHS/RHS/CHS, matching base_plate_hollow.py exactly:
          desktop draws SHS and RHS identically (col_len=colD horizontal,
          col_width=colB vertical, wall thickness = column_tf, NOT
          column_tw), and CHS as an ellipse with the same bounding box. */}
      {(params.colType === "SHS" || params.colType === "RHS") && params.colD > 0 && params.colB > 0 && (
        <g>
          <rect x={sx(centerX - params.colD / 2)} y={sy(centerY - params.colB / 2)} width={params.colD * scale} height={params.colB * scale} fill="#475569" stroke="#000" strokeWidth="2" />
          {params.colTf > 0 && (
            <rect x={sx(centerX - params.colD / 2 + params.colTf)} y={sy(centerY - params.colB / 2 + params.colTf)} width={Math.max((params.colD - 2 * params.colTf) * scale, 0)} height={Math.max((params.colB - 2 * params.colTf) * scale, 0)} fill="#f1f5f9" stroke="#000" strokeWidth="1" />
          )}
        </g>
      )}

      {params.colType === "CHS" && params.colD > 0 && params.colB > 0 && (
        <g>
          <ellipse cx={sx(centerX)} cy={sy(centerY)} rx={(params.colD / 2) * scale} ry={(params.colB / 2) * scale} fill="#475569" stroke="#000" strokeWidth="2" />
          {params.colTf > 0 && (
            <ellipse cx={sx(centerX)} cy={sy(centerY)} rx={Math.max((params.colD / 2 - params.colTf) * scale, 0)} ry={Math.max((params.colB / 2 - params.colTf) * scale, 0)} fill="#f1f5f9" stroke="#000" strokeWidth="1" />
          )}
        </g>
      )}

      {/* Hollow-section stiffeners: D/OD group top+bottom (vertical bands,
          height = distance from plate edge to column), B group left+right
          (horizontal bands, length = distance from plate edge to column). */}
      {(params.colType === "SHS" || params.colType === "RHS" || params.colType === "CHS") && dThick > 0 && (
        <g fill="#dc2626" opacity="0.75" stroke="#1d4ed8" strokeWidth="1.5">
          {(() => {
            const stiffX = centerX - dThick / 2;
            const stiffHeight = centerY - params.colB / 2;
            return (
              <>
                <rect x={sx(stiffX)} y={sy(0)} width={dThick * scale} height={Math.max(stiffHeight * scale, 0)} />
                <rect x={sx(stiffX)} y={sy(centerY + params.colB / 2)} width={dThick * scale} height={Math.max(stiffHeight * scale, 0)} />
              </>
            );
          })()}
        </g>
      )}
      {(params.colType === "SHS" || params.colType === "RHS" || params.colType === "CHS") && bThick > 0 && (
        <g fill="#dc2626" opacity="0.75" stroke="#1d4ed8" strokeWidth="1.5">
          {(() => {
            const stiffY = centerY - bThick / 2;
            const stiffLength = centerX - params.colD / 2;
            return (
              <>
                <rect x={sx(0)} y={sy(stiffY)} width={Math.max(stiffLength * scale, 0)} height={bThick * scale} />
                <rect x={sx(centerX + params.colD / 2)} y={sy(stiffY)} width={Math.max(stiffLength * scale, 0)} height={bThick * scale} />
              </>
            );
          })()}
        </g>
      )}

      {/* I-Section - plan view matching desktop's base_plate.py exactly:
          web is a thin horizontal band spanning colLenEff (the column's
          depth, oriented along the plate's length), flanges are vertical
          end-caps spanning colB (flange width) at each end of the web. */}
      {params.colType === "I-Section" && params.colLenEff > 0 && params.colB > 0 && (
        <g fill="#475569" stroke="#000">
          <rect
            x={sx(centerX - params.colLenEff / 2)}
            y={sy(centerY - params.colTw / 2)}
            width={params.colLenEff * scale}
            height={params.colTw * scale}
            strokeWidth="1"
          />
          <rect
            x={sx(centerX - params.colLenEff / 2 - params.colTf)}
            y={sy(centerY - params.colB / 2)}
            width={params.colTf * scale}
            height={params.colB * scale}
            strokeWidth="1.5"
          />
          <rect
            x={sx(centerX + params.colLenEff / 2)}
            y={sy(centerY - params.colB / 2)}
            width={params.colTf * scale}
            height={params.colB * scale}
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Stiffeners (I-Section only) */}
      {params.colType === "I-Section" && params.hasFlangeStiff && (
        <g fill="#dc2626" opacity="0.75" stroke="#1d4ed8" strokeWidth="1.5">
          {(() => {
            const stiffThk = params.flangeThickNum;
            const offset = (stiffThk - params.colTf) / 2;
            const topY = centerY - params.colB / 2;
            const botY = centerY + params.colB / 2;
            const leftFlangeOuterX = centerX - params.colLenEff / 2 - params.colTf;
            const rightFlangeOuterX = centerX + params.colLenEff / 2 + params.colTf;
            return (
              <>
                <rect x={sx(leftFlangeOuterX - offset)} y={sy(0)} width={stiffThk * scale} height={topY * scale} />
                <rect x={sx(leftFlangeOuterX - offset)} y={sy(botY)} width={stiffThk * scale} height={(params.pW - botY) * scale} />
                <rect x={sx(rightFlangeOuterX - stiffThk - offset)} y={sy(0)} width={stiffThk * scale} height={topY * scale} />
                <rect x={sx(rightFlangeOuterX - stiffThk - offset)} y={sy(botY)} width={stiffThk * scale} height={(params.pW - botY) * scale} />
              </>
            );
          })()}
        </g>
      )}
      {params.colType === "I-Section" && params.hasAlongStiff && (
        <g fill="#dc2626" opacity="0.75" stroke="#1d4ed8" strokeWidth="1.5">
          {(() => {
            const webCenterLeft = centerX - params.colLenEff / 2 - params.colTf;
            const webCenterRight = centerX + params.colLenEff / 2 + params.colTf;
            const offset = (params.colTw - params.alongThickNum) / 2;
            const yTop = centerY - params.alongThickNum / 2 + offset;
            return (
              <>
                <rect x={sx(0)} y={sy(yTop)} width={webCenterLeft * scale} height={params.alongThickNum * scale} />
                <rect x={sx(webCenterRight)} y={sy(yTop)} width={(params.pL - webCenterRight) * scale} height={params.alongThickNum * scale} />
              </>
            );
          })()}
        </g>
      )}
      {params.colType === "I-Section" && params.hasAcrossStiff && (
        <g fill="#dc2626" opacity="0.75" stroke="#1d4ed8" strokeWidth="1.5">
          {(() => {
            const xLeft = centerX - params.acrossThickNum / 2;
            return (
              <>
                <rect x={sx(xLeft)} y={sy(centerY - params.acrossLenNum - params.colTw / 2)} width={params.acrossThickNum * scale} height={params.acrossLenNum * scale} />
                <rect x={sx(xLeft)} y={sy(centerY + params.colTw / 2)} width={params.acrossThickNum * scale} height={params.acrossLenNum * scale} />
              </>
            );
          })()}
        </g>
      )}

      {/* Anchor Bolts */}
      {ocfBolts.map((b, i) => renderAnchor(b.x, b.y, diaOcfBolt, `ocf-${i}`))}
      {icfBolts.map((b, i) => renderAnchor(b.x, b.y, diaIcfBolt, `icf-${i}`))}

      {/* Dimensions & Labels */}
      <line x1={sx(0)} y1={sy(params.pW) + 30} x2={sx(params.pL)} y2={sy(params.pW) + 30} stroke="#000" strokeWidth="1" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
      <line x1={sx(0)} y1={sy(params.pW) + 5} x2={sx(0)} y2={sy(params.pW) + 35} stroke="#000" strokeWidth="0.8" />
      <line x1={sx(params.pL)} y1={sy(params.pW) + 5} x2={sx(params.pL)} y2={sy(params.pW) + 35} stroke="#000" strokeWidth="0.8" />
      <DimensionText x={sx(params.pL / 2)} y={sy(params.pW) + 44} text={`${params.pL.toFixed(0)} mm`} />

      <line x1={sx(0) - 30} y1={sy(0)} x2={sx(0) - 30} y2={sy(params.pW)} stroke="#000" strokeWidth="1" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
      <line x1={sx(0) - 35} y1={sy(0)} x2={sx(0) + 5} y2={sy(0)} stroke="#000" strokeWidth="0.8" />
      <line x1={sx(0) - 35} y1={sy(params.pW)} x2={sx(0) + 5} y2={sy(params.pW)} stroke="#000" strokeWidth="0.8" />
      <DimensionText x={sx(0) - 38} y={sy(params.pW / 2) + 4} text={`${params.pW.toFixed(0)} mm`} anchor="end" />

      {/* Outside Anchor Spacing Labels (edge measured from bolt to nearest plate edge, matching desktop) */}
      {ocfBolts.length > 0 && (() => {
        const firstX = ocfBolts[0].x;
        const firstY = ocfBolts[0].y;
        return (
          <g>
            <line x1={sx(params.pL) + 15} y1={sy(0)} x2={sx(params.pL) + 15} y2={sy(firstY)} stroke="#000" strokeWidth="0.8" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
            <line x1={sx(params.pL) + 10} y1={sy(firstY)} x2={sx(params.pL) + 20} y2={sy(firstY)} stroke="#000" strokeWidth="0.8" />
            <DimensionText x={sx(params.pL) + 24} y={sy(firstY / 2) + 4} text={`${toNumber(endOcf).toFixed(0)}`} anchor="start" />

            <line x1={sx(0)} y1={sy(0) - 15} x2={sx(firstX)} y2={sy(0) - 15} stroke="#000" strokeWidth="0.8" markerStart="url(#baseplate-arrow-start)" markerEnd="url(#baseplate-arrow-end)" />
            <line x1={sx(firstX)} y1={sy(0) - 20} x2={sx(firstX)} y2={sy(0) - 10} stroke="#000" strokeWidth="0.8" />
            <DimensionText x={sx(firstX / 2)} y={sy(0) - 22} text={`${firstX.toFixed(0)}`} />
          </g>
        );
      })()}

      <text x={sx(0) + 10} y={sy(0) + 18} fontSize="11" fill="#334155" fontFamily="Arial, sans-serif" fontWeight="bold">
        Base Plate: {params.pL.toFixed(0)}x{params.pW.toFixed(0)}x{toNumber(plateThickness).toFixed(0)} mm
      </text>
    </svg>
  );
};

export default BasePlateSketch;
