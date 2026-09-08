// API/business logic for module operations

import { createDesign as dsCreateDesign } from "../../../datasources/modulesDataSource";

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
      // Non-400 error
    }
    return { status, body: jsonResponse };
  } catch (error) {
    return { status: 500, body: { success: false, error: error?.message || 'Design request failed' } };
  }
};
