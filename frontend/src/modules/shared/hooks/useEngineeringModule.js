import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleContext } from "../../../context/ModuleState";
import { useEngineeringService } from "./useEngineeringService";
import { useModuleData } from "./useModuleData";
import { useModuleForm } from "./useModuleForm";
import { useDesignSubmission } from "./useDesignSubmission";
import { useNavigationGuard } from "./useNavigationGuard";
import { useDependentData } from "./useDependentData";
import { useDesignReport } from "./useDesignReport";

/**
 * useEngineeringModule Hook
 * 
 * Manages business logic and state for engineering module workflows.
 * Provides a clean API for EngineeringModule component.
 * 
 * This hook encapsulates:
 * - Module data loading and state management
 * - Design calculation and CAD generation flow
 * - Input/output state synchronization
 * - Navigation protection and reset logic
 * - Modal and selection state management
 * 
 * @param {Object} moduleConfig - Module configuration object
 * @param {string} moduleConfig.designType - Module identifier (e.g., 'FinPlateConnection')
 * @param {string} moduleConfig.cameraKey - Camera/view key for module
 * @param {Object} moduleConfig.defaultInputs - Default input values
 * @param {Array} moduleConfig.modalConfig - Modal configuration array
 * @param {Array} moduleConfig.selectionConfig - Selection configuration array
 * @param {Function} moduleConfig.validateInputs - Input validation function
 * @param {Function} moduleConfig.buildSubmissionParams - Parameter building function
 * @param {string} moduleConfig.routePath - Route path for navigation
 * 
 * @returns {Object} State and action functions
 * @returns {Array} returns.beamList - List of beam sections
 * @returns {Array} returns.columnList - List of column sections
 * @returns {Array} returns.materialList - List of materials
 * @returns {Array} returns.boltDiameterList - List of bolt diameters
 * @returns {Object} returns.inputs - Current input values
 * @returns {Function} returns.setInputs - Update input values
 * @returns {Object} returns.output - Design output data
 * @returns {Array} returns.logs - Design calculation logs
 * @returns {boolean} returns.loading - Loading state
 * @returns {Function} returns.handleSubmit - Submit design calculation
 * @returns {Function} returns.handleReset - Reset module state
 * @returns {Object} returns.service - Engineering service API
 */
export const useEngineeringModule = (moduleConfig) => {
  const navigate = useNavigate();
  const service = useEngineeringService();
  const { getModuleData, getDesignPreferences } = service;
  
  // Access ModuleContext to get resetModuleState function
  const { resetModuleState } = useContext(ModuleContext);

  // ===================================================================
  // MODULE DATA - Loaded via dedicated hook
  // ===================================================================
  const moduleData = useModuleData(getModuleData, moduleConfig.designType);

  // Extract module data for easy access
  const {
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    boltTypeList,
    sectionProfileList,
    channelList,
    sectionDesignation,
    coverPlateList,
    weldSizeList,
  } = moduleData;

  // ===================================================================
  // DESIGN & CAD STATE - Managed via dedicated hook
  // ===================================================================
  const {
    submitDesign,
    designData,
    designLogs,
    cadData,
    renderCadModel,
    displayPDF,
    setDisplayPDF,
    output,
    logs,
    loading,
    renderBoolean,
    modelKey,
    isLoadingModalVisible,
    loadingStage,
    status,
    setStatus,
    resetDesignState,
    clearDesignResults: clearDesignResultsState,
    screenshotTrigger,
    setScreenshotTrigger,
  } = useDesignSubmission(service, moduleConfig);

  // Form & selection state (moved into dedicated hook)
  const {
    inputs,
    setInputs,
    extraState,
    setExtraState,
    selectionStates,
    allSelected,
    selectedItems,
    modalStates,
    modalDynamicSrc,
    setModalDynamicSrc,
    designPrefModalStatus,
    setDesignPrefModalStatus, // ✅ ADD
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    saveInputFileName,
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    resetFormState,
  } = useModuleForm(moduleConfig, moduleData);

  const [selectedView, setSelectedView] = useState("Model");

  // Helper function to check if there's unsaved work
  const hasUnsavedWork = () => {
    return !!(output || renderBoolean);
  };

  // Navigation guard
  const {
    showConfirmation: showResetConfirmation,
    setShowConfirmation: setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    confirmNavigation,
    performNavigation,
  } = useNavigationGuard(hasUnsavedWork, moduleConfig.routePath);

  // Design report
  const report = useDesignReport(
    service,
    moduleConfig,
    output,
    logs,
    inputs,
    allSelected,
    extraState,
    { boltDiameterList, propertyClassList, thicknessList, angleList }
  );

  // Dependent data side-effects
  useDependentData(getDesignPreferences, moduleConfig, inputs, extraState);

  // Comprehensive reset function
  const resetToDefaultState = () => {
    // Reset ModuleContext state (designData, logs, CAD paths, etc.)
    resetModuleState();
    
    // Reset design & CAD state (hook-level state)
    resetDesignState();

    // Reset form state
    resetFormState();
    setSelectedView("Model");
  };

  const handleSubmit = async () => {
    await submitDesign({
      inputs,
      selectionStates,
      allSelected,
      moduleData,
      extraState,
    });
  };

  const handleReset = () => {
    setConfirmationType("reset");
    setShowResetConfirmation(true);
  };

  const handleHomeClick = () => {
    if (hasUnsavedWork()) {
      confirmNavigation("navigation", "home");
    } else {
      navigate("/home");
    }
  };

  const performReset = () => {
    if (confirmationType === "navigation") {
      resetToDefaultState();
      performNavigation();
    } else {
      resetToDefaultState();
      setShowResetConfirmation(false);
      setConfirmationType("reset");
    }
  };

  const saveOutput = async () => {
    const validationResult = moduleConfig.validateInputs(inputs, extraState);
    if (!validationResult.isValid) {
      alert(validationResult.message);
      return;
    }

    const data = moduleConfig.buildSubmissionParams(
      inputs,
      allSelected,
      {
        boltDiameterList,
        propertyClassList,
        thicknessList,
        angleList,
      },
      extraState
    );

    const csvResult = await service.exportToCSV(data);
    if (!csvResult.success) {
      alert(csvResult.error || "Failed to export CSV");
    }
  };

  const clearDesignResults = () => {
    clearDesignResultsState();
  };

  return {
    // ===================================================================
    // CONTEXT DATA - Module state variables
    // ===================================================================
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList, // FIXED: Added angleList to return object
    boltTypeList,
    sectionProfileList,
    sectionDesignation,
    channelList,
    displayPDF,
    designLogs,
    designData,
    renderCadModel: cadData?.render,
    cadModelPaths: cadData?.paths,
    hoverDict: cadData?.hover,
    coverPlateList,
    weldSizeList,

    // contextData = moduleData for dropdowns and expand helpers
    contextData: moduleData,

    // SERVICE API - Expose service for advanced usage
    // ===================================================================
    service,                    // Full service object for advanced usage


    // ===================================================================
    // COMPONENT STATE - Internal hook state
    // ===================================================================
    ...moduleData,

    // Form
    inputs,
    setInputs,
    extraState,
    setExtraState,
    selectionStates,
    allSelected,
    selectedItems,
    modalStates,
    modalDynamicSrc,
    setModalDynamicSrc,
    designPrefModalStatus,
    setDesignPrefModalStatus, // ✅ ADD
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    saveInputFileName,

    // Submission
    output,
    logs,
    loading,
    renderBoolean,
    modelKey,
    cadData,
    loadingStage,
    isLoadingModalVisible,
    status,
    setStatus,
    displayPDF,
    setDisplayPDF,
    screenshotTrigger,
    setScreenshotTrigger,

    // View state
    selectedView,
    setSelectedView,

    // Navigation
    showResetConfirmation,
    confirmationType,

    // ===================================================================
    // ACTIONS - Hook action functions
    // ===================================================================
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    handleHomeClick,
    performReset,
    saveOutput,

    // Report
    createDesignReportBool: report.createDesignReportBool,
    designReportInputs: report.designReportInputs,
    setDesignReportInputs: report.setDesignReportInputs,
    handleCreateDesignReport: report.open,
    handleCancelDesignReport: report.close,

    clearDesignResults,
    
    // Expose resetModuleState for external use (e.g., module change detection)
    resetModuleState,
  };
};
