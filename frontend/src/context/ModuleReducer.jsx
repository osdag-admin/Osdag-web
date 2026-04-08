
/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    # Simplified ModuleReducer - Consolidated Actions       #
    ######################################################### 
*/

export default (state, action) => {
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

      // Merge with existing custom materials from localStorage if needed
      const existingCustomMaterials = JSON.parse(localStorage.getItem("osdag-custom-materials") || "[]");
      const mergedMaterialList = existingCustomMaterials.length > 0
        ? [...materialList, ...existingCustomMaterials]
        : materialList;

      return {
        ...state,
        // Core data lists
        materialList: mergedMaterialList,
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
      console.log('[ModuleReducer] SET_HOVER_DICT action received');
      console.log('[ModuleReducer] action.payload:', action.payload);
      console.log('[ModuleReducer] action.payload type:', typeof action.payload);
      console.log('[ModuleReducer] action.payload keys:', action.payload ? Object.keys(action.payload) : 'N/A');
      const newHoverDict = action.payload || {};
      console.log('[ModuleReducer] Setting hoverDict to:', newHoverDict);
      return {
        ...state,
        hoverDict: newHoverDict,
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

    // Legacy actions for backward compatibility
    case "UPDATE_SUPPORTING_ST_DATA":
      return {
        ...state,
        ...((state, action) => {
          const designPrefData = { ...state.designPrefData };
          if (designPrefData.supporting_section_results?.[0]) {
            const sectionResults = { ...designPrefData.supporting_section_results[0] };
            const isCustom = action.payload?.includes?.("Cus") || false;
            sectionResults.Source = isCustom ? "Custom" : "IS808_Rev";
            sectionResults.Type = isCustom ? "Welded" : "Rolled";
            designPrefData.supporting_section_results = [sectionResults];
          }
          return { designPrefData, error_msg: "" };
        })(state, action)
      };

    case "UPDATE_SUPPORTED_ST_DATA":
      return {
        ...state,
        ...((state, action) => {
          const designPrefData = { ...state.designPrefData };
          if (designPrefData.supported_section_results?.[0]) {
            const sectionResults = { ...designPrefData.supported_section_results[0] };
            const isCustom = action.payload?.includes?.("Cus") || false;
            sectionResults.Source = isCustom ? "Custom" : "IS808_Rev";
            sectionResults.Type = isCustom ? "Welded" : "Rolled";
            designPrefData.supported_section_results = [sectionResults];
          }
          return { designPrefData, error_msg: "" };
        })(state, action)
      };

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

    // Legacy material actions for backward compatibility
    case "SAVE_CM_DETAILS":
      return {
        ...state,
        conn_material_details: action.payload,
        error_msg: "",
      };

    case "SAVE_SDM_DETAILS":
      return {
        ...state,
        supported_material_details: action.payload,
        error_msg: "",
      };

    case "SAVE_STM_DETAILS":
      return {
        ...state,
        supporting_material_details: action.payload,
        error_msg: "",
      };

    case "UPDATE_MATERIAL_FROM_CACHES":
      return {
        ...state,
        materialList: [...(state.materialList || []), ...(action.payload || [])],
        error_msg: "",
      };

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

    // Remove unused cookie action
    case "SET_COOKIE_FETCH":
      return state; // No-op - this action is no longer needed
    default:
      return state;
  }
}