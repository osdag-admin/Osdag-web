/* eslint-disable react/prop-types */
import { useMemo } from "react";

/**
 * Renders an SVG based spacing diagram similar to the desktop client.
 *
 * Expected props:
 *  - plateWidth, plateHeight (mm)
 *  - rows, cols (integers)
 *  - edge (mm) distance from origin edge to first bolt centre
 *  - end (mm) distance from reference edge to first bolt centre vertically
 *  - pitch (mm) distance between bolt rows (optional)
 *  - gauge (number or array) distance(s) between bolt columns (optional)
 *  - holeDiameter (mm)
 *  - origin ("left" | "right") indicates which plate edge the horizontal gauge begins from
 *  - weldSize (mm) optional for showing weld strip
 *
 * Any missing parameter will gracefully fallback to centred placement.
 */
const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;
const MARGIN = 70;

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};



const distributeWithGauge = (count, origin, edge, plateWidth, gaugeValues) => {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [plateWidth / 2];
  }

  const gauges = gaugeValues.length ? gaugeValues : [plateWidth / (count + 1)];
  const positions = [];

  if (origin === "right") {
    let current = plateWidth - edge;
    positions.push(current);
    for (let i = 1; i < count; i += 1) {
      const gauge = gauges[(i - 1) % gauges.length] || gauges[gauges.length - 1];
      current -= gauge;
      positions.push(current);
    }
  } else {
    let current = edge;
    positions.push(current);
    for (let i = 1; i < count; i += 1) {
      const gauge = gauges[(i - 1) % gauges.length] || gauges[gauges.length - 1];
      current += gauge;
      positions.push(current);
    }
  }

  return positions;
};

const distributeRows = (rows, end, pitch, plateHeight) => {
  if (rows <= 0) {
    return [];
  }

  if (rows === 1) {
    return [plateHeight / 2];
  }

  const positions = [];
  let current = end;
  const increment = pitch > 0 ? pitch : (plateHeight - 2 * end) / Math.max(rows - 1, 1);
  for (let i = 0; i < rows; i += 1) {
    positions.push(current);
    current += increment;
  }
  return positions;
};

const distributeSymmetric = (count, edge, pitch, totalLength) => {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [totalLength / 2];
  }

  const P = pitch > 0 ? pitch : (totalLength - 2 * edge) / Math.max(count - 1, 1);
  const positions = [];

  const mid = (count - 1) / 2;
  for (let i = 0; i < count; i += 1) {
    if (i < mid) {
      positions.push(edge + i * P);
    } else if (i === mid) {
      positions.push(totalLength / 2);
    } else {
      positions.push(totalLength - edge - (count - 1 - i) * P);
    }
  }

  return positions;
};

const DimensionText = ({ x, y, text, anchor = "middle" }) => (
  <text
    x={x}
    y={y}
    fontSize="14"
    fontWeight="500"
    textAnchor={anchor}
    fill="#000"
    fontFamily="Arial, sans-serif"
    paintOrder="stroke"
    stroke="#fff"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {text}
  </text>
);

const renderDetailedDimensions = (
  params,
  boltColsPositions,
  boltRowsPositions,
  offsetX,
  offsetY,
  scale,
  origin
) => {
  const dimColor = "#000";
  const hOffset = 35;
  const vOffset = 45;
  const extLength = 8;
  const textOffset = 16;

  const elements = [];

  // Horizontal dimensions (top of plate)
  if (boltColsPositions.length > 0) {
    const firstBoltX = boltColsPositions[0];
    const lastBoltX = boltColsPositions[boltColsPositions.length - 1];
    const dimY = offsetY - hOffset;

    // Edge distances
    const leftEdgeStart = offsetX;
    const leftEdgeEnd = offsetX + firstBoltX * scale;
    elements.push(
      <line key="h-edge-left-ext1" x1={leftEdgeStart} y1={offsetY - 5} x2={leftEdgeStart} y2={dimY + extLength} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="h-edge-left-ext2" x1={leftEdgeEnd} y1={offsetY - 5} x2={leftEdgeEnd} y2={dimY + extLength} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="h-edge-left" x1={leftEdgeStart} y1={dimY} x2={leftEdgeEnd} y2={dimY} stroke={dimColor} strokeWidth="1" markerEnd="url(#spacing-arrow-end)" markerStart="url(#spacing-arrow-start)" />
    );
    elements.push(
      <DimensionText key="h-edge-left-text" x={(leftEdgeStart + leftEdgeEnd) / 2} y={dimY - textOffset} text={`${(params.edgeDist || 0).toFixed(0)}`} />
    );

    const rightEdgeStart = offsetX + lastBoltX * scale;
    const rightEdgeEnd = offsetX + params.width * scale;
    elements.push(
      <line key="h-edge-right-ext1" x1={rightEdgeStart} y1={offsetY - 5} x2={rightEdgeStart} y2={dimY + extLength} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="h-edge-right-ext2" x1={rightEdgeEnd} y1={offsetY - 5} x2={rightEdgeEnd} y2={dimY + extLength} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="h-edge-right" x1={rightEdgeStart} y1={dimY} x2={rightEdgeEnd} y2={dimY} stroke={dimColor} strokeWidth="1" markerEnd="url(#spacing-arrow-end)" markerStart="url(#spacing-arrow-start)" />
    );
    elements.push(
      <DimensionText key="h-edge-right-text" x={(rightEdgeStart + rightEdgeEnd) / 2} y={dimY - textOffset} text={`${(params.edgeDist || 0).toFixed(0)}`} />
    );

    // Gauge distances between bolts (only if multiple columns)
    for (let i = 0; i < boltColsPositions.length - 1; i += 1) {
      const x1 = offsetX + boltColsPositions[i] * scale;
      const x2 = offsetX + boltColsPositions[i + 1] * scale;
      const gaugeValue = Math.abs(boltColsPositions[i + 1] - boltColsPositions[i]);
      
      // Extension lines
      elements.push(
        <line
          key={`h-gauge-ext1-${i}`}
          x1={x1}
          y1={offsetY - 5}
          x2={x1}
          y2={dimY + extLength}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      elements.push(
        <line
          key={`h-gauge-ext2-${i}`}
          x1={x2}
          y1={offsetY - 5}
          x2={x2}
          y2={dimY + extLength}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      
      elements.push(
        <line
          key={`h-gauge-${i}`}
          x1={x1}
          y1={dimY}
          x2={x2}
          y2={dimY}
          stroke={dimColor}
          strokeWidth="1"
          markerEnd="url(#spacing-arrow-end)"
          markerStart="url(#spacing-arrow-start)"
        />
      );
      
      elements.push(
        <DimensionText
          key={`h-gauge-text-${i}`}
          x={(x1 + x2) / 2}
          y={dimY - textOffset}
          text={`${gaugeValue.toFixed(0)}`}
        />
      );
    }

    // Overall width dimension (bottom)
    const widthDimY = offsetY + params.height * scale + hOffset;
    
    elements.push(
      <line
        key="h-width-ext1"
        x1={offsetX}
        y1={offsetY + params.height * scale + 5}
        x2={offsetX}
        y2={widthDimY - extLength}
        stroke={dimColor}
        strokeWidth="1"
      />
    );
    elements.push(
      <line
        key="h-width-ext2"
        x1={offsetX + params.width * scale}
        y1={offsetY + params.height * scale + 5}
        x2={offsetX + params.width * scale}
        y2={widthDimY - extLength}
        stroke={dimColor}
        strokeWidth="1"
      />
    );
    
    elements.push(
      <line
        key="h-width"
        x1={offsetX}
        y1={widthDimY}
        x2={offsetX + params.width * scale}
        y2={widthDimY}
        stroke={dimColor}
        strokeWidth="1"
        markerEnd="url(#spacing-arrow-end)"
        markerStart="url(#spacing-arrow-start)"
      />
    );
    
    elements.push(
      <DimensionText
        key="h-width-text"
        x={offsetX + (params.width * scale) / 2}
        y={widthDimY + textOffset + 4}
        text={`${params.width.toFixed(0)}`}
      />
    );
  }

  // Vertical dimensions (right side of plate)
  if (boltRowsPositions.length > 0) {
    const firstBoltY = boltRowsPositions[0];
    const lastBoltY = boltRowsPositions[boltRowsPositions.length - 1];
    const dimX = offsetX + params.width * scale + vOffset;

    // Top end distance
    const topY = offsetY;
    const topBoltY = offsetY + firstBoltY * scale;
    
    elements.push(
      <line key="v-end-top-ext1" x1={offsetX + params.width * scale + 5} y1={topY} x2={dimX - extLength} y2={topY} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="v-end-top-ext2" x1={offsetX + params.width * scale + 5} y1={topBoltY} x2={dimX - extLength} y2={topBoltY} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="v-end-top" x1={dimX} y1={topY} x2={dimX} y2={topBoltY} stroke={dimColor} strokeWidth="1" markerEnd="url(#spacing-arrow-end)" markerStart="url(#spacing-arrow-start)" />
    );
    elements.push(
      <DimensionText key="v-end-top-text" x={dimX + textOffset + 4} y={(topY + topBoltY) / 2 + 5} text={`${(params.endDist || 0).toFixed(0)}`} anchor="start" />
    );

    // Pitch distances between bolt rows (only if multiple rows)
    for (let i = 0; i < boltRowsPositions.length - 1; i += 1) {
      const y1 = offsetY + boltRowsPositions[i] * scale;
      const y2 = offsetY + boltRowsPositions[i + 1] * scale;
      const pitchValue = Math.abs(boltRowsPositions[i + 1] - boltRowsPositions[i]);
      
      elements.push(
        <line
          key={`v-pitch-ext1-${i}`}
          x1={offsetX + params.width * scale + 5}
          y1={y1}
          x2={dimX - extLength}
          y2={y1}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      elements.push(
        <line
          key={`v-pitch-ext2-${i}`}
          x1={offsetX + params.width * scale + 5}
          y1={y2}
          x2={dimX - extLength}
          y2={y2}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      
      elements.push(
        <line
          key={`v-pitch-${i}`}
          x1={dimX}
          y1={y1}
          x2={dimX}
          y2={y2}
          stroke={dimColor}
          strokeWidth="1"
          markerEnd="url(#spacing-arrow-end)"
          markerStart="url(#spacing-arrow-start)"
        />
      );
      
      elements.push(
        <DimensionText
          key={`v-pitch-text-${i}`}
          x={dimX + textOffset + 4}
          y={(y1 + y2) / 2 + 5}
          text={`${(pitchValue || 0).toFixed(0)}`}
          anchor="start"
        />
      );
    }

    // Bottom end distance
    const bottomBoltY = offsetY + lastBoltY * scale;
    const bottomY = offsetY + params.height * scale;
    
    elements.push(
      <line key="v-end-bottom-ext1" x1={offsetX + params.width * scale + 5} y1={bottomBoltY} x2={dimX - extLength} y2={bottomBoltY} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="v-end-bottom-ext2" x1={offsetX + params.width * scale + 5} y1={bottomY} x2={dimX - extLength} y2={bottomY} stroke={dimColor} strokeWidth="1" />
    );
    elements.push(
      <line key="v-end-bottom" x1={dimX} y1={bottomBoltY} x2={dimX} y2={bottomY} stroke={dimColor} strokeWidth="1" markerEnd="url(#spacing-arrow-end)" markerStart="url(#spacing-arrow-start)" />
    );
    elements.push(
      <DimensionText key="v-end-bottom-text" x={dimX + textOffset + 4} y={(bottomBoltY + bottomY) / 2 + 5} text={`${(params.endDist || 0).toFixed(0)}`} anchor="start" />
    );

    // Overall height dimension (left side)
    const heightDimX = offsetX - vOffset;
    
    elements.push(
      <line
        key="v-height-ext1"
        x1={offsetX - 5}
        y1={offsetY}
        x2={heightDimX + extLength}
        y2={offsetY}
        stroke={dimColor}
        strokeWidth="1"
      />
    );
    elements.push(
      <line
        key="v-height-ext2"
        x1={offsetX - 5}
        y1={offsetY + params.height * scale}
        x2={heightDimX + extLength}
        y2={offsetY + params.height * scale}
        stroke={dimColor}
        strokeWidth="1"
      />
    );
    
    elements.push(
      <line
        key="v-height"
        x1={heightDimX}
        y1={offsetY}
        x2={heightDimX}
        y2={offsetY + params.height * scale}
        stroke={dimColor}
        strokeWidth="1"
        markerEnd="url(#spacing-arrow-end)"
        markerStart="url(#spacing-arrow-start)"
      />
    );
    
    elements.push(
      <DimensionText
        key="v-height-text"
        x={heightDimX - textOffset - 4}
        y={offsetY + (params.height * scale) / 2 + 5}
        text={`${params.height.toFixed(0)}`}
        anchor="end"
      />
    );
  }

  return <>{elements}</>;
};

const SpacingDiagram = ({
  plateWidth,
  plateHeight,
  rows,
  cols,
  edge,
  end,
  pitch,
  gauge,
  holeDiameter,
  origin = "left",
  weldSize = 0,
  layout = "linear",
  angleDesignation = "",
  drawAngleThickness = "none",
  className = "",
  children,
}) => {
  const numericParams = useMemo(() => {
    const boltRows = Math.max(1, Math.round(toNumber(rows, 1)));
    const boltCols = Math.max(1, Math.round(toNumber(cols, 1)));

    let gaugeValues = [];
    if (Array.isArray(gauge)) {
      gaugeValues = gauge
        .map((value) => toNumber(value))
        .filter((value) => Number.isFinite(value) && value > 0);
    } else if (gauge !== undefined && gauge !== null && gauge !== "") {
      const numericGauge = toNumber(gauge);
      if (Number.isFinite(numericGauge) && numericGauge > 0) {
        gaugeValues = [numericGauge];
      }
    }

    const edgeRaw = toNumber(edge);
    const edgeDist = Number.isFinite(edgeRaw) && edgeRaw > 0 ? edgeRaw : undefined;

    const endRaw = toNumber(end);
    const endDist = Number.isFinite(endRaw) && endRaw > 0 ? endRaw : undefined;

    const pitchRaw = toNumber(pitch);
    const pitchDist = Number.isFinite(pitchRaw) && pitchRaw > 0 ? pitchRaw : undefined;

    let angleThickness = 0;
    let angleLegSize = 0;
    if (angleDesignation) {
      const parts = String(angleDesignation).split(/x/i).map(p => parseFloat(p.trim()));
      if (parts.length >= 3) {
        angleLegSize = parts[0];
        angleThickness = parts[2];
      }
    }

    // All calculations should come from osdag_core - no fallback calculations
    let width = toNumber(plateWidth);
    if (width <= 0 && angleLegSize > 0) {
      width = angleLegSize;
    }
    let height = toNumber(plateHeight);
    if (height <= 0 && angleLegSize > 0) {
      height = angleLegSize;
    }
    
    // If required dimensions are missing, return early with error state
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      console.warn('SpacingDiagram: Missing required plateWidth or plateHeight from backend');
      return {
        width: 0,
        height: 0,
        boltRows,
        boltCols,
        edgeDist: edgeDist || 0,
        endDist: endDist || 0,
        pitchDist: pitchDist || 0,
        gaugeValues,
        holeDia: 0,
        weld: Math.max(0, toNumber(weldSize, 0)),
        error: 'Missing plate dimensions from backend',
        angleThickness: 0,
        angleLegSize: 0,
      };
    }
    
    // Hole diameter should come from backend, but if missing use 0 (no holes for welded connections)
    const holeDia = toNumber(holeDiameter);
    
    // All gauge values should come from backend - no fallback normalization
    if (!gaugeValues.length) {
      // If no gauge values from backend, use the provided gauge value
      const singleGauge = toNumber(gauge);
      if (Number.isFinite(singleGauge) && singleGauge > 0) {
        gaugeValues = [singleGauge];
      }
    }

    return {
      width,
      height,
      boltRows,
      boltCols,
      edgeDist: edgeDist || 0,
      endDist: endDist || 0,
      pitchDist: pitchDist || 0,
      gaugeValues,
      holeDia: holeDia || 0,
      weld: Math.max(0, toNumber(weldSize, 0)),
      layout,
      angleThickness,
      angleLegSize,
    };
  }, [plateWidth, plateHeight, rows, cols, edge, end, pitch, gauge, holeDiameter, weldSize, layout, angleDesignation]);

  const scale = useMemo(() => {
    if (numericParams.error || numericParams.width <= 0 || numericParams.height <= 0) {
      return 1;
    }
    const usableWidth = VIEWBOX_WIDTH - 2 * MARGIN;
    const usableHeight = VIEWBOX_HEIGHT - 2 * MARGIN;
    const scaleX = usableWidth / numericParams.width;
    const scaleY = usableHeight / numericParams.height;
    return Math.min(scaleX, scaleY);
  }, [numericParams.width, numericParams.height, numericParams.error]);

  if (numericParams.error || numericParams.width <= 0 || numericParams.height <= 0) {
    return (
      <div className={`flex min-h-[280px] w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 ${className}`}>
        Dimensions Unavailable
      </div>
    );
  }

  const offsetX = (VIEWBOX_WIDTH - numericParams.width * scale) / 2;
  const offsetY = (VIEWBOX_HEIGHT - numericParams.height * scale) / 2;

  const boltColsPositions = numericParams.layout === "symmetric"
    ? distributeSymmetric(
        numericParams.boltCols,
        numericParams.edgeDist,
        numericParams.gaugeValues[0] || 0,
        numericParams.width
      )
    : distributeWithGauge(
        numericParams.boltCols,
        origin,
        numericParams.edgeDist,
        numericParams.width,
        numericParams.gaugeValues
      );

  const boltRowsPositions = numericParams.layout === "symmetric"
    ? distributeSymmetric(
        numericParams.boltRows,
        numericParams.endDist,
        numericParams.pitchDist,
        numericParams.height
      )
    : distributeRows(
        numericParams.boltRows,
        numericParams.endDist,
        numericParams.pitchDist,
        numericParams.height
      );

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className={`h-auto w-full max-w-xl ${className}`}
      role="img"
    >
      <defs>
        <marker
          id="spacing-arrow-start"
          markerWidth="12"
          markerHeight="12"
          refX="0"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 12 0 L 0 6 L 12 12 Z" fill="#000" />
        </marker>
        <marker
          id="spacing-arrow-end"
          markerWidth="12"
          markerHeight="12"
          refX="12"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 12 6 L 0 12 Z" fill="#000" />
        </marker>
      </defs>
      
      {/* Plate */}
      <rect
        x={offsetX}
        y={offsetY}
        width={numericParams.width * scale}
        height={numericParams.height * scale}
        fill="#b8b8a0"
        stroke="#000"
        strokeWidth="2"
      />

      {/* Angle thickness strip */}
      {drawAngleThickness === 'left' && numericParams.angleThickness > 0 && (
        <rect
          x={offsetX}
          y={offsetY}
          width={numericParams.angleThickness * scale}
          height={numericParams.height * scale}
          fill="rgba(0, 0, 0, 0.15)"
          stroke="#000"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      )}
      {drawAngleThickness === 'right' && numericParams.angleThickness > 0 && (
        <rect
          x={offsetX + (numericParams.width - numericParams.angleThickness) * scale}
          y={offsetY}
          width={numericParams.angleThickness * scale}
          height={numericParams.height * scale}
          fill="rgba(0, 0, 0, 0.15)"
          stroke="#000"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      )}

      {/* Optional weld strip */}
      {numericParams.weld > 0 && (
        <rect
          x={offsetX}
          y={offsetY}
          width={numericParams.weld * scale}
          height={numericParams.height * scale}
          fill="rgba(220, 20, 60, 0.2)"
          stroke="rgba(220, 20, 60, 0.6)"
          strokeWidth="2"
        />
      )}

      {/* Bolt holes */}
      {boltRowsPositions.map((rowY, rowIndex) =>
        boltColsPositions.map((colX, colIndex) => (
          <circle
            key={`bolt-${rowIndex}-${colIndex}`}
            cx={offsetX + colX * scale}
            cy={offsetY + rowY * scale}
            r={(numericParams.holeDia / 2) * scale}
            fill="none"
            stroke="#a0522d"
            strokeWidth="2"
          />
        ))
      )}

      {/* Detailed Dimensions */}
      {renderDetailedDimensions(
        numericParams,
        boltColsPositions,
        boltRowsPositions,
        offsetX,
        offsetY,
        scale,
        origin
      )}

      {typeof children === "function"
        ? children({
            offsetX,
            offsetY,
            scale,
            boltColsPositions,
            boltRowsPositions,
            numericParams,
          })
        : children}
    </svg>
  );
};

export default SpacingDiagram;