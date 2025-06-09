import { useState, useEffect, useContext } from "react";
import { ModuleContext } from "../../../context/ModuleState";

export const useEngineeringModule = (moduleConfig) => {
  const {
    beamList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    designLogs,
    designData,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createSession,
    createDesign,
    createDesignReport,
    getSupportedData,
    deleteSession,
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

  const [extraState, setExtraState] = useState({
    selectedOption: "Flushed - Reversible Moment", // Default for BeamBeamEndPlate
  });

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

  // Other states
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const [selectedView, setSelectedView] = useState("Model");
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);

  // Initialize session
  useEffect(() => {
    createSession(moduleConfig.sessionName);
    console.log("Session created for:", moduleConfig.sessionName);
    return () => {
      if (location.pathname !== moduleConfig.routePath) {
        deleteSession(moduleConfig.sessionName);
      }
    };
  }, []);

  // Handle design logs
  useEffect(() => {
    if (displayOutput) {
      try {
        setLogs(designLogs);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designLogs]);

  // Handle design data
  useEffect(() => {
    if (displayOutput) {
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
        setOutput(formatedOutput);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designData]);

  // Handle CAD model rendering
  useEffect(() => {
    if (renderCadModel && cadModelPaths) {
      setRenderBoolean(true);
      setLoading(false);
    } else {
      setRenderBoolean(false);
    }
  }, [renderCadModel, cadModelPaths]);

  // Get supported data when member designation changes
  useEffect(() => {
    getSupportedData({
      supported_section: inputs.member_designation,
    });
  }, [inputs.member_designation]);

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
    });

    createDesign(param, moduleConfig.designType);
    setDisplayOutput(true);
    setLoading(true);
    setModelKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setInputs(moduleConfig.defaultInputs);
    setAllSelected(
      moduleConfig.selectionConfig.reduce((acc, selection) => {
        acc[selection.inputKey] = true;
        return acc;
      }, {})
    );

    // Reset selection states
    moduleConfig.selectionConfig.forEach((selection) => {
      updateSelectionState(selection.key, "All");
    });

    setRenderBoolean(false);
    setOutput(null);
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
    });

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
    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(data);
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
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
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

    // Actions
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    saveOutput,
    handleCreateDesignReport,
    handleOkDesignReport,
    handleCancelDesignReport,
  };
};
