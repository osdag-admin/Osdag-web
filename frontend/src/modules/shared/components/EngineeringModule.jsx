
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Modal, Button } from "antd";
import { useEngineeringModule } from "../hooks/useEngineeringModule";
import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_BEAM_COLUMN_END_PLATE,
} from "../../../constants/DesignKeys";
import { BaseInputDock } from "./BaseInputDock";
import { BaseOutputDock } from "./BaseOutputDock";
import { CustomizationModal } from "../components/CustomizationModal";
import { DesignReportModal } from "../components/DesignReportModal";
import { DesignStatusModal } from "./DesignStatusModal";
import { DESIGN_STATUS } from "../hooks/useDesignSubmission";
import {
  CadScene,
  useViewCamera,
  ScreenshotCapture,
  ReportCaptureDev,
  CadSceneProvider,
  CadSceneBbox,
} from "./cad";
import Logs from "./Logs";
import UnifiedDropdownMenu from "../utils/UnifiedDropdownMenu";
import DesignPrefSections from "./DesignPrefSections";
import { message, Modal as AntdModal } from 'antd';
import { menuItems } from "../utils/moduleUtils";
import { UI_STRINGS } from "../../../constants/UIStrings";
import { isGuestUser } from "../../../utils/auth";
import { expandAllSelectedInputs } from "../utils/osiInputSerializer";

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
    allSelected,
    selectedItems,
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
    selectedView,
    setSelectedView,
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
    isLoadingModalVisible,
    setIsLoadingModalVisible,
    loadingStage,
    setLoadingStage,
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
    performReset,
    handleCreateDesignReport,
    handleCancelDesignReport,
    clearDesignResults,

    // Service API (for project/OSI operations)
    service,
    resetModuleState,
    contextData,
  } = useEngineeringModule(moduleConfig);

  const [showResetButton, setShowResetButton] = useState(false);
  const [showInputDock, setShowInputDock] = useState(true);
  const [showOutputDock, setShowOutputDock] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isDesignComplete, setIsDesignComplete] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [showUnlockWarning, setShowUnlockWarning] = useState(false);
  const [showOptionsContainer, setShowOptionsContainer] = useState(false); // New state for options container
  const [isGridActive, setIsGridActive] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false); // New state for re-design operations
  const [selectedSection, setSelectedSection] = useState(["Model"]);
  const [selectedCameraView, setSelectedCameraView] = useState("Model");
  const [lockZoom, setLockZoom] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCad, setShowCad] = useState(window.innerWidth >= 768); // Default: true on desktop, false on mobile

  // Normalize CAD path keys to handle case/spacing differences
  const normalizedCadModelPaths = useMemo(() => {
    const out = {};
    Object.entries(cadModelPaths || {}).forEach(([key, value]) => {
      if (!key) return;
      const trimmed = key.trim();
      out[trimmed] = value;
      out[trimmed.toLowerCase()] = value;
      out[trimmed.toUpperCase()] = value;
    });
    return out;
  }, [cadModelPaths]);

  // Debug: log CAD paths when they change
  useEffect(() => {
    if (normalizedCadModelPaths) {
      const keys = Object.keys(normalizedCadModelPaths || {});
      console.log("[EngineeringModule] cadModelPaths keys:", keys);
      console.log("[EngineeringModule] selectedSection:", selectedSection);
    }
  }, [normalizedCadModelPaths, selectedSection]);

  // Detect mobile/desktop and landscape orientation
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      console.log(`[VIEWPORT] Width changed: ${width}px | isMobile: ${mobile}`);
      setIsMobile(mobile);
      // Landscape: width > height and on mobile/tablet
      setIsLandscape(width > window.innerHeight && mobile);

      // On desktop, ensure CAD is always visible (only set once on mount/resize, not on every showCad change)
      if (!mobile) {
        setShowCad(true);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []); // Empty dependency array - only run on mount and resize

  // Log isMobile state changes
  useEffect(() => {
    console.log(`[STATE] isMobile changed: ${isMobile} | Window width: ${window.innerWidth}px`);
  }, [isMobile]);

  // Log showInputDock state changes
  useEffect(() => {
    console.log(`[DOCK] showInputDock changed: ${showInputDock}`);
  }, [showInputDock]);

  // Log showOutputDock state changes
  useEffect(() => {
    console.log(`[DOCK] showOutputDock changed: ${showOutputDock}`);
  }, [showOutputDock]);

  // Log showLogs state changes
  useEffect(() => {
    console.log(`[DOCK] showLogs changed: ${showLogs}`);
  }, [showLogs]);

  // Log showCad state changes
  useEffect(() => {
    console.log(`[DOCK] showCad changed: ${showCad}`);
  }, [showCad]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Hover tooltip state for 3D parts
  const [hoverText, setHoverText] = useState("");
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
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
      setShowOutputDock(false);
      setShowLogs(false);
      setShowOptionsContainer(false);
      setIsInputLocked(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      setIsRedesigning(false);
      designCompletedRef.current = false;

      // Reset CAD visibility based on device
      if (isMobile) {
        setShowCad(false);
      } else {
        setShowCad(true);
      }
    }

    // Check if projectId changed (same module, different project)
    if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== currentProjectId) {
      console.log(`[STATE_CLEANUP] Project changed: ${prevProjectIdRef.current} -> ${currentProjectId}`);

      // Clear design state when switching projects
      resetModuleState();
      clearDesignResults();
      setIsDesignComplete(false);
      setShowOutputDock(false);
      setShowLogs(false);
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
  // PROJECT LOADING - Clear state before loading project inputs
  // ===================================================================
  // Enforce project presence for authenticated users. Only depend on URL so we don't re-run when
  // service/setInputs/resetModuleState change (which would cause infinite GET /api/projects/1/).
  const projectIdFromUrl = getProjectIdFromUrl();
  useEffect(() => {
    if (isGuestUser()) {
      console.info('[EngineeringModule] Guest mode detected: skipping project enforcement');
      return;
    }
    const projectId = projectIdFromUrl;
    if (!projectId || Number.isNaN(projectId)) {
      lastLoadedProjectIdRef.current = null;
      message.warning('No active project. Redirecting to home.');
      navigate('/home', { replace: true });
      return;
    }
    // Prevent infinite loop: only fetch once per projectId
    if (lastLoadedProjectIdRef.current === projectId) {
      return;
    }
    lastLoadedProjectIdRef.current = projectId;
    (async () => {
      try {
        resetModuleState();
        clearDesignResults();
        setIsDesignComplete(false);
        setShowOutputDock(false);
        setShowLogs(false);
        setShowOptionsContainer(false);
        setIsInputLocked(false);
        designCompletedRef.current = false;

        const result = await service.getProject(projectId);
        if (!result.success || !result.project) {
          lastLoadedProjectIdRef.current = null;
          message.warning('Project not found. Redirecting to home.');
          navigate('/home', { replace: true });
          return;
        }
        if (result.project.inputs_json) {
          try {
            setInputs(result.project.inputs_json);
          } catch (_ignored) {
            // ignore parse issues; user can overwrite via UI
          }
        }
        // Normalize URL to path form: .../fin_plate/1 instead of .../fin_plate?projectId=1
        const pathname = location.pathname;
        const pathEndsWithId = pathname.endsWith(`/${projectId}`);
        const hasQueryProjectId = new URLSearchParams(location.search).get('projectId') != null;
        if (!pathEndsWithId && hasQueryProjectId && moduleConfig.routePath) {
          const basePath = moduleConfig.routePath.replace(/\/$/, '');
          navigate(`${basePath}/${projectId}`, { replace: true });
        }
      } catch (_e) {
        lastLoadedProjectIdRef.current = null;
        message.warning('Cannot verify project. Redirecting to home.');
        navigate('/home', { replace: true });
      }
    })();
  }, [projectIdFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally stable deps to avoid infinite GET

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
        setShowInputDock(false);
        setShowOutputDock(false);
        setShowCad(true);
        setShowLogs(true);
      } else {
        // Desktop: Auto-open output dock and logs
        console.log(`[DESIGN_COMPLETE] Setting desktop docks: Output=opening, Logs=opening`);
        setShowOutputDock(true);
        setShowLogs(true);
      }

      // Lock inputs after successful design
      setIsInputLocked(true);
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
        setShowOutputDock(true);
        setShowLogs(true);
      }
    }
  }, [status.step, output, isRedesigning, isMobile]);

  const handleGridToggle = () => {
    setIsGridActive(!isGridActive);
  };

  const handleSubmitEnhanced = async () => {
    setIsInputLocked(false);
    // If there's already an existing design, completely reset everything
    if (isDesignComplete || renderBoolean || output) {

      // Immediately hide current model and output
      designCompletedRef.current = false; // Reset completion flag
      setIsRedesigning(true);
      setIsDesignComplete(false);
      setShowOutputDock(false);
      setShowLogs(false);
      setShowOptionsContainer(false);
      setSelectedSection(["Model"]);
      setSelectedCameraView("Model");
      // Reset CAD state based on device type
      if (isMobile) {
        setShowCad(false);
      } else {
        setShowCad(true);
      }

      // Reset all the data that controls model rendering
      await performReset();

      // Small delay to ensure reset is processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Call the actual submit function
    try {
      await handleSubmit();
      setShowResetButton(true);

      // Persist latest inputs to project after design
      if (!isGuestUser()) {
        const pid = getProjectIdFromUrl();
        if (pid && !Number.isNaN(pid)) {
          try {
            await service.updateProject(pid, { inputs_json: inputs });
          } catch (_e) {
            // ignore persistence errors; UI will still show outputs
          }
        }
      }
    } catch (error) {
    } finally {
      // Reset the redesigning state after completion
      setIsRedesigning(false);
    }
  };

  // Toggle reset button visibility
  const toggleResetButton = () => {
    setShowResetButton(!showResetButton);
  };

  // Toggle functions for SVG clicks
  const toggleInputDock = () => {
    console.log(`[TOGGLE] toggleInputDock called | isMobile: ${isMobile} | current showInputDock: ${showInputDock}`);
    if (isMobile) {
      // Mobile: Close all other docks when opening input dock
      if (showInputDock) {
        // Closing input dock
        console.log(`[TOGGLE] Closing input dock (mobile)`);
        setShowInputDock(false);
      } else {
        // Opening input dock - close all others first
        console.log(`[TOGGLE] Opening input dock (mobile) - closing others`);
        setShowOutputDock(false);
        setShowLogs(false);
        setShowCad(false);
        setShowInputDock(true);
      }
    } else {
      // Desktop: Independent toggle
      console.log(`[TOGGLE] Toggling input dock (desktop): ${!showInputDock}`);
      setShowInputDock(prev => !prev);
    }
  };

  const toggleOutputDock = () => {
    // Only check if output exists, not isDesignComplete
    if (!output) {
      console.log(`[TOGGLE] toggleOutputDock called but output is null`);
      return;
    }

    console.log(`[TOGGLE] toggleOutputDock called | isMobile: ${isMobile} | current showOutputDock: ${showOutputDock}`);
    if (isMobile) {
      // Mobile: Close all other docks when opening output dock
      if (showOutputDock) {
        // Closing output dock
        console.log(`[TOGGLE] Closing output dock (mobile)`);
        setShowOutputDock(false);
      } else {
        // Opening output dock - close all others first
        console.log(`[TOGGLE] Opening output dock (mobile) - closing others`);
        setShowInputDock(false);
        setShowLogs(false);
        setShowCad(false);
        setShowOutputDock(true);
      }
    } else {
      // Desktop: Independent toggle
      console.log(`[TOGGLE] Toggling output dock (desktop): ${!showOutputDock}`);
      setShowOutputDock(prev => !prev);
    }
  };

  const handleLockToggle = () => {
    if (isInputLocked) {
      // Show warning modal first
      setShowUnlockWarning(true);
    } else {
      setIsInputLocked(true);
      // Don't close the dock when locking - keep it open but locked
    }
  };

  const confirmUnlock = () => {
    console.log(`[UNLOCK] confirmUnlock called | isMobile: ${isMobile}`);
    designCompletedRef.current = false; // Reset completion flag
    clearDesignResults();
    setIsDesignComplete(false);
    setShowOptionsContainer(false);
    setShowOutputDock(false);
    setShowLogs(false);
    setSelectedSection(["Model"]);
    setSelectedCameraView("Model");
    setShowResetButton(false);
    setHoverText("");
    setHoverPos({ x: 0, y: 0 });
    setIsInputLocked(false);
    setShowInputDock(true);
    setIsRedesigning(false);
    setShowUnlockWarning(false);
    // Reset CAD state based on device type
    if (isMobile) {
      console.log(`[UNLOCK] Resetting docks for mobile: Input=true, CAD=false`);
      setShowCad(false);
    } else {
      console.log(`[UNLOCK] Resetting docks for desktop: Input=true, CAD=true`);
      setShowCad(true);
    }
  };

  const cancelUnlock = () => {
    setShowUnlockWarning(false);
    setIsInputLocked(true);
  };

  const toggleLogs = () => {
    // Only check if output exists
    if (!output) {
      console.log(`[TOGGLE] toggleLogs called but output is null`);
      return;
    }

    console.log(`[TOGGLE] toggleLogs called | isMobile: ${isMobile} | current showLogs: ${showLogs} | current showCad: ${showCad}`);
    if (isMobile) {
      // Mobile: Special logic for CAD+Logs combination
      if (showLogs) {
        // Closing logs
        console.log(`[TOGGLE] Closing logs (mobile)`);
        setShowLogs(false);
      } else {
        // Opening logs
        if (showCad) {
          // If CAD is open, keep it open (CAD+Logs case)
          console.log(`[TOGGLE] Opening logs with CAD (mobile) - CAD+Logs case`);
          setShowInputDock(false);
          setShowOutputDock(false);
          setShowLogs(true);
        } else {
          // Open logs only, close all other docks
          console.log(`[TOGGLE] Opening logs only (mobile) - closing others`);
          setShowInputDock(false);
          setShowOutputDock(false);
          setShowCad(false);
          setShowLogs(true);
        }
      }
    } else {
      // Desktop: Independent toggle
      console.log(`[TOGGLE] Toggling logs (desktop): ${!showLogs}`);
      setShowLogs(prev => !prev);
    }
  };

  // New CAD toggle function
  const toggleCad = () => {
    console.log(`[TOGGLE] toggleCad called | isMobile: ${isMobile} | current showCad: ${showCad} | current showLogs: ${showLogs}`);
    if (isMobile) {
      // Mobile: Special logic for CAD+Logs combination
      if (showCad) {
        // Closing CAD
        console.log(`[TOGGLE] Closing CAD (mobile)`);
        setShowCad(false);
      } else {
        // Opening CAD
        if (showLogs) {
          // If logs are open, keep them open (CAD+Logs case)
          console.log(`[TOGGLE] Opening CAD with logs (mobile) - CAD+Logs case`);
          setShowInputDock(false);
          setShowOutputDock(false);
          setShowCad(true);
        } else {
          // Open CAD only, close all other docks
          console.log(`[TOGGLE] Opening CAD only (mobile) - closing others`);
          setShowInputDock(false);
          setShowOutputDock(false);
          setShowLogs(false);
          setShowCad(true);
        }
      }
    } else {
      // Desktop: CAD is always visible, no toggle needed
      // This shouldn't be called on desktop, but handle gracefully
      console.log(`[TOGGLE] toggleCad called on desktop - setting showCad to true`);
      setShowCad(true);
    }
  };

  const handleResetEnhanced = async () => {
    setShowResetConfirmation(true);
    setConfirmationType("reset");
  };

  const performResetEnhanced = async () => {
    performReset();
    setShowResetButton(false);
    setShowResetConfirmation(false);
    setShowOutputDock(false);
    setShowInputDock(true);
    setIsDesignComplete(false);
    setShowLogs(false); // Reset logs visibility
    setShowOptionsContainer(false); // Hide options container on reset
    setSelectedSection("Model"); // Reset selected section
    setSelectedCameraView("Model"); // Reset selected camera view
    setIsRedesigning(false); // Reset redesigning state
    setIsInputLocked(false);
    // Reset CAD state based on device type
    if (isMobile) {
      setShowCad(false);
    } else {
      setShowCad(true);
    }
  };
  // Save inputs to OSI file / Project (JSON-first)
  const handleSaveInputs = async () => {
    const userIsGuest = isGuest();

    // Determine module_id - use designType from moduleConfig, or fallback to inputs.module
    const module_id = moduleConfig?.designType || inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
    const projectName = inputs?.project_name || inputs?.name || moduleConfig?.sessionName || 'project';

    try {
      const inputsForSave = expandAllSelectedInputs(inputs, allSelected, contextData);
      if (userIsGuest) {
        // Guest: OSI download flow using service
        const result = await service.saveOSIFromInputs(projectName, module_id, inputsForSave, false);
        if (result.success && result.is_guest && result.content_base64) {
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
        message.error(result.error || 'Failed to save inputs');
        return;
      }

      // Authenticated: persist inputs_json to project
      const projectId = getProjectIdFromUrl();
      if (!projectId || Number.isNaN(projectId)) {
        message.warning('No active project. Open or create a project first.');
        return;
      }
      const updateResult = await service.updateProject(projectId, { inputs_json: inputsForSave });
      if (!updateResult.success) {
        message.error(updateResult.error || 'Failed to save inputs');
        return;
      }

      // Also provide a local OSI download for logged-in users (same as guest)
      try {
        const saveResult = await service.saveOSIFromInputs(projectName, module_id, inputsForSave, true);
        if (saveResult.success && saveResult.content_base64) {
          const binaryString = atob(saveResult.content_base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = saveResult.filename || `${projectName}.osi`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('Inputs saved and OSI downloaded');
        } else {
          message.success('Inputs saved');
        }
      } catch (_e) {
        message.success('Inputs saved');
      }
    } catch (err) {
      console.error('Error saving inputs:', err);
      message.error('Failed to save inputs');
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

  // Default hover dictionary mapping per-part names to labels
  // Prioritize ctxHoverDict values from backend over defaults
  // Use useMemo to recalculate when ctxHoverDict changes
  const hoverDict = useMemo(() => {
    const defaults = {
      // Defaults (fallback if backend doesn't provide)
      Beam: "Beam",
      Column: "Column",
      Plate: "Plate",
      Weld: "Weld",
      Welds: "Welds",
      Bolt: "Bolt",
      Bolts: "Bolts",
      cleatAngle: "Cleat Angle",
      SeatedAngle: "Seated Angle",
      Connector: "Connector",
      EndPlate: "End Plate",
      Member: "Member",
      Angle: "Angle",
    };

    // Backend hover_dict values override defaults
    const final = {
      ...defaults,
      ...(ctxHoverDict || {}),
    };

    // Debug: log hoverDict to see what we have
    if (ctxHoverDict && Object.keys(ctxHoverDict).length > 0) {
      console.log('[EngineeringModule] ctxHoverDict:', ctxHoverDict);
      console.log('[EngineeringModule] Final hoverDict:', final);
    }

    return final;
  }, [ctxHoverDict]);

  // If backend provided bolt details but no separate Bolt mesh exists,
  // enrich the Plate hover to include bolt info as a fallback.
  const hasBoltMesh = Boolean(cadModelPaths?.Bolt || cadModelPaths?.Bolts);
  if (!hasBoltMesh && (ctxHoverDict && ctxHoverDict.Bolt)) {
    const boltText = String(ctxHoverDict.Bolt).replace(/<br\s*\/?>/gi, ' ');
    hoverDict.Plate = hoverDict.Plate ? `${hoverDict.Plate}: ${boltText}` : boltText;
  }

  const handleHoverLabel = (label, clientX, clientY) => {
    if (!label) return;
    if (typeof clientX === 'number' && typeof clientY === 'number') {
      setHoverPos({ x: clientX + 12, y: clientY + 12 });
    }
    setHoverText(label);
  };
  const handleHoverEnd = () => {
    setHoverText("");
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Navigation */}
      <div className="sticky top-0 z-[60] md:h-[15%] min-h-[48px] max-h-[80px] flex flex-row flex-wrap justify-center md:justify-between items-center bg-[#d2d4d2] gap-x-4 w-full text-sm flex-shrink-0 pl-4">
        <div className="flex flex-row flex-wrap justify-center md:justify-start items-center gap-x-4">
          {menuItems.map((item, index) => (
            <UnifiedDropdownMenu
              key={index}
              label={item.label}
              dropdown={item.dropdown}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              inputs={inputs}
              setInputs={setInputs}
              allSelected={allSelected}
              logs={logs}
              setCreateDesignReportBool={setCreateDesignReportBool}
              triggerScreenshotCapture={triggerScreenshotCapture}
              selectedOption={extraState.selectedOption}
              setSelectedOption={(value) =>
                setExtraState({ ...extraState, selectedOption: value })
              }
              cadModelPaths={cadModelPaths}
              contextData={contextData}
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
            className={`w-9 h-9 flex items-center justify-center transition`}
            title={`${showInputDock ? 'Hide' : 'Show'} input dock`}
            type="button"
          >
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
              <line x1="40" y1="10" x2="40" y2="90" stroke="currentColor" strokeWidth="6" />
              {showInputDock && (
                <rect x="10" y="10" width="30" height="80" fill="currentColor" />
              )}
            </svg>

          </button>

          {/* Logs Button */}
          <button
            onClick={toggleLogs}
            disabled={!output}
            className={`w-9 h-9 flex items-center justify-center transition`}
            title={output ? `${showLogs ? 'Hide' : 'Show'} logs` : 'Run a design to view logs'}
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

             {showLogs && (
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

          {/* CAD Toggle Button - Mobile Only */}
          <button
            onClick={toggleCad}
            className={`md:hidden p-2 min-w-[44px] min-h-[44px] rounded-md transition-colors ${showCad
              ? 'bg-osdag-green text-white dark:bg-osdag-dark-green'
              : 'hover:bg-black/10 dark:hover:bg-black/40'
              }`}
            title={`${showCad ? 'Hide' : 'Show'} CAD`}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 3D Cube Icon */}
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </button>

          {/* Output Dock Button */}
          <button
            onClick={toggleOutputDock}
            disabled={!output}
            title={output ? `${showOutputDock ? 'Hide' : 'Show'} output dock` : 'Run a design to view outputs'}
            type="button"
            className={`p-2 md:p-2 min-w-[44px] min-h-[44px] rounded-md transition-colors ${output
              ? (showOutputDock ? 'bg-osdag-green text-white dark:bg-osdag-dark-green' : 'hover:bg-black/10 dark:hover:bg-black/40')
              : "opacity-40 cursor-not-allowed"
              }`}
          >
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
              <line x1="60" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="6" />
              {showOutputDock && (
                <rect x="60" y="10" width="30" height="80" fill="currentColor" />
              )}
            </svg>
          </button>
          {/* home */}
          <button
            onClick={() => navigate('/home')}
            title="Home"
            type="button"
            className="p-2 md:p-2 min-w-[44px] min-h-[44px] rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
          {/* theme mode */}
          <button
            onClick={toggleTheme}
            className="p-2 md:p-2 min-w-[44px] min-h-[44px] text-black transition-colors dark:text-white"
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.64 13.64a1 1 0 00-1.05-.24 8 8 0 01-10-10 1 1 0 00-.24-1.05A1 1 0 008.73 2 10 10 0 1022 15.27a1 1 0 00-.36-1.63z" />
              </svg>
            )}
          </button>

        </div>

        {/* Initial theme detection, run once per mount */}
        {React.useEffect(() => {
          const saved = localStorage.getItem('osdag-theme');
          if (saved === 'dark') {
            document.body.classList.add('dark');
          } else if (saved === 'light') {
            document.body.classList.remove('dark');
          }
        }, [])}
      </div>

      <div className="relative flex flex-row h-full w-full">
        {/* Input Dock Toggle Button - Fixed to left, shows when dock is closed (Desktop only) */}
        {!showInputDock && !isMobile && (
          <button
            onClick={toggleInputDock}
            className="hidden md:flex absolute left-0 top-0 h-full w-8 bg-white dark:bg-osdag-dark-color border-r border-gray-300 dark:border-osdag-border items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            title="Open Input Dock"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </button>
        )}

        {/* Output Dock Toggle Button - Fixed to right, shows when dock is closed and output exists (Desktop only) */}
        {!showOutputDock && output && !isMobile && (
          <button
            onClick={toggleOutputDock}
            className="hidden md:flex absolute right-0 top-0 h-full w-8 bg-white dark:bg-osdag-dark-color border-l border-gray-300 dark:border-gray-700 items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            title="Open Output Dock"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor">
              <path d="M15.41 7.41L10.83 12l4.58 4.59L14 18l-6-6 6-6 1.41 1.41z" />
            </svg>
          </button>
        )}

        {/* Left - Input Dock */}
        {showInputDock && (
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
          />
        )}

        {/* Middle - 3D Model and Logs Container */}
        <div className={`
          flex-1 flex flex-col relative min-w-0
          ${isMobile && (showInputDock || showOutputDock) ? 'hidden' : 'flex'}
        `}>
          {/* Options Container - Show after design is complete. On desktop, show even when docks are open. On mobile, only show when CAD is visible */}
          {showOptionsContainer && output && (isMobile ? showCad : true) && (
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
                                setSelectedView("Model");
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
                                setSelectedView(newSelection[0]);
                                setSelectedCameraView(newSelection[0]);
                              } else {
                                // Uncheck: remove this option
                                const newSelection = selectedSection.filter(s => s !== option);
                                // If nothing left, default to Model
                                if (newSelection.length === 0) {
                                  setSelectedSection(["Model"]);
                                  setSelectedView("Model");
                                  setSelectedCameraView("Model");
                                } else {
                                  setSelectedSection(newSelection);
                                  setSelectedView(newSelection[0]);
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
          {(!isMobile || showCad) && (
            <div className={`
              model-container
              ${isMobile
                ? (showLogs ? 'h-[70%]' : 'h-full')
                : (showLogs ? 'h-[60%]' : 'h-full')
              }
            `}>
              {loading || isRedesigning ? (
                <div className="modelLoading">
                  <p>{isRedesigning ? "Updating Model..." : "Loading Model..."}</p>
                </div>
              ) : renderBoolean ? (
                <div className="cadModel relative   bg-gradient-to-b from-[#FFFFFF] to-[#7E7E7E] dark:from-[#535353] dark:to-[#000000]">
                  {/* Existing background color picker - left side */}
                  {/* <div className="absolute top-2 left-2 flex items-center gap-2 bg-white/90 dark:bg-osdag-dark-color/90 px-3 py-1.5 rounded-lg shadow-md z-10">
                  <label htmlFor="bgColorPicker" className="text-xs font-medium text-black dark:text-white mr-1">
                    Background:
                  </label>
                  <input
                    type="color"
                    id="bgColorPicker"
                    value={bgColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="bg-color-picker"
                    title="Change Background Color"
                  />
                </div> */}

                  <Canvas
                    gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
                    style={{ width: "100%", height: "100%", background: 'transparent' }}
                  >
                    <PerspectiveCamera
                      ref={cameraRef}
                      makeDefault
                      position={cameraPos}
                      fov={13}
                      near={0.1}
                      far={1000}
                    />
                    <Suspense
                      fallback={
                        <Html>
                          <p>Loading 3D Model...</p>
                        </Html>
                      }
                    >
                      {renderBoolean && normalizedCadModelPaths && Object.keys(normalizedCadModelPaths).length > 0 && (() => {
                        const activeViews = Array.isArray(selectedSection) ? selectedSection : [selectedSection];
                        const primary = activeViews[0] || "Model";
                        if (primary && primary !== "Model") {
                          const hasPart =
                            normalizedCadModelPaths[primary] ||
                            normalizedCadModelPaths[primary?.toLowerCase?.()] ||
                            normalizedCadModelPaths[primary?.toUpperCase?.()];
                          if (!hasPart) {
                            return (
                              <Html>
                                <p>{`No CAD part found for view "${primary}". Available parts: ${Object.keys(normalizedCadModelPaths).join(", ")}`}</p>
                              </Html>
                            );
                          }
                        }
                        return null;
                      })()}
                      <CadSceneProvider>
                        <CadScene
                          modelPaths={normalizedCadModelPaths}
                          selectedView={Array.isArray(selectedSection) ? selectedSection[0] : selectedSection}
                          selectedViews={selectedSection}
                          isMobile={isMobile}
                          cameraSettings={{
                            ...cameraSettings,
                            connectivity: getConnectivity(), // Add connectivity info
                          }}
                          hoverDict={hoverDict}
                          onHoverLabel={handleHoverLabel}
                          onHoverEnd={handleHoverEnd}
                          moduleCadConfig={moduleConfig}
                          key={`${modelKey}-${selectedSection}`}
                        />
                        <CadSceneBbox
                          modelKey={modelKey}
                          selectedCameraView={selectedCameraView}
                        />
                        <ScreenshotCapture
                          screenshotTrigger={screenshotTrigger}
                          setScreenshotTrigger={setScreenshotTrigger}
                          selectedView={Array.isArray(selectedSection) ? selectedSection[0] : selectedSection}
                        />
                        <ReportCaptureDev />
                      </CadSceneProvider>
                    </Suspense>
                  </Canvas>
                </div>
              ) : (
                <div className="modelback"></div>
              )}
            </div>
          )}

          {/* Logs Dock */}
          {showLogs && output && (
            <div className={`
              ${isMobile
                ? (showCad ? 'h-[30%]' : 'fixed inset-0 z-50 h-full pt-[80px]')
                : 'h-[40%]'
              }
              ${isMobile && !showCad ? 'bg-white dark:bg-osdag-dark-color' : ''}
              ${!isMobile && !showInputDock ? 'md:pl-0' : 'md:pl-[30px]'}
              ${!isMobile && !showOutputDock && output ? 'md:pr-0' : ''}
            `}>
              <Logs logs={logs} />
            </div>
          )}
        </div>

        {/* Right - Output Dock */}
        {showOutputDock && output && outputConfig && status.step !== DESIGN_STATUS.ERROR && (
          <div className={`
            fixed inset-0 z-50 h-full pt-[80px] sm:relative sm:inset-auto sm:z-auto sm:h-auto sm:pt-0
            w-full sm:w-[320px] md:w-[350px] lg:w-[400px]
            flex flex-col
            bg-white dark:bg-osdag-dark-color
          `}>
            <BaseOutputDock
              output={output}
              outputConfig={outputConfig}
              title={title || UI_STRINGS.OUTPUT_DOCK}
              extraState={{ ...extraState, cadModelPaths, renderCadModel: renderBoolean, connectivity: inputs?.connectivity, member_designation: inputs?.member_designation, designation: inputs?.member_designation, weld_type: inputs?.weld_type }}
              handleCreateDesignReport={handleCreateDesignReport}
              saveOutput={saveOutput}
            />
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
            onCancel={() =>
              isInputLocked
                ? setDesignPrefModalStatus(false)   // Directly close
                : setConfirmationModal(true)        // Ask confirmation
            }
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
              confirmationModal={confirmationModal}
              setConfirmationModal={setConfirmationModal}
              isInputLocked={isInputLocked}
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
    </div >
  );
};
