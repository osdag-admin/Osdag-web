// API/business logic for module operations

// export const BASE_URL = "http://127.0.0.1:8000/";
import { getModuleSlug } from "../../../constants/apiRoutes";
import { createDesign as dsCreateDesign, createCad as dsCreateCad } from "../../../datasources/modulesDataSource";

export const createDesign = async (param, module_id, onCADSuccess = null, dispatch) => {
  try {
    const { status, body: jsonResponse } = await dsCreateDesign(module_id, param);

    if (dispatch) {
      dispatch({ type: "SET_DESIGN_DATA_AND_LOGS", payload: jsonResponse });
    }

    const hasData = jsonResponse?.data && Object.keys(jsonResponse.data || {}).length > 0;
    const isSuccess = status >= 200 && status < 300 && jsonResponse?.success !== false && (hasData || Array.isArray(jsonResponse));

    if (isSuccess) {
      if (onCADSuccess && typeof onCADSuccess === 'function') {
        onCADSuccess(jsonResponse.data, jsonResponse.logs);
      }
    } else if (status === 400) {
      dispatch && dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
    } else {
    }
    return { status, body: jsonResponse };
  } catch (error) {
    return { status: 500, body: { success: false, error: error?.message || 'Design request failed' } };
  }
};

export const getModuleData = async (moduleName) => {
  // ...implementation
};

export const getDesingPrefData = async (params) => {
  // ...implementation
};

export const populateModule = async (moduleKey, dispatch) => {
  const slug = getModuleSlug(moduleKey);
  const email = localStorage.getItem("email");
  const url = `${BASE_URL}api/modules/${slug}/options/${email ? `?email=${encodeURIComponent(email)}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  dispatch({ type: "SET_ALL_MODULE_DATA", payload: data });
};

export const designAndGenerateCad = async (moduleKey, inputParams, dispatch) => {
  let error = null;
  const { status: designStatus, body: designData } = await dsCreateDesign(moduleKey, inputParams);
  // Always dispatch with { data, logs } structure
  const payload = {
    data: designData.data || designData,
    logs: designData.logs || []
  };
  dispatch({
    type: "SET_DESIGN_DATA_AND_LOGS",
    payload
  });
  if (designStatus === 201 && (designData.data || designData)) {
    const { status: cadStatus, data: cadData } = await dsCreateCad(moduleKey, inputParams);
    // CAD-specific: simple alert on 500
    if (cadStatus === 500) {
      let message = "Server error (500)";
      // eslint-disable-next-line no-alert
      alert(message);
      return { design: designData, cad: null, error: message };
    }
    
    // Log the API response to debug hover_dict
    console.log('=== [moduleApi] CAD API Response ===');
    console.log('[moduleApi] Response status:', cadStatus);
    console.log('[moduleApi] Response data keys:', Object.keys(cadData));
    console.log('[moduleApi] cadData.hover_dict:', cadData.hover_dict);
    console.log('[moduleApi] cadData.hover_dict type:', typeof cadData.hover_dict);
    if (cadData.hover_dict && typeof cadData.hover_dict === 'object') {
      console.log('[moduleApi] hover_dict keys:', Object.keys(cadData.hover_dict));
      console.log('[moduleApi] hover_dict entries:', Object.entries(cadData.hover_dict));
      console.log('[moduleApi] hover_dict JSON:', JSON.stringify(cadData.hover_dict, null, 2));
    }
    
    if (cadStatus === 201 && cadData.status === "success") {
      dispatch({ type: "SET_CAD_MODEL_PATHS", payload: cadData.files });
      
      // Log before dispatching hover_dict
      console.log('[moduleApi] Before dispatch - cadData.hover_dict:', cadData.hover_dict);
      if (cadData.hover_dict) {
        console.log('[moduleApi] Dispatching SET_HOVER_DICT with:', cadData.hover_dict);
        dispatch({ type: "SET_HOVER_DICT", payload: cadData.hover_dict });
      } else {
        console.warn('[moduleApi] cadData.hover_dict is missing or empty!');
      }
      
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: true });
      return { design: designData, cad: cadData, error: null };
    } else if (cadStatus === 200 && cadData.status === "coming_soon") {
      // Handle "coming soon" status gracefully
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      // Don't show error, just return with coming_soon status
      return { design: designData, cad: { status: "coming_soon", message: cadData.message }, error: null };
    } else {
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      error = cadData?.message || "CAD generation failed.";
      return { design: designData, cad: null, error };
    }
  } else {
    dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
    error = designData?.message || "Design calculation failed.";
    return { design: null, cad: null, error };
  }
}; 
