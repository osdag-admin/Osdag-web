import { useEffect, useState } from "react";

/**
 * Status state machine types
 * Represents the different stages of the design workflow
 */
export const DESIGN_STATUS = {
  IDLE: 'IDLE',
  VALIDATING: 'VALIDATING',
  CALCULATING: 'CALCULATING',
  CAD_GENERATING: 'CAD_GENERATING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
};

/**
 * Status object shape
 * {
 *   step: DESIGN_STATUS.IDLE | DESIGN_STATUS.VALIDATING | ...
 *   message: string
 *   error: Error | null
 *   progress: number (0-100, optional)
 * }
 */

/**
 * Action layer for design + CAD submission.
 * Encapsulates validation, submission pipeline, and related UI state.
 */
export const useDesignSubmission = (service, moduleConfig) => {
  const [designData, setDesignData] = useState({});
  const [designLogs, setDesignLogs] = useState([]);
  const [cadModelPaths, setCadModelPaths] = useState({});
  const [hoverDict, setHoverDict] = useState({});
  const [renderCadModel, setRenderCadModel] = useState(false);
  const [displayPDF, setDisplayPDF] = useState(false);

  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [loading, setLoading] = useState(false); // Keep for backward compatibility
  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);
  
  // Status state machine
  const [status, setStatus] = useState({
    step: DESIGN_STATUS.IDLE,
    message: '',
    error: null
  });

  const submitDesign = async ({ inputs, selectionStates, allSelected, moduleData, extraState }) => {
    console.log("[useDesignSubmission] submitDesign start", {
      designType: moduleConfig.designType,
      inputs,
      allSelected,
    });
    
    // Pass full moduleData as lists so buildSubmissionParams can use sectionDesignation, anchorDiameterList, etc.
    const lists = moduleData;
    
    // Validation step
    setStatus({
      step: DESIGN_STATUS.VALIDATING,
      message: 'Validating inputs...',
      error: null
    });
    
    const validationResult = moduleConfig.validateInputs(
      inputs,
      extraState,
      lists,
      selectionStates
    );
    
    if (!validationResult.isValid) {
      setStatus({
        step: DESIGN_STATUS.ERROR,
        message: validationResult.message || 'Validation failed',
        error: new Error(validationResult.message)
      });
      alert(validationResult.message);
      return;
    }

    // Parameter building step
    let param = null;
    try {
      param = moduleConfig.buildSubmissionParams(
        inputs,
        allSelected,
        lists,
        extraState
      );
    } catch (err) {
      setStatus({
        step: DESIGN_STATUS.ERROR,
        message: 'Error preparing submission parameters',
        error: err
      });
      alert("Error preparing submission parameters. See console for details.");
      console.error("buildSubmissionParams threw:", err);
      return;
    }

    // Calculation step
    setStatus({
      step: DESIGN_STATUS.CALCULATING,
      message: 'Running design calculations...',
      error: null
    });
    setLoading(true); // Keep for backward compatibility

    try {
      const designResult = await service.createDesign(moduleConfig.designType, param);
      console.log("[useDesignSubmission] designResult", designResult);
      const designStatus = designResult?.status;
      const designBody = designResult?.body;
      const designSuccess =
        (designResult?.status === 200 || designResult?.status === 201) &&
        designBody?.success !== false &&
        designBody?.data;

      if (!designSuccess) {
        const errorMessage = designBody?.error || "Design failed. Please check inputs.";
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: errorMessage,
          error: new Error(errorMessage)
        });
        setLoading(false);
        alert(errorMessage);
        return;
      }

      // Normalize design output once and set (keep all keys so output dock can show every configured field)
      const formattedOutput = {};
      for (const [key, value] of Object.entries(designBody?.data || {})) {
        const label = value?.label ?? key;
        const val = value?.val ?? value?.value ?? value;
        formattedOutput[key] = { label, val: val !== undefined && val !== null ? val : "" };
      }

      const nextLogs = designBody.logs || [];
      setDesignData(designBody.data || {});
      setDesignLogs(nextLogs);
      setLogs(nextLogs);
      setOutput(formattedOutput);
      setDisplayOutput(true); // Show output immediately after calculation

      // CAD Generation step
      setStatus({
        step: DESIGN_STATUS.CAD_GENERATING,
        message: 'Building 3D model...',
        error: null
      });
      
      const cadResult = await service.createCADModel(moduleConfig.designType, param);
      console.log("[useDesignSubmission] CAD result", cadResult);
      
      if (cadResult?.success) {
        console.log('[useDesignSubmission] CAD success, files:', cadResult.files);
        // Normalize CAD keys to expected case
        const normalizedFiles = {};
        Object.entries(cadResult.files || {}).forEach(([key, value]) => {
          if (!key) return;
          const normKey = key.trim();
          const mapped =
            normKey === 'beam' ? 'Beam' :
            normKey === 'column' ? 'Column' :
            normKey === 'plate' ? 'Plate' :
            normKey;
          normalizedFiles[mapped] = value;
        });

        setCadModelPaths(cadResult.files || {});
        setHoverDict(cadResult.hover_dict || {});
        setRenderCadModel(true);
        setRenderBoolean(true);
        setDisplayOutput(true);
        setLoading(false);
        setModelKey((prev) => prev + 1);
        
        // Complete
        setStatus({
          step: DESIGN_STATUS.COMPLETE,
          message: 'Design complete!',
          error: null
        });
        
        // Auto-dismiss after 1 second
        setTimeout(() => {
          setStatus({
            step: DESIGN_STATUS.IDLE,
            message: '',
            error: null
          });
        }, 1000);
      } else {
        // CAD failed but calculation succeeded - partial success
        const cadErrorMessage = cadResult?.error || 'Failed to generate 3D model';
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: `Calculation succeeded, but ${cadErrorMessage.toLowerCase()}`,
          error: new Error(cadErrorMessage)
        });
        setLoading(false);
        setRenderBoolean(false);
        // Keep output visible since calculation succeeded
      }
    } catch (e) {
      // Determine if this is a calculation error or CAD error
      const hasOutput = output !== null;
      const errorMessage = e.message || 'An error occurred during design';
      
      if (hasOutput) {
        // Partial success: calculation worked, CAD failed
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: `Calculation succeeded, but ${errorMessage.toLowerCase()}`,
          error: e
        });
      } else {
        // Complete failure: calculation failed
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: errorMessage,
          error: e
        });
      }
      
      setLoading(false);
      setRenderBoolean(false);
    }
  };

  const resetDesignState = () => {
    setDesignData({});
    setDesignLogs([]);
    setCadModelPaths({});
    setHoverDict({});
    setRenderCadModel(false);
    setRenderBoolean(false);
    setModelKey(0);
    setOutput(null);
    setLogs(null);
    setDisplayOutput(false);
    setLoading(false);
    setStatus({
      step: DESIGN_STATUS.IDLE,
      message: '',
      error: null
    });
  };

  const clearDesignResults = () => {
    setDisplayOutput(false);
    setOutput(null);
    setLogs(null);
    setRenderBoolean(false);
    setModelKey((prev) => prev + 1);
    setLoading(false);
    setStatus({
      step: DESIGN_STATUS.IDLE,
      message: '',
      error: null
    });
  };

  return {
    // submission
    submitDesign,
    // design state
    designData,
    designLogs,
    cadData: {
      paths: cadModelPaths,
      hover: hoverDict,
      render: renderCadModel,
    },
    displayPDF,
    setDisplayPDF,
    // derived/output
    output,
    logs,
    displayOutput,
    setDisplayOutput,
    // ui/flags
    loading, // Keep for backward compatibility
    renderBoolean,
    modelKey,
    setModelKey,
    // status state machine
    status,
    setStatus,
    // backward compatibility (deprecated, use status instead)
    isLoadingModalVisible: status.step !== DESIGN_STATUS.IDLE,
    setIsLoadingModalVisible: (visible) => {
      if (!visible) {
        setStatus({ step: DESIGN_STATUS.IDLE, message: '', error: null });
      }
    },
    loadingStage: status.message,
    setLoadingStage: (message) => {
      if (status.step !== DESIGN_STATUS.IDLE) {
        setStatus({ ...status, message });
      }
    },
    screenshotTrigger,
    setScreenshotTrigger,
    // helpers
    resetDesignState,
    clearDesignResults,
  };
};

