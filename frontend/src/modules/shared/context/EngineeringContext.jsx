/* eslint-disable react-refresh/only-export-components, react/prop-types */
import { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useViewport } from "../hooks/useViewport";
import { useHover } from "../hooks/useHover";
import { useDockPanels } from "../hooks/useDockPanels";
import { useProjectLoader } from "../hooks/useProjectLoader";
import { useEngineeringShortcuts } from "../hooks/useEngineeringShortcuts";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEngineeringModule } from "../hooks/useEngineeringModule";
import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_SEAT_ANGLE,
} from "../../../constants/DesignKeys";
import { DESIGN_STATUS } from "../hooks/useDesignSubmission";
import { useViewCamera } from "../components/cad";
import { message } from "antd";
import { useProjectCreation } from "../hooks/useProjectCreation";
import { deleteAllCustomSections } from "../../../datasources/sectionsDataSource";
import { getModuleConfig as getDesignPrefModuleConfig } from "../utils/moduleConfig";
import { canOpenAdditionalInputs } from "../utils/designPrefOpenGuard";
import { useOsiFileHandlers } from "../hooks/useOsiFileHandlers";
import { useCadExport } from "../hooks/useCadExport";
import { usePlateGirderOptimization } from "../hooks/usePlateGirderOptimization";
import { isGuestUser } from "../../../utils/auth";
import { expandAllSelectedInputs } from "../utils/osiInputSerializer";
import {
  downloadGroupedInputsCsv,
  downloadGroupedOutputsCsv,
} from "../utils/groupedCsvExport";
import { DESIGN_EXAMPLES_URL } from "../components/help/helpContent";

const EngineeringContext = createContext(null);

export const useEngineeringContext = () => {
  const context = useContext(EngineeringContext);
  if (!context) {
    throw new Error("useEngineeringContext must be used within an EngineeringProvider");
  }
  return context;
};

const EngineeringShortcutsRunner = () => {
  const context = useEngineeringContext();
  const { form, uiContext, designStatus, docks, navigate } = context;

  const handleOpenDesignPrefFromShortcut = () => {
    const mod = getDesignPrefModuleConfig(form.inputs?.module);
    const guard = canOpenAdditionalInputs(
      mod,
      form.inputs,
      { selectedOption: form.extraState?.selectedOption },
      context.contextData,
      form.selectionStates
    );
    if (!guard.ok) {
      message.warning(guard.message);
      return;
    }
    uiContext.setDesignPrefModalStatus(true);
  };

  useEngineeringShortcuts({
    navigate,
    toggleInputDock: context.toggleInputDock,
    toggleOutputDock: context.toggleOutputDock,
    toggleLogs: context.toggleLogs,
    handleSubmitEnhanced: context.handleSubmitEnhanced,
    handleResetEnhanced: context.handleResetEnhanced,
    handleLockToggle: context.handleLockToggle,
    showCad: docks.cad,
    selectedCameraView: context.selectedCameraView,
    setSelectedCameraView: context.setSelectedCameraView,
    hasModalContext: context.hasModalContext,
    output: designStatus.output,
    status: designStatus.status,
    handleCreateProject: context.handleCreateProject,
    projectIdFromUrl: context.projectIdFromUrl,
    handleLoadInputFromShortcut: context.handleLoadInputFromShortcut,
    cadModelPaths: designStatus.cadModelPaths,
    setSelectedSave3dType: context.setSelectedSave3dType,
    setShowSave3dTypeModal: context.setShowSave3dTypeModal,
    setCreateDesignReportBool: uiContext.setCreateDesignReportBool,
    handleOpenDesignPrefFromShortcut,
    toggleTheme: context.toggleTheme,
  });

  return null;
};

export const EngineeringProvider = ({ moduleConfig, outputConfig, title, children }) => {
  const isGuest = isGuestUser();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const lockBtnRef = useRef(null);
  const designCompletedRef = useRef(false);
  const prevModuleRef = useRef(null);
  const prevProjectIdRef = useRef(null);

  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const { isMobile } = useViewport();
  const {
    docks,
    toggleInputDock,
    toggleOutputDock,
    toggleLogs,
    toggleCad,
    resetDocks,
    setDocks,
  } = useDockPanels(isMobile);

  const { hoverText, setHoverText, hoverPos, setHoverPos, handleHoverLabel, handleHoverEnd } = useHover();

  const [showAboutOsdagModal, setShowAboutOsdagModal] = useState(false);
  const [showSave3dTypeModal, setShowSave3dTypeModal] = useState(false);
  const [selectedSave3dType, setSelectedSave3dType] = useState("Export STL");

  const coreState = useEngineeringModule(moduleConfig);
  const { form, moduleData, uiContext, designStatus, actions } = coreState;

  const { handleSaveInputs, handleLoadInputFromShortcut } = useOsiFileHandlers(coreState, moduleConfig);
  const { exportCadByType } = useCadExport(coreState, moduleConfig);

  const { handleCreateProject, projectCreationModal } = useProjectCreation({
    inputs: form.inputs,
    extraState: form.extraState,
    allSelected: form.allSelected,
    contextData: moduleData.contextData,
    moduleConfig,
    designPrefOverrides: form.designPrefOverrides,
    hasOutput: !!designStatus.output,
  });

  const [isDesignComplete, setIsDesignComplete] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [showUnlockWarning, setShowUnlockWarning] = useState(false);
  const [showOptionsContainer, setShowOptionsContainer] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [selectedSection, setSelectedSection] = useState(["Model"]);
  const [selectedCameraView, setSelectedCameraView] = useState("Model");
  const [lockZoom, setLockZoom] = useState(false);

  // Plate Girder PSO optimization (only active for the Optimized design mode).
  // Streams particle updates over WebSocket, plays them back smoothly, and on
  // completion populates the standard output dock via actions.loadOutputs.
  const {
    optimizationData,
    optimizationPlotData,
    optimizationDone,
    showOptimizationGraph,
    setShowOptimizationGraph,
    startPsoOptimization,
    resetOptimization,
    isConnected: psoConnected,
    isOptimizing: psoOptimizing,
  } = usePlateGirderOptimization({
    onComplete: (formattedOutput, _rawLogs, cadPaths) => {
      if (formattedOutput && Object.keys(formattedOutput).length > 0) {
        actions.loadOutputs(formattedOutput);
      }
      // Render the optimized section's CAD model (generated by the Celery task).
      if (cadPaths && Object.keys(cadPaths).length > 0) {
        actions.loadCadModel(cadPaths);
      }
      // Briefly show the "Design Complete!" status, then return to IDLE so the
      // DesignStatusModal auto-dismisses (mirrors the synchronous design flow).
      designStatus.setStatus({
        step: DESIGN_STATUS.COMPLETE,
        message: "Optimization complete!",
        error: null,
      });
      setTimeout(() => {
        designStatus.setStatus({ step: DESIGN_STATUS.IDLE, message: "", error: null });
      }, 1200);
    },
    onError: (msg) => {
      const text = msg || "Optimization failed";
      message.error(text);
      designStatus.setStatus({
        step: DESIGN_STATUS.ERROR,
        message: text,
        error: new Error(text),
      });
      setIsInputLocked(false);
      setIsRedesigning(false);
    },
  });

  useEffect(() => {
    if (form.inputs?.graphicsOption) {
      const opt = form.inputs.graphicsOption;
      if (["Model", "Beam", "Column", "Seated Angle", "Cleat Angle"].includes(opt)) {
        if (opt === "Model") {
          setSelectedSection(["Model"]);
          setSelectedCameraView("Model");
        } else {
          const newSelection = selectedSection.filter((s) => s !== "Model");
          if (!newSelection.includes(opt)) {
            newSelection.push(opt);
          }
          if (newSelection.length > 0) {
            setSelectedSection(newSelection);
            setSelectedCameraView(newSelection[0]);
          }
        }
      } else if (opt === "Show front view") {
        setSelectedCameraView("XY");
      } else if (opt === "Show side view") {
        setSelectedCameraView("YZ");
      } else if (opt === "Show top view") {
        setSelectedCameraView("ZX");
      }
      form.setInputs((prev) => {
        const next = { ...prev };
        delete next.graphicsOption;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.inputs?.graphicsOption, selectedSection]);

  const prevPathsRef = useRef(null);
  const normalizedCadModelPaths = useMemo(() => {
    const out = {};
    Object.entries(designStatus.cadModelPaths || {}).forEach(([key, value]) => {
      if (!key) return;
      const trimmed = key.trim();
      out[trimmed] = value;
      out[trimmed.toLowerCase()] = value;
      out[trimmed.toUpperCase()] = value;
    });
    const nextStr = JSON.stringify(out);
    if (prevPathsRef.current === nextStr) return JSON.parse(nextStr);
    prevPathsRef.current = nextStr;
    return out;
  }, [designStatus.cadModelPaths]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const getProjectIdFromUrl = () => {
    const fromPath = params.projectId;
    if (fromPath != null && fromPath !== "") {
      const n = parseInt(fromPath, 10);
      if (!Number.isNaN(n)) return n;
    }
    const searchParams = new URLSearchParams(location.search);
    const fromQuery = searchParams.get("projectId");
    return fromQuery ? parseInt(fromQuery, 10) : null;
  };

  useEffect(() => {
    const saved = localStorage.getItem("osdag-theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
    } else if (saved === "light") {
      document.body.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const currentModule = moduleConfig.designType;
    const currentProjectId = getProjectIdFromUrl();

    if (prevModuleRef.current && prevModuleRef.current !== currentModule) {
      actions.resetModuleState();
      actions.clearDesignResults();
      setIsDesignComplete(false);
      setDocks({ output: false, logs: false, cad: !isMobile });
      setShowOptionsContainer(false);
      setIsInputLocked(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      setIsRedesigning(false);
      designCompletedRef.current = false;
    }

    if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== currentProjectId) {
      actions.resetModuleState();
      actions.clearDesignResults();
      setIsDesignComplete(false);
      setDocks({ output: false, logs: false });
      setShowOptionsContainer(false);
      setIsInputLocked(false);
      designCompletedRef.current = false;
    }

    prevModuleRef.current = currentModule;
    prevProjectIdRef.current = currentProjectId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleConfig.designType, location.search, location.pathname, actions.resetModuleState, actions.clearDesignResults, isMobile]);

  useEffect(() => {
    return () => {
      actions.resetModuleState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.resetModuleState]);

  const projectIdFromUrl = getProjectIdFromUrl();
  useProjectLoader({
    projectIdFromUrl,
    service: actions.service,
    moduleConfig,
    navigate,
    location,
    setInputs: form.setInputs,
    setDesignPrefOverrides: form.setDesignPrefOverrides,
    loadSavedOutputs: actions.loadSavedOutputs,
    resetModuleState: actions.resetModuleState,
    clearDesignResults: actions.clearDesignResults,
    resetDocks,
    setIsDesignComplete,
    setShowOptionsContainer,
    setIsInputLocked,
    designCompletedRef,
    resetFormState: form.resetFormState,
    setExtraState: form.setExtraState,
    setSelectionStates: form.setSelectionStates,
    setAllSelected: form.setAllSelected,
    setSelectedItems: form.setSelectedItems,
    moduleData: moduleData.contextData,
  });

  useEffect(() => {
    const designJustCompleted = designStatus.status.step === DESIGN_STATUS.COMPLETE && !designCompletedRef.current;

    if (designJustCompleted) {
      designCompletedRef.current = true;
      setIsDesignComplete(true);
      setShowOptionsContainer(true);

      if (isMobile) {
        setDocks({ input: false, output: false, cad: true, logs: true });
      } else {
        setDocks({ output: true, logs: true });
      }

      setIsInputLocked(true);

      const searchParams = new URLSearchParams(location.search);
      let timerId;
      if (searchParams.get("action") === "report") {
        timerId = setTimeout(() => {
          if (actions.handleCreateDesignReport) actions.handleCreateDesignReport();
        }, 1000);
      }
      return () => {
        if (timerId) clearTimeout(timerId);
      };
    } else if (
      isRedesigning ||
      designStatus.status.step === DESIGN_STATUS.CALCULATING ||
      designStatus.status.step === DESIGN_STATUS.CAD_GENERATING
    ) {
      if (isRedesigning) {
        designCompletedRef.current = false;
        setIsDesignComplete(false);
        setShowOptionsContainer(false);
        setIsInputLocked(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designStatus.status.step, isRedesigning, isMobile]);

  useEffect(() => {
    if (
      designStatus.status.step === DESIGN_STATUS.CAD_GENERATING &&
      designStatus.output &&
      !isRedesigning &&
      !designCompletedRef.current
    ) {
      if (!isMobile) {
        setDocks({ output: true, logs: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designStatus.status.step, designStatus.output, isRedesigning, isMobile]);

  const handleSubmitEnhanced = useCallback(async () => {
    setIsInputLocked(false);
    if (isDesignComplete || designStatus.renderBoolean || designStatus.output) {
      designCompletedRef.current = false;
      setIsRedesigning(true);
      setIsDesignComplete(false);
      setDocks({ output: false, logs: false, cad: !isMobile });
      setShowOptionsContainer(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      actions.clearDesignResults();
      actions.resetModuleState();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      if (moduleConfig.isOptimized?.(form.inputs)) {
        // Optimized mode → run PSO over WebSocket instead of synchronous design.
        // The PSO dashboard (opened by startPsoOptimization) is the progress UI,
        // so we intentionally do NOT set a CALCULATING status here — that would
        // render the generic "OSDAG Design Processing" modal on top of the graph.
        const params = moduleConfig.buildSubmissionParams(
          form.inputs,
          form.allSelected,
          moduleData.contextData,
          form.extraState
        );
        startPsoOptimization(params);
        return;
      }
      await actions.handleSubmit();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRedesigning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesignComplete, designStatus.renderBoolean, designStatus.output, isMobile, actions.clearDesignResults, actions.resetModuleState, actions.handleSubmit, moduleConfig, form.inputs, form.allSelected, form.extraState, moduleData.contextData, startPsoOptimization]);

  const handleLockToggle = useCallback(() => {
    if (isInputLocked) {
      setShowUnlockWarning(true);
    } else {
      setIsInputLocked(true);
    }
  }, [isInputLocked]);

  const confirmUnlock = () => {
    designCompletedRef.current = false;
    actions.clearDesignResults();
    setIsDesignComplete(false);
    setShowOptionsContainer(false);
    setDocks({ output: false, logs: false, input: true, cad: !isMobile });
    setSelectedSection(["Model"]);
    setSelectedCameraView("Model");
    setHoverText("");
    setHoverPos({ x: 0, y: 0 });
    setIsInputLocked(false);
    setIsRedesigning(false);
    setShowUnlockWarning(false);
  };

  const cancelUnlock = () => {
    setShowUnlockWarning(false);
    setIsInputLocked(true);
  };

  const handleResetEnhanced = useCallback(async () => {
    uiContext.setShowResetConfirmation(true);
    uiContext.setConfirmationType("reset");
  }, [uiContext]);

  const performResetEnhanced = async () => {
    if (isGuestUser()) {
      message.info("Guest users do not have custom sections stored in the backend.");
    } else {
      try {
        await deleteAllCustomSections();
        try {
          await moduleData.refetchModuleOptions?.();
        } catch (_e) {
          console.error(_e);
        }
      } catch (e) {
        message.error(e?.message || "Failed to delete custom sections.");
      }
    }

    actions.performReset();
    uiContext.setShowResetConfirmation(false);
    setDocks({ output: false, input: true, logs: false, cad: !isMobile });
    setIsDesignComplete(false);
    setShowOptionsContainer(false);
    setSelectedSection(["Model"]);
    setSelectedCameraView("Model");
    setIsRedesigning(false);
    setIsInputLocked(false);
  };

  const getConnectivity = () => {
    if (moduleConfig.cameraKey === MODULE_KEY_FIN_PLATE) {
      return form.extraState?.selectedOption || form.inputs?.connectivity;
    }
    return null;
  };

  const cameraSettings = useViewCamera(
    moduleConfig.cameraKey,
    selectedCameraView
  );

  const { position: cameraPos } = cameraSettings;

  const options = moduleConfig.cadOptions;

  const triggerScreenshotCapture = () => {
    designStatus.setScreenshotTrigger(true);
  };

  const hoverDict = useMemo(() => {
    const staticFallbacks = {
      "Cleat Angle": "Cleat Angle",
      "Seated Angle": "Seated Angle",
      "Member": "Member",
    };

    return {
      ...staticFallbacks,
      ...(designStatus.hoverDict || {}),
    };
  }, [designStatus.hoverDict]);

  const handleNavbarMenuClick = async (name) => {
    console.log("[DEBUG EngineeringContext] handleNavbarMenuClick called with:", name);
    if (name === "Create Design Report" || name === "Save Design Report") {
      uiContext.setCreateDesignReportBool(true);
      return;
    }
    if (name === "Save 3D Model") {
      const hasModelOrOutput = !!designStatus.output || (normalizedCadModelPaths && Object.keys(normalizedCadModelPaths).length > 0);
      console.log("[DEBUG Save 3D Model]", { hasModelOrOutput, output: !!designStatus.output, cadPathsKeys: Object.keys(normalizedCadModelPaths || {}) });
      if (!hasModelOrOutput) {
        message.warning("No 3D model available. Run design first to enable Save 3D Model.");
        return;
      }
      setSelectedSave3dType("Export STL");
      setShowSave3dTypeModal(true);
      return;
    }
    if (name === "Download Inputs CSV" || name === "Save Inputs (.csv)") {
      const inputsExpanded = expandAllSelectedInputs(form.inputs, form.allSelected, moduleData.contextData);
      const effectiveInputs = { ...inputsExpanded, ...(form.designPrefOverrides || {}) };
      const moduleId = moduleConfig?.designType || form.inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
      return downloadGroupedInputsCsv({
        moduleConfig,
        inputs: inputsExpanded,
        effectiveInputs,
        designPrefOverrides: form.designPrefOverrides,
        extraState: form.extraState,
        filename: `${moduleId}_inputs.csv`,
      });
    }
    if (name === "Download Outputs CSV" || name === "Save Outputs (.csv)") {
      const moduleId = moduleConfig?.designType || form.inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
      return downloadGroupedOutputsCsv({
        output: designStatus.output,
        outputConfig,
        logs: designStatus.logs,
        filename: `${moduleId}_outputs.csv`,
      });
    }
    if (name === "Download Inputs OSI" || name === "Save Inputs (.osi)" || name === "Download Osi") {
      return handleSaveInputs();
    }
    if (
      name === "Export BREP" ||
      name === "Export STL" ||
      name === "Export STEP" ||
      name === "Export IGS" ||
      name === "Export IFC"
    ) {
      return exportCadByType(name);
    }
    if (name === "Design Examples") {
      window.open(DESIGN_EXAMPLES_URL, "_blank", "noopener,noreferrer");
      return;
    }
    if (name === "Ask us a question") {
      setShowAskQuestionModal(true);
      return;
    }
    if (name === "About Osdag") {
      setShowAboutOsdagModal(true);
      return;
    }
    if (name === "Model" || name === "Beam" || name === "Column" || name === "Seated Angle") {
      setSelectedSection([name]);
      setSelectedCameraView(name);
      return;
    }
    if (name === "Reset") {
      return handleResetEnhanced();
    }
    if (name === "Show Optimization Graph") {
      setShowOptimizationGraph(true);
      return;
    }
    if (name === "Quit") {
      actions.handleQuitClick();
      return;
    }
    return undefined;
  };

  const hasModalContext =
    !!uiContext.createDesignReportBool ||
    !!uiContext.designPrefModalStatus ||
    !!uiContext.showResetConfirmation ||
    !!showUnlockWarning ||
    !!showAskQuestionModal ||
    !!showAboutOsdagModal ||
    !!uiContext.confirmationModal ||
    Object.values(uiContext.modalStates || {}).some(Boolean) ||
    designStatus.status.step === DESIGN_STATUS.ERROR;

  const value = {
    // Hooks state values
    form,
    moduleData,
    uiContext,
    designStatus,
    actions,

    // Layout control states
    isMobile,
    docks,
    toggleInputDock,
    toggleOutputDock,
    toggleLogs,
    toggleCad,
    resetDocks,
    setDocks,

    // Derived states & actions
    isDesignComplete,
    setIsDesignComplete,
    isInputLocked,
    setIsInputLocked,
    showUnlockWarning,
    setShowUnlockWarning,
    showOptionsContainer,
    setShowOptionsContainer,
    isRedesigning,
    setIsRedesigning,
    selectedSection,
    setSelectedSection,
    selectedCameraView,
    setSelectedCameraView,
    lockZoom,
    setLockZoom,
    showAskQuestionModal,
    setShowAskQuestionModal,
    showAboutOsdagModal,
    setShowAboutOsdagModal,
    showSave3dTypeModal,
    setShowSave3dTypeModal,
    selectedSave3dType,
    setSelectedSave3dType,
    hoverText,
    setHoverText,
    hoverPos,
    setHoverPos,
    handleHoverLabel,
    handleHoverEnd,

    // Config props
    moduleConfig,
    outputConfig,
    title,

    // Services & calculated values
    isGuest,
    navigate,
    location,
    params,
    lockBtnRef,
    normalizedCadModelPaths,
    cameraSettings,
    cameraPos,
    getConnectivity,
    hoverDict,
    options,
    projectIdFromUrl,
    hasModalContext,

    // Enhancements & event handles
    handleSaveInputs,
    handleLoadInputFromShortcut,
    exportCadByType,
    handleCreateProject,
    projectCreationModal,
    handleSubmitEnhanced,
    handleLockToggle,
    confirmUnlock,
    cancelUnlock,
    handleResetEnhanced,
    performResetEnhanced,
    handleNavbarMenuClick,
    triggerScreenshotCapture,
    toggleTheme,

    // Plate Girder PSO optimization
    optimizationData,
    optimizationPlotData,
    optimizationDone,
    showOptimizationGraph,
    setShowOptimizationGraph,
    startPsoOptimization,
    resetOptimization,
    psoConnected,
    psoOptimizing,
  };

  return (
    <EngineeringContext.Provider value={value}>
      <EngineeringShortcutsRunner />
      {children}
    </EngineeringContext.Provider>
  );
};
