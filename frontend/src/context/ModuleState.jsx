/* eslint-disable react/prop-types */
import { createContext, useReducer, useCallback } from "react";
import ModuleReducer from "./ModuleReducer";
import { createDesign as apiCreateDesign } from '../modules/shared/api/moduleApi';
import {
  fetchModuleOptions as dsFetchModuleOptions,
  createCad as dsCreateCad,
  downloadCad as dsDownloadCad,
  addCustomMaterial as dsAddCustomMaterial,
  fetchDesignPreferences as dsFetchDesignPreferences,
} from "../datasources/modulesDataSource";

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    # Simplified ModuleContext - 8 Core Functions Only      #
    ######################################################### 
*/

//initial state
let initialValue = {
  error_msg: "",
  currentModuleName: "",

  // Common fields for all modules
  materialList: [],
  boltDiameterList: [],
  thicknessList: [],
  propertyClassList: [],
  boltTypeList: [],

  // Structural elements
  beamList: [],
  columnList: [],
  connectivityList: [],
  coverPlateList: [],

  // Angle-specific (cleat angle, seated angle)
  angleList: [],
  topAngleList: [],

  // Tension member specific
  sectionProfileList: [],
  channelList: [],

  // Welded connection specific
  weldTypes: [],
  weldFab: [],
  weldSizeList: [],

  // End plate specific
  endPlateTypeList: [],

  // Session variables removed for multi-module support
  designLogs: [],
  designData: {},
  renderCadModel: false,
  cadModelPaths: {}, //stores cad files path
  hoverDict: {},
  displayPDF: false,
  report_id: "",
  blobUrl: "",
  designPrefData: {},
  /** Snapshot used to restore last successful preference sync. */
  lastKnownGoodDesignPrefSnapshot: null,
  /** Last strict linked reseed metadata (dock-driver refresh path). */
  lastStrictLinkedReseedMeta: null,
  /** Set after pref/CAD-invalidating change; UI may show redesign hint */
  designOutputsInvalidated: false,
  conn_material_details: [],
  supported_material_details: [],
  supporting_material_details: [],
  design_pref_defaults: {
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    connector_material: "E 250 (Fe 410 W)A",
    material: "E 250 (Fe 410 W)A",
    bolt_tension_type: "Pre-tensioned",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
  },
};

//create context
export const ModuleContext = createContext(initialValue);

//provider component
export const ModuleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ModuleReducer, initialValue);

  // ===================================================================
  // SIMPLIFIED CONTEXT API - 8 CORE FUNCTIONS ONLY
  // ===================================================================
  // ===================================================================
  // 1. POPULATE - Universal Module Data Fetcher
  // ===================================================================

  /**
   * Universal function to get all module data in one API call
   * Replaces: getConnectivityList, getColumnBeamMaterialList, getBeamMaterialList, 
   *          getBoltDiameterList, getThicknessList, getPropertyClassList, etc.
   * @param {string} moduleName - Module identifier (e.g., 'FinPlateConnection')
   * @param {Object} options - Optional parameters
   * @param {string} options.connectivity - Connection type filter
   * @param {Object} options.filters - Additional filters for data
   */
  const getModuleData = useCallback(async (moduleName, options = {}) => {
    try {

      if (!moduleName) {
        dispatch({ type: "SET_ERR_MSG", payload: "Module name is required" });
        return { success: false, error: "Module name is required" };
      }

      // Set current module
      dispatch({ type: "SET_CURRENT_MODULE_NAME", payload: moduleName });

      const { success, data, error } = await dsFetchModuleOptions(moduleName, {
        connectivity: options.connectivity,
      });

      if (!success) {
        throw new Error(error || "Failed to load module data");
      }
      // Dispatch comprehensive data update
      dispatch({ type: "SET_ALL_MODULE_DATA", payload: data });

      return { success: true, data };
    } catch (error) {
      dispatch({ type: "SET_ERR_MSG", payload: "Failed to load module data" });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * Get connectivity-specific data for a module
   * @param {string} moduleName - Module identifier
   */
  const getConnectivityData = useCallback(async (moduleName) => {
    return await getModuleData(moduleName, { connectivity: null });
  }, [getModuleData]);

  /**
   * Manage custom materials - add, update, remove, or sync with cache
   * Replaces: addCustomMaterialToDB, updateMaterialListFromCaches
   * @param {string} action - 'add', 'update'
   * @param {Object} data - Material data or parameters
   */
  const manageCustomMaterials = useCallback(async (action, data = {}) => {
    try {

      switch (action) {
        case 'add': {
          const { connectivity } = data;
          const result = await dsAddCustomMaterial(data);

          // Refresh module data to include the new material
          if (connectivity) {
            await getModuleData(state.currentModuleName, { connectivity });
          } else {
            await getModuleData(state.currentModuleName);
          }

          return { success: true, message: "Material added successfully", data: result };
        }

        case 'update': {
          const { materialType, materialData } = data;
          dispatch({
            type: "SAVE_MATERIAL_DETAILS",
            payload: { materialType, materialData: [materialData] },
          });
          return { success: true, message: "Material details updated" };
        }

        default:
          return { success: false, error: "Invalid action specified" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [getModuleData, dispatch, state.currentModuleName]);

  // ===================================================================
  // 2. CALCULATE - Design Computation
  // ===================================================================

  /**
   * Create design calculation
   * Uses external API function for consistency
   */
  const createDesign = useCallback((param, module_id, onCADSuccess = null) => {
    return apiCreateDesign(param, module_id, onCADSuccess, dispatch);
  }, [dispatch]);

  // ===================================================================
  // 3. CAD - 3D Model Generation and Download
  // ===================================================================

  /**
   * Create 3D CAD model from input data
   * @param {Object} inputData - Design input values
   * @param {string} moduleId - Module identifier
   * @param {Function} onCADSuccess - Success callback function
   */
  const createCADModel = useCallback(async (inputData, moduleId, onCADSuccess = null) => {
    try {
      const { status, data } = await dsCreateCad(moduleId, inputData);

      // Handle "coming soon" status (200 with coming_soon status)
      if (status === 200 && data.status === "coming_soon") {
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
        // Don't show error alert for "coming soon"
        return { success: false, coming_soon: true, message: data.message || "3D model generation is coming soon" };
      }

      if (status < 200 || status >= 300) {
        const errMsg = data.message || `CAD generation failed: ${status}`;
        throw new Error(errMsg);
      }

      if (status === 201 && data.status === "success") {

        // Store CAD data and trigger rendering
        dispatch({ type: "SET_CAD_MODEL_PATHS", payload: data.files });

        if (data.hover_dict) {
          dispatch({ type: "SET_HOVER_DICT", payload: data.hover_dict });
        }
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: true });

        // Execute success callback if provided
        if (onCADSuccess && typeof onCADSuccess === 'function') {
          try {
            await onCADSuccess();
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('[ModuleState] onCADSuccess callback failed:', error);
            }
          }
        }

        return { success: true, files: data.files };
      } else {
        throw new Error(`CAD generation failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[ModuleState] createCADModel ERROR:', error);
      }
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * Download CAD model in specified format
   * @param {string} format - File format (e.g., 'step', 'iges', 'stl')
   */
  const downloadCADModel = useCallback(async (format) => {
    try {
      const { success, blob, error } = await dsDownloadCad(format);
      if (!success) {
        throw new Error(error || "Failed to fetch CAD file");
      }
      return { success: true, blob };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const syncDesignPrefMaterialsFromBase = (
    baseMaterialGrade,
    materialList,
    currentDesignPrefInputs
  ) => {
    if (!baseMaterialGrade || !materialList?.length) return;

    const selectedMaterial = materialList.find(
      (mat) => mat.Grade === baseMaterialGrade
    );

    if (!selectedMaterial) return;

    const updatedInputs = {
      ...currentDesignPrefInputs,
      supporting_material: baseMaterialGrade,
      supported_material: baseMaterialGrade,
      connector_material: baseMaterialGrade,
    };

    // Dispatch updates
    manageDesignPreferences("material_update", {
      materialType: "supporting",
      materialData: selectedMaterial,
    });

    manageDesignPreferences("material_update", {
      materialType: "supported",
      materialData: selectedMaterial,
    });

    manageDesignPreferences("material_update", {
      materialType: "connector",
      materialData: selectedMaterial,
    });

    return updatedInputs;
  };

  // ===================================================================
  // 5. DESIGN PREFERENCES - Manage Design Settings
  // ===================================================================

  /**
   * Manage design preferences and material properties
   * @param {string} action - Action type ('get', 'update', 'material_update')
   * @param {Object} params - Action parameters
   */
  const manageDesignPreferences = useCallback(async (action, params = {}) => {
    try {

      switch (action) {
        case 'get': {
          const { success, data, error } = await dsFetchDesignPreferences(params);
          if (!success) {
            throw new Error(error || "Failed to fetch design preferences");
          }
          dispatch({ type: "SAVE_DESIGN_PREF_DATA", payload: data });

          return { success: true, data };
        }

        case 'material_update': {
          const { materialType, materialData } = params;

          dispatch({
            type: "SAVE_MATERIAL_DETAILS",
            payload: { materialType, materialData: [materialData] },
          });

          return { success: true, message: "Material details updated" };
        }

        case 'section_update': {
          const { id, materialValue } = params;
          const sectionType = id === 1 ? "supporting" : "supported";

          dispatch({
            type: "UPDATE_SECTION_DATA",
            payload: { sectionType, materialValue },
          });

          return { success: true, message: "Section data updated" };
        }

        default:
          throw new Error(`Unsupported preference action: ${action}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // ===================================================================
  // UTILITY FUNCTIONS
  // ===================================================================

  /**
   * Reset module state to initial values
   */
  const resetModuleState = useCallback(() => {
    dispatch({ type: "RESET_MODULE_STATE" });
  }, [dispatch]);

  const applyDesignPrefSyncBundle = useCallback((payload) => {
    dispatch({ type: "APPLY_DESIGN_PREF_SYNC_BUNDLE", payload });
  }, [dispatch]);

  const setLastKnownGoodDesignPrefSnapshot = useCallback((snapshot) => {
    dispatch({ type: "SET_LAST_KNOWN_GOOD_DESIGN_PREF_SNAPSHOT", payload: snapshot });
  }, [dispatch]);

  const applyStrictLinkedReseed = useCallback(({ material_details, metadata, snapshot }) => {
    dispatch({
      type: "APPLY_STRICT_LINKED_RESEED",
      payload: { material_details, metadata, snapshot },
    });
  }, [dispatch]);

  const invalidateDesignOutputs = useCallback(() => {
    dispatch({ type: "INVALIDATE_DESIGN_OUTPUTS" });
  }, [dispatch]);

  return (
    <ModuleContext.Provider
      value={{
        // ===================================================================
        // STATE VARIABLES (unchanged for compatibility)
        // ===================================================================
        // Common fields for all modules
        materialList: state.materialList,
        coverPlateList: state.coverPlateList,
        weldSizeList: state.weldSizeList,
        currentModuleName: state.currentModuleName,
        boltDiameterList: state.boltDiameterList,
        thicknessList: state.thicknessList,
        propertyClassList: state.propertyClassList,
        boltTypeList: state.boltTypeList,
        syncDesignPrefMaterialsFromBase,

        // Structural elements
        beamList: state.beamList,
        columnList: state.columnList,
        connectivityList: state.connectivityList,

        // Angle-specific (cleat angle, seated angle)
        angleList: state.angleList,
        topAngleList: state.topAngleList,

        // Tension member specific
        sectionProfileList: state.sectionProfileList,
        channelList: state.channelList,
        sectionDesignation: state.sectionDesignation,

        // Welded connection specific
        weldTypes: state.weldTypes,
        weldFab: state.weldFab,

        // End plate specific
        endPlateTypeList: state.endPlateTypeList,

        // Session-related state
        error_msg: state.error_msg,
        designData: state.designData,
        designLogs: state.designLogs,
        renderCadModel: state.renderCadModel,
        cadModelPaths: state.cadModelPaths,
        hoverDict: state.hoverDict,  // CAD model hover tooltip data
        displayPDF: state.displayPDF,
        blobUrl: state.blobUrl,
        designPrefData: state.designPrefData,
        lastKnownGoodDesignPrefSnapshot: state.lastKnownGoodDesignPrefSnapshot,
        designOutputsInvalidated: state.designOutputsInvalidated,
        lastStrictLinkedReseedMeta: state.lastStrictLinkedReseedMeta,
        conn_material_details: state.conn_material_details,
        supported_material_details: state.supported_material_details,
        supporting_material_details: state.supporting_material_details,
        design_pref_defaults: state.design_pref_defaults,

        // ===================================================================
        // SIMPLIFIED API - 8 CORE FUNCTIONS ONLY
        // ===================================================================

        // 1. POPULATE (3 functions)
        getModuleData,              // Universal data fetcher - replaces 12+ functions
        getConnectivityData,        // Connectivity-specific data
        manageCustomMaterials,      // Custom material operations

        // 2. CALCULATE (1 function) 
        createDesign,               // Design calculation

        // 3. CAD (2 functions)
        createCADModel,             // Generate 3D model
        downloadCADModel,           // Download CAD file

        // 5. PREFERENCES (1 function)
        manageDesignPreferences,    // Design settings and material properties
        applyDesignPrefSyncBundle,
        applyStrictLinkedReseed,
        setLastKnownGoodDesignPrefSnapshot,
        invalidateDesignOutputs,

        // UTILITY
        resetModuleState,           // Reset state
        dispatch,                   // Direct dispatch access for advanced usage
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};
