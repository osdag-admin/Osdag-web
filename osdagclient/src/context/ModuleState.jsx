import { createContext, useReducer, useState } from "react";
import ModuleReducer from "./ModuleReducer";

// crypto packages
import { decode as base64_decode, encode as base64_encode } from "base-64";

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
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
  
  // Structural elements
  beamList: [],
  columnList: [],
  connectivityList: [],
  
  // Angle-specific (cleat angle, seated angle)
  angleList: [],
  topAngleList: [],
  
  // Tension member specific
  sectionProfileList: [],
  channelList: [],
  
  // Welded connection specific
  weldTypes: [],
  weldFab: [],
  
  // End plate specific
  endPlateTypeList: [],
  
  // Session variables removed for multi-module support
  designLogs: [],
  designData: {},
  renderCadModel: false,
  cadModelPaths: {}, //stores cad files path
  displayPDF: false,
  report_id: "",
  blobUrl: "",
  designPrefData: {},
  conn_material_details: [],
  supported_material_details: [],
  supporting_material_details: [],
  design_pref_defaults: {
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    connector_material: "E 250 (Fe 410 W)A",
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

const BASE_URL = "http://127.0.0.1:8000/";

//create context
export const ModuleContext = createContext(initialValue);

//provider component
export const ModuleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ModuleReducer, initialValue);
  const [projectSaveCallback, setProjectSaveCallback] = useState(null);

  // Session functions removed for multi-module support
  // actions
  const getConnectivityList = async (moduleName) => {
    try {
      dispatch({ type: "SET_CURRENT_MODULE_NAME", payload: moduleName });
      const response = await fetch(
        `${BASE_URL}populate?moduleName=${moduleName}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
      const jsonResponse = await response?.json();
      console.log("connectivityList", jsonResponse);
      const data = jsonResponse.connectivityList;
      // dispatch the action to set the connectivityList
      dispatch({ type: "SET_CONNECTIVITY_LIST", payload: data });
      state.connectivityListObtained = true;
    } catch (error) {
      dispatch({ type: "SET_ERR_MSG_LEAF", payload: "" });
      console.log("error", error);
    }
  };

  const getColumnBeamMaterialList = async (
    moduleName,
    connectivity,
    cmat,
    update = false,
    type
  ) => {
    console.log("getColumnBeamMaterialList called with:", {
      moduleName,
      connectivity,
      cmat,
      update,
      type,
    });

    try {
      
      console.log("GETTING COLUMN BEAM MATERIALS", moduleName);
      const email = localStorage.getItem("email");
      console.log("Using email:", email);

      const url = `${BASE_URL}populate?moduleName=${state.currentModuleName}&connectivity=${connectivity}&email=${email}`;
      console.log("Making request to:", url);
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      console.log("Got response status:", response.status);

      const jsonResponse = await response?.json();
      console.log("Response data:", jsonResponse);
      if (update) {
        console.log("Updating with material:", cmat);
        const mList = jsonResponse.materialList;
        const mat = mList.filter((item) => item.Grade === cmat);
        console.log("Filtered materials:", mat);

        if (type === "connector") {
          console.log("Saving connector material details");
          dispatch({ type: "SAVE_CM_DETAILS", payload: mat });
        } else if (type === "supported") {
          console.log("Saving supported material details");
          dispatch({ type: "SAVE_SDM_DETAILS", payload: mat });
        } else if (type === "supporting") {
          console.log("Saving supporting material details");
          dispatch({ type: "SAVE_STM_DETAILS", payload: mat });
        }
      }

      if (connectivity !== "Beam-Beam") {
        console.log("Dispatching column-beam material list");
        dispatch({
          type: "SET_COLUMN_BEAM_MATERIAL_LIST",
          payload: jsonResponse,
        });
      } else if (connectivity === "Beam-Beam") {
        console.log("Dispatching beam material list");
        dispatch({ type: "SET_BEAM_MATERIAL_LIST", payload: jsonResponse });
      }
    } catch (error) {
      console.log("Error in getColumnBeamMaterialList:", error);
      dispatch({ type: "SET_ERR_MSG_COLUMN_BEAM_MATERIAL", payload: "" });
    }
  };

  const getColumnBeamMaterialList2 = async (
    moduleName,
    connectivity,
    cmat,
    update = false,
    type
  ) => {
    console.log("getColumnBeamMaterialList called with:", {
      moduleName,
      connectivity,
      cmat,
      update,
      type,
    });

    try {
      console.log("GETTING COLUMN BEAM MATERIALS", moduleName);
      const email = localStorage.getItem("email");
      console.log("Using email:", email);

      const url = `${BASE_URL}populate?moduleName=${state.currentModuleName}&connectivity=${connectivity}&email=${email}`;
      console.log("Making request to:", url);

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      console.log("Got response status:", response.status);

      const jsonResponse = await response?.json();
      console.log("Response data:", jsonResponse);

      console.log("Dispatching column-beam material list");
      dispatch({
        type: "SET_COLUMN_BEAM_MATERIAL_LIST",
        payload: jsonResponse,
      });
    } catch (error) {
      console.log("Error in getColumnBeamMaterialList:", error);
      dispatch({ type: "SET_ERR_MSG_COLUMN_BEAM_MATERIAL", payload: "" });
    }
  };

  const getBeamMaterialList = async (
    moduleName,
    cmat,
    update = false,
    type
  ) => {
    dispatch({ type: "SET_CURRENT_MODULE_NAME", payload: moduleName });
    try {
      console.log("GETTING BEAM MATERIALS ", moduleName);
      const email = localStorage.getItem("email");
      // Build the URL with or without email if present
      let url = `${BASE_URL}populate?moduleName=${moduleName}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }
      const response = await fetch(
        url,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
      console.log("url : ", url);
      console.log("response : ", response);
      const jsonResponse = await response?.json();
      
      // diaptch the action

      console.log("BEAM MATERIAL LIST", jsonResponse);
      if (update) {
        const mList = jsonResponse.materialList;
        const mat = mList.filter((item) => item.Grade === cmat);
        if (type === "connector")
          dispatch({ type: "SAVE_CM_DETAILS", payload: mat });
        else if (type === "supported")
          dispatch({ type: "SAVE_SDM_DETAILS", payload: mat });
      }
      dispatch({ type: "SET_BEAM_MATERIAL_LIST", payload: jsonResponse });
    } catch (error) {
      dispatch({ type: "SET_ERR_MSG_COLUMN_BEAM_MATERIAL", payload: "" });
      console.log("error : ", error);
    }
  };

  const getBeamMaterialList2 = async (
    moduleName,
    cmat,
    update = false,
    type
  ) => {
    //console.log("here");

          try {
        console.log("GETTING LIST FOR :", moduleName);
        dispatch({ type: "SET_CURRENT_MODULE_NAME", payload: moduleName });
        const email = localStorage.getItem("email");
      const response = await fetch(
        `${BASE_URL}populate?moduleName=${moduleName}&email=${email}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
      const jsonResponse = await response?.json();
      console.log("BEAM WELDED details", jsonResponse);

      if (update) {
        const mList = jsonResponse.materialList;
        const mat = mList.filter((item) => item.Grade === cmat);

        if (type === "connector")
          dispatch({ type: "SAVE_CM_DETAILS", payload: mat });
        else if (type === "supported")
          dispatch({ type: "SAVE_SDM_DETAILS", payload: mat });
      }

      dispatch({
        type: "SET_COLUMN_BEAM_MATERIAL_LIST",
        payload: jsonResponse,
      });
    } catch (error) {
      dispatch({ type: "SET_ERR_MSG_COLUMN_BEAM_MATERIAL", payload: "" });
      console.log("error : ", error);
    }
  };

  const addCustomMaterialToDB = async (grade, inputs, connectivity, type) => {
    try {
      const email = localStorage.getItem("email");
      const res = await fetch(`http://127.0.0.1:8000/materialDetails/`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          materialName: grade,
          fy_20: parseInt(inputs.fy_20),
          fy_20_40: parseInt(inputs.fy_20_40),
          fy_40: parseInt(inputs.fy_40),
          fu: parseInt(inputs.fu),
        }),
      });
      const data = await res?.json();
      if (connectivity) {
        await getColumnBeamMaterialList(
          state.currentModuleName,
          connectivity,
          grade,
          true,
          type
        );
      }

      await getBeamMaterialList(state.currentModuleName, grade, true, type);

      //console.log(state.materialList)
      /*if(param.type === 'connector')
                dispatch({type: 'SAVE_CM_DETAILS', payload: [{
                    Elongation: null,
                    Grade: grade,
                    Ultimate_Tensile_Stress: inputs.fu,
                    Yield_Stress_between_20_and_neg40: inputs.fy_20_40,
                    Yield_Stress_greater_than_40: inputs.fy_40,
                    Yield_Stress_less_than_20: inputs.fu,
                    id: 169
                }]})
            else if(param.type === 'supported')
                dispatch({type: 'SAVE_SDM_DETAILS', payload: [param.data]})
            else if(param.type === 'supporting')
                dispatch({type: 'SAVE_STM_DETAILS', payload: [param.data]})*/

      return { success: true, message: "Material added successfuly" };
    } catch (error) {
      return { message: error };
    }
  };

  const updateMaterialListFromCaches = () => {
    const data = JSON.parse(localStorage.getItem("osdag-custom-materials"));
    console.log(data);
    if (data && data.length > 0) {
      console.log(data);
      dispatch({ type: "UPDATE_MATERIAL_FROM_CACHES", payload: data });
    }
  };

  // Simplified: One API call to get ALL module data
  const getModuleData = async (moduleName) => {
    try {
      console.log("CleatAngle - getModuleData called with moduleName:", moduleName);
      
      if (!moduleName) {
        console.error("No module name provided for getModuleData");
        return;
      }

      const email = localStorage.getItem("email");
      let url = `${BASE_URL}populate?moduleName=${moduleName}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }

      console.log("CleatAngle - Making request to URL:", url);

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        console.error(`Failed to fetch module data: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log("CleatAngle - Received data from API:", data);
      console.log("CleatAngle - ConnectivityList in response:", data.connectivityList);
     
      dispatch({ type: "SET_ALL_MODULE_DATA", payload: data });
      console.log("CleatAngle - Dispatched SET_ALL_MODULE_DATA");

    } catch (error) {
      console.error("Error loading module data:", error);
    }
  };

  // Legacy functions for backward compatibility (simplified to use getModuleData)
  const getBoltDiameterList = async (moduleName) => {
    await getModuleData(moduleName);
  };

  const getThicknessList = async (moduleName) => {
    await getModuleData(moduleName);
  };

  const getPropertyClassList = async (moduleName) => {
    await getModuleData(moduleName);
  };

  const getCleatAngleList = async () => {
    await getModuleData(state.currentModuleName);
  };

  const gettopAngleList = async () => {
    await getModuleData(state.currentModuleName);
  };

  const getTensionMemberAngleList = async () => {
    await getModuleData(state.currentModuleName);
  };

  const getTensionMemberChannelList = async () => {
    await getModuleData(state.currentModuleName);
  };

  const resetModuleState = () => {
    dispatch({ type: "RESET_MODULE_STATE" });
  };

  const createCADModel = async (inputData, moduleId, onCADSuccess = null) => {
    try {
      console.log("Creating CAD model with input data:", inputData);
      console.log("Module ID:", moduleId);
      console.log("CAD Success callback provided:", !!onCADSuccess);
      console.log("CAD Success callback type:", typeof onCADSuccess);
      
      // CAD generation now accepts POST with input data and module ID
      const response = await fetch(`${BASE_URL}design/cad`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_id: moduleId,
          input_values: inputData
        }),
      });

      if (!response.ok) {
        console.error("CAD generation failed:", response.status);
        const errorText = await response.text();
        console.error("CAD error details:", errorText);
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
        return;
      }

      const data = await response.json();
      console.log("CAD response status:", response.status);
      console.log("CAD response data status:", data.status);

      if (response.status === 201 && data.status === "success") {
        console.log("CAD Model Generated Successfully:", data.files);

        // Store CAD `.obj` data instead of file paths
        dispatch({ type: "SET_CAD_MODEL_PATHS", payload: data.files });

        // Trigger rendering in modules
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: true });
        
        // Call the success callback to save project data
        if (onCADSuccess && typeof onCADSuccess === 'function') {
          console.log("Calling CAD success callback to save project data");
          try {
            await onCADSuccess();
            console.log("CAD success callback executed successfully");
          } catch (error) {
            console.error("Error in CAD success callback:", error);
          }
        } else {
          console.log("No CAD success callback provided or not a function");
        }
      } else {
        console.error("CAD generation failed:", data);
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      }
    } catch (error) {
      console.error("Error in createCADModel:", error);
      dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
    }
  };

  const downloadCADModel = async (format) => {
    console.log("inside downloadCADModel thunk");

    const section = "Model"; // Always Model section

    try {
      const response = await fetch(`${BASE_URL}design/downloadCad/`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: format,
          section: section,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch CAD file.");
        return null;
      }

      const blob = await response.blob();
      return blob; // Return the blob here
    } catch (error) {
      console.error("Error downloading CAD model:", error);
      return null;
    }
  };

  const createDesign = async (param, module_id, onCADSuccess = null) => {
    try {
      console.log("CleatAngle - Creating design with params:", param);
      console.log("CleatAngle - Module ID:", module_id);
      console.log("CleatAngle - Material key in params:", param.Material);
      console.log("CleatAngle - All param keys:", Object.keys(param));
      
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
      
      console.log("CleatAngle - Response status:", response.status);
      const jsonResponse = await response?.json();
      console.log("CleatAngle - modulestate jsonResponse:", jsonResponse);
      console.log("CleatAngle - Response data keys:", Object.keys(jsonResponse?.data || {}));
      console.log("CleatAngle - Response data:", jsonResponse?.data);
      console.log("CleatAngle - Response logs:", jsonResponse?.logs);
      
      dispatch({ type: "SET_DESIGN_DATA_AND_LOGS", payload: jsonResponse });
      
      if (response.status == 201) {
        // Only attempt CAD generation if we have valid output
        if (jsonResponse?.data && Object.keys(jsonResponse.data).length > 0) {
          console.log("CleatAngle - Valid output found, attempting CAD generation");
          try {
            // Pass the output and logs data directly to the CAD callback
            const cadCallbackWithData = () => {
              if (onCADSuccess && typeof onCADSuccess === 'function') {
                // Pass the current output and logs data to the callback
                onCADSuccess(jsonResponse.data, jsonResponse.logs);
              }
            };
            createCADModel(param, module_id, cadCallbackWithData);
          } catch (error) {
            console.log("CleatAngle - Error in creating the CAD model from createDesign:", error);
          }
        } else {
          console.log("CleatAngle - No valid output found, skipping CAD generation");
        }
      } else if (response.status == 400) {
        console.log("CleatAngle - BAD input values", response);
        // set the render CAD to false to display the default image only
        dispatch({ type: "SET_RENDER_CAD_MODEL_BOOLEAN", payload: false });
      }
    } catch (error) {
      console.log("CleatAngle - Error in creating the design:", error);
    }
  };

  const getDesingPrefData = async (param) => {
    try {
      const response = await fetch(
        `${BASE_URL}design-preferences/?supported_section=${param.supported_section}&supporting_section=${param.supporting_section}&connectivity=${param.connectivity}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
      const data = await response?.json();
      dispatch({ type: "SAVE_DESIGN_PREF_DATA", payload: data });
    } catch (error) {
      //console.log(error)
      console.log("Something went wrong");
    }
  };

  const getSupportedData = async (param) => {
    try {
      const response = await fetch(
        `${BASE_URL}design-preferences/?supported_section=${param.supported_section}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
      const data = await response?.json();
      dispatch({ type: "SAVE_DESIGN_PREF_DATA", payload: data });
    } catch (error) {
      //console.log(error)
      console.log("Something went wrong");
    }
  };

  const getMaterialDetails = async (param) => {
    console.log("PARAM: ", param);
    if (param.type === "connector")
      dispatch({ type: "SAVE_CM_DETAILS", payload: [param.data] });
    else if (param.type === "supported")
      dispatch({ type: "SAVE_SDM_DETAILS", payload: [param.data] });
    else if (param.type === "supporting")
      dispatch({ type: "SAVE_STM_DETAILS", payload: [param.data] });

    return;
  };

  const getPDF = async (obj) => {
    try {
      fetch(`${BASE_URL}getPDF?report_id=${obj.report_id}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache", // Disable caching
          Pragma: "no-cache", // For older browsers
        },
      }).then((response) => {
        if (response.ok) {
          const link = document.createElement("a");
          link.href = response.url;
          link.setAttribute("download", "your_file_name.pdf");
          link.click();
          link.remove();
        } else {
          console.error(
            "Error in obtaining the PDF file:",
            response.status,
            response.statusText
          );
        }
      });
    } catch (error) {
      console.log("Error in obtaining the PDF file from catch:", error);
    }
  };

  const fetchCompanyLogo = async (companyLogo, companyLogoName) => {
    console.log("companyLogo : ", companyLogo);
    console.log("companyLogoName : ", companyLogoName);

    //base64 encode the companylogo and the ocmpanylogoname and store it in localStorage
    // stringify the object before storing
    if (
      !localStorage.getItem("companyLogo") &&
      !localStorage.getItem("companyLogoName") &&
      companyLogo &&
      companyLogoName
    ) {
      let companyLogoArr = [base64_encode(companyLogo)];
      localStorage.setItem("companyLogo", JSON.stringify(companyLogoArr));
      let companyLogoNameArr = [base64_encode(companyLogoName)];
      localStorage.setItem(
        "companyLogoName",
        JSON.stringify(companyLogoNameArr)
      );
      console.log(
        "1 companyLogo and companyLogoName stored in the localStorage"
      );
    } else if (
      localStorage.getItem("companyLogo") &&
      localStorage.getItem("companyLogoName") &&
      companyLogo &&
      companyLogoName
    ) {
      let companyLogoArr = localStorage.getItem("companyLogo");
      companyLogoArr = JSON.parse(companyLogoArr);
      companyLogoArr.push(base64_encode(companyLogo));
      localStorage.setItem("companyLogo", JSON.stringify(companyLogoArr));

      let companyLogoNameArr = localStorage.getItem("companyLogoName");
      companyLogoNameArr = JSON.parse(companyLogoNameArr);
      companyLogoNameArr.push(base64_encode(companyLogoName));
      localStorage.setItem(
        "companyLogoName",
        JSON.stringify(companyLogoNameArr)
      );
      console.log(
        "1 companyLogo and companyLogoName stored in the localStorage"
      );
    }

    // creting a formData and appending the image in the formData
    let formData = new FormData();
    formData.append("file", companyLogo, companyLogoName);
    console.log("final formData ; ", formData);
    try {
      const response = await fetch(`${BASE_URL}company-logo/`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: formData,
      });

      if (response?.status == 201) {
        const jsonResponse = await response?.json();
        // return the logogFullPath
        return jsonResponse.logoFullPath;
      } else {
        console.log("response.status !=201, there is some error");
      }
    } catch (err) {
      console.log("There was an error in fetching the company Logo");
    }
  };

  const createDesignReport = async (params, moduleId = null, inputValues = null, designStatus = true, logs = []) => {
    console.log("params  : ", params);
    console.log("moduleId  : ", moduleId);
    console.log("inputValues  : ", inputValues);
    console.log("designStatus  : ", designStatus);
    console.log("logs  : ", logs);

    // store the companyLogo in the server fileSystem
    const logoFullPath = params.companyLogo
      ? await fetchCompanyLogo(params.companyLogo, params.companyLogoName)
      : "";
    console.log("fileName received : ", logoFullPath);

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
      console.log("jsonresponse : ", jsonResponse);
      if (response.status == 201) {
        // obtain the report_id and fetch the pdf file
        getPDF({ report_id: jsonResponse.report_id });
      } else {
        console.log("response.status!=201 in createDesignReport, erorr");
      }
    } catch (error) {
      console.log("error : ", error);
    }
  };

  const saveCSV = async () => {
    try {
      const response = await fetch(`${BASE_URL}save-csv`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      const jsonResponse = await response?.json();
      console.log("jsonResponse : ", jsonResponse);
    } catch (error) {
      console.log("error : ", error);
    }
  };

  const updateSourceAndMechType = (id, materialValue) => {
    if (id === 1) {
      dispatch({ type: "UPDATE_SUPPORTING_ST_DATA", payload: materialValue });
    } else if (id === 2) {
      dispatch({ type: "UPDATE_SUPPORTED_ST_DATA", payload: materialValue });
    }
  };

  return (
    <ModuleContext.Provider
      value={{
        // State variables
        // Common fields for all modules
        materialList: state.materialList,
        currentModuleName: state.currentModuleName,
        boltDiameterList: state.boltDiameterList,
        thicknessList: state.thicknessList,
        propertyClassList: state.propertyClassList,
        
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
        
        // Welded connection specific
        weldTypes: state.weldTypes,
        weldFab: state.weldFab,
        
        // End plate specific
        endPlateTypeList: state.endPlateTypeList,
        // Session-related state removed for multi-module support
        error_msg: state.error_msg,
        designData: state.designData,
        designLogs: state.designLogs,
        renderCadModel: state.renderCadModel,
        cadModelPaths: state.cadModelPaths,
        displayPDF: state.displayPDF,
        blobUrl: state.blobUrl,
        designPrefData: state.designPrefData,
        conn_material_details: state.conn_material_details,
        supported_material_details: state.supported_material_details,
        supporting_material_details: state.supporting_material_details,
        design_pref_defaults: state.design_pref_defaults,

        // Session functions removed for multi-module support

        // Thunks
        getConnectivityList,
        getBeamMaterialList,
        getColumnBeamMaterialList,
        getModuleData,
        getThicknessList,
        getBoltDiameterList,
        getPropertyClassList,
        createCADModel,
        createDesign,
        getDesingPrefData,
        getSupportedData,
        updateSourceAndMechType,
        getMaterialDetails,
        updateMaterialListFromCaches,
        addCustomMaterialToDB,
        downloadCADModel,
        resetModuleState,
        getTensionMemberAngleList,
        getTensionMemberChannelList,
        createDesignReport,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};
