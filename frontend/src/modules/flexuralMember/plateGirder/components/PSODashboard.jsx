import { useMemo, useState, useEffect } from 'react';
import ParallelCoordinatesPlot from './ParallelCoordinatesPlot';
import PerformanceMap from './PerformanceMap';
import CrossSectionPreview from './CrossSectionPreview';

/**
 * PSO Dashboard Component
 * 
 * Main dashboard with 3-panel layout:
 * - Top: Parallel Coordinates Plot
 * - Bottom Left: Performance Map
 * - Bottom Right: Cross-Section Preview
 * 
 * Matches documentation layout from plate-girder.md
 */
function PSODashboard({ data, onClose, optimizationDone }) {
  // Replay state management
  const [frameCache, setFrameCache] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState('once'); // 'once' or 'loop'
  const [isReplayMode, setIsReplayMode] = useState(false);

  // Process data for visualization components
  const processedData = useMemo(() => {
    if (!data) {
      console.warn('[PSODashboard] No data provided');
      return null;
    }
    
    // Ensure data has required fields
    if (!data.history && !data.currentSwarm && !data.globalBest) {
      console.warn('[PSODashboard] Data exists but has no history/swarm/globalBest:', data);
    }

    // Normalize positions for parallel coordinates
    const normalizePosition = (position, variableNames, bounds) => {
      if (!position || !variableNames || !bounds || !bounds.lb || !bounds.ub) return null;
      if (position.length !== variableNames.length) return null;
      if (bounds.lb.length !== bounds.ub.length || bounds.lb.length !== position.length) return null;
      
      return position.map((val, idx) => {
        const lb = bounds.lb[idx];
        const ub = bounds.ub[idx];
        if (ub === lb || isNaN(lb) || isNaN(ub)) return 50;
        const normalized = ((val - lb) / (ub - lb)) * 100;
        return isNaN(normalized) ? 50 : Math.max(0, Math.min(100, normalized)); // Clamp to 0-100
      });
    };

    // Process history
    const history = (data.history || []).map(item => ({
      ...item,
      normalized: normalizePosition(item.position, data.variableNames, data.bounds)
    }));

    // Process current swarm
    const currentSwarm = (data.currentSwarm || []).map(item => ({
      ...item,
      normalized: normalizePosition(item.position, data.variableNames, data.bounds)
    }));

    // Process global best
    let globalBest = null;
    if (data.globalBest && data.globalBest.position) {
      globalBest = {
        ...data.globalBest,
        normalized: normalizePosition(
          data.globalBest.position,
          data.variableNames,
          data.bounds
        )
      };
    }

    return {
      history,
      currentSwarm,
      globalBest
    };
  }, [data]);

  // Format best weight for display
  const bestWeightDisplay = useMemo(() => {
    if (!data?.globalBest?.weight_kg) return '---';
    return `${data.globalBest.weight_kg.toFixed(2)} kg`;
  }, [data]);

  // Format best particle info
  const bestParticleDisplay = useMemo(() => {
    if (!data?.globalBest) return '---';
    const iter = data.globalBest.iter ?? data.current_iter ?? '?';
    const particle = data.globalBest.particle ?? '?';
    return `${particle} @ Iter ${iter}`;
  }, [data]);

  // Save plot functionality using Plotly toImage API
  const handleSavePlot = async () => {
    try {
      // Dynamically import Plotly
      const Plotly = (await import('plotly.js-dist-min')).default;
      
      // Find plot elements by their container divs
      const plots = document.querySelectorAll('.js-plotly-plot');
      
      if (plots.length === 0) {
        console.warn('[PSODashboard] No Plotly plots found');
        return;
      }
      
      console.log(`[PSODashboard] Found ${plots.length} plots to export`);
      
      // Export each plot
      const exportPromises = Array.from(plots).map(async (plotElement, index) => {
        try {
          const imgData = await Plotly.toImage(plotElement, {
            format: 'png',
            width: 1200,
            height: 400
          });
          
          // Determine filename based on plot position
          let filename = 'pso_plot.png';
          if (index === 0) filename = 'parallel_coordinates.png';
          else if (index === 1) filename = 'performance_map.png';
          
          // Trigger download
          const link = document.createElement('a');
          link.href = imgData;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log(`[PSODashboard] Saved: ${filename}`);
          return true;
        } catch (err) {
          console.error(`[PSODashboard] Error exporting plot ${index}:`, err);
          return false;
        }
      });
      
      await Promise.all(exportPromises);
      console.log('[PSODashboard] All plots saved successfully');
    } catch (error) {
      console.error('[PSODashboard] Error saving plots:', error);
    }
  };

  // Build frame cache when optimization completes
  useEffect(() => {
    if (optimizationDone && data.history && data.history.length > 0 && frameCache.length === 0) {
      console.log('[PSODashboard] Building frame cache...');
      
      // Group history by iteration
      const iterationMap = new Map();
      data.history.forEach(item => {
        const iter = item.iter;
        if (!iterationMap.has(iter)) {
          iterationMap.set(iter, []);
        }
        iterationMap.get(iter).push(item);
      });
      
      // Build frames array (one per iteration)
      const frames = [];
      let runningBest = null;
      
      const sortedIterations = Array.from(iterationMap.keys()).sort((a, b) => a - b);
      
      sortedIterations.forEach(iter => {
        const particles = iterationMap.get(iter);
        
        // Update running global best (feasible priority, then lowest weight)
        particles.forEach(p => {
          if (!runningBest) {
            runningBest = { ...p };
          } else {
            const isFeasible = p.ur <= 1.0;
            const bestIsFeasible = runningBest.ur <= 1.0;
            
            if (isFeasible && !bestIsFeasible) {
              // New is feasible, old best is not
              runningBest = { ...p };
            } else if (isFeasible && bestIsFeasible) {
              // Both feasible, prefer lower weight
              if (p.weight_kg < runningBest.weight_kg) {
                runningBest = { ...p };
              }
            } else if (!isFeasible && !bestIsFeasible) {
              // Both infeasible, prefer lower UR
              if (p.ur < runningBest.ur) {
                runningBest = { ...p };
              }
            }
          }
        });
        
        frames.push({
          iteration: iter,
          particles: particles,
          globalBest: runningBest ? { ...runningBest } : null
        });
      });
      
      console.log(`[PSODashboard] Frame cache built: ${frames.length} frames`);
      setFrameCache(frames);
      setCurrentFrame(frames.length - 1); // Start at last frame
      setIsReplayMode(true);
    }
  }, [optimizationDone, data.history, frameCache.length]);

  // Playback timer (5 FPS = 200ms per frame, matching desktop REPLAY_SPEED)
  useEffect(() => {
    if (!isPlaying || frameCache.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= frameCache.length - 1) {
          if (loopMode === 'loop') {
            return 0; // Loop back to start
          } else {
            setIsPlaying(false); // Stop at end in 'once' mode
            return prev;
          }
        }
        return prev + 1;
      });
    }, 200); // 5 FPS (matches desktop REPLAY_SPEED)
    
    return () => clearInterval(interval);
  }, [isPlaying, loopMode, frameCache.length]);

  // Compute display data based on current frame or live data
  const displayData = useMemo(() => {
    if (isReplayMode && frameCache.length > 0 && currentFrame < frameCache.length) {
      const frame = frameCache[currentFrame];
      
      // Build history up to current frame (for fade effect)
      const historyUpToFrame = frameCache
        .slice(0, currentFrame + 1)
        .flatMap(f => f.particles);
      
      return {
        history: historyUpToFrame,
        currentSwarm: frame.particles,
        globalBest: frame.globalBest
      };
    }
    
    // Live mode - use raw data
    return {
      history: data.history || [],
      currentSwarm: data.currentSwarm || [],
      globalBest: data.globalBest
    };
  }, [isReplayMode, frameCache, currentFrame, data]);

  // Use displayData instead of processedData for visualization
  const finalProcessedData = useMemo(() => {
    if (!displayData) {
      console.warn('[PSODashboard] No displayData provided');
      return null;
    }
    
    // Ensure data has required fields
    if (!displayData.history && !displayData.currentSwarm && !displayData.globalBest) {
      console.warn('[PSODashboard] DisplayData exists but has no history/swarm/globalBest:', displayData);
    }

    // Normalize positions for parallel coordinates
    const normalizePosition = (position, variableNames, bounds) => {
      if (!position || !variableNames || !bounds || !bounds.lb || !bounds.ub) return null;
      if (position.length !== variableNames.length) return null;
      if (bounds.lb.length !== bounds.ub.length || bounds.lb.length !== position.length) return null;
      
      return position.map((val, idx) => {
        const lb = bounds.lb[idx];
        const ub = bounds.ub[idx];
        if (ub === lb || isNaN(lb) || isNaN(ub)) return 50;
        const normalized = ((val - lb) / (ub - lb)) * 100;
        return isNaN(normalized) ? 50 : Math.max(0, Math.min(100, normalized)); // Clamp to 0-100
      });
    };

    // Process history
    const history = (displayData.history || []).map(item => ({
      ...item,
      normalized: normalizePosition(item.position, data.variableNames, data.bounds)
    }));

    // Process current swarm
    const currentSwarm = (displayData.currentSwarm || []).map(item => ({
      ...item,
      normalized: normalizePosition(item.position, data.variableNames, data.bounds)
    }));

    // Process global best
    let globalBest = null;
    if (displayData.globalBest && displayData.globalBest.position) {
      globalBest = {
        ...displayData.globalBest,
        normalized: normalizePosition(
          displayData.globalBest.position,
          data.variableNames,
          data.bounds
        )
      };
    }

    return {
      history,
      currentSwarm,
      globalBest
    };
  }, [displayData, data.variableNames, data.bounds]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header - Fixed height */}
      <div
        className="flex flex-row h-12 p-2 font text-white flex-shrink-0 border-b border-gray-600"
        style={{ backgroundColor: '#6b7d20' }}
      >
        <div className="flex-1 content-center font-black text-sm sm:text-base truncate">
          PSO OPTIMIZATION SPACE
        </div>
        <div className="flex w-auto gap-2 sm:gap-3 flex-wrap items-center">
          <div className="hidden sm:block font-extrabold text-xs sm:text-sm whitespace-nowrap">
            ITER: {data?.current_iter ?? 0}
          </div>
          <div className="hidden md:block font-black text-[#ffd708] text-xs sm:text-sm whitespace-nowrap">
            BEST: {bestWeightDisplay}
          </div>
          <div className="hidden lg:block text-xs sm:text-sm whitespace-nowrap">
            P: {bestParticleDisplay}
          </div>
          <div className="flex items-center justify-center">
            <button
              className="px-3 py-1 sm:px-4 sm:py-2 bg-osdag-green text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap"
              onClick={() => {
                onClose();
                console.log('PSO Dashboard closed');
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flexible height with minimum constraints */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Top Panel: Parallel Coordinates Plot */}
        <div className="flex-shrink-0 min-h-0 p-1 border-b border-gray-300" style={{ height: '45vh', minHeight: '300px' }}>
          <div className="w-full h-full bg-white rounded border">
            <ParallelCoordinatesPlot
              data={finalProcessedData}
              variableNames={data?.variableNames || []}
              bounds={data?.bounds || { lb: [], ub: [] }}
            />
          </div>
        </div>

        {/* Bottom Panels: Performance Map and Cross-Section */}
        <div className="flex flex-row flex-1 min-h-0 overflow-hidden" style={{ height: '45vh', minHeight: '250px' }}>
          {/* Bottom Left: Performance Map */}
          <div className="flex-1 min-w-0 p-1 border-r border-gray-300 overflow-hidden">
            <div className="w-full h-full bg-white rounded border">
              <PerformanceMap data={finalProcessedData} />
            </div>
          </div>

          {/* Bottom Right: Cross-Section Preview */}
          <div className="flex-1 min-w-0 p-1 overflow-hidden">
            <div className="w-full h-full bg-white rounded border">
              <CrossSectionPreview
                data={finalProcessedData}
                variableNames={data?.variableNames || []}
                bounds={data?.bounds || { lb: [], ub: [] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Responsive with scrollable controls */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-50">
        <div className="p-3">
          {/* Status Row */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              {optimizationDone ? (
                <span className="text-green-600 font-semibold text-sm">Γ£ô Optimization Complete</span>
              ) : (
                <span className="text-sm">Optimizing...</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {optimizationDone && (
                <button
                  className="px-3 py-1.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
                  onClick={() => {
                    console.log('[PSODashboard] Close button clicked in footer');
                    if (onClose) {
                      onClose();
                    } else {
                      console.warn('[PSODashboard] onClose handler is not provided');
                    }
                  }}
                >
                  Close
                </button>
              )}
              <button
                className="px-3 py-1.5 bg-gray-200 text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors text-sm"
                onClick={handleSavePlot}
              >
                ≡ƒÆ╛ Save Plot
              </button>
            </div>
          </div>

          {/* Replay Controls Row (only show when optimization is done) */}
          {optimizationDone && frameCache.length > 0 && (
            <div className="border-t border-gray-300 pt-3">
              {/* Step Controls */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <button
                  onClick={() => setCurrentFrame(0)}
                  disabled={currentFrame === 0}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                  title="First frame"
                >
                  ΓÅ«
                </button>
                <button
                  onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
                  disabled={currentFrame === 0}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                  title="Previous frame"
                >
                  ΓùÇ
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors font-semibold"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? 'ΓÅ╕' : 'Γû╢'}
                </button>
                <button
                  onClick={() => setCurrentFrame(prev => Math.min(frameCache.length - 1, prev + 1))}
                  disabled={currentFrame === frameCache.length - 1}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                  title="Next frame"
                >
                  Γû╢
                </button>
                <button
                  onClick={() => setCurrentFrame(frameCache.length - 1)}
                  disabled={currentFrame === frameCache.length - 1}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                  title="Last frame"
                >
                  ΓÅ¡
                </button>
              </div>

              {/* Frame Slider and Controls */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  Frame: {currentFrame + 1}/{frameCache.length}
                </span>

                <input
                  type="range"
                  min={0}
                  max={frameCache.length - 1}
                  value={currentFrame}
                  onChange={(e) => setCurrentFrame(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentFrame / (frameCache.length - 1)) * 100}%, #d1d5db ${(currentFrame / (frameCache.length - 1)) * 100}%, #d1d5db 100%)`
                  }}
                />

                <select
                  value={loopMode}
                  onChange={(e) => setLoopMode(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                >
                  <option value="once">Once</option>
                  <option value="loop">Loop</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PSODashboard;

