import React, { useMemo } from "react";

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

const clampPositive = (value, fallback) => {
  const n = toNumber(value, fallback);
  return n > 0 ? n : fallback;
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

const DimensionText = ({ x, y, text, anchor = "middle" }) => (
  <text
    x={x}
    y={y}
    fontSize="14"
    fontWeight="500"
    textAnchor={anchor}
    fill="#000"
    fontFamily="Arial, sans-serif"
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

    // Edge distances (only show if multiple columns)
    if (boltColsPositions.length > 1) {
      if (origin === "left") {
        // Left edge distance
        const edgeStart = offsetX;
        const edgeEnd = offsetX + firstBoltX * scale;
        
        // Extension lines
        elements.push(
          <line
            key="h-edge-start-ext1"
            x1={edgeStart}
            y1={offsetY - 5}
            x2={edgeStart}
            y2={dimY + extLength}
            stroke={dimColor}
            strokeWidth="1"
          />
        );
        elements.push(
          <line
            key="h-edge-start-ext2"
            x1={edgeEnd}
            y1={offsetY - 5}
            x2={edgeEnd}
            y2={dimY + extLength}
            stroke={dimColor}
            strokeWidth="1"
          />
        );
        
        // Dimension line with arrows
        elements.push(
          <line
            key="h-edge-start"
            x1={edgeStart}
            y1={dimY}
            x2={edgeEnd}
            y2={dimY}
            stroke={dimColor}
            strokeWidth="1"
            markerEnd="url(#arrow-end)"
            markerStart="url(#arrow-start)"
          />
        );
        
        elements.push(
          <DimensionText
            key="h-edge-start-text"
            x={(edgeStart + edgeEnd) / 2}
            y={dimY - textOffset}
            text={`${(params.edgeDist || 0).toFixed(0)}`}
          />
        );
      } else {
        // Right edge distance
        const edgeStart = offsetX + lastBoltX * scale;
        const edgeEnd = offsetX + params.width * scale;
        
        elements.push(
          <line
            key="h-edge-end-ext1"
            x1={edgeStart}
            y1={offsetY - 5}
            x2={edgeStart}
            y2={dimY + extLength}
            stroke={dimColor}
            strokeWidth="1"
          />
        );
        elements.push(
          <line
            key="h-edge-end-ext2"
            x1={edgeEnd}
            y1={offsetY - 5}
            x2={edgeEnd}
            y2={dimY + extLength}
            stroke={dimColor}
            strokeWidth="1"
          />
        );
        
        elements.push(
          <line
            key="h-edge-end"
            x1={edgeStart}
            y1={dimY}
            x2={edgeEnd}
            y2={dimY}
            stroke={dimColor}
            strokeWidth="1"
            markerEnd="url(#arrow-end)"
            markerStart="url(#arrow-start)"
          />
        );
        
        elements.push(
          <DimensionText
            key="h-edge-end-text"
            x={(edgeStart + edgeEnd) / 2}
            y={dimY - textOffset}
            text={`${(params.edgeDist || 0).toFixed(0)}`}
          />
        );
      }
    }

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
          markerEnd="url(#arrow-end)"
          markerStart="url(#arrow-start)"
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
        markerEnd="url(#arrow-end)"
        markerStart="url(#arrow-start)"
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

    // Top end distance (only if multiple rows)
    if (boltRowsPositions.length > 1) {
      const topY = offsetY;
      const boltY = offsetY + firstBoltY * scale;
      
      elements.push(
        <line
          key="v-end-top-ext1"
          x1={offsetX + params.width * scale + 5}
          y1={topY}
          x2={dimX - extLength}
          y2={topY}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      elements.push(
        <line
          key="v-end-top-ext2"
          x1={offsetX + params.width * scale + 5}
          y1={boltY}
          x2={dimX - extLength}
          y2={boltY}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      
      elements.push(
        <line
          key="v-end-top"
          x1={dimX}
          y1={topY}
          x2={dimX}
          y2={boltY}
          stroke={dimColor}
          strokeWidth="1"
          markerEnd="url(#arrow-end)"
          markerStart="url(#arrow-start)"
        />
      );
      
      elements.push(
        <DimensionText
          key="v-end-top-text"
          x={dimX + textOffset + 4}
          y={(topY + boltY) / 2 + 5}
          text={`${(params.endDist || 0).toFixed(0)}`}
          anchor="start"
        />
      );
    }

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
          markerEnd="url(#arrow-end)"
          markerStart="url(#arrow-start)"
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

    // Bottom end distance (only if multiple rows)
    if (boltRowsPositions.length > 1) {
      const boltY = offsetY + lastBoltY * scale;
      const bottomY = offsetY + params.height * scale;
      
      elements.push(
        <line
          key="v-end-bottom-ext1"
          x1={offsetX + params.width * scale + 5}
          y1={boltY}
          x2={dimX - extLength}
          y2={boltY}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      elements.push(
        <line
          key="v-end-bottom-ext2"
          x1={offsetX + params.width * scale + 5}
          y1={bottomY}
          x2={dimX - extLength}
          y2={bottomY}
          stroke={dimColor}
          strokeWidth="1"
        />
      );
      
      elements.push(
        <line
          key="v-end-bottom"
          x1={dimX}
          y1={boltY}
          x2={dimX}
          y2={bottomY}
          stroke={dimColor}
          strokeWidth="1"
          markerEnd="url(#arrow-end)"
          markerStart="url(#arrow-start)"
        />
      );
      
      elements.push(
        <DimensionText
          key="v-end-bottom-text"
          x={dimX + textOffset + 4}
          y={(boltY + bottomY) / 2 + 5}
          text={`${(params.endDist || 0).toFixed(0)}`}
          anchor="start"
        />
      );
    }

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
        markerEnd="url(#arrow-end)"
        markerStart="url(#arrow-start)"
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
  className = "",
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

    // All calculations should come from osdag_core - no fallback calculations
    const width = toNumber(plateWidth);
    const height = toNumber(plateHeight);
    
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
    };
  }, [plateWidth, plateHeight, rows, cols, edge, end, pitch, gauge, holeDiameter, weldSize]);

  const scale = useMemo(() => {
    const usableWidth = VIEWBOX_WIDTH - 2 * MARGIN;
    const usableHeight = VIEWBOX_HEIGHT - 2 * MARGIN;
    const scaleX = usableWidth / numericParams.width;
    const scaleY = usableHeight / numericParams.height;
    return Math.min(scaleX, scaleY);
  }, [numericParams.width, numericParams.height]);

  const offsetX = (VIEWBOX_WIDTH - numericParams.width * scale) / 2;
  const offsetY = (VIEWBOX_HEIGHT - numericParams.height * scale) / 2;

  const boltColsPositions = distributeWithGauge(
    numericParams.boltCols,
    origin,
    numericParams.edgeDist,
    numericParams.width,
    numericParams.gaugeValues
  );

  const boltRowsPositions = distributeRows(
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
          id="arrow-start"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M 8 4 L 0 0 L 0 8 Z" fill="#000" />
        </marker>
        <marker
          id="arrow-end"
          markerWidth="8"
          markerHeight="8"
          refX="0"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 8 4 L 0 0 L 0 8 Z" fill="#000" />
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
    </svg>
  );
};

export default SpacingDiagram;