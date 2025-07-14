import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ModuleContext } from "../../../context/ModuleState";
import { getCurrentUserEmail } from "../../../utils/auth";

export const useEngineeringModule = (moduleConfig) => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get project ID from URL parameter

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
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);

  // Project management states
  const [projectNameLoading, setProjectNameLoading] = useState(false);
  const [projectDataLoading, setProjectDataLoading] = useState(true);
  const [projectDataLoaded, setProjectDataLoaded] = useState(false);

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

  // Helper function to check if there's unsaved work
  const hasUnsavedWork = () => {
    return !!(output || renderBoolean);
  };

  // Project management functions
  const BASE_URL = 'http://localhost:8000/api/';

  const createProject = async (projectName) => {
    try {
      setProjectNameLoading(true);
      console.log('Creating project with name:', projectName);
      console.log('Module config design type:', moduleConfig.designType);
      console.log('User email:', getCurrentUserEmail());
      
      const response = await fetch(`${BASE_URL}projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          module_id: moduleConfig.designType,
          module_name: moduleConfig.sessionName,
          user_email: getCurrentUserEmail(),
        }),
      });

      const data = await response.json();
      console.log('Project creation response:', data);
      
      if (data.success) {
        console.log('Project created successfully with ID:', data.project_id);
        return data.project_id;
      } else {
        throw new Error(data.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    } finally {
      setProjectNameLoading(false);
    }
  };

  const saveProjectData = async (projectId, inputData, outputData, logData) => {
    try {
      const userEmail = getCurrentUserEmail();
      console.log('saveProjectData called with:');
      console.log('projectId:', projectId);
      console.log('userEmail:', userEmail);
      console.log('inputData:', inputData);
      console.log('outputData:', outputData);
      console.log('logData:', logData);
      
      const requestBody = {
        input_values: inputData,
        output_values: outputData,
        logs: logData,
      };
      console.log('Request body being sent:', requestBody);
      
      const response = await fetch(`${BASE_URL}projects/${projectId}/?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response from server:', data);
      
      if (data.success) {
        console.log('Project data saved successfully');
      } else {
        throw new Error(data.error || 'Failed to save project data');
      }
    } catch (error) {
      console.error('Error saving project data:', error);
      throw error;
    }
  };

  // Function to save project when CAD generation is successful
  const saveProjectOnCADSuccess = async (outputData = null, logData = null) => {
    console.log('saveProjectOnCADSuccess called');
    console.log('currentProjectId:', projectId);
    console.log('current inputs:', inputs);
    console.log('outputData parameter:', outputData);
    console.log('logData parameter:', logData);
    
    if (!projectId) {
      console.log('Cannot save project: missing project ID');
      console.log('This might happen if the project ID was reset during initialization');
      return;
    }

    try {
      // Use provided data or current state
      const finalOutputData = outputData || output;
      const finalLogData = logData || logs;
      
      console.log('Final output data to save:', finalOutputData);
      console.log('Final log data to save:', finalLogData);
      
      // First, try to find the project by name
      const userEmail = getCurrentUserEmail();
      const findResponse = await fetch(`http://localhost:8000/api/projects/by-name/${encodeURIComponent(projectId)}/?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (findResponse.ok) {
        // Project exists, update it
        const project = await findResponse.json();
        if (project.success && project.data) {
          console.log('Updating existing project:', project.data.id);
          await saveProjectData(project.data.id, inputs, finalOutputData, finalLogData);
          console.log('Project updated successfully after CAD generation');
        }
      } else {
        // Project doesn't exist, create it
        console.log('Project not found, creating new project with name:', projectId);
        const createResponse = await fetch('http://localhost:8000/api/projects/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectId,
            module_id: moduleConfig.moduleId,
            module_name: moduleConfig.moduleName,
            user_email: getCurrentUserEmail(),
            inputs: inputs,
            output: finalOutputData,
            logs: finalLogData,
          }),
        });

        const createData = await createResponse.json();
        if (createData.success) {
          console.log('New project created successfully with ID:', createData.project_id);
        } else {
          console.error('Failed to create new project:', createData);
        }
      }
    } catch (error) {
      console.error('Error saving project after CAD generation:', error);
    }
  };


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
        console.log("BACK BUTTON: Prevented navigation due to unsaved work");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [output, renderBoolean, allowNavigation, moduleConfig.routePath]);

  // Manage history state
  useEffect(() => {
    if (hasUnsavedWork()) {
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [output, renderBoolean]);

  // Cleanup on unmount (simplified - no session deletion needed)
  useEffect(() => {
    return () => {
      if (window.location.pathname !== moduleConfig.routePath) {
        if (!hasUnsavedWork() || allowNavigation) {
          console.log("CLEANUP: Proceeding with module cleanup");
          // Removed session deletion - no longer needed
          setTimeout(() => {
            resetToDefaultState();
          }, 50);
          setAllowNavigation(false);
        }
      }
    };
  }, [allowNavigation, moduleConfig.routePath]);

  // Handle design logs
  useEffect(() => {
    if (displayOutput) {
      try {
        setLogs(designLogs);
      } catch (error) {
        console.log("Error setting logs:", error);
        setLogs(null);
      }
    } else {
      setLogs(null);
    }
  }, [designLogs, displayOutput]);

  // Handle design data - Both modules use same flat structure now
  useEffect(() => {
    if (displayOutput) {
      try {
        console.log("CleatAngle - Processing design data:", designData);
        console.log("CleatAngle - Design data keys:", Object.keys(designData || {}));
        console.log("CleatAngle - Display output:", displayOutput);
        
        const formatedOutput = {};

        // Both FinPlate and BeamBeamEndPlate use flat structure: { "Bolt.Diameter": { label, val } }
        for (const [key, value] of Object.entries(designData)) {
          const newKey = key;
          const label = value.label;
          const val = value.value;
          console.log(`CleatAngle - Processing key: ${key}, label: ${label}, val: ${val}`);
          if (val !== undefined && val !== null) {
            formatedOutput[newKey] = { label, val };
          }
        }
        setOutput(formatedOutput);
      } catch (error) {
        console.log("CleatAngle - Error processing design data:", error);
        setOutput(null);
      }
    }
  }, [designData, displayOutput]);

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
    const validationResult = moduleConfig.validateInputs(inputs);
    if (!validationResult.isValid) {
      alert(validationResult.message);
      return;
    }

    // Wait for project data loading to complete
    if (projectDataLoading) {
      console.log('Waiting for project data to load...');
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

    // Show loading modal
    setIsLoadingModalVisible(true);
    setLoadingStage("Generating design calculations...");

    try {
      // Pass the saveProjectOnCADSuccess callback to createDesign
      const response = await createDesign(param, moduleConfig.designType, saveProjectOnCADSuccess);
      console.log(" createDesign response:", response);

    setDisplayOutput(true);
    setModelKey((prev) => prev + 1);

      // Project will be saved when CAD generation is successful
      // (handled by the saveProjectOnCADSuccess callback)
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
      console.log(`USER CONFIRMED NAVIGATION - source: ${navigationSource}`);

      setAllowNavigation(true);
      setShowResetConfirmation(false);
      setConfirmationType("reset");

      setTimeout(() => {
        // Removed session deletion - no longer needed for multi-module support
        resetToDefaultState();

        if (navigationSource === "home") {
          console.log("Navigating to home");
          navigate("/home");
        } else if (navigationSource === "back") {
          console.log("Navigating to connections page");
          navigate("/design-type/connections");
        }

        setAllowNavigation(false);
        setNavigationSource(null);
      }, 100);
    } else {
      console.log("USER CONFIRMED RESET - starting targeted reset");
      resetToDefaultState();
      setShowResetConfirmation(false);
      setConfirmationType("reset");
      console.log("RESET: User confirmed - targeted reset completed");
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
    for (const key in output) {
      if (output.hasOwnProperty(key)) {
        const { label, val } = output[key];
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
    if (!output) {
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
    output,
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

    // Project management states
    // currentProjectId, // This line is removed
    projectNameLoading,
    projectDataLoading,
    projectDataLoaded,

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

    // Project management actions
    createProject,
    saveProjectData,
    // loadProjectData, // This line is removed

    // New actions
    saveProjectOnCADSuccess,
  };
};
