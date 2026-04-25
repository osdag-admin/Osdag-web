/**
 * Default CAD Configuration
 * Centralized configuration for 3D model rendering
 */

// Default part colors (hex values)
export const DEFAULT_PART_COLORS = {
  // Structural members
  Beam: "#868664",
  Column: "#484836",
  Member: "#808080",

  // Plates and connectors
  Plate: "#2f2f23",
  "Plate 1": "#2f2f23",
  "Plate 2": "#4a4a3a",
  Endplate: "#2f2f23",
  EndPlate: "#2f2f23",
  cleatAngle: "#2f2f23",
  SeatedAngle: "#2f2f23",
  Connector: "#868664",
  CoverPlate: "#2f2f23",
  "Cover Plate": "#2f2f23",

  // Fasteners
  Bolt: "#996633",
  Bolts: "#996633",

  // Welds
  Weld: "#ff0000",
  Welds: "#ff0000",
  weld_left: "#ff0000",
  weld_right: "#ff0000",

  // Fallback
  Model: "#999999",
};

// Render order categories (z-index priority)
export const RENDER_ORDER = {
  STRUCTURAL: 0,  // Beam, Column, Member (render first, behind everything)
  CONNECTOR: 1,   // Plate, EndPlate, cleatAngle, SeatedAngle, Connector
  FASTENER: 2,    // Bolt, Bolts, Weld, Welds (render on top)
};

// Default render order mapping
export const DEFAULT_RENDER_ORDER = {
  // Structural members
  beam: RENDER_ORDER.STRUCTURAL,
  column: RENDER_ORDER.STRUCTURAL,
  member: RENDER_ORDER.STRUCTURAL,

  // Plates and connectors
  plate: RENDER_ORDER.CONNECTOR,
  endplate: RENDER_ORDER.CONNECTOR,
  cleat: RENDER_ORDER.CONNECTOR,
  seated: RENDER_ORDER.CONNECTOR,
  connector: RENDER_ORDER.CONNECTOR,

  // Fasteners
  bolt: RENDER_ORDER.FASTENER,
  weld: RENDER_ORDER.FASTENER,
};

// Valid part keys for grouping (must match API section names so parts are included in the scene)
export const VALID_PART_KEYS = new Set([
  "Member",
  "Endplate",
  "EndPlate",
  "Beam",
  "Column",
  "Plate",
  "Plate 1",
  "Plate 2",
  "Weld",
  "Welds",
  "Bolt",
  "Bolts",
  "cleatAngle",
  "SeatedAngle",
  "Connector",
  "Cover Plate",
  "CoverPlate",
  "Model",
]);

/**
 * Get color for a part, with fallback logic
 * @param {string} partName - Name of the part
 * @param {object} moduleCadConfig - Optional module-specific CAD config
 * @returns {string} Hex color code
 */
export const getPartColor = (partName, moduleCadConfig = null) => {
  // Check module-specific config first
  if (moduleCadConfig?.partColors?.[partName]) {
    return moduleCadConfig.partColors[partName];
  }

  // Try exact match
  if (DEFAULT_PART_COLORS[partName]) {
    return DEFAULT_PART_COLORS[partName];
  }

  // Try lowercase
  const lower = partName?.toLowerCase();
  if (DEFAULT_PART_COLORS[lower]) {
    return DEFAULT_PART_COLORS[lower];
  }

  // Try capitalized (first letter uppercase, rest lowercase)
  const capitalized = partName?.charAt(0).toUpperCase() + partName?.slice(1).toLowerCase();
  if (DEFAULT_PART_COLORS[capitalized]) {
    return DEFAULT_PART_COLORS[capitalized];
  }

  // Special case: weld variants
  if (lower?.startsWith("weld")) {
    return DEFAULT_PART_COLORS.Weld;
  }

  // Fallback
  return DEFAULT_PART_COLORS.Model || "#888888";
};

/**
 * Get render order for a part based on its name
 * @param {string} partName - Name of the part
 * @param {object} moduleCadConfig - Optional module-specific CAD config
 * @returns {number} Render order (z-index)
 */
export const getRenderOrder = (partName, moduleCadConfig = null) => {
  // Check module-specific config first
  if (moduleCadConfig?.renderOrder?.[partName] !== undefined) {
    return moduleCadConfig.renderOrder[partName];
  }

  const lower = partName?.toLowerCase() || "";

  // Structural members (Beam, Column, Member) render first
  if (lower.includes("beam") || lower.includes("column") || lower.includes("member")) {
    return RENDER_ORDER.STRUCTURAL;
  }

  // Plates, connectors, and endplates render on top
  if (
    lower.includes("plate") ||
    lower.includes("endplate") ||
    lower.includes("cleat") ||
    lower.includes("seated") ||
    lower.includes("connector")
  ) {
    return RENDER_ORDER.CONNECTOR;
  }

  // Bolts and welds render on top
  if (lower.includes("bolt") || lower.includes("weld")) {
    return RENDER_ORDER.FASTENER;
  }

  // Default to structural
  return RENDER_ORDER.STRUCTURAL;
};
