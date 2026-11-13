
/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    # Simplified ModuleReducer - Consolidated Actions       #
    ######################################################### 
*/

export default function ModuleReducer(state, action) {
  switch (action.type) {
    // ===================================================================
    // CONSOLIDATED DATA ACTIONS - Replace 10+ individual actions
    // ===================================================================
    case "SET_ALL_MODULE_DATA": {
      const {
        materialList = [],
        boltDiameterList = [],
        thicknessList = [],
        propertyClassList = [],
        boltTypeList = [],
        connectivityList = [],
        beamList = [],
        columnList = [],
        angleList = [],
        topAngleList = [],
        channelList = [],
        sectionProfileList = [],
        endPlateTypeList = [],
        weldTypes = [],
        weldFab = [],
        coverPlateList = [],
        weldSizeList = [],
      } = action.payload;

      return {
        ...state,
        // Core data lists
        materialList,
        coverPlateList,
        boltDiameterList,
        thicknessList,
        propertyClassList,
        boltTypeList,
        connectivityList,

        // Structural elements
        beamList,
        columnList,

        // Module-specific lists
        angleList,
        topAngleList,
        channelList,
        sectionProfileList,
        endPlateTypeList,

        // Welding data
        weldTypes,
        weldFab,
        weldSizeList,

        // Clear any previous errors
        error_msg: "",
      };
    }

    // ===================================================================
    // DESIGN & CAD ACTIONS - Consolidated and simplified
    // ===================================================================
    case "SET_DESIGN_DATA_AND_LOGS":
      return {
        ...state,
        designData: action.payload.data || {},
        designLogs: action.payload.logs || [],
        error_msg: "",
      };

    case "SET_RENDER_CAD_MODEL_BOOLEAN":
      return {
        ...state,
        renderCadModel: action.payload,
      };

    case "SET_CAD_MODEL_PATHS":
      return {
        ...state,
        cadModelPaths: action.payload || {},
      };

    case "SET_HOVER_DICT":
      return {
        ...state,
        hoverDict: action.payload || {},
      };

    // ===================================================================
    // REPORT ACTIONS - Consolidated
    // ===================================================================
    case "SET_REPORT_ID_AND_DISPLAY_PDF":
      return {
        ...state,
        report_id: action.payload,
        displayPDF: true,
        error_msg: "",
      };

    case "SET_BLOBL_URL":
      return {
        ...state,
        blobUrl: action.payload,
      };

    // ===================================================================
    // DESIGN PREFERENCES - Consolidated and simplified
    // ===================================================================
    case "SAVE_DESIGN_PREF_DATA":
      return {
        ...state,
        designPrefData: action.payload || {},
        error_msg: "",
      };

    case "UPDATE_SECTION_DATA": {
      // Consolidated action for both supporting and supported section updates
      const { sectionType, materialValue } = action.payload;
      const designPrefData = { ...state.designPrefData };

      const isCustom = materialValue?.includes?.("Cus") || false;
      const sectionKey = sectionType === "supporting" ? "supporting_section_results" : "supported_section_results";

      if (designPrefData[sectionKey] && designPrefData[sectionKey][0]) {
        const sectionResults = { ...designPrefData[sectionKey][0] };
        sectionResults.Source = isCustom ? "Custom" : "IS808_Rev";
        sectionResults.Type = isCustom ? "Welded" : "Rolled";
        designPrefData[sectionKey] = [sectionResults];
      }

      return {
        ...state,
        designPrefData,
        error_msg: "",
      };
    }

    // ===================================================================
    // MATERIAL MANAGEMENT - Consolidated
    // ===================================================================
    case "SAVE_MATERIAL_DETAILS": {
      // Unified action for all material detail saving
      const { materialType, materialData } = action.payload;

      switch (materialType) {
        case "connector":
          return { ...state, conn_material_details: materialData, error_msg: "" };
        case "supported":
          return { ...state, supported_material_details: materialData, error_msg: "" };
        case "supporting":
          return { ...state, supporting_material_details: materialData, error_msg: "" };
        default:
          return state;
      }
    }

    // ===================================================================
    // UTILITY ACTIONS
    // ===================================================================
    case "RESET_MODULE_STATE":
      return {
        ...state,
        // Reset design-related state completely
        designData: {},
        designLogs: [],
        renderCadModel: false,
        cadModelPaths: {},
        hoverDict: {}, // Clear CAD hover tooltips
        displayPDF: false,
        report_id: "",
        blobUrl: "",
        designPrefData: {},
        lastKnownGoodDesignPrefSnapshot: null,
        designOutputsInvalidated: false,
        conn_material_details: [],
        supported_material_details: [],
        supporting_material_details: [],
        error_msg: "",
        // Keep module data lists (they're module-specific, not design-specific)
        // These will be refreshed when getModuleData is called for the new module
      };

    case "SET_ERR_MSG":
      return {
        ...state,
        error_msg: action.payload || "",
      };

    case "SET_CURRENT_MODULE_NAME":
      return {
        ...state,
        currentModuleName: action.payload,
        error_msg: "",
      };

    /** Atomically apply material detail rows returned by preference sync. */
    case "APPLY_DESIGN_PREF_SYNC_BUNDLE": {
      const md = action.payload?.material_details || {};
      const conn = md.connector;
      const supd = md.supported;
      const supg = md.supporting;
      return {
        ...state,
        ...(Array.isArray(conn) ? { conn_material_details: conn } : {}),
        ...(Array.isArray(supd) ? { supported_material_details: supd } : {}),
        ...(Array.isArray(supg) ? { supporting_material_details: supg } : {}),
        error_msg: "",
      };
    }

    /**
     * Strict linked-key reseed metadata from dock-driver refresh.
     * Keeps material details and last-known snapshot aligned with linked resets.
     */
    case "APPLY_STRICT_LINKED_RESEED": {
      const md = action.payload?.material_details || {};
      const conn = md.connector;
      const supd = md.supported;
      const supg = md.supporting;
      const snapshot = action.payload?.snapshot ?? null;
      const metadata = action.payload?.metadata ?? null;
      return {
        ...state,
        ...(Array.isArray(conn) ? { conn_material_details: conn } : {}),
        ...(Array.isArray(supd) ? { supported_material_details: supd } : {}),
        ...(Array.isArray(supg) ? { supporting_material_details: supg } : {}),
        ...(snapshot ? { lastKnownGoodDesignPrefSnapshot: snapshot } : {}),
        lastStrictLinkedReseedMeta: metadata,
        error_msg: "",
      };
    }

    case "SET_LAST_KNOWN_GOOD_DESIGN_PREF_SNAPSHOT":
      return {
        ...state,
        lastKnownGoodDesignPrefSnapshot: action.payload ?? null,
      };

    /** Invalidate prior design/CAD/report after effective pref change */
    case "INVALIDATE_DESIGN_OUTPUTS":
      return {
        ...state,
        designData: {},
        designLogs: [],
        renderCadModel: false,
        cadModelPaths: {},
        hoverDict: {},
        displayPDF: false,
        report_id: "",
        blobUrl: "",
        designOutputsInvalidated: true,
        error_msg: "",
      };

    case "CLEAR_DESIGN_OUTPUTS_INVALIDATED_FLAG":
      return {
        ...state,
        designOutputsInvalidated: false,
      };

    // Remove unused cookie action
    case "SET_COOKIE_FETCH":
      return state; // No-op - this action is no longer needed
    default:
      return state;
  }
}
