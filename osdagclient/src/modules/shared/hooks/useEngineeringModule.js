import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ModuleContext } from "../../../context/ModuleState";
import { isGuestUser, getCurrentUserEmail } from "../../../utils/auth";
import { message } from 'antd';
import { designAndGenerateCad } from '../api/moduleApi';

// Helper to map DB keys to internal keys
function mapDbInputKeysToInternal(dbInputs) {
  if (!dbInputs) return {};
  const keyMap = {
    "Module": "module",
    "Material": "connector_material",
    "Weld.Fab": "weld_fab",
    "Bolt.Type": "bolt_type",
    "Bolt.Grade": "bolt_grade",
    "Load.Axial": "load_axial",
    "Load.Shear": "load_shear",
    "Connectivity": "connectivity",
    "Bolt.Diameter": "bolt_diameter",
    "Detailing.Gap": "detailing_gap",
    "Bolt.Slip_Factor": "bolt_slip_factor",
    "Bolt.TensionType": "bolt_tension_type",
    "Connector.Material": "connector_material",
    "Bolt.Bolt_Hole_Type": "bolt_hole_type",
    "Detailing.Edge_type": "detailing_edge_type",
    "Design.Design_Method": "design_method",
    "Weld.Material_Grade_OverWrite": "weld_material_grade",
    "Connector.Plate.Thickness_List": "plate_thickness",
    "Detailing.Corrosive_Influences": "detailing_corr_status",
    "Member.Supported_Section.Material": "supported_material",
    "Member.Supporting_Section.Material": "supporting_material",
    "Member.Supported_Section.Designation": "beam_section",
    "Member.Supporting_Section.Designation": "column_section",
    "primary_beam": "primary_beam",
    "secondary_beam": "secondary_beam"
  };
  const mapped = {};
  for (const [k, v] of Object.entries(dbInputs)) {
    mapped[keyMap[k] || k] = v;
  }
  return mapped;
}

// Helper to map DB output keys to config keys (for output dock)
const outputKeyMap = {
  "Bolt.Grade_Provided": "Bolt.Grade",
  // Add more mappings if needed
};

function mapDbOutputToConfigKeys(dbOutput) {
  if (!dbOutput) return {};
  const mapped = {};
  Object.entries(dbOutput).forEach(([key, value]) => {
    const mappedKey = outputKeyMap[key] || key;
    mapped[mappedKey] = { ...value, key: mappedKey };
  });
  return mapped;
}

export const useEngineeringModule = (moduleConfig) => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get project name/id from URL parameter

  const {
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    channelList,
    sectionProfileList,
    designLogs,
    designData,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createDesign,
    createDesignReport,
    getSupportedData,
    getDesingPrefData,
    resetModuleState,
    // Session functions removed for multi-module support
    getBoltDiameterList,
    getModuleData,
    getThicknessList,
    getPropertyClassList,
    getConnectivityList,
    getBeamMaterialList,
    getTensionMemberAngleList,
    getTensionMemberChannelList,
  } = useContext(ModuleContext);

  // Core state management
  const [inputs, setInputs] = useState(moduleConfig.defaultInputs || {});
  const [loadedFromProject, setLoadedFromProject] = useState(false);

  // On mount: if projectId and not guest, load input values from DB
  useEffect(() => {
    if (!isGuestUser() && projectId) {
      const userEmail = getCurrentUserEmail();
      const url = `http://localhost:8000/api/projects/by-name/${encodeURIComponent(projectId)}/?user_email=${encodeURIComponent(userEmail)}`;
      fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.inputs) {
            // Merge DB inputs with defaults: DB values override defaults, but fallback to default if DB value is undefined/empty
            const mappedInputs = mapDbInputKeysToInternal(data.data.inputs);
            const mergedInputs = { ...moduleConfig.defaultInputs };
            for (const key in mappedInputs) {
              if (
                mappedInputs[key] !== undefined &&
                mappedInputs[key] !== null &&
                !(Array.isArray(mappedInputs[key]) && mappedInputs[key].length === 0) &&
                mappedInputs[key] !== ""
              ) {
                mergedInputs[key] = mappedInputs[key];
              }
            }
            setInputs(mergedInputs);
            setLoadedFromProject(true);
            message.success('Input fields loaded from saved project.');
            console.log('Loaded project input from DB:', mergedInputs);
            // Log output and logs as well
            console.log('Loaded project output from DB:', data.data.output);
            console.log('Loaded project logs from DB:', data.data.logs);
            // Map output keys before dispatching to context
            if (data.data.output && Object.keys(data.data.output).length > 0) {
              const mappedOutput = mapDbOutputToConfigKeys(data.data.output);
              dispatch({
                type: 'SET_DESIGN_DATA_AND_LOGS',
                payload: {
                  data: mappedOutput,
                  logs: data.data.logs || [],
                }
              });
              setLogs(data.data.logs || []);
              setDisplayOutput(true);
            } else {
              // If output is empty, clear output and logs
              dispatch({
                type: 'SET_DESIGN_DATA_AND_LOGS',
                payload: {
                  data: {},
                  logs: [],
                }
              });
              setLogs([]);
              setDisplayOutput(false);
            }
          } else {
            // If no data or inputs, treat as new/empty project
            dispatch({
              type: 'SET_DESIGN_DATA_AND_LOGS',
              payload: {
                data: {},
                logs: [],
              }
            });
            setLogs([]);
            setDisplayOutput(false);
          }
        })
        .catch(err => {
          console.error('Failed to load project input from DB:', err);
          // On error, clear logs/output
          dispatch({
            type: 'SET_DESIGN_DATA_AND_LOGS',
            payload: {
              data: {},
              logs: [],
            }
          });
          setLogs([]);
          setDisplayOutput(false);
        });
    } else {
      // If guest or no projectId, treat as new/empty project
      dispatch({
        type: 'SET_DESIGN_DATA_AND_LOGS',
        payload: {
          data: {},
          logs: [],
        }
      });
      setLogs([]);
      setDisplayOutput(false);
    }
  }, [projectId]);

  // Decouple logs from displayOutput: only set logs when designLogs changes
  useEffect(() => {
    setLogs(designLogs || []);
  }, [designLogs]);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);

  // Modal states
  const [modalStates, setModalStates] = useState(
    moduleConfig.modalConfig.reduce((acc, modal) => {
      acc[modal.key] = false;
      return acc;
    }, {})
  );

  // Selection states
  const [selectionStates, setSelectionStates] = useState(
    moduleConfig.selectionConfig.reduce((acc, selection) => {
      acc[selection.key] = selection.defaultValue || "All";
      return acc;
    }, {})
  );

  // All selected states
  const [allSelected, setAllSelected] = useState(
    moduleConfig.selectionConfig.reduce((acc, selection) => {
      acc[selection.inputKey] = true;
      return acc;
    }, {})
  );

  // Selected items for transfers
  const [selectedItems, setSelectedItems] = useState(
    moduleConfig.selectionConfig.reduce((acc, selection) => {
      acc[selection.inputKey] = [];
      return acc;
    }, {})
  );

  // Initialize extraState based on module type
  const getInitialExtraState = () => {
    if (moduleConfig.cameraKey === "FinPlate") {
      return {
        selectedOption: "Column Flange-Beam-Web", // Default for FinPlate
      };
    } else if (moduleConfig.cameraKey === "CleatAngle") {
      return {
        selectedOption: "Column Flange-Beam-Web", // Default for CleatAngle
      };
    } else if (moduleConfig.cameraKey === "TensionMember") {
      return {
        selectedProfile: "Back to Back Angles",
        imageSource: moduleConfig.getSectionImage ? moduleConfig.getSectionImage("Back to Back Angles") : null,
      };
    }
    if (moduleConfig.cameraKey === "EndPlate") {
      return {
        selectedOption: "Column Flange-Beam-Web", // Default for shear EndPlate
      };
    } else if (moduleConfig.cameraKey === "FlexuralMember") {
      return {
        selectedProfile: "Beams",
        imageSource: moduleConfig.getSectionImage
          ? moduleConfig.getSectionImage("Beams")
          : null,
      };
    }
    return {
      selectedOption: "Flushed - Reversible Moment", // Default for BeamBeamEndPlate
    };
  };

  const [extraState, setExtraState] = useState(getInitialExtraState());

  // Design report states
  const [createDesignReportBool, setCreateDesignReportBool] = useState(false);
  const [designReportInputs, setDesignReportInputs] = useState({
    companyName: "Your company",
    groupTeamName: "Your team",
    designer: "You",
    projectTitle: "",
    subtitle: "",
    jobNumber: "1",
    client: "Someone else",
    additionalComments: "No comments",
    companyLogo: null,
    companyLogoName: "",
  });

  // Navigation and reset states
  const [confirmationType, setConfirmationType] = useState("reset");
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [navigationSource, setNavigationSource] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  // Other states
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const [selectedView, setSelectedView] = useState("Model");
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);

  const { dispatch } = useContext(ModuleContext);
  // Helper function to check if there's unsaved work
  const hasUnsavedWork = () => {
    return !!(designData || renderBoolean);
  };

  // Project management functions
  const BASE_URL = 'http://localhost:8000/api/';

  // Navigation protection
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedWork()) {
        const message = "You have unsaved design progress. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePopState = (event) => {
      if (hasUnsavedWork() && !allowNavigation) {
        window.history.pushState(null, "", moduleConfig.routePath);
        setConfirmationType("navigation");
        setNavigationSource("back");
        setShowResetConfirmation(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [designData, renderBoolean, allowNavigation, moduleConfig.routePath]);

  // Manage history state
  useEffect(() => {
    if (hasUnsavedWork()) {
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [designData, renderBoolean]);



  // Handle design logs
  useEffect(() => {
    if (displayOutput) {
      try {
        setLogs(designLogs);
      } catch (error) {
        setLogs(null);
      }
    } else {
      setLogs(null);
    }
  }, [designLogs, displayOutput]);

  // Handle design data - Both modules use same flat structure now
  useEffect(() => {
    if (designData) {
      try {
        const formatedOutput = {};
        for (const [key, value] of Object.entries(designData)) {
          const newKey = key;
          const label = value.label;
          const val = value.value;
          if (val !== undefined && val !== null) {
            formatedOutput[newKey] = { label, val };
          }
        }
        // setOutput(formatedOutput); // REMOVE this line
      } catch (error) {
        // setOutput(null); // REMOVE this line
      }
    } else {
      // setOutput(null); // REMOVE this line
    }
  }, [designData]);

  // Handle CAD model rendering
  useEffect(() => {
    if (renderCadModel && cadModelPaths) {
      setRenderBoolean(true);
      setLoading(false);

      // Hide loading modal when model is ready
      setTimeout(() => {
        setIsLoadingModalVisible(false);
        setLoadingStage("");
      }, 500);
    } else {
      setRenderBoolean(false);
    }
  }, [renderCadModel, cadModelPaths]);

  // Get supported data when member designation changes (BeamBeamEndPlate)
  useEffect(() => {
    if (inputs.member_designation && moduleConfig.cameraKey !== "FinPlate") {
      getSupportedData({
        supported_section: inputs.member_designation,
      });
    }
  }, [inputs.member_designation]);

  // Get design preferences data for FinPlate
  useEffect(() => {
    if (moduleConfig.cameraKey === "FinPlate" && getDesingPrefData) {
      const conn_map = {
        "Column Flange-Beam-Web": "Column Flange-Beam Web",
        "Column Web-Beam-Web": "Column Web-Beam Web",
        "Beam-Beam": "Beam-Beam",
      };

      const connectivity = extraState?.selectedOption || inputs.connectivity;

      if (connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web") {
        if (inputs.column_section && inputs.beam_section) {
          getDesingPrefData({
            supported_section: inputs.beam_section,
            supporting_section: inputs.column_section,
            connectivity: conn_map[connectivity].split(" ").join("-"),
          });
        }
      } else if (connectivity === "Beam-Beam") {
        if (inputs.primary_beam && inputs.secondary_beam) {
          getDesingPrefData({
            supported_section: inputs.secondary_beam,
            supporting_section: inputs.primary_beam,
            connectivity: conn_map[connectivity],
          });
        }
      }
    }
  }, [
    inputs.column_section,
    inputs.beam_section,
    inputs.primary_beam,
    inputs.secondary_beam,
    extraState.selectedOption,
    inputs.connectivity,
  ]);

  // Auto-hide save input popup
  useEffect(() => {
    if (displaySaveInputPopup) {
      setTimeout(() => setDisplaySaveInputPopup(false), 4000);
    }
  }, [displaySaveInputPopup]);

  // After lists and inputs are loaded, set default for dropdowns if undefined/empty
  useEffect(() => {
    // Only run if not loaded from project (i.e., new project)
    if (!loadedFromProject) {
      setInputs((prev) => {
        const updated = { ...prev };
        // For bolt_diameter
        if ((!updated.bolt_diameter || updated.bolt_diameter.length === 0) && boltDiameterList && boltDiameterList.length > 0) {
          updated.bolt_diameter = [boltDiameterList[0]];
        }
        // For bolt_grade
        if ((!updated.bolt_grade || updated.bolt_grade.length === 0) && propertyClassList && propertyClassList.length > 0) {
          updated.bolt_grade = [propertyClassList[0]];
        }
        // For plate_thickness
        if ((!updated.plate_thickness || updated.plate_thickness.length === 0) && thicknessList && thicknessList.length > 0) {
          updated.plate_thickness = [thicknessList[0]];
        }
        // For connector_material
        if ((!updated.connector_material || updated.connector_material === "") && materialList && materialList.length > 0) {
          updated.connector_material = materialList[0].Grade || materialList[0];
        }
        // For beam_section
        if ((!updated.beam_section || updated.beam_section === "") && beamList && beamList.length > 0) {
          updated.beam_section = beamList[0].Designation || beamList[0];
        }
        // For column_section
        if ((!updated.column_section || updated.column_section === "") && columnList && columnList.length > 0) {
          updated.column_section = columnList[0].Designation || columnList[0];
        }
        return updated;
      });
    }
  }, [boltDiameterList, propertyClassList, thicknessList, materialList, beamList, columnList, loadedFromProject]);

  const updateModalState = (modalKey, isOpen) => {
    setModalStates((prev) => ({
      ...prev,
      [modalKey]: isOpen,
    }));
  };

  const updateSelectionState = (selectionKey, value) => {
    setSelectionStates((prev) => ({
      ...prev,
      [selectionKey]: value,
    }));
  };

  const updateSelectedItems = (inputKey, items) => {
    setSelectedItems((prev) => ({
      ...prev,
      [inputKey]: items,
    }));
    setInputs((prev) => ({
      ...prev,
      [inputKey]: items,
    }));
  };

  const toggleAllSelected = (inputKey, isAll) => {
    setAllSelected((prev) => ({
      ...prev,
      [inputKey]: isAll,
    }));
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    const validationResult = moduleConfig.validateInputs(inputs);
    if (!validationResult.isValid) {
      console.log('Validation failed:', validationResult.message);
      alert(validationResult.message);
      return;
    }

    const param = moduleConfig.buildSubmissionParams(
      inputs,
      allSelected,
      {
        boltDiameterList,
        propertyClassList,
        thicknessList,
        angleList,
        channelList,
        beamList,
        columnList,
      },
      extraState
    );

    console.log('Submitting design and CAD with params:', param);
    setIsLoadingModalVisible(true);
    setLoadingStage("Generating design calculations and CAD...");

    try {
      const result = await designAndGenerateCad(moduleConfig.designType, param, dispatch || (() => { }));
      console.log('API result:', result);
      setIsLoadingModalVisible(false);
      setLoadingStage("");
      if (result.error) {
        console.log('API error:', result.error);
        alert(result.error);
        setDisplayOutput(false);
        return;
      }
      setDisplayOutput(true);
      setModelKey((prev) => {
        const newKey = prev + 1;
        console.log('Model key incremented to:', newKey);
        return newKey;
      });

      // --- Project Update Logic ---
      if (!isGuestUser() && projectId) {
        try {
          const userEmail = getCurrentUserEmail();
          const updateUrl = `http://localhost:8000/api/projects/by-name/${encodeURIComponent(projectId)}/?user_email=${encodeURIComponent(userEmail)}`;
          const updatePayload = {
            input_values: param,
            output_values: result.design?.data || result.design || {},
            logs: result.design?.logs || [],
          };
          await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
          });
          console.log('Project updated in backend:', updatePayload);
        } catch (err) {
          console.error('Failed to update project in backend:', err);
        }
      }
      // --- End Project Update Logic ---
    } catch (error) {
      console.log('Unexpected error in handleSubmit:', error);
      setIsLoadingModalVisible(false);
      setLoadingStage("");
      alert("An unexpected error occurred. Please try again.");
    }
  };



  const handleReset = () => {
    setConfirmationType("reset");
    setShowResetConfirmation(true);
  };

  const handleHomeClick = () => {
    if (hasUnsavedWork()) {
      setConfirmationType("navigation");
      setNavigationSource("home");
      setShowResetConfirmation(true);
    } else {
      navigate("/home");
    }
  };

  const performReset = () => {
    if (confirmationType === "navigation") {
      setAllowNavigation(true);
      setShowResetConfirmation(false);
      setConfirmationType("reset");

      setTimeout(() => {
        // Removed session deletion - no longer needed for multi-module support
        // resetToDefaultState();

        if (navigationSource === "home") {
          navigate("/home");
        } else if (navigationSource === "back") {
          navigate("/design-type/connections");
        }

        setAllowNavigation(false);
        setNavigationSource(null);
      }, 100);
    } else {
      setShowResetConfirmation(false);
      setConfirmationType("reset");
    }
  };

  const saveOutput = () => {
    const validationResult = moduleConfig.validateInputs(inputs);
    if (!validationResult.isValid) {
      alert(validationResult.message);
      return;
    }

    let data = moduleConfig.buildSubmissionParams(
      inputs,
      allSelected,
      {
        boltDiameterList,
        propertyClassList,
        thicknessList,
        angleList,
        channelList,
        beamList,
        columnList,
      },
      extraState
    );

    // Add output data to the submission data
    for (const key in designData) { // Use designData directly
      if (designData.hasOwnProperty(key)) {
        const { label, val } = designData[key];
        if (label && val !== undefined && val !== null) {
          const safeLabel = label.replace(/\s+/g, "_");
          data[`${key}.${safeLabel}`] = val;
        }
      }
    }

    // Convert to CSV and download
    data = convertToCSV(data);
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "output.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const csvData = keys.map((key, index) => {
      const escapedValue = values[index].toString().replace(/"/g, '\\"');
      return `"${key}","${escapedValue}"`;
    });

    return csvData.join("\n");
  };

  const handleCreateDesignReport = () => {
    setCreateDesignReportBool(true);
  };

  const handleOkDesignReport = () => {
    if (!designData) { // Use designData directly
      alert("Please submit the design first.");
      return;
    }

    // Build the input values for the design report
    const inputValues = moduleConfig.buildSubmissionParams(
      inputs,
      allSelected,
      {
        boltDiameterList,
        propertyClassList,
        thicknessList,
        angleList,
        channelList,
      },
      extraState
    );

    // Determine the module ID based on the module config
    const moduleId = moduleConfig.designType;

    // Pass all required parameters to createDesignReport
    createDesignReport(
      designReportInputs,  // form data
      moduleId,            // module identifier
      inputValues,         // input data used for design
      true,                // design was successful (since we have output)
      logs || []           // design logs
    );

    handleCancelDesignReport();
  };

  const handleCancelDesignReport = () => {
    setDesignReportInputs({
      companyName: "Your company",
      groupTeamName: "Your team",
      designer: "You",
      projectTitle: "",
      subtitle: "",
      jobNumber: "1",
      client: "Someone else",
      additionalComments: "No comments",
      companyLogo: null,
      companyLogoName: "",
    });
    setCreateDesignReportBool(false);
  };

  return {
    // Context data
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    channelList,
    sectionProfileList,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createDesignReport,

    // State
    inputs,
    setInputs,
    // output, // REMOVE this line
    logs,
    loading,
    renderBoolean,
    modelKey,
    modalStates,
    selectionStates,
    allSelected,
    selectedItems,
    createDesignReportBool,
    setCreateDesignReportBool,
    designReportInputs,
    setDesignReportInputs,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    setDisplaySaveInputPopup,
    saveInputFileName,
    setSaveInputFileName,
    selectedView,
    setSelectedView,
    screenshotTrigger,
    setScreenshotTrigger,
    extraState,
    setExtraState,
    loadedFromProject,
    setLoadedFromProject,

    // Navigation and Reset states
    showResetConfirmation,
    setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    isLoadingModalVisible,
    setIsLoadingModalVisible,
    loadingStage,
    setLoadingStage,

    // Actions
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    handleHomeClick,
    performReset,
    saveOutput,
    handleCreateDesignReport,
    handleOkDesignReport,
    handleCancelDesignReport,
    // Add designData as output for OutputDockComponent, mapped to config keys
    output: mapDbOutputToConfigKeys(designData),
  };
};
