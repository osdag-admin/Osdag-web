import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleContext } from "../../../context/ModuleState";

export const useEngineeringModule = (moduleConfig) => {
  const navigate = useNavigate();
  
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
    createSession,
    createDesign,
    createDesignReport,
    getSupportedData,
    getDesingPrefData,
    deleteSession,
    resetModuleState,
  } = useContext(ModuleContext);

  // Core state management
  const [inputs, setInputs] = useState(moduleConfig.defaultInputs);
  const [output, setOutput] = useState(null);
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
    } else if (moduleConfig.cameraKey === "TensionMember") {
      return {
        selectedProfile: "Back to Back Angles",
        imageSource: moduleConfig.getSectionImage ? moduleConfig.getSectionImage("Back to Back Angles") : null,
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

  // Comprehensive reset function
  const resetToDefaultState = () => {
    console.log(`${moduleConfig.sessionName}: Starting complete reset`);

    if (resetModuleState) {
      resetModuleState();
    }

    setRenderBoolean(false);
    setModelKey(0);
    setOutput(null);
    setLogs(null);
    setDisplayOutput(false);
    setLoading(false);

    setInputs(moduleConfig.defaultInputs);
    setExtraState(getInitialExtraState());

    // Reset selection states
    setSelectionStates(
      moduleConfig.selectionConfig.reduce((acc, selection) => {
        acc[selection.key] = selection.defaultValue || "All";
        return acc;
      }, {})
    );

    setAllSelected(
      moduleConfig.selectionConfig.reduce((acc, selection) => {
        acc[selection.inputKey] = true;
        return acc;
      }, {})
    );

    // Reset modal states
    setModalStates(
      moduleConfig.modalConfig.reduce((acc, modal) => {
        acc[modal.key] = false;
        return acc;
      }, {})
    );

    setSelectedItems(
      moduleConfig.selectionConfig.reduce((acc, selection) => {
        acc[selection.inputKey] = [];
        return acc;
      }, {})
    );

    setDesignPrefModalStatus(false);
    setConfirmationModal(false);
    setDisplaySaveInputPopup(false);
    setCreateDesignReportBool(false);
    setSelectedView("Model");
    setScreenshotTrigger(false);

    console.log(`${moduleConfig.sessionName}: Complete reset finished`);
  };

  // Initialize session and navigation protection
  useEffect(() => {
    resetToDefaultState();

    setTimeout(() => {
      console.log(`${moduleConfig.sessionName}: Creating new session`);
      createSession(moduleConfig.sessionName);
    }, 100);
  }, []);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.location.pathname !== moduleConfig.routePath) {
        if (!hasUnsavedWork() || allowNavigation) {
          console.log("CLEANUP: Proceeding with session deletion");
          deleteSession(moduleConfig.sessionName);
          setTimeout(() => {
            resetToDefaultState();
          }, 50);
          setAllowNavigation(false);
        }
      }
    };
  }, [allowNavigation, moduleConfig.routePath, moduleConfig.sessionName]);

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
        const formatedOutput = {};
        
        // Both FinPlate and BeamBeamEndPlate use flat structure: { "Bolt.Diameter": { label, val } }
        for (const [key, value] of Object.entries(designData)) {
          const newKey = key;
          const label = value.label;
          const val = value.value;
          if (val !== undefined && val !== null) {
            formatedOutput[newKey] = { label, val };
          }
        }
        
        setOutput(formatedOutput);
      } catch (error) {
        console.log(error);
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

    const param = moduleConfig.buildSubmissionParams(inputs, allSelected, {
      boltDiameterList,
      propertyClassList,
      thicknessList,
      angleList,
      channelList,
    }, extraState);

    // Show loading modal
    setIsLoadingModalVisible(true);
    setLoadingStage("Generating design calculations...");

    createDesign(param, moduleConfig.designType);
    setDisplayOutput(true);
    setModelKey((prev) => prev + 1);
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
        deleteSession(moduleConfig.sessionName);
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

    let data = moduleConfig.buildSubmissionParams(inputs, allSelected, {
      boltDiameterList,
      propertyClassList,
      thicknessList,
      angleList,
      channelList,
    }, extraState);

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
    createDesignReport(designReportInputs);
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
  };
};