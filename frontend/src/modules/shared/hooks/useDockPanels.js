import { useReducer, useCallback, useEffect } from "react";

const initialState = {
  input: true,
  output: true,
  cad: typeof window !== "undefined" ? window.innerWidth >= 1280 : true,
  logs: false,
};

const dockReducer = (state, action) => {
  const { isMobile, hasOutput } = action.payload || {};

  switch (action.type) {
    case "TOGGLE_INPUT": {
      if (isMobile) {
        if (state.input) {
          return { ...state, input: false };
        } else {
          return { ...state, input: true, output: false, logs: false, cad: false };
        }
      }
      return { ...state, input: !state.input };
    }
    case "TOGGLE_OUTPUT": {
      if (!hasOutput) return state;
      if (isMobile) {
        if (state.output) {
          return { ...state, output: false };
        } else {
          return { ...state, output: true, input: false, logs: false, cad: false };
        }
      }
      return { ...state, output: !state.output };
    }
    case "TOGGLE_LOGS": {
      if (!hasOutput) return state;
      if (isMobile) {
        if (state.logs) {
          return { ...state, logs: false };
        } else {
          if (state.cad) {
            return { ...state, logs: true, input: false, output: false };
          } else {
            return { ...state, logs: true, input: false, output: false, cad: false };
          }
        }
      }
      return { ...state, logs: !state.logs };
    }
    case "TOGGLE_CAD": {
      if (isMobile) {
        if (state.cad) {
          return { ...state, cad: false };
        } else {
          if (state.logs) {
            return { ...state, cad: true, input: false, output: false };
          } else {
            return { ...state, cad: true, input: false, output: false, logs: false };
          }
        }
      }
      return { ...state, cad: true }; // Desktop always true
    }
    case "DESIGN_COMPLETE": {
      if (isMobile) {
        return { ...state, input: false, output: false, cad: true, logs: true };
      }
      return { ...state, output: true, logs: true };
    }
    case "EARLY_OUTPUT": {
      if (!isMobile) {
        return { ...state, output: true, logs: true };
      }
      return state;
    }
    case "REDESIGNING":
    case "UNLOCK":
    case "RESET": {
      if (isMobile) {
        return { ...state, input: true, output: false, logs: false, cad: false };
      }
      return { ...state, input: true, output: false, logs: false, cad: true };
    }
    case "SYNC_MOBILE": {
      if (!isMobile && !state.cad) {
        return { ...state, cad: true };
      }
      return state;
    }
    case "SET_DOCK_STATE": {
      return { ...state, ...action.payload.state };
    }
    default:
      return state;
  }
};

export const useDockPanels = (isMobile) => {
  const [docks, dispatch] = useReducer(dockReducer, {
    ...initialState,
    cad: !isMobile,
    output: !isMobile,
  });

  useEffect(() => {
    dispatch({ type: "SYNC_MOBILE", payload: { isMobile } });
  }, [isMobile]);

  const toggleInputDock = useCallback(() => {
    dispatch({ type: "TOGGLE_INPUT", payload: { isMobile } });
  }, [isMobile]);

  const toggleOutputDock = useCallback((hasOutput) => {
    dispatch({ type: "TOGGLE_OUTPUT", payload: { isMobile, hasOutput } });
  }, [isMobile]);

  const toggleLogs = useCallback((hasOutput) => {
    dispatch({ type: "TOGGLE_LOGS", payload: { isMobile, hasOutput } });
  }, [isMobile]);

  const toggleCad = useCallback(() => {
    dispatch({ type: "TOGGLE_CAD", payload: { isMobile } });
  }, [isMobile]);

  const setDesignComplete = useCallback(() => {
    dispatch({ type: "DESIGN_COMPLETE", payload: { isMobile } });
  }, [isMobile]);

  const setEarlyOutput = useCallback(() => {
    dispatch({ type: "EARLY_OUTPUT", payload: { isMobile } });
  }, [isMobile]);

  const resetDocks = useCallback((actionType = "RESET") => {
    dispatch({ type: actionType, payload: { isMobile } });
  }, [isMobile]);
  
  const setDocks = useCallback((state) => {
    dispatch({ type: "SET_DOCK_STATE", payload: { state } });
  }, []);

  return {
    docks,
    toggleInputDock,
    toggleOutputDock,
    toggleLogs,
    toggleCad,
    setDesignComplete,
    setEarlyOutput,
    resetDocks,
    setDocks,
  };
};
