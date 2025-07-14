// API/business logic for module operations

export const BASE_URL = "http://127.0.0.1:8000/";

export const createDesign = async (param, module_id, onCADSuccess = null, dispatch) => {
  try {
    console.log("param", param);
    const response = await fetch(`${BASE_URL}calculate-output/${module_id}`, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(param),
    });
    const jsonResponse = await response?.json();
    dispatch && dispatch({ type: "SET_DESIGN_DATA_AND_LOGS", payload: jsonResponse });
    if (response.status == 201 && jsonResponse?.data && Object.keys(jsonResponse.data).length > 0) {
      if (onCADSuccess && typeof onCADSuccess === 'function') {
        onCADSuccess(jsonResponse.data, jsonResponse.logs);
      }
    } else if (response.status == 400) {
      dispatch && dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
    }
  } catch (error) {
    console.log("Error in creating the design:", error);
  }
};

export const createDesignReport = async (params, moduleId = null, inputValues = null, designStatus = true, logs = [], fetchCompanyLogo, getPDF) => {
  const logoFullPath = params.companyLogo
    ? await fetchCompanyLogo(params.companyLogo, params.companyLogoName)
    : "";
  try {
    const response = await fetch(`${BASE_URL}generate-report`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        metadata: {
          ProfileSummary: {
            CompanyName: params.companyName,
            CompanyLogo: logoFullPath ? logoFullPath : "",
            "Group/TeamName": params.groupTeamName,
            Designer: params.designer,
          },
          ProjectTitle: params.projectTitle,
          Subtitle: params.subtitle,
          JobNumber: params.jobNumber,
          AdditionalComments: params.additionalComments,
          Client: params.client,
        },
        module_id: moduleId,
        input_values: inputValues,
        design_status: designStatus,
        logs: logs,
      }),
    });
    const jsonResponse = await response?.json();
    if (response.status == 201) {
      getPDF && getPDF({ report_id: jsonResponse.report_id });
    }
  } catch (error) {
    console.log("error : ", error);
  }
};

export const getModuleData = async (moduleName) => {
  // ...implementation
};

export const getDesingPrefData = async (params) => {
  // ...implementation
};

export const populateModule = async (moduleKey, dispatch) => {
  const response = await fetch(`${BASE_URL}populate?moduleName=${moduleKey}`, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  dispatch({ type: "SET_ALL_MODULE_DATA", payload: data });
};

export const designAndGenerateCad = async (moduleKey, inputParams, dispatch) => {
  let error = null;
  const designRes = await fetch(`${BASE_URL}calculate-output/${moduleKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputParams),
    credentials: "include"
  });
  const designData = await designRes.json();
  console.log("[designAndGenerateCad] API designData response:", designData);
  // Always dispatch with { data, logs } structure
  const payload = {
    data: designData.data || designData,
    logs: designData.logs || []
  };
  console.log("[designAndGenerateCad] Dispatching SET_DESIGN_DATA_AND_LOGS with payload:", payload);
  dispatch({
    type: "SET_DESIGN_DATA_AND_LOGS",
    payload
  });
  if (designRes.status === 201 && (designData.data || designData)) {
    const cadRes = await fetch(`${BASE_URL}design/cad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleKey, input_values: inputParams }),
      credentials: "include"
    });
    const cadData = await cadRes.json();
    console.log("[designAndGenerateCad] CAD API response:", cadData);
    if (cadRes.status === 201 && cadData.status === "success") {
      dispatch({ type: "SET_CAD_MODEL_PATHS", payload: cadData.files });
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: true });
      console.log("[designAndGenerateCad] Returning:", { design: designData, cad: cadData, error: null });
      return { design: designData, cad: cadData, error: null };
    } else {
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      error = cadData?.message || "CAD generation failed.";
      console.log("[designAndGenerateCad] CAD error, returning:", { design: designData, cad: null, error });
      return { design: designData, cad: null, error };
    }
  } else {
    dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
    error = designData?.message || "Design calculation failed.";
    console.log("[designAndGenerateCad] Design error, returning:", { design: null, cad: null, error });
    return { design: null, cad: null, error };
  }
}; 