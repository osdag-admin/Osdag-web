import { useMemo } from 'react';
import Plot from 'react-plotly.js';

/**
 * Performance Map Component using Plotly
 * 
 * 2D scatter plot showing Weight vs Utilization Ratio
 * Shows: History (faint), Current Swarm (bold), Global Best (gold diamond), UR=1.0 line (red)
 */
function PerformanceMap({ data }) {
  const plotData = useMemo(() => {
    const traces = [];

    // Pre-compute weight range (used for feasibility line + axis range)
    const allWeights = [
      ...(data?.history?.map(d => d.weight_kg) || []),
      ...(data?.currentSwarm?.map(d => d.weight_kg) || []),
      ...(data?.globalBest ? [data.globalBest.weight_kg] : [])
    ].filter(w => w != null && !isNaN(w));

    const weightMin = allWeights.length > 0 ? Math.max(0, Math.min(...allWeights) * 0.9) : 0;
    const weightMax = allWeights.length > 0 ? Math.max(...allWeights) * 1.1 : 1000;

    // UR = 1.0 feasibility line (add FIRST so it renders behind points)
    if (allWeights.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: 'UR = 1.0',
        x: [weightMin, weightMax],
        y: [1.0, 1.0],
        line: {
          color: 'rgba(255, 0, 0, 1)',
          width: 2,
          dash: 'dash'
        },
        showlegend: false,
        hoverinfo: 'skip',
      });
    }

    // History points (faint background, last 3000)
    if (data?.history && data.history.length > 0) {
      const historyData = data.history.slice(-3000).map(d => ({
        x: d.weight_kg,
        y: d.ur,
        feasible: d.ur <= 1.0
      }));

      // Split into feasible and infeasible for different colors
      const feasibleHistory = historyData.filter(d => d.feasible);
      const infeasibleHistory = historyData.filter(d => !d.feasible);

      if (feasibleHistory.length > 0) {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: 'History (Feasible)',
          x: feasibleHistory.map(d => d.x),
          y: feasibleHistory.map(d => d.y),
          marker: {
            color: 'rgba(34, 255, 0, 0.2)',
            size: 2,
            line: {
              color: 'rgba(34, 255, 0, 0.3)',
              width: 0.5
            }
          },
          showlegend: false,
          hoverinfo: 'x+y',
          hovertemplate: 'Weight: %{x:.2f} kg<br>UR: %{y:.3f}<extra></extra>'
        });
      }

      if (infeasibleHistory.length > 0) {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: 'History (Infeasible)',
          x: infeasibleHistory.map(d => d.x),
          y: infeasibleHistory.map(d => d.y),
          marker: {
            color: 'rgba(189, 0, 0, 0.2)',
            size: 2,
            line: {
              color: 'rgba(189, 0, 0, 0.3)',
              width: 0.5
            }
          },
          showlegend: false,
          hoverinfo: 'x+y',
          hovertemplate: 'Weight: %{x:.2f} kg<br>UR: %{y:.3f}<extra></extra>'
        });
      }
    }

    // Current Swarm (bold points)
    if (data?.currentSwarm && data.currentSwarm.length > 0) {
      const swarmData = data.currentSwarm.map(d => ({
        x: d.weight_kg,
        y: d.ur,
        feasible: d.ur <= 1.0
      }));

      const feasibleSwarm = swarmData.filter(d => d.feasible);
      const infeasibleSwarm = swarmData.filter(d => !d.feasible);

      if (feasibleSwarm.length > 0) {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: 'Current Swarm (Feasible)',
          x: feasibleSwarm.map(d => d.x),
          y: feasibleSwarm.map(d => d.y),
          marker: {
            color: 'rgba(34, 255, 0, 0.8)',
            size: 3,
            line: {
              color: 'rgba(34, 255, 0, 1)',
              width: 1
            }
          },
          showlegend: false,
          hoverinfo: 'x+y',
          hovertemplate: 'Weight: %{x:.2f} kg<br>UR: %{y:.3f}<extra></extra>'
        });
      }

      if (infeasibleSwarm.length > 0) {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: 'Current Swarm (Infeasible)',
          x: infeasibleSwarm.map(d => d.x),
          y: infeasibleSwarm.map(d => d.y),
          marker: {
            color: 'rgba(189, 0, 0, 0.8)',
            size: 3,
            line: {
              color: 'rgba(189, 0, 0, 1)',
              width: 1
            }
          },
          showlegend: false,
          hoverinfo: 'x+y',
          hovertemplate: 'Weight: %{x:.2f} kg<br>UR: %{y:.3f}<extra></extra>'
        });
      }
    }

    // Global Best (gold diamond)
    if (data?.globalBest && data.globalBest.weight_kg != null) {
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'Global Best',
        x: [data.globalBest.weight_kg],
        y: [data.globalBest.ur],
        marker: {
          color: 'rgba(255, 215, 0, 1)',
          size: 12,
          symbol: 'diamond',
          line: {
            color: '#000',
            width: 1
          }
        },
        showlegend: false,
        hoverinfo: 'x+y+text',
        text: ['Best'],
        hovertemplate: '<b>Global Best</b><br>Weight: %{x:.2f} kg<br>UR: %{y:.3f}<extra></extra>'
      });
    }

    return traces;
  }, [data]);

  // Calculate dynamic axes ranges
  const allWeights = [
    ...(data?.history?.map(d => d.weight_kg) || []),
    ...(data?.currentSwarm?.map(d => d.weight_kg) || []),
    ...(data?.globalBest ? [data.globalBest.weight_kg] : [])
  ].filter(w => w != null && !isNaN(w));

  const allURs = [
    ...(data?.history?.map(d => d.ur) || []),
    ...(data?.currentSwarm?.map(d => d.ur) || []),
    ...(data?.globalBest ? [data.globalBest.ur] : [])
  ].filter(ur => ur != null && !isNaN(ur));

  const weightMin = allWeights.length > 0 ? Math.max(0, Math.min(...allWeights) * 0.9) : 0;
  const weightMax = allWeights.length > 0 ? Math.max(...allWeights) * 1.1 : 1000;
  const urMax = allURs.length > 0 ? Math.max(2.0, Math.max(...allURs) * 1.1) : 2.0;

  const layout = useMemo(() => ({
    autosize: true,
    margin: { l: 50, r: 20, t: 20, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
      title: 'Weight (kg)',
      range: [weightMin, weightMax],
      showgrid: true,
      gridcolor: 'rgba(200, 200, 200, 0.3)',
      zeroline: false,
      showline: true,
      linecolor: 'rgba(0, 0, 0, 0.5)'
    },
    yaxis: {
      title: 'Utilization Ratio (UR)',
      range: [0, urMax],
      showgrid: true,
      gridcolor: 'rgba(200, 200, 200, 0.3)',
      zeroline: true,
      zerolinecolor: 'rgba(0, 0, 0, 0.3)',
      showline: true,
      linecolor: 'rgba(0, 0, 0, 0.5)'
    },
    font: { size: 12 },
    hovermode: 'closest'
  }), [weightMin, weightMax, urMax]);

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

export default PerformanceMap;
