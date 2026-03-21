/**
 * View-to-Part Mapping Configuration
 * Maps CAD view options to which parts should be displayed
 */

// Default view-to-part mappings
export const DEFAULT_VIEW_MAPPINGS = {
  "Model": "all",  // Show all parts when Model is selected
  "Beam": ["Beam"],
  "Column": ["Column"],
  // Plate view should show both Plate and Bolt/Bolts (for Fin Plate connections)
  "Plate": ["Plate", "Bolt", "Bolts"],
  "Connector": ["Connector", "cleatAngle", "SeatedAngle", "EndPlate"],
  "CleatAngle": ["cleatAngle"],
  "SeatedAngle": ["SeatedAngle"],
  "EndPlate": ["EndPlate"],
  "Member": ["Member"],
  "CoverPlate": ["CoverPlate", "Cover Plate"],
  // Simple connections (desktop parity): Plate 1, Plate 2, Cover Plate, Bolts, Welds
  "Plate 1": ["Plate 1"],
  "Plate 2": ["Plate 2"],
  "Cover Plate": ["Cover Plate"],
  "Bolts": ["Bolts"],
  "Welds": ["Welds"],
  // Base Plate
  "Conc": ["Conc", "Concrete"],
  "Grout": ["Grout"],
  "Stiffeners": ["Stiffeners", "Stiffener"],
};

/**
 * Create a view mapper function that checks if a part should be shown
 * @param {object} moduleCadConfig - Optional module-specific CAD config
 * @returns {function} Function that takes (partName, activeViews) and returns boolean
 */
export const createViewMapper = (moduleCadConfig = null) => {
  // Use module-specific mappings if provided, otherwise use defaults
  const baseMappings = moduleCadConfig?.viewMappings || DEFAULT_VIEW_MAPPINGS;
  // For simple connections (cadOptions has Plate 1, etc.): Model = merge per-part meshes only (skip backend "Model" mesh to avoid duplicate)
  const viewMappings = { ...baseMappings };
  if (moduleCadConfig?.cadOptions && Array.isArray(moduleCadConfig.cadOptions) && moduleCadConfig.cadOptions.includes("Plate 1")) {
    viewMappings["Model"] = moduleCadConfig.cadOptions.filter((opt) => opt !== "Model");
  }

  return (partName, activeViews) => {
    // Check each active view (no special-case for Model so module mapping applies)
    for (const view of activeViews) {
      const mappedParts = viewMappings[view];

      // If mapping is "all", show everything
      if (mappedParts === "all") {
        return true;
      }

      // If mapping is an array, check if partName matches
      if (Array.isArray(mappedParts)) {
        // Exact match
        if (mappedParts.includes(partName)) {
          return true;
        }

        // Case-insensitive match only (no partial match, so "Plate 1" does not show "Plate")
        const lowerPartName = partName?.toLowerCase();
        if (mappedParts.some(p => p?.toLowerCase() === lowerPartName)) {
          return true;
        }
      }
    }

    return false;
  };
};

/**
 * Get view options for a module
 * @param {object} moduleCadConfig - Module-specific CAD config
 * @param {object} moduleConfig - Full module config (for fallback)
 * @returns {array} Array of view option strings
 */
export const getViewOptions = (moduleCadConfig = null, moduleConfig = null) => {
  // Check module-specific config first
  if (moduleCadConfig?.viewOptions) {
    return moduleCadConfig.viewOptions;
  }

  // Fallback to moduleConfig.cadOptions
  if (moduleConfig?.cadOptions) {
    return moduleConfig.cadOptions;
  }

  // Default fallback
  return ["Model", "Beam", "Connector"];
};
