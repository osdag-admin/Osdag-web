import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";

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
  const params = useParams();
  const projectId = params.projectId ? parseInt(params.projectId, 10) : null;
  /// TODO: verify if this flow is ok or we need to add a save project and not auto save
  const saveTimeoutRef = useRef(null);
  const pendingSaveRef = useRef(null);
  const [designData, setDesignData] = useState({});
  const [designLogs, setDesignLogs] = useState([]);
  const [cadModelPaths, setCadModelPaths] = useState({});
  const [hoverDict, setHoverDict] = useState({});
  const [renderCadModel, setRenderCadModel] = useState(false);
  const [displayPDF, setDisplayPDF] = useState(false);

  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);

  // Status state machine
  const [status, setStatus] = useState({
    step: DESIGN_STATUS.IDLE,
    message: '',
    error: null
  });

  // Cleanup/Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingSaveRef.current && projectId && service.updateProject) {
        service.updateProject(projectId, pendingSaveRef.current).catch(err => {
          if (import.meta.env.DEV) {
            console.error('[useDesignSubmission] Failed to save outputs on unmount:', err);
          }
        });
      }
    };
  }, [projectId, service]);

  const submitDesign = async ({
    inputs,
    dockInputs = null,
    designPrefOverrides = null,
    selectionStates,
    allSelected,
    moduleData,
    extraState,
  }) => {
    let outputWasSet = false;

    // Pass full moduleData as lists so buildSubmissionParams can use sectionDesignation, anchorDiameterList, etc.
    const lists = moduleData;

    // Validation step
    setStatus({
      step: DESIGN_STATUS.VALIDATING,
      message: 'Validating inputs...',
      error: null
    });

    if (moduleConfig.inputSections) {
      for (const section of moduleConfig.inputSections) {
        for (const field of section.fields || []) {
          if (field.conditionalDisplay && !field.conditionalDisplay(extraState, inputs)) {
            continue;
          }

          if (field.type === 'image') {
            continue;
          }

          let value = inputs[field.key];
          if (field.type === 'connectivitySelect' || field.type === 'endPlateSelect') {
            value = extraState?.selectedOption || value;
          }
          const isCustomizable = field.type === 'customizable';

          if (isCustomizable) {
            const selectionKey = field.selectionKey;
            const isCustomized = selectionStates?.[selectionKey] === 'Customized';
            if (isCustomized && (!Array.isArray(value) || value.length === 0)) {
              const errMsg = `Please select at least one value for ${field.label}.`;
              setStatus({
                step: DESIGN_STATUS.ERROR,
                message: errMsg,
                error: new Error(errMsg)
              });
              message.error(errMsg);
              return;
            }
          } else {
            if (
              value === undefined ||
              value === null ||
              (typeof value === 'string' && value.trim() === '') ||
              value === 'Select Section' ||
              (Array.isArray(value) && value.length === 0)
            ) {
              const errMsg = `Please fill in the ${field.label} field.`;
              setStatus({
                step: DESIGN_STATUS.ERROR,
                message: errMsg,
                error: new Error(errMsg)
              });
              message.error(errMsg);
              return;
            }
          }
        }
      }
    }

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
      message.error(validationResult.message || 'Validation failed');
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
      if (import.meta.env.DEV) {
        console.error("buildSubmissionParams threw:", err);
      }
      return;
    }

    // Calculation step
    setStatus({
      step: DESIGN_STATUS.CALCULATING,
      message: 'Running design calculations...',
      error: null
    });
    setLoading(true);

    try {
      const designResult = await service.createDesign(moduleConfig.designType, param);
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
      outputWasSet = true;
      setDisplayOutput(true);

      if (designBody?.design_status === false) {
        const failMessage = "Design is unsafe / failed. Please inspect calculation logs for details.";
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: failMessage,
          error: new Error(failMessage)
        });
        setLoading(false);
        return;
      }

      if (projectId && service.updateProject) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        const savePayload = {
          inputs_json: {
            dock: dockInputs || { ...inputs, ...extraState },
            pref: designPrefOverrides || {},
          },
          outputs_json: designBody.data,
        };
        pendingSaveRef.current = savePayload;

        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await service.updateProject(projectId, savePayload);
            pendingSaveRef.current = null;
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error('[useDesignSubmission] Failed to save outputs (debounced):', err);
            }
          } finally {
            saveTimeoutRef.current = null;
          }
        }, 5000);
      }

      setStatus({
        step: DESIGN_STATUS.CAD_GENERATING,
        message: 'Building 3D model...',
        error: null
      });

      const cadResult = await service.createCADModel(moduleConfig.designType, param);

      if (cadResult?.success) {
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

        setCadModelPaths(normalizedFiles);
        setHoverDict(cadResult.hover_dict || {});
        setRenderCadModel(true);
        setRenderBoolean(true);
        setDisplayOutput(true);
        setLoading(false);
        setModelKey((prev) => prev + 1);

        setStatus({
          step: DESIGN_STATUS.COMPLETE,
          message: 'Design complete!',
          error: null
        });

        setTimeout(() => {
          setStatus({
            step: DESIGN_STATUS.IDLE,
            message: '',
            error: null
          });
        }, 1000);
      } else {
        const cadErrorMessage = cadResult?.error || 'Failed to generate 3D model';
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: `Calculation succeeded, but ${cadErrorMessage.toLowerCase()}`,
          error: new Error(cadErrorMessage)
        });
        setLoading(false);
        setRenderBoolean(false);
      }
    } catch (e) {
      const hasOutput = outputWasSet;
      const errorMessage = e.message || 'An error occurred during design';

      if (hasOutput) {
        setStatus({
          step: DESIGN_STATUS.ERROR,
          message: `Calculation succeeded, but ${errorMessage.toLowerCase()}`,
          error: e
        });
      } else {
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

  const loadSavedOutputs = (outputsData) => {
    if (!outputsData || Object.keys(outputsData).length === 0) return;

    const formattedOutput = {};
    for (const [key, value] of Object.entries(outputsData)) {
      const label = value?.label ?? key;
      const val = value?.val ?? value?.value ?? value;
      formattedOutput[key] = { label, val: val !== undefined && val !== null ? val : "" };
    }

    setOutput(formattedOutput);
    setDisplayOutput(true);
  };

  const loadOutputs = (outputsData) => {
    if (!outputsData) return;

    const formattedOutput = {};
    for (const [key, value] of Object.entries(outputsData)) {
      const label = value?.label ?? key;
      const val = value?.val ?? value?.value ?? value;
      formattedOutput[key] = { label, val: val !== undefined && val !== null ? val : "" };
    }

    setDesignData(outputsData);
    setOutput(formattedOutput);
    setDisplayOutput(true);
  };

  // Inject a pre-generated CAD model (e.g. from the PSO optimization result)
  // and flip the render flags so the CadViewer picks it up — mirrors the CAD
  // handling in the synchronous submitDesign flow.
  const loadCadModel = (files, hover) => {
    if (!files || Object.keys(files).length === 0) return;
    const normalizedFiles = {};
    Object.entries(files).forEach(([key, value]) => {
      if (!key) return;
      const normKey = key.trim();
      const mapped =
        normKey === 'beam' ? 'Beam' :
          normKey === 'column' ? 'Column' :
            normKey === 'plate' ? 'Plate' :
              normKey;
      normalizedFiles[mapped] = value;
    });
    setCadModelPaths(normalizedFiles);
    setHoverDict(hover || {});
    setRenderCadModel(true);
    setRenderBoolean(true);
    setModelKey((prev) => prev + 1);
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
    loading,
    renderBoolean,
    modelKey,
    setModelKey,
    // status state machine
    status,
    setStatus,
    screenshotTrigger,
    setScreenshotTrigger,
    // helpers
    resetDesignState,
    clearDesignResults,
    loadSavedOutputs,
    loadOutputs,
    loadCadModel,
  };
};

