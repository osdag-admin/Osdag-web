/* eslint-disable react/prop-types */
import { EngineeringProvider } from "../context/EngineeringContext";
import { EngineeringHeader } from "./EngineeringHeader";
import { EngineeringLayout } from "./EngineeringLayout";
import { EngineeringModals } from "./EngineeringModals";
import { MobileBottomNav } from "./MobileBottomNav";

export const EngineeringModule = ({
  moduleConfig,
  outputConfig,
  title,
}) => {
  const isGuest = isGuestUser;
  const navigate = useNavigate();
  const cameraRef = useRef();
  const lockBtnRef = useRef(null);
  const designCompletedRef = useRef(false); // Track if we've already handled design completion
  const prevModuleRef = useRef(null); // Track previous module for change detection
  const prevProjectIdRef = useRef(null); // Track previous projectId for change detection
  const lastLoadedProjectIdRef = useRef(null); // Prevent re-fetching same project (stops infinite GET loop)
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const { isMobile, isLandscape } = useViewport();
  const {
    docks,
    toggleInputDock,
    toggleOutputDock,
    toggleLogs,
    toggleCad,
    setDesignComplete: setDocksDesignComplete,
    setEarlyOutput: setDocksEarlyOutput,
    resetDocks,
    setDocks
  } = useDockPanels(isMobile);
  const { hoverText, setHoverText, hoverPos, setHoverPos, handleHoverLabel, handleHoverEnd } = useHover();

  const [showAboutOsdagModal, setShowAboutOsdagModal] = useState(false);
  const [showSave3dTypeModal, setShowSave3dTypeModal] = useState(false);
  const [selectedSave3dType, setSelectedSave3dType] = useState("Export STL");

  const {
    // Module data
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
    cadModelPaths,
    hoverDict: ctxHoverDict,
    coverPlateList,
    weldSizeList,
    profileList = [],
    anchorDiameterList = [],
    anchorGradeList = [],
    footingGradeList = [],
    weldTypeList = [],
    anchorTypeList = [],

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
    setSelectionStates,
    allSelected,
    setAllSelected,
    selectedItems,
    setSelectedItems,
    saveOutput,
    createDesignReportBool,
    setCreateDesignReportBool,
    designReportInputs,
    setDesignReportInputs,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    saveInputFileName,
    designPrefOverrides,
    setDesignPrefOverrides,
    screenshotTrigger,
    setScreenshotTrigger,
    extraState,
    setExtraState,
    modalDynamicSrc,
    setModalDynamicSrc,

    // Navigation and Reset states
    showResetConfirmation,
    setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    status,
    setStatus,

    // Actions
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    handleHomeClick,
    handleQuitClick,
    performReset,

    // Report
    handleCreateDesignReport,
    handleCancelDesignReport,
    clearDesignResults,
    loadSavedOutputs,
    loadOutputs,
    resetDesignState,
    service,

    // Direct access to module context reset
    resetFormState,
    resetModuleState,
    contextData,
    refetchModuleOptions,
  } = useEngineeringModule(moduleConfig);

  const { handleCreateProject, projectCreationModal } = useProjectCreation({
    inputs,
    extraState,
    allSelected,
    contextData,
    moduleConfig,
    designPrefOverrides,
    hasOutput: !!output,
  });

  const [showResetButton, setShowResetButton] = useState(false);
  const [isDesignComplete, setIsDesignComplete] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [showUnlockWarning, setShowUnlockWarning] = useState(false);
  const [showOptionsContainer, setShowOptionsContainer] = useState(false); // New state for options container
  const [isRedesigning, setIsRedesigning] = useState(false); // New state for re-design operations
  const [selectedSection, setSelectedSection] = useState(["Model"]);
  const [selectedCameraView, setSelectedCameraView] = useState("Model");
  const [lockZoom, setLockZoom] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Hooking Graphics Options (Model / Selected Section & Bg Color)
  const colorPickerRef = useRef(null);
  const [customBgColor, setCustomBgColor] = useState(null);

  useEffect(() => {
    if (inputs?.graphicsOption) {
      const opt = inputs.graphicsOption;
      if (["Model", "Beam", "Column", "Seated Angle", "Cleat Angle"].includes(opt)) {
        if (opt === "Model") {
          setSelectedSection(["Model"]);

          setSelectedCameraView("Model");
        } else {
          // If a non-Model option is selected, add it
          const newSelection = selectedSection.filter(s => s !== "Model");
          if (!newSelection.includes(opt)) {
            newSelection.push(opt);
          }
          if (newSelection.length > 0) {
            setSelectedSection(newSelection);

            setSelectedCameraView(newSelection[0]);
          }
        }
      } else if (opt === "Change Background") {
        if (colorPickerRef.current) {
          colorPickerRef.current.click();
        }
      } else if (opt === "Show front view") {
        setSelectedCameraView("XY");
      } else if (opt === "Show side view") {
        setSelectedCameraView("YZ");
      } else if (opt === "Show top view") {
        setSelectedCameraView("ZX");
      }
      // Cleanup graphicOption to allow consecutive clicks of same option
      setInputs(prev => {
        const next = { ...prev };
        delete next.graphicsOption;
        return next;
      });
    }
  }, [inputs?.graphicsOption, selectedSection]);

  const prevPathsRef = useRef(null);
  const normalizedCadModelPaths = useMemo(() => {
    const out = {};
    Object.entries(cadModelPaths || {}).forEach(([key, value]) => {
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
  }, [cadModelPaths]);

  // Debug: log CAD paths when they change
  useEffect(() => {
    if (normalizedCadModelPaths) {
      const keys = Object.keys(normalizedCadModelPaths || {});
      }
  }, [normalizedCadModelPaths, selectedSection]);







  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Hover tooltip state for 3D parts
  const location = useLocation();
  const params = useParams();

  // Project ID from path (e.g. /design/connections/shear/fin_plate/1) or query (?projectId=1)
  const getProjectIdFromUrl = () => {
    const fromPath = params.projectId;
    if (fromPath != null && fromPath !== '') {
      const n = parseInt(fromPath, 10);
      if (!Number.isNaN(n)) return n;
    }
    const searchParams = new URLSearchParams(location.search);
    const fromQuery = searchParams.get('projectId');
    return fromQuery ? parseInt(fromQuery, 10) : null;
  };

  // ===================================================================
  // MODULE CHANGE DETECTION - Clear state when switching modules
  // ===================================================================
  useEffect(() => {
    const currentModule = moduleConfig.designType;
    const currentProjectId = getProjectIdFromUrl();

    // Check if module changed
    if (prevModuleRef.current && prevModuleRef.current !== currentModule) {
      console.log(`[STATE_CLEANUP] Module changed: ${prevModuleRef.current} -> ${currentModule}`);

      // Clear ModuleContext state (designData, logs, CAD paths, etc.)
      resetModuleState();

      // Clear hook-level design state
      clearDesignResults();

      // Reset UI state
      setIsDesignComplete(false);
      setDocks({ output: false });
      setDocks({ logs: false });
      setShowOptionsContainer(false);
      setIsInputLocked(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      setIsRedesigning(false);
      designCompletedRef.current = false;

      // Reset CAD visibility based on device
      if (isMobile) {
        setDocks({ cad: false });
      } else {
        setDocks({ cad: true });
      }
    }

    // Check if projectId changed (same module, different project)
    if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== currentProjectId) {
      console.log(`[STATE_CLEANUP] Project changed: ${prevProjectIdRef.current} -> ${currentProjectId}`);

      // Clear design state when switching projects
      resetModuleState();
      clearDesignResults();
      setIsDesignComplete(false);
      setDocks({ output: false });
      setDocks({ logs: false });
      setShowOptionsContainer(false);
      setIsInputLocked(false);
      designCompletedRef.current = false;
    }

    // Update refs
    prevModuleRef.current = currentModule;
    prevProjectIdRef.current = currentProjectId;
  }, [moduleConfig.designType, location.search, location.pathname, resetModuleState, clearDesignResults, isMobile]);

  // ===================================================================
  // CLEANUP ON UNMOUNT - Clear state when component unmounts
  // ===================================================================
  useEffect(() => {
    return () => {
      console.log('[STATE_CLEANUP] Component unmounting, clearing ModuleContext state');
      // Clear ModuleContext state when component unmounts
      resetModuleState();
    };
  }, [resetModuleState]);

  // ===================================================================
  // PROJECT LOADING - Load project inputs if project ID exists
  // ===================================================================
  const projectIdFromUrl = getProjectIdFromUrl();
  useProjectLoader({
    projectIdFromUrl,
    service,
    moduleConfig,
    navigate,
    location,
    setInputs,
    setDesignPrefOverrides,
    loadSavedOutputs,
    resetModuleState,
    clearDesignResults,
    resetDocks,
    setIsDesignComplete,
    setShowOptionsContainer,
    setIsInputLocked,
    designCompletedRef,
    resetFormState,
    setExtraState,
    setSelectionStates,
    setAllSelected,
    setSelectedItems,
    moduleData: contextData,
  });

  // Only change dock visibility after design is complete
  useEffect(() => {
    // Check if design just completed (transition to COMPLETE status)
    const designJustCompleted = status.step === DESIGN_STATUS.COMPLETE && !designCompletedRef.current;

    if (designJustCompleted) {
      console.log(`[DESIGN_COMPLETE] Design completed | isMobile: ${isMobile}`);
      designCompletedRef.current = true; // Mark as handled
      setIsDesignComplete(true);
      setShowOptionsContainer(true); // Show options container after design is complete

      if (isMobile) {
        // Mobile: Auto-open CAD+Logs so results are visible immediately
        console.log(`[DESIGN_COMPLETE] Setting mobile docks: CAD=true, Logs=true, Input=false, Output=false`);
        setDocks({ input: false });
        setDocks({ output: false });
        setDocks({ cad: true });
        setDocks({ logs: true });
      } else {
        // Desktop: Auto-open output dock and logs
        console.log(`[DESIGN_COMPLETE] Setting desktop docks: Output=opening, Logs=opening`);
        setDocks({ output: true });
        setDocks({ logs: true });
      }

      // Lock inputs after successful design
      setIsInputLocked(true);

      // Auto-trigger report generation if ?action=report is in the URL
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('action') === 'report') {
        setTimeout(() => {
          if (handleCreateDesignReport) handleCreateDesignReport();
        }, 1000);
      }
    } else if (isRedesigning || status.step === DESIGN_STATUS.CALCULATING || status.step === DESIGN_STATUS.CAD_GENERATING) {
      // Reset the completion flag when redesigning or during design process
      if (isRedesigning) {
        designCompletedRef.current = false;
        setIsDesignComplete(false);
        setShowOptionsContainer(false);
        setIsInputLocked(false);
      }
    }
  }, [status.step, isRedesigning, isMobile]);

  // Show output dock immediately after calculation completes (before CAD)
  useEffect(() => {
    // When status transitions to CAD_GENERATING, calculation just completed
    if (status.step === DESIGN_STATUS.CAD_GENERATING && output && !isRedesigning && !designCompletedRef.current) {
      console.log(`[EARLY_OUTPUT] Calculation complete, showing output dock early`);
      if (!isMobile) {
        setDocks({ output: true });
        setDocks({ logs: true });
      }
    }
  }, [status.step, output, isRedesigning, isMobile]);


  const handleSubmitEnhanced = useCallback(async () => {
    setIsInputLocked(false);
    // If there's already an existing design, completely reset everything
    if (isDesignComplete || renderBoolean || output) {

      // Immediately hide current model and output
      designCompletedRef.current = false; // Reset completion flag
      setIsRedesigning(true);
      setIsDesignComplete(false);
      setDocks({ output: false });
      setDocks({ logs: false });
      setShowOptionsContainer(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      // Reset CAD state based on device type
      if (isMobile) {
        setDocks({ cad: false });
      } else {
        setDocks({ cad: true });
      }

      // Reset all the data that controls model rendering but PRESERVE inputs
      clearDesignResults();
      resetModuleState();

      // Small delay to ensure reset is processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Call the actual submit function
    try {
      await handleSubmit();
      setShowResetButton(true);
    } catch (error) {
    } finally {
      // Reset the redesigning state after completion
      setIsRedesigning(false);
    }
  }, [isDesignComplete, renderBoolean, output, isMobile, clearDesignResults, resetModuleState, handleSubmit, resetDocks]);

  // Toggle reset button visibility
  const toggleResetButton = () => {
    setShowResetButton(!showResetButton);
  };

  // Toggle functions for SVG clicks


  const handleLockToggle = useCallback(() => {
    if (isInputLocked) {
      // Show warning modal first
      setShowUnlockWarning(true);
    } else {
      setIsInputLocked(true);
      // Don't close the dock when locking - keep it open but locked
    }
  }, [isInputLocked]);

  const confirmUnlock = () => {
    console.log(`[UNLOCK] confirmUnlock called | isMobile: ${isMobile}`);
    designCompletedRef.current = false; // Reset completion flag
    clearDesignResults();
    setIsDesignComplete(false);
    setShowOptionsContainer(false);
    setDocks({ output: false });
    setDocks({ logs: false });
    setSelectedSection(["Model"]);
    setSelectedCameraView("Model");
    setShowResetButton(false);
    setHoverText("");
    setHoverPos({ x: 0, y: 0 });
    setIsInputLocked(false);
    setDocks({ input: true });
    setIsRedesigning(false);
    setShowUnlockWarning(false);
    // Reset CAD state based on device type
    if (isMobile) {
      console.log(`[UNLOCK] Resetting docks for mobile: Input=true, CAD=false`);
      setDocks({ cad: false });
    } else {
      console.log(`[UNLOCK] Resetting docks for desktop: Input=true, CAD=true`);
      setDocks({ cad: true });
    }
  };

  const cancelUnlock = () => {
    setShowUnlockWarning(false);
    setIsInputLocked(true);
  };


  // New CAD toggle function

  const handleResetEnhanced = useCallback(async () => {
    setShowResetConfirmation(true);
    setConfirmationType("reset");
  }, []);

  const performResetEnhanced = async () => {
    // Guests never store custom sections in backend.
    if (isGuestUser()) {
      message.info("Guest users do not have custom sections stored in the backend.");
    } else {
      try {
        await deleteAllCustomSections();
        // Ensure dropdown options no longer include deleted user sections.
        try {
          await refetchModuleOptions?.();
        } catch (_e) {
          // ignore refetch errors; local reset still proceeds
        }
      } catch (e) {
        message.error(e?.message || "Failed to delete custom sections.");
      }
    }

    performReset();
    setShowResetButton(false);
    setShowResetConfirmation(false);
    setDocks({ output: false });
    setDocks({ input: true });
    setIsDesignComplete(false);
    setDocks({ logs: false });
    setShowOptionsContainer(false);
    setSelectedSection("Model");
    setSelectedCameraView("Model");
    setIsRedesigning(false);
    setIsInputLocked(false);
    // Reset CAD state based on device type
    if (isMobile) {
      setDocks({ cad: false });
    } else {
      setDocks({ cad: true });
    }
  };
  const handleSaveInputs = async () => {
    // Determine module_id - use designType from moduleConfig, or fallback to inputs.module
    const module_id = moduleConfig?.designType || inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
    const projectName = inputs?.project_name || inputs?.name || moduleConfig?.sessionName || 'project';

    try {
      const inputsForSave = expandAllSelectedInputs(inputs, allSelected, contextData);
      
      let flatInputs = {};
      if (moduleConfig && typeof moduleConfig.buildSubmissionParams === "function") {
        try {
          flatInputs = moduleConfig.buildSubmissionParams(
            inputsForSave,
            allSelected,
            contextData,
            extraState
          ) || {};
        } catch (e) {
          console.warn("Failed to dynamically build flat parameters, falling back to raw inputs:", e);
          flatInputs = { ...inputsForSave };
        }
      } else {
        flatInputs = { ...inputsForSave };
      }

      // Prefix design pref overrides
      Object.entries(designPrefOverrides || {}).forEach(([key, val]) => {
        flatInputs[`Pref.${key}`] = val;
      });

      // Always download-only (no backend persistence). Force inline/base64 response.
      const result = await service.saveOSIFromInputs(projectName, module_id, flatInputs, true);
      if (result.success && result.content_base64) {
        try {
          const binaryString = atob(result.content_base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename || `${projectName}.osi`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('OSI file downloaded successfully');
        } catch (err) {
          console.error('Error downloading OSI file:', err);
          message.error('Failed to download OSI file');
        }
        return;
      }
      message.error(result.error || 'Failed to download OSI');
    } catch (err) {
      console.error('Error saving inputs:', err);
      message.error('Failed to download OSI');
    }
  };

  // Get connectivity for FinPlateConnection module
  const getConnectivity = () => {
    if (moduleConfig.cameraKey === MODULE_KEY_FIN_PLATE) {
      return extraState?.selectedOption || inputs?.connectivity;
    }
    return null;
  };

  const cameraSettings = useViewCamera(
    moduleConfig.cameraKey,
    selectedCameraView,
    getConnectivity()
  );

  const {
    position: cameraPos,
    modelPosition,
    modelScale,
  } = cameraSettings;

  // Determine view options based on module config
  const getViewOptions = () => {
    if (moduleConfig.cadOptions) {
      return moduleConfig.cadOptions || ["Model", "Beam", "Connector"];
    }

    if (moduleConfig.cameraKey === MODULE_KEY_FIN_PLATE) {
      return ["Model", "Beam", "Column", "Plate"];
    }
    else if (moduleConfig.cameraKey === MODULE_KEY_CLEAT_ANGLE) {
      return ["Model", "Beam", "Column", "CleatAngle"]; // FIXED: Use CleatAngle instead of Connector
    }
    else if (moduleConfig.cameraKey === MODULE_KEY_END_PLATE) {
      return ["Model", "Beam", "Column", "Plate"];
    }
    else if (moduleConfig.cameraKey === MODULE_KEY_SEAT_ANGLE) {
      return ["Model", "Beam", "Column", "SeatedAngle"]; // FIXED: Use SeatedAngle instead of Connector
    }
    else if (moduleConfig.cameraKey === MODULE_KEY_BEAM_COLUMN_END_PLATE) {
      return ["Model", "Beam", "Column", "End Plate"];
    }

    return moduleConfig.cadOptions || ["Model", "Beam", "Connector"];
  };

  const options = getViewOptions();

  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  const handleLoadInputFromShortcut = async () => {
    const element = document.createElement("input");
    element.setAttribute("type", "file");
    element.accept = ".osi,application/json";
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();

    element.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        document.body.removeChild(element);
        return;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);
        const data = await openOsiFile(formData);
        if (data.ok && data.success) {
          loadStateFromOsi(data.inputs || {}, {
            setInputs,
            setDesignPrefOverrides,
            setExtraState,
            setSelectionStates,
            setAllSelected,
            setSelectedItems,
            moduleConfig,
            safeModuleData: contextData || {},
          });
          message.success("Input loaded from OSI");
        } else {
          message.error(data.error || "Failed to open OSI file");
        }
      } catch (err) {
        message.error("Failed to open OSI file");
      } finally {
        if (document.body.contains(element)) {
          document.body.removeChild(element);
        }
      }
    });
  };

  const handleOpenDesignPrefFromShortcut = () => {
    const mod = getDesignPrefModuleConfig(inputs?.module);
    const guard = canOpenAdditionalInputs(
      mod,
      inputs,
      { selectedOption: extraState?.selectedOption },
      contextData,
      selectionStates
    );
    if (!guard.ok) {
      message.warning(guard.message);
      return;
    }
    setDesignPrefModalStatus(true);
  };

  // Build the hover dictionary: backend values take priority.
  // We intentionally do NOT include default fallback strings for parts like
  // Beam/Column/Plate so that when the backend provides nothing, SmartPart
  // falls back to just the part name (clean), rather than a static string.
  const hoverDict = useMemo(() => {
    // Backend hover_dict values are the source of truth.
    // Only keep truly generic part-name labels for parts
    // the backend never annotates (e.g. SeatedAngle, Member).
    const staticFallbacks = {
      "Cleat Angle": "Cleat Angle",
      "Seated Angle": "Seated Angle",
      "Member": "Member",
    };

    const final = {
      ...staticFallbacks,
      ...(ctxHoverDict || {}),
    };
    
    return final;
  }, [ctxHoverDict]);



  const handleNavbarMenuClick = async (name) => {
    const exportCadByType = async (optionName) => {
      const formatMap = {
        "Export BREP": "brep",
        "Export STL": "stl",
        "Export STEP": "step",
        "Export IGS": "iges",
        "Export IFC": "ifc",
      };
      const format = formatMap[optionName];
      if (!format) {
        message.error("Unsupported export type.");
        return;
      }

      const moduleId = moduleConfig?.designType || inputs?.module;
      if (!moduleId) {
        message.error("Module ID is missing. Unable to export CAD.");
        return;
      }

      if (!cadModelPaths || Object.keys(cadModelPaths).length === 0) {
        message.warning("Run design first to generate CAD output.");
        return;
      }

      if (format === "brep" || format === "stl") {
        const downloaded = await downloadCachedModelByFormat({
          cadModelPaths,
          format,
          moduleId,
          message,
        });
        if (downloaded) return;
      }

      if (typeof moduleConfig?.buildSubmissionParams !== "function") {
        message.error("Module export configuration is missing.");
        return;
      }

      try {
        const inputValues = moduleConfig.buildSubmissionParams(
          inputs,
          allSelected,
          contextData || {},
          extraState || {}
        );

        const result = await service.exportCADModel(
          moduleId,
          inputValues,
          format,
          "Model"
        );

        if (!result?.success || !result?.blob) {
          message.error(result?.error || "CAD export failed");
          return;
        }

        downloadExportCadResponse({
          blob: result.blob,
          disposition: result.disposition,
          fallbackFilename: `${moduleId}_Model.${format}`,
        });
        message.success(`${format.toUpperCase()} exported successfully`);
      } catch (error) {
        console.error("CAD export error:", error);
        message.error(error?.message || "Failed to export CAD");
      }
    };

    // Database menu actions (desktop-style)
    if (name === "Download Inputs CSV") {
      const inputsExpanded = expandAllSelectedInputs(inputs, allSelected, contextData);
      const effectiveInputs = { ...inputsExpanded, ...(designPrefOverrides || {}) };
      const moduleId = moduleConfig?.designType || inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
      return downloadGroupedInputsCsv({
        moduleConfig,
        inputs: inputsExpanded,
        effectiveInputs,
        designPrefOverrides,
        extraState,
        filename: `${moduleId}_inputs.csv`,
      });
    }
    if (name === "Download Outputs CSV") {
      const moduleId = moduleConfig?.designType || inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
      return downloadGroupedOutputsCsv({
        output,
        outputConfig,
        logs,
        filename: `${moduleId}_outputs.csv`,
      });
    }
    if (name === "Download Inputs OSI") {
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
    if (name === "Change Background") {
      message.info("Background change feature coming soon");
      return;
    }
    if (name === "Reset") {
      return handleResetEnhanced();
    }
    return undefined;
  };

  const hasModalContext =
    !!createDesignReportBool ||
    !!designPrefModalStatus ||
    !!showResetConfirmation ||
    !!showUnlockWarning ||
    !!showAskQuestionModal ||
    !!showAboutOsdagModal ||
    !!confirmationModal ||
    Object.values(modalStates || {}).some(Boolean) ||
    status.step === DESIGN_STATUS.ERROR;

  useEngineeringShortcuts({
    navigate,
    toggleInputDock,
    toggleOutputDock,
    toggleLogs,
    handleSubmitEnhanced,
    handleResetEnhanced,
    handleLockToggle,
    showCad: docks.cad,
    selectedCameraView,
    setSelectedCameraView,
    hasModalContext,
    output,
    status,
    handleCreateProject,
    projectIdFromUrl,
    handleLoadInputFromShortcut,
    cadModelPaths,
    setSelectedSave3dType,
    setShowSave3dTypeModal,
    setCreateDesignReportBool,
    handleOpenDesignPrefFromShortcut,
    toggleTheme,
  });

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Navigation */}
      <div className="sticky top-0 z-[60] h-[52px] flex flex-row justify-between items-center bg-[#d2d4d2] w-full text-sm flex-shrink-0 px-4">
        <div className="flex flex-row items-center gap-x-4">
          {menuItems.map((item, index) => (
            <UnifiedDropdownMenu
              key={index}
              label={item.label}
              dropdown={item.dropdown}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              inputs={inputs}
              setInputs={setInputs}
              allSelected={allSelected}
              setAllSelected={setAllSelected}
              setDesignPrefOverrides={setDesignPrefOverrides}
              setExtraState={setExtraState}
              setSelectionStates={setSelectionStates}
              setSelectedItems={setSelectedItems}
              logs={logs}
              setCreateDesignReportBool={setCreateDesignReportBool}
              triggerScreenshotCapture={triggerScreenshotCapture}
              selectedOption={extraState.selectedOption}
              setSelectedOption={(value) =>
                setExtraState({ ...extraState, selectedOption: value })
              }
              cadModelPaths={cadModelPaths}
              contextData={contextData}
              selectionStates={selectionStates}
              hasOutput={!!output}
              onMenuClick={handleNavbarMenuClick}
              onCreateProject={handleCreateProject}
              isExistingProject={!!projectIdFromUrl}
              moduleConfig={moduleConfig}
              extraState={extraState}
            />
          ))}

          {displaySaveInputPopup && (
            <span id="save-input-style" style={{ marginTop: "18px" }}>
              <strong>Saved input file as "{saveInputFileName}"</strong>
            </span>
          )}
        </div>

        <div className="flex flex-row justify-center items-center gap-2 text-black dark:text-white pr-4">

          {/* Input Dock Button */}
          <button
            onClick={toggleInputDock}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white hidden xl:flex`}
            title={`${docks.input ? 'Hide' : 'Show'} input dock`}
            type="button"
          >
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
              <line x1="40" y1="10" x2="40" y2="90" stroke="currentColor" strokeWidth="6" />
              {docks.input && (
                <rect x="10" y="10" width="30" height="80" fill="currentColor" />
              )}
            </svg>

          </button>

          {/* Logs Button */}
          <button
            onClick={toggleLogs}
            disabled={!output && (!logs || logs.length === 0)}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors hidden xl:flex ${(output || (logs && logs.length > 0))
              ? 'hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white'
              : 'opacity-40 cursor-not-allowed'
              }`}
            title={(output || (logs && logs.length > 0))
              ? `${docks.logs ? 'Hide' : 'Show'} logs`
              : 'Run a design to view logs'}
            type="button"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-5 h-5"
              fill="none"
            >
              <rect
                x="10"
                y="10"
                width="80"
                height="80"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
              />

              <line
                x1="10"
                y1="60"
                x2="90"
                y2="60"
                stroke="currentColor"
                strokeWidth="6"
              />

              {docks.logs && (
                <rect
                  x="10"
                  y="60"
                  width="80"
                  height="30"
                  fill="currentColor"
                  stroke="none"
                />
              )}
            </svg>
          </button>

          {/* Output Dock Button */}
          <button
            onClick={toggleOutputDock}
            disabled={!output}
            title={output ? `${docks.output ? 'Hide' : 'Show'} output dock` : 'Run a design to view outputs'}
            type="button"
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors hidden xl:flex ${output
              ? 'hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white'
              : 'opacity-40 cursor-not-allowed'
              }`}
          >
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
              <line x1="60" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="6" />
              {docks.output && (
                <rect x="60" y="10" width="30" height="80" fill="currentColor" />
              )}
            </svg>
          </button>
          {/* home */}
          <button
            onClick={() => navigate('/home')}
            title="Home"
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
          {/* theme mode */}
          <button
            onClick={toggleTheme}
            disabled
            title="Dark mode is under development"
            className="w-10 h-10 flex items-center justify-center rounded-md transition-colors text-black dark:text-white opacity-40 cursor-not-allowed flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
            </svg>
          </button>

        </div >

        {/* Initial theme detection, run once per mount */}
        {
          React.useEffect(() => {
            const saved = localStorage.getItem('osdag-theme');
            if (saved === 'dark') {
              document.body.classList.add('dark');
            } else if (saved === 'light') {
              document.body.classList.remove('dark');
            }
          }, [])
        }
      </div >

      <div className="relative flex flex-row flex-1 overflow-hidden w-full">
        {/* Input Dock Toggle Button - Fixed to left, shows when dock is closed (Desktop only) */}
        {!docks.input && !isMobile && (
          <button
            onClick={toggleInputDock}
            className="hidden xl:flex absolute left-0 top-0 h-full w-10 bg-white dark:bg-osdag-dark-color border-r border-gray-300 dark:border-osdag-border items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            title="Open Input Dock"
            type="button"
          >
          </button>
        )}

        {/* Output Dock Toggle Button - Fixed to right, shows when dock is closed and output exists (Desktop only) */}
        {!docks.output && output && !isMobile && (
          <button
            onClick={toggleOutputDock}
            className="hidden xl:flex absolute right-0 top-0 h-full w-10 bg-white dark:bg-osdag-dark-color border-l border-gray-300 dark:border-gray-700 items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            title="Open Output Dock"
            type="button"
          >
          </button>
        )}

        {/* Left - Input Dock */}
        {docks.input ? (
          <BaseInputDock
            moduleConfig={moduleConfig}
            inputs={inputs}
            setInputs={setInputs}
            isInputLocked={isInputLocked}
            lockBtnRef={lockBtnRef}
            lockZoom={lockZoom}
            setLockZoom={setLockZoom}
            showUnlockWarning={showUnlockWarning}
            confirmUnlock={confirmUnlock}
            cancelUnlock={cancelUnlock}
            handleSaveInputs={handleSaveInputs}
            handleSubmitEnhanced={handleSubmitEnhanced}
            isGuest={isGuest}
            setDesignPrefModalStatus={setDesignPrefModalStatus}
            handleLockToggle={handleLockToggle}
            selectionStates={selectionStates}
            updateSelectionState={updateSelectionState}
            updateModalState={updateModalState}
            toggleAllSelected={toggleAllSelected}
            contextData={contextData}
            extraState={extraState}
            setExtraState={setExtraState}
            updateSelectedItems={updateSelectedItems}
            setModalDynamicSrc={setModalDynamicSrc}
            onRefetchModuleOptions={refetchModuleOptions}
            isOpen={docks.input}
          />
        ) : (
          <div className="fixed left-0 top-[50%] -translate-y-1/2 h-fit w-[40px] hidden xl:flex flex-col items-center justify-center font-bold z-[1000]">
            <div className="relative flex flex-col items-center w-[30px] py-[10px] gap-[14px]">
              <span className="inline-block rotate-[270deg]"><b>T</b></span>
              <span className="inline-block rotate-[270deg]"><b>U</b></span>
              <span className="inline-block rotate-[270deg]"><b>P</b></span>
              <span className="inline-block rotate-[270deg]"><b>N</b></span>
              <span className="inline-block rotate-[270deg]"><b>I</b></span>
            </div>
          </div>
        )}

        <FloatingNavBar />

        {/* EDGE BAR (always visible) */}
        <div
          className={`absolute top-0 h-screen w-[40px] z-[1000] hidden xl:block ${docks.input ? "left-[400px]" : "left-[30px]"
            }`}
        >
          {/* GREEN LINE */}
          <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">

            {/* TOGGLE HANDLE */}
            <div
              onClick={toggleInputDock}
              className="
                absolute right-0 top-[50%]
                -translate-y-1/2
                w-[8px] h-[80px]
                bg-[#6a8f00]
                flex items-center justify-center
                cursor-pointer
              "
            >
              <span className="text-white text-[14px]">
                {docks.input ? "❮" : "❯"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle - 3D Model and Logs Container */}
        <div className={`
          flex-1 flex flex-col relative min-w-0
          ${isMobile && (docks.input || docks.output) ? 'hidden' : 'flex'}
          ${!isMobile && !(docks.output && outputConfig && status.step !== DESIGN_STATUS.ERROR) ? 'xl:pr-[40px]' : ''}
        `}>
          {/* Options Container - Show after design is complete. On desktop, show even when docks are open. On mobile, only show when CAD is visible */}
          {showOptionsContainer && output && (isMobile ? docks.cad : true) && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 max-w-[95%] w-fit overflow-x-auto overflow-y-hidden flex flex-row items-center gap-2 p-1 bg-white/90 dark:bg-osdag-dark-color/90 rounded-md border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                {options.map((option) => {
                  const isChecked = selectedSection.includes(option);
                  const isModel = option === "Model";
                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-xs font-medium text-black dark:text-white`}
                    // rounded-lg cursor-pointer transition-colors text-sm font-medium ${isChecked ? 'bg-osdag-green/10 text-osdag-green dark:bg-osdag-dark-green/20 dark:text-osdag-green' : 'text-black dark:text-white hover:bg-black/10 dark:hover:bg-black/40'}`}
                    >
                      {/* Checkbox highlight box */}
                      <div
                        className={`
                          rounded-md p-[2px] transition-colors
                          ${isChecked
                            ? "bg-osdag-green/20 dark:bg-osdag-dark-green/30"
                            : "bg-transparent"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-gray-400 text-osdag-green focus:ring-osdag-green"
                          checked={isChecked}
                          onChange={(event) => {
                            if (isModel) {
                              // If Model is selected, clear all others and select only Model
                              if (event.target.checked) {
                                setSelectedSection(["Model"]);

                                setSelectedCameraView("Model");
                              } else {
                                // Don't allow unchecking Model if it's the only one
                                if (selectedSection.length === 1 && selectedSection[0] === "Model") {
                                  return;
                                }
                              }
                            }
                            else {
                              // If a non-Model option is selected
                              if (event.target.checked) {
                                // Remove Model from selection and add this option
                                const newSelection = selectedSection.filter(s => s !== "Model");
                                if (!newSelection.includes(option)) {
                                  newSelection.push(option);
                                }
                                setSelectedSection(newSelection);
                                // Use first selected for camera/view if needed

                                setSelectedCameraView(newSelection[0]);
                              } else {
                                // Uncheck: remove this option
                                const newSelection = selectedSection.filter(s => s !== option);
                                // If nothing left, default to Model
                                if (newSelection.length === 0) {
                                  setSelectedSection(["Model"]);

                                  setSelectedCameraView("Model");
                                } else {
                                  setSelectedSection(newSelection);

                                  setSelectedCameraView(newSelection[0]);
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* CAD Window Container */}
          <CadViewer
            isMobile={isMobile}
            showCad={docks.cad}
            showLogs={docks.logs}
            loading={loading}
            isRedesigning={isRedesigning}
            renderBoolean={renderBoolean}
            customBgColor={customBgColor}
            cameraPos={cameraPos}
            normalizedCadModelPaths={normalizedCadModelPaths}
            selectedSection={selectedSection}
            modelKey={modelKey}
            cameraSettings={cameraSettings}
            getConnectivity={getConnectivity}
            hoverDict={hoverDict}
            handleHoverLabel={handleHoverLabel}
            handleHoverEnd={handleHoverEnd}
            moduleConfig={moduleConfig}
            selectedCameraView={selectedCameraView}
            screenshotTrigger={screenshotTrigger}
            setScreenshotTrigger={setScreenshotTrigger}
            showOutputDock={docks.output}
            hasOutput={!!output}
          />

          {/* Logs Dock */}
          {docks.logs && (output || (logs && logs.length > 0)) && (
            <div className={`
              ${isMobile
                ? (docks.cad ? 'h-[30%]' : 'fixed inset-0 z-50 h-full pt-[52px]')
                : 'h-[40%]'
              }
              ${isMobile && !docks.cad ? 'bg-white dark:bg-osdag-dark-color' : ''}
${!isMobile ? (docks.input ? 'pl-0' : 'pl-[40px]') : ''}
${!isMobile ? (docks.output ? 'pr-0' : 'pr-[40px]') : ''}
             `}>
              <Logs logs={logs} />
            </div>
          )}
        </div>

        {/* Right - Output Dock */}
        {docks.output && outputConfig && status.step !== DESIGN_STATUS.ERROR ? (
          <div
            className={`
              fixed inset-0 z-50 h-full pt-[52px] pb-14
              xl:relative xl:inset-auto xl:z-auto xl:h-auto xl:pt-0 xl:pb-0
              w-full xl:w-[400px]
              flex flex-col bg-white dark:bg-osdag-dark-color
            `}
          >
            <BaseOutputDock
              output={output}
              outputConfig={outputConfig}
              title={title || UI_STRINGS.OUTPUT_DOCK}
              extraState={{
                ...extraState,
                cadModelPaths,
                renderCadModel: renderBoolean,
                connectivity: inputs?.connectivity,
                member_designation: inputs?.member_designation,
                designation: inputs?.member_designation,
                weld_type: inputs?.weld_type
              }}
              handleCreateDesignReport={handleCreateDesignReport}
              saveOutput={saveOutput}
            />

            {/* RIGHT SIDE GREEN STRIP */}
            <div className="absolute top-0 left-0 h-full w-[40px] z-[50]">
              {/* GREEN LINE */}
              <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">
                
                {/* TOGGLE HANDLE */}
                <div
                  onClick={() => toggleOutputDock(!!output)}
                  className="
                    absolute left-0 top-[50%]
                    -translate-y-1/2
                    w-[8px] h-[80px]
                    bg-[#6a8f00]
                    flex items-center justify-center
                    cursor-pointer
                  "
                >
                  <span className="text-white text-[14px]">
                    ❯
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* COLLAPSED STRIP */
          <div
            className="
            fixed right-0 top-0 h-screen w-[40px]
            z-10 bg-white hidden xl:block
            ">
            {/* GREEN LINE */}
            <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">

              {/* TOGGLE HANDLE */}
              <div
                onClick={() => setDocks({ output: true })}
                className="
                  absolute left-0 top-[50%]
                  -translate-y-1/2
                  w-[8px] h-[80px]
                  bg-[#6a8f00]
                  flex items-center justify-center
                  cursor-pointer
                "
              >
                <span className="text-white text-[14px]">
                  ❮
                </span>
              </div>
            </div>

            {/* OUTPUT TEXT */}
            <div className="absolute right-[10px] top-[50%] -translate-y-1/2 flex flex-col items-center gap-[14px]">
              {"OUTPUT".split("").map((ch, i) => (
                <span key={i} className="rotate-90 font-bold">
                  {ch}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Design Report Modal */}
      <DesignReportModal
        isOpen={createDesignReportBool}
        onCancel={handleCancelDesignReport}
        onOk={undefined}
        designReportInputs={designReportInputs}
        setDesignReportInputs={setDesignReportInputs}
        output={output}
        moduleId={moduleConfig?.designType}
        inputValues={inputs}
        logs={logs}
        moduleConfig={moduleConfig}
        boltDiameterList={boltDiameterList}
        propertyClassList={propertyClassList}
        thicknessList={thicknessList}
        angleList={angleList}
        allSelected={allSelected}
        extraState={extraState}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        lists={contextData}
      />

      {/* Customization Modals */}
      {
        moduleConfig.modalConfig.map((modal) => (
          <CustomizationModal
            key={modal.key}
            isOpen={modalStates[modal.key]}
            onClose={() => updateModalState(modal.key, false)}
            title="Customized"
            dataSource={contextData[modal.dataSource] || (modalDynamicSrc[modal.inputKey] || [])} // FIXED: This now includes angleList
            selectedItems={selectedItems[modal.inputKey]}
            onTransferChange={(nextTargetKeys) =>
              updateSelectedItems(modal.inputKey, nextTargetKeys)
            }
          />
        ))
      }

      {/* Design Preferences Modal (Additional Inputs) */}
      {
        designPrefModalStatus && (
          <Modal
            title="Additional Inputs"
            open={designPrefModalStatus}
            onCancel={() => {
              if (isInputLocked) {
                setDesignPrefModalStatus(false);
              } else {
                setConfirmationModal(true);
              }
            }}
            footer={null}
            minWidth={isMobile ? undefined : 1200}
            width={isMobile ? '100%' : 1400}
            maxHeight={isMobile ? '100%' : 1200}
            maskClosable={false}
            className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
          >
            <DesignPrefSections
              module={moduleConfig.sessionName}
              inputs={inputs}
              setInputs={setInputs}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              designPrefOverrides={designPrefOverrides}
              setDesignPrefOverrides={setDesignPrefOverrides}
              confirmationModal={confirmationModal}
              setConfirmationModal={setConfirmationModal}
              isInputLocked={isInputLocked}
              moduleMaterialList={materialList}
              isGuest={isGuestUser()}
              onRefetchModuleOptions={refetchModuleOptions}
            />
          </Modal>
        )
      }

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetConfirmation}
        title={
          <span>
            {confirmationType === "reset"
              ? "Confirm Reset"
              : "Unsaved Progress"}
          </span>
        }
        onCancel={() => {
          setShowResetConfirmation(false);
          setConfirmationType("reset");
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowResetConfirmation(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            style={{ background: "rgb(135, 91, 91)", color: "white" }}
            onClick={performResetEnhanced}
          >
            {confirmationType === "reset"
              ? "Yes, Reset Everything"
              : "Yes, Leave Page"}
          </Button>,
        ]}
        width={isMobile ? '90%' : 500}
        className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
      >
        <div>
          <p>
            {confirmationType === "reset"
              ? "Are you sure you want to reset all inputs and clear the current design?"
              : "You have unsaved design progress. Are you sure you want to leave?"}
          </p>
          <br />
          <p>
            <strong>This will lose all your current work.</strong>
          </p>
        </div>
      </Modal>

      {/* Design Status Modal */}
      <DesignStatusModal
        status={status}
        isMobile={isMobile}
        onRetry={() => {
          // Retry logic - could trigger handleSubmitEnhanced again
          setStatus({ step: DESIGN_STATUS.IDLE, message: '', error: null });
        }}
        onClose={() => {
          if (status.step === DESIGN_STATUS.ERROR) {
            setStatus({ step: DESIGN_STATUS.IDLE, message: '', error: null });
          }
        }}
      />

      {/* Hover tooltip overlay */}
      {hoverText && (
        <div
          style={{
            position: 'fixed',
            left: hoverPos.x,
            top: hoverPos.y,
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 6,
            pointerEvents: 'none',
            fontSize: 12,
            zIndex: 1000,
            maxWidth: '250px',
            lineHeight: '1.4',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          dangerouslySetInnerHTML={{ __html: hoverText }}
        />
      )}
      {projectCreationModal}
      <HelpLinkModal
        open={showAskQuestionModal}
        onClose={() => setShowAskQuestionModal(false)}
        title="Ask us a question"
        helperText="Please visit:"
        link={ASK_QUESTION_LINK}
      />
      <AboutOsdagModal
        open={showAboutOsdagModal}
        onClose={() => setShowAboutOsdagModal(false)}
      />
      <Modal
        open={showSave3dTypeModal}
        title="Save 3D Model"
        onCancel={() => setShowSave3dTypeModal(false)}
        onOk={async () => {
          await handleNavbarMenuClick(selectedSave3dType);
          setShowSave3dTypeModal(false);
        }}
        okText="Export"
        cancelText="Cancel"
        width={isMobile ? "90%" : 520}
        className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
      >
        <div className="space-y-3">
          <p className="text-sm">Choose CAD file type to export:</p>
          <Radio.Group
            value={selectedSave3dType}
            onChange={(event) => setSelectedSave3dType(event.target.value)}
            className="flex flex-col gap-2"
          >
            <Radio value="Export BREP">BREP</Radio>
            <Radio value="Export STL">STL</Radio>
            <Radio value="Export STEP">STEP</Radio>
            <Radio value="Export IGS">IGS</Radio>
            <Radio value="Export IFC">IFC</Radio>
          </Radio.Group>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-osdag-dark-color border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-[2000]">
          {/* Inputs Tab */}
          <button
            onClick={() => setDocks({ input: true, cad: false, output: false, logs: false })}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${docks.input
              ? 'text-osdag-green'
              : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
              }`}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Inputs</span>
          </button>

          {/* 3D View Tab */}
          <button
            onClick={() => setDocks({ input: false, cad: true, output: false, logs: true })}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${docks.cad && !docks.input && !docks.output
              ? 'text-osdag-green'
              : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
              }`}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>3D View</span>
          </button>

          {/* Outputs Tab */}
          <button
            onClick={() => {
              if (output) {
                setDocks({ input: false, cad: false, output: true, logs: true });
              } else {
                message.info("Please run the design first to view outputs.");
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${!output ? 'opacity-40 cursor-not-allowed' : ''
              } ${docks.output
                ? 'text-osdag-green'
                : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
              }`}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Outputs</span>
          </button>
        </div>
      )}
    </div>
  );
};
