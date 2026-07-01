import { useMemo } from 'react';
import Plot from 'react-plotly.js';

/**
 * Parallel Coordinates Plot Component using Plotly
 * 
 * Visualizes design variable convergence during optimization.
 * Shows: History, Current Swarm, and Global Best with color coding by feasibility
 */
function ParallelCoordinatesPlot({ data, variableNames, bounds }) {
  const plotData = useMemo(() => {
    if (!data || !variableNames || variableNames.length === 0 || !bounds || !bounds.lb || !bounds.ub) {
      return [];
    }

    // Normalize function: (val - lb) / (ub - lb) * 100
    const normalize = (val, idx) => {
      const lb = bounds.lb[idx];
      const ub = bounds.ub[idx];
      if (ub === lb) return 50; // Avoid division by zero
      return ((val - lb) / (ub - lb)) * 100;
    };

    // Collect all data points (history + current swarm + global best)
    const allData = [];
    const allColors = [];
    const allLineWidths = [];
    const allLineStyles = [];

    // Add history (faint, last 2000)
    if (data.history && data.history.length > 0) {
      const historySlice = data.history.slice(-2000);
      historySlice.forEach(item => {
        const normalized = item.normalized || item.position.map((val, idx) => normalize(val, idx));
        allData.push(normalized);
        allColors.push(item.ur <= 1.0 ? 'rgba(34, 255, 0, 0.3)' : 'rgba(189, 0, 0, 0.3)');
        allLineWidths.push(0.5);
        allLineStyles.push('solid');
      });
    }

    // Add current swarm (bold)
    if (data.currentSwarm && data.currentSwarm.length > 0) {
      data.currentSwarm.forEach(item => {
        const normalized = item.normalized || item.position.map((val, idx) => normalize(val, idx));
        allData.push(normalized);
        allColors.push(item.ur <= 1.0 ? 'rgba(34, 255, 0, 0.8)' : 'rgba(189, 0, 0, 0.8)');
        allLineWidths.push(1.5);
        allLineStyles.push('solid');
      });
    }

    // Add global best (gold, dashed, thicker)
    if (data.globalBest && data.globalBest.normalized) {
      const bestNormalized = data.globalBest.normalized;
      allData.push(bestNormalized);
      allColors.push('rgba(255, 215, 0, 0.9)');
      allLineWidths.push(2);
      allLineStyles.push('dash');
    }

    if (allData.length === 0) {
      return [];
    }

    // Create dimensions array for Plotly parcoords
    const dimensions = variableNames.map((name, idx) => ({
      label: name,
      values: allData.map(d => d[idx]),
      range: [0, 100],
      tickformat: '.0f',
      tickvals: [0, 25, 50, 75, 100],
      ticktext: ['0%', '25%', '50%', '75%', '100%']
    }));

    // Create single parcoords trace with all data
    const trace = {
      type: 'parcoords',
      line: {
        color: allColors,
        width: allLineWidths,
        // Note: Plotly parcoords doesn't support per-line dash styles easily
        // We'll use color and width to distinguish instead
      },
      dimensions: dimensions
    };

    return [trace];
  }, [data, variableNames, bounds]);

  const layout = useMemo(() => ({
    autosize: true,
    margin: { l: 20, r: 20, t: 20, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { size: 10 }
  }), []);

  const config = useMemo(() => ({
    displayModeBar: false,
    responsive: true
  }), []);

  if (plotData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div>No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}

export default ParallelCoordinatesPlot;
