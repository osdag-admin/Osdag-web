import { useMemo, useEffect } from 'react';

function PSODashboard({ data, onClose, optimizationDone }) {
  const bestWeightDisplay = useMemo(() => {
    if (!data?.globalBest?.weight_kg) return '---';
    return `${data.globalBest.weight_kg.toFixed(2)} kg`;
  }, [data]);

  const bestParticleDisplay = useMemo(() => {
    if (!data?.globalBest) return '---';
    const iter = data.globalBest.iter ?? data.current_iter ?? '?';
    const particle = data.globalBest.particle ?? '?';
    return `${particle} @ Iter ${iter}`;
  }, [data]);

  useEffect(() => {}, [data]);
  
  if (!data) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-600 mb-2">Initializing Optimization...</div>
          <div className="text-sm text-gray-500">Connecting to optimization server</div>
        </div>
      </div>
    );
  }
  
  const hasNoData = !data.history || data.history.length === 0;
  if (hasNoData && !optimizationDone) {
    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div
          className="flex flex-row h-12 p-2 font text-white flex-shrink-0 border-b border-gray-600"
          style={{ backgroundColor: '#6b7d20' }}
        >
          <div className="flex-1 content-center font-black text-sm sm:text-base truncate">
            PSO OPTIMIZATION SPACE
          </div>
          <div className="flex w-auto gap-2 sm:gap-3 flex-wrap items-center">
            <div className="font-extrabold text-xs sm:text-sm whitespace-nowrap">
              ITER: {(data?.current_iter ?? 0) + 1}
            </div>
            <div className="font-black text-[#ffd708] text-xs sm:text-sm whitespace-nowrap">
              BEST: ---
            </div>
            <button
              className="px-3 py-1 sm:px-4 sm:py-2 bg-osdag-green text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-600 mb-2">Starting Optimization...</div>
            <div className="text-sm text-gray-500">Waiting for first iteration data</div>
          </div>
        </div>
        
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-50 p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Optimizing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div
        className="flex flex-row h-12 p-2 font text-white flex-shrink-0 border-b border-gray-600"
        style={{ backgroundColor: '#6b7d20' }}
      >
        <div className="flex-1 content-center font-black text-sm sm:text-base truncate">
          PSO OPTIMIZATION SPACE
        </div>
        <div className="flex w-auto gap-2 sm:gap-3 flex-wrap items-center">
          <div className="font-extrabold text-xs sm:text-sm whitespace-nowrap">
            ITER: {data?.current_iter ?? 0}
          </div>
          <div className="font-black text-[#ffd708] text-xs sm:text-sm whitespace-nowrap">
            BEST: {bestWeightDisplay}
          </div>
          <div className="text-xs sm:text-sm whitespace-nowrap">
            P: {bestParticleDisplay}
          </div>
          <div className="flex items-center justify-center">
            <button
              className="px-3 py-1 sm:px-4 sm:py-2 bg-osdag-green text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-50">
        <div className="p-3">
          {data?.globalBest && (
            <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
              <div className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                <div className="whitespace-nowrap">
                  <span className="font-bold text-green-600 dark:text-green-400">Global Best</span>
                  <span className="mx-1">|</span>
                  <span>Iter: {data.globalBest.iter ?? '?'}</span>
                  <span className="mx-1">|</span>
                  <span>Particle: {data.globalBest.particle ?? '?'}</span>
                  <span className="mx-1">|</span>
                  <span className="font-semibold text-blue-600">Weight: {data.globalBest.weight_kg?.toFixed(2) ?? '?'} kg</span>
                  <span className="mx-1">|</span>
                  <span>D: {data.globalBest.depth?.toFixed(0) ?? '?'} mm</span>
                  <span className="mx-1">|</span>
                  <span>UR: {data.globalBest.ur?.toFixed(4) ?? '?'}</span>
                  {data.globalBest.position && data.variableNames && data.globalBest.position.length > 0 && (
                    <>
                      {data.globalBest.position.map((val, idx) => (
                        <span key={idx}>
                          <span className="mx-1">|</span>
                          <span>{data.variableNames[idx]?.replace('_thickness', '').replace('top_flange', 'tf').replace('bottom_flange', 'bf').replace('web', 'tw') || `V${idx}`}: {typeof val === 'number' ? val.toFixed(1) : val}</span>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {optimizationDone ? (
                <span className="text-green-600 font-semibold text-sm">✅ Optimization Complete</span>
              ) : (
                <span className="text-sm">Optimizing...</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PSODashboard;
