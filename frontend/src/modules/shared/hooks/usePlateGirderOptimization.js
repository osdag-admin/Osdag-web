import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useWebSocketOptimization } from "./useWebSocketOptimization";

const PSO_PLAYBACK_INTERVAL_MS = 80;
const PSO_PARTICLES_PER_TICK = 50;

/**
 * Encapsulates Plate Girder PSO real-time optimization:
 *  - WebSocket streaming (via useWebSocketOptimization)
 *  - Smooth client-side playback of batched particle updates
 *  - Aggregated optimizationData for the PSODashboard / OptimizationGraph
 *
 * @param {Object} params
 * @param {Function} params.onComplete - called with (formattedOutput, rawLogs) on pso_complete
 * @param {Function} params.onError - called with (message) on pso_error
 */
export const usePlateGirderOptimization = ({ onComplete, onError } = {}) => {
  const [showOptimizationGraph, setShowOptimizationGraph] = useState(false);
  const [optimizationDone, setOptimizationDone] = useState(false);
  const [optimizationData, setOptimizationData] = useState({
    current_iter: 0,
    variableNames: [],
    bounds: { lb: [], ub: [] },
    history: [],
    currentSwarm: [],
    globalBest: null,
  });

  const psoParticleQueueRef = useRef([]);
  const psoPlaybackTimerRef = useRef(null);
  const psoPendingCompleteRef = useRef(null);

  const applyPsoParticles = useCallback((particlesWithParent) => {
    if (!Array.isArray(particlesWithParent) || !particlesWithParent.length) return;
    setOptimizationData((prev) => {
      let newHistory = [...(prev.history || [])];
      let currentSwarm = [...(prev.currentSwarm || [])];
      let globalBest = prev.globalBest;
      let currentIter = prev.current_iter;
      let variableNames = prev.variableNames || [];
      let bounds = prev.bounds || { lb: [], ub: [] };
      let plotImage = prev.plotImage;

      particlesWithParent.forEach(({ particle: p, parentData }) => {
        if (!p) return;
        const varsDict = {};
        const names = p.variable_names || parentData?.variable_names || [];
        const values = p.variables || parentData?.variables || [];
        (names || []).forEach((name, idx) => {
          varsDict[name] = (values || [])[idx];
        });

        const ur = Number(p.ur);
        const weightKg = Number(p.weight_kg);
        const depth = Number(varsDict.D || p.depth);
        if (!Number.isFinite(ur)) return;

        const particleData = {
          ur,
          weight_kg: Number.isFinite(weightKg) ? weightKg : 0,
          depth: Number.isFinite(depth) ? depth : 0,
          tw: varsDict.tw,
          tf: varsDict.tf || varsDict.tf_top,
          bf: varsDict.bf || varsDict.bf_top,
          vars: varsDict,
          // Raw variable values in variable_names order — required by the
          // Parallel Coordinates plot for normalization against bounds.
          position: Array.isArray(values) ? values.map(Number) : [],
          particle: p.particle_index,
          iter: p.iteration,
          timestamp: Date.now(),
        };

        if (p.variable_names || parentData?.variable_names) {
          variableNames = p.variable_names || parentData.variable_names;
        }
        if (p.bounds || parentData?.bounds) bounds = p.bounds || parentData.bounds;
        if (p.plot_image || parentData?.plot_image) {
          plotImage = p.plot_image || parentData.plot_image;
        }

        newHistory.push(particleData);

        if (particleData.iter !== currentIter) {
          currentIter = particleData.iter;
          currentSwarm = [particleData];
        } else {
          currentSwarm.push(particleData);
          if (currentSwarm.length > 200) currentSwarm.shift();
        }

        const isFeasible = particleData.ur <= 1.0;
        if (
          !globalBest ||
          (isFeasible && (globalBest.ur > 1.0 || particleData.weight_kg < globalBest.weight_kg))
        ) {
          globalBest = particleData;
        } else if (!isFeasible && globalBest.ur > 1.0 && particleData.ur < globalBest.ur) {
          globalBest = particleData;
        }
      });

      if (newHistory.length > 10000) newHistory = newHistory.slice(-10000);

      return {
        ...prev,
        current_iter: currentIter,
        variableNames,
        bounds,
        history: newHistory,
        currentSwarm,
        globalBest,
        plotImage,
      };
    });
  }, []);

  const stopPsoPlayback = useCallback(() => {
    if (psoPlaybackTimerRef.current) {
      clearInterval(psoPlaybackTimerRef.current);
      psoPlaybackTimerRef.current = null;
    }
  }, []);

  const completePsoOptimization = useCallback(
    (messageData) => {
      setOptimizationDone(true);

      const result = messageData?.result;
      if (result && result.design) {
        const formattedOutput = {};
        for (const [key, value] of Object.entries(result.design)) {
          const label = value?.label ?? key;
          const val = value?.val ?? value?.value ?? value;
          if (val !== undefined && val !== null) {
            formattedOutput[key] = { label, val };
          }
        }
        // Preserve accumulated swarm data + attach final result
        setOptimizationData((prev) => ({
          ...prev,
          finalResult: result.design,
          finalLogs: result.raw || [],
        }));
        if (onComplete) onComplete(formattedOutput, result.raw || [], messageData?.cad_paths || {});
      }
    },
    [onComplete]
  );

  const drainPsoParticleQueue = useCallback(() => {
    const queue = psoParticleQueueRef.current;
    if (!queue.length) {
      stopPsoPlayback();
      if (psoPendingCompleteRef.current) {
        const { messageData } = psoPendingCompleteRef.current;
        psoPendingCompleteRef.current = null;
        completePsoOptimization(messageData);
      }
      return;
    }
    const nextParticles = queue.splice(0, PSO_PARTICLES_PER_TICK);
    applyPsoParticles(nextParticles);
  }, [applyPsoParticles, completePsoOptimization, stopPsoPlayback]);

  const startPsoPlayback = useCallback(() => {
    if (psoPlaybackTimerRef.current) return;
    psoPlaybackTimerRef.current = setInterval(drainPsoParticleQueue, PSO_PLAYBACK_INTERVAL_MS);
  }, [drainPsoParticleQueue]);

  const enqueuePsoParticles = useCallback(
    (particlesWithParent) => {
      if (!Array.isArray(particlesWithParent) || !particlesWithParent.length) return;
      psoParticleQueueRef.current.push(...particlesWithParent);
      startPsoPlayback();
    },
    [startPsoPlayback]
  );

  // WebSocket update handler: normalize batched or single-particle payloads
  const handleUpdate = useCallback(
    (data) => {
      if (!data) return;
      if (Array.isArray(data.particles) && data.particles.length) {
        enqueuePsoParticles(data.particles.map((particle) => ({ particle, parentData: data })));
      } else {
        // Single particle payload
        enqueuePsoParticles([{ particle: data, parentData: data }]);
      }
    },
    [enqueuePsoParticles]
  );

  const handleComplete = useCallback((messageData) => {
    // Defer completion until the playback queue has drained for a smooth finish
    if (psoParticleQueueRef.current.length) {
      psoPendingCompleteRef.current = { messageData };
    } else {
      completePsoOptimization(messageData);
    }
  }, [completePsoOptimization]);

  const handleError = useCallback(
    (message) => {
      stopPsoPlayback();
      if (onError) onError(message);
    },
    [onError, stopPsoPlayback]
  );

  const { disconnect, startOptimization, isConnected, isOptimizing } =
    useWebSocketOptimization(handleUpdate, handleComplete, handleError);

  const resetOptimization = useCallback(() => {
    stopPsoPlayback();
    psoParticleQueueRef.current = [];
    psoPendingCompleteRef.current = null;
    setOptimizationDone(false);
    setOptimizationData({
      current_iter: 0,
      variableNames: [],
      bounds: { lb: [], ub: [] },
      history: [],
      currentSwarm: [],
      globalBest: null,
    });
  }, [stopPsoPlayback]);

  const startPsoOptimization = useCallback(
    (inputData) => {
      resetOptimization();
      setShowOptimizationGraph(true);
      // startOptimization connects if needed and sends once the socket opens.
      startOptimization(inputData);
    },
    [resetOptimization, startOptimization]
  );

  // Transform aggregated optimizationData into the plotly-friendly shape expected
  // by <OptimizationGraph> (3D scatter buckets + global best), matching desktop.
  const optimizationPlotData = useMemo(() => {
    const fease = { x: [], y: [], z: [], text: [] };
    const non_fease = { x: [], y: [], z: [], text: [] };
    const swarm_fease = { x: [], y: [], z: [], text: [] };
    const swarm_non_fease = { x: [], y: [], z: [], text: [] };

    const asFiniteNumber = (value, fallback = 0) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    };

    const pushParticlePoint = (target, p, prefix = "") => {
      target.x.push(asFiniteNumber(p.ur));
      target.y.push(asFiniteNumber(p.depth));
      target.z.push(asFiniteNumber(p.weight_kg));
      target.text.push(`${prefix}Iter: ${p.iter}, P: ${p.particle}`);
    };

    (optimizationData.history || []).forEach((p) => {
      const ur = Number(p.ur);
      if (!Number.isFinite(ur)) return;
      pushParticlePoint(ur <= 1.0 ? fease : non_fease, p);
    });

    (optimizationData.currentSwarm || []).forEach((p) => {
      const ur = Number(p.ur);
      if (!Number.isFinite(ur)) return;
      pushParticlePoint(ur <= 1.0 ? swarm_fease : swarm_non_fease, p, "[LIVE] ");
    });

    const gb = optimizationData.globalBest;
    return {
      current_iter: optimizationData.current_iter,
      variableNames: optimizationData.variableNames,
      bounds: optimizationData.bounds,
      fease,
      non_fease,
      swarm_fease,
      swarm_non_fease,
      best: {
        found: !!gb,
        x: gb ? [asFiniteNumber(gb.ur)] : [],
        y: gb ? [asFiniteNumber(gb.depth)] : [],
        z: gb ? [asFiniteNumber(gb.weight_kg)] : [],
        val: gb?.weight_kg || 0,
        iter: (gb?.iter || 0) + 1,
        particle: (gb?.particle || 0) + 1,
        vars: gb?.vars || {},
      },
    };
  }, [optimizationData]);

  useEffect(() => {
    return () => {
      stopPsoPlayback();
      disconnect();
    };
  }, [stopPsoPlayback, disconnect]);

  return {
    optimizationData,
    optimizationPlotData,
    optimizationDone,
    showOptimizationGraph,
    setShowOptimizationGraph,
    startPsoOptimization,
    resetOptimization,
    isConnected,
    isOptimizing,
  };
};
