import { useState, useContext, useCallback } from "react";
import { message } from "antd";
import { useDesignPrefSync } from "./useDesignPrefSync";
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
 * @param {number|null} projectId - Current project ID (optional)
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

  const {
    resetModuleState,
    applyStrictLinkedReseed,
    setLastKnownGoodDesignPrefSnapshot,
  } = useContext(ModuleContext);

  const [optionsRefetchKey, setOptionsRefetchKey] = useState(0);
  const moduleData = useModuleData(
    getModuleData,
    moduleConfig.designType,
    optionsRefetchKey
  );
  const refetchModuleOptions = useCallback(() => {
    setOptionsRefetchKey((k) => k + 1);
  }, []);

  const {
    submitDesign,
    cadData,
    output,
    logs,
    rawCsvData,
    loading,
    renderBoolean,
    modelKey,
    status,
    setStatus,
    resetDesignState,
    clearDesignResults: clearDesignResultsState,
    screenshotTrigger,
    setScreenshotTrigger,
    loadSavedOutputs,
    loadOutputs,
    loadCadModel,
  } = useDesignSubmission(service, moduleConfig);

  const {
    inputs,
    setInputs,
    extraState,
    setExtraState,
    selectionStates,
    setSelectionStates,
    allSelected,
    setAllSelected,
    selectedItems,
    setSelectedItems,
    modalStates,
    modalDynamicSrc,
    setModalDynamicSrc,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    saveInputFileName,
    designPrefOverrides,
    setDesignPrefOverrides,
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    resetFormState,
  } = useModuleForm(moduleConfig, moduleData);

  useDesignPrefSync({
    sessionName: moduleConfig.sessionName,
    inputs,
    setInputs,
    applyStrictLinkedReseed,
    setLastKnownGoodDesignPrefSnapshot,
    pause: designPrefModalStatus,
  });

  const hasUnsavedWork = () => {
    return !!(output || renderBoolean);
  };

  const {
    showConfirmation: showResetConfirmation,
    setShowConfirmation: setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    confirmNavigation,
    performNavigation,
  } = useNavigationGuard(hasUnsavedWork(), moduleConfig.routePath);

  const report = useDesignReport(
    service,
    moduleConfig,
    output,
    logs,
    inputs,
    allSelected,
    extraState,
    moduleData
  );

  useDependentData(getDesignPreferences, moduleConfig, inputs, extraState);

  const resetToDefaultState = () => {
    resetModuleState();
    resetDesignState();
    resetFormState();
    // setSelectedView is managed by the CAD viewer component
  };

  const handleSubmit = async () => {
    const mergedInputs = { ...inputs, ...(designPrefOverrides || {}) };
    await submitDesign({
      inputs: mergedInputs,
      dockInputs: inputs,
      designPrefOverrides,
      selectionStates,
      allSelected,
      moduleData,
      extraState,
    });
  };


  const handleQuitClick = () => {
    if (hasUnsavedWork()) {
      confirmNavigation("navigation", "back");
    } else {
      navigate(-1);
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
      message.error(validationResult.message);
      return;
    }

    const data = moduleConfig.buildSubmissionParams(
      inputs,
      allSelected,
      moduleData,
      extraState
    );

    const csvResult = await service.exportToCSV(data);
    if (!csvResult.success) {
      message.error(csvResult.error || "Failed to export CSV");
    }
  };

  const clearDesignResults = () => {
    clearDesignResultsState();
  };

  return {
    moduleData: {
      ...moduleData,
      contextData: moduleData,
    },

    form: {
      inputs,
      setInputs,
      extraState,
      setExtraState,
      designPrefOverrides,
      setDesignPrefOverrides,
      selectionStates,
      setSelectionStates,
      allSelected,
      setAllSelected,
      selectedItems,
      setSelectedItems,
      modalDynamicSrc,
      setModalDynamicSrc,
      displaySaveInputPopup,
      saveInputFileName,
      resetFormState,
    },

    uiContext: {
      modalStates,
      updateModalState,
      updateSelectionState,
      updateSelectedItems,
      toggleAllSelected,
      designPrefModalStatus,
      setDesignPrefModalStatus,
      confirmationModal,
      setConfirmationModal,
      showResetConfirmation,
      setShowResetConfirmation,
      confirmationType,
      setConfirmationType,
      createDesignReportBool: report.createDesignReportBool,
      designReportInputs: report.designReportInputs,
      setDesignReportInputs: report.setDesignReportInputs,
      setCreateDesignReportBool: report.open,
    },

    designStatus: {
      output,
      logs,
      rawCsvData,
      loading,
      status,
      setStatus,
      cadModelPaths: cadData?.paths,
      renderBoolean,
      modelKey,
      screenshotTrigger,
      setScreenshotTrigger,
      hoverDict: cadData?.hover,
    },

    // 5. Actions / Handlers
    actions: {
      handleSubmit,
      handleQuitClick,
      performReset,
      saveOutput,
      clearDesignResults,
      loadSavedOutputs,
      loadOutputs,
      loadCadModel,
      service,
      resetModuleState,
      refetchModuleOptions,
      handleCreateDesignReport: report.open,
      handleCancelDesignReport: report.close,
    },
  };
};
