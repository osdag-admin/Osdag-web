import { useEffect, useRef } from "react";
import { message } from "antd";
import { useAuth } from "../../../context/AuthContext";
import { loadStateFromOsi } from "../utils/osiLoader";

export const useProjectLoader = ({
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
  moduleData,
}) => {
  const lastLoadedProjectIdRef = useRef(undefined);
  const { user, loading } = useAuth();

  // Snapshot whether an OSI prefill key exists at render time, before any
  // effect (including useModuleForm's prefill-consuming effect) has run.
  // Reading sessionStorage live inside the effect below races with
  // useModuleForm, which deletes the key as soon as it applies the prefill —
  // by the time this effect's async auth check resolves, the key can already
  // be gone, causing resetFormState() to wipe out the prefilled inputs.
  const moduleKeyForPrefillRef = useRef(undefined);
  const hadPrefillAtMountRef = useRef(false);
  {
    const activeConfig = moduleConfig || {};
    const moduleKeyNow = activeConfig.designType || activeConfig.moduleKey || activeConfig.cameraKey;
    if (moduleKeyForPrefillRef.current !== moduleKeyNow) {
      moduleKeyForPrefillRef.current = moduleKeyNow;
      hadPrefillAtMountRef.current = !!(moduleKeyNow && sessionStorage.getItem(`prefill:${moduleKeyNow}`));
    }
  }

  const callbacksRef = useRef({
    setInputs,
    setDesignPrefOverrides,
    loadSavedOutputs,
    resetModuleState,
    clearDesignResults,
    resetDocks,
    setIsDesignComplete,
    setShowOptionsContainer,
    setIsInputLocked,
    resetFormState,
    service,
    moduleConfig,
    navigate,
    location,
    setExtraState,
    setSelectionStates,
    setAllSelected,
    setSelectedItems,
    moduleData,
  });

  useEffect(() => {
    callbacksRef.current = {
      setInputs,
      setDesignPrefOverrides,
      loadSavedOutputs,
      resetModuleState,
      clearDesignResults,
      resetDocks,
      setIsDesignComplete,
      setShowOptionsContainer,
      setIsInputLocked,
      resetFormState,
      service,
      moduleConfig,
      navigate,
      location,
      setExtraState,
      setSelectionStates,
      setAllSelected,
      setSelectedItems,
      moduleData,
    };
  });

  useEffect(() => {
    return () => {
      lastLoadedProjectIdRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const projectId = projectIdFromUrl || null;

    if (lastLoadedProjectIdRef.current === projectId) {
      return;
    }

    if (callbacksRef.current.location.state?.justSaved) {
      console.info('[EngineeringModule] Just saved project, preserving current UI state.');
      lastLoadedProjectIdRef.current = projectId;
      window.history.replaceState({}, document.title); 
      return;
    }

    lastLoadedProjectIdRef.current = projectId;

    if (!projectId) {
      const hasPrefill = hadPrefillAtMountRef.current;

      if (hasPrefill) {
        console.info('[EngineeringModule] OSI prefill detected: skipping default reset');
        return;
      }

      console.info('[EngineeringModule] No project ID in URL: resetting form to defaults');
      callbacksRef.current.resetFormState();
      return;
    }

    if (!user) {
      console.info('[EngineeringModule] Guest mode detected with project ID: skipping project loading');
      return;
    }

    const abortController = new AbortController();

    const loadProject = async () => {
      try {
        callbacksRef.current.resetModuleState();
        callbacksRef.current.clearDesignResults();
        callbacksRef.current.setIsDesignComplete(false);
        callbacksRef.current.resetDocks("RESET");
        callbacksRef.current.setShowOptionsContainer(false);
        callbacksRef.current.setIsInputLocked(false);
        designCompletedRef.current = false;

        const result = await callbacksRef.current.service.getProject(projectId, { signal: abortController.signal });
        if (abortController.signal.aborted) return;
        
        if (!result.success || !result.project) {
          lastLoadedProjectIdRef.current = undefined;
          message.warning('Project not found.');
          return;
        }

        if (result.project.inputs_json) {
          try {
            const savedInputs = result.project.inputs_json;
            loadStateFromOsi(savedInputs, {
              setInputs: callbacksRef.current.setInputs,
              setDesignPrefOverrides: callbacksRef.current.setDesignPrefOverrides,
              setExtraState: callbacksRef.current.setExtraState,
              setSelectionStates: callbacksRef.current.setSelectionStates,
              setAllSelected: callbacksRef.current.setAllSelected,
              setSelectedItems: callbacksRef.current.setSelectedItems,
              moduleConfig: callbacksRef.current.moduleConfig,
              safeModuleData: callbacksRef.current.moduleData || {},
            });
          } catch (err) {
            console.error('[EngineeringModule] Error parsing inputs_json:', err);
            message.error('Failed to parse saved project inputs.');
          }
        }
        if (result.project.outputs_json) {
          try {
            callbacksRef.current.loadSavedOutputs(result.project.outputs_json);
          } catch (err) {
            console.error('[EngineeringModule] Error loading saved outputs:', err);
            message.error('Failed to load saved project outputs.');
          }
        }

        const currentPathname = callbacksRef.current.location.pathname;
        const pathEndsWithId = currentPathname.endsWith(`/${projectId}`);
        const hasQueryProjectId = new URLSearchParams(callbacksRef.current.location.search).get('projectId') != null;
        if (!pathEndsWithId && hasQueryProjectId && callbacksRef.current.moduleConfig.routePath) {
          const basePath = callbacksRef.current.moduleConfig.routePath.replace(/\/$/, '');
          callbacksRef.current.navigate(`${basePath}/${projectId}`, { replace: true });
        }
      } catch (_e) {
        if (abortController.signal.aborted) return;
        lastLoadedProjectIdRef.current = undefined;
        console.error('[EngineeringModule] Error loading project:', _e);
        message.warning('Cannot load project. Redirecting to module base.');

        const basePath = callbacksRef.current.moduleConfig.routePath || '/home';
        callbacksRef.current.navigate(basePath, { replace: true });
      }
    };

    loadProject();

    return () => {
      abortController.abort();
    };

  }, [projectIdFromUrl, user, loading, designCompletedRef]);
};