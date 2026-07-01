import { useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';

import Plotly from 'plotly.js-dist-min';

const IBeamSVG = ({ depth = 400, bfTop = 300, bfBot = 300, tw = 8, tfTop = 12, tfBot = 12 }) => {
    const toPositive = (value, fallback) => {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
    };

    const D = toPositive(depth, 400);
    const topWidth = toPositive(bfTop, 300);
    const bottomWidth = toPositive(bfBot, topWidth);
    const webThickness = toPositive(tw, 8);
    const topThickness = toPositive(tfTop, 12);
    const bottomThickness = toPositive(tfBot, topThickness);

    const viewWidth = 560;
    const viewHeight = 500;
    const margin = { top: 34, right: 132, bottom: 92, left: 92 };
    const drawAreaWidth = viewWidth - margin.left - margin.right;
    const drawAreaHeight = viewHeight - margin.top - margin.bottom;
    const maxWidth = Math.max(topWidth, bottomWidth, webThickness);
    const scale = Math.min(drawAreaWidth / maxWidth, drawAreaHeight / D);

    const drawD = D * scale;
    const drawTopWidth = topWidth * scale;
    const drawBottomWidth = bottomWidth * scale;
    const drawWebThickness = Math.max(webThickness * scale, 5);
    const drawTopThickness = Math.max(topThickness * scale, 5);
    const drawBottomThickness = Math.max(bottomThickness * scale, 5);
    const drawWebHeight = Math.max(drawD - drawTopThickness - drawBottomThickness, 8);

    const centerX = margin.left + drawAreaWidth / 2;
    const topY = margin.top + (drawAreaHeight - drawD) / 2;
    const bottomY = topY + drawD - drawBottomThickness;
    const webY = topY + drawTopThickness;
    const sectionRight = centerX + Math.max(drawTopWidth, drawBottomWidth) / 2;
    const sectionLeft = centerX - Math.max(drawTopWidth, drawBottomWidth) / 2;
    const midY = topY + drawD / 2;
    const depthDimX = sectionRight + 48;
    const bottomDimY = topY + drawD + 38;
    const widthLabel = topWidth === bottomWidth
        ? `B=${bottomWidth.toFixed(0)}`
        : `Bt=${topWidth.toFixed(0)}  Bb=${bottomWidth.toFixed(0)}`;

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="drop-shadow-sm"
            role="img"
            aria-label={`Plate girder cross-section with depth ${D.toFixed(0)} millimetres and width ${bottomWidth.toFixed(0)} millimetres`}
        >
            <defs>
                <marker id="section-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#4b5563" />
                </marker>
            </defs>

            {/* Axes */}
            <line x1={centerX} y1={topY - 30} x2={centerX} y2={topY + drawD + 30} stroke="#ef4444" strokeWidth="1.3" strokeDasharray="5 5" opacity="0.75" />
            <text x={centerX} y={topY - 36} textAnchor="middle" fill="#991b1b" fontSize="13" fontWeight="700">Y</text>
            <text x={centerX} y={topY + drawD + 52} textAnchor="middle" fill="#991b1b" fontSize="13" fontWeight="700">Y</text>

            <line x1={sectionLeft - 62} y1={midY} x2={sectionRight + 112} y2={midY} stroke="#ef4444" strokeWidth="1.3" strokeDasharray="5 5" opacity="0.75" />
            <text x={sectionLeft - 74} y={midY - 10} textAnchor="middle" fill="#991b1b" fontSize="13" fontWeight="700">Z</text>
            <text x={sectionRight + 124} y={midY - 10} textAnchor="middle" fill="#991b1b" fontSize="13" fontWeight="700">Z</text>

            {/* I-section */}
            <g>
                <rect
                    x={centerX - drawTopWidth / 2}
                    y={topY}
                    width={drawTopWidth}
                    height={drawTopThickness}
                    fill="#3b82f6"
                    stroke="#1e3a8a"
                    strokeWidth="2.4"
                />
                <rect
                    x={centerX - drawWebThickness / 2}
                    y={webY}
                    width={drawWebThickness}
                    height={drawWebHeight}
                    fill="#60a5fa"
                    stroke="#1e3a8a"
                    strokeWidth="2.4"
                />
                <rect
                    x={centerX - drawBottomWidth / 2}
                    y={bottomY}
                    width={drawBottomWidth}
                    height={drawBottomThickness}
                    fill="#3b82f6"
                    stroke="#1e3a8a"
                    strokeWidth="2.4"
                />
            </g>

            {/* Dimensions */}
            <line x1={depthDimX} y1={topY} x2={depthDimX} y2={topY + drawD} stroke="#4b5563" strokeWidth="1.2" markerStart="url(#section-arrow)" markerEnd="url(#section-arrow)" />
            <line x1={sectionRight + 12} y1={topY} x2={depthDimX + 10} y2={topY} stroke="#94a3b8" strokeWidth="1" />
            <line x1={sectionRight + 12} y1={topY + drawD} x2={depthDimX + 10} y2={topY + drawD} stroke="#94a3b8" strokeWidth="1" />
            <text x={depthDimX + 18} y={midY + 4} fill="#111827" fontSize="13" fontWeight="700">D={D.toFixed(0)}</text>

            <line x1={centerX - drawBottomWidth / 2} y1={bottomDimY} x2={centerX + drawBottomWidth / 2} y2={bottomDimY} stroke="#4b5563" strokeWidth="1.2" markerStart="url(#section-arrow)" markerEnd="url(#section-arrow)" />
            <line x1={centerX - drawBottomWidth / 2} y1={bottomY + drawBottomThickness + 8} x2={centerX - drawBottomWidth / 2} y2={bottomDimY + 8} stroke="#94a3b8" strokeWidth="1" />
            <line x1={centerX + drawBottomWidth / 2} y1={bottomY + drawBottomThickness + 8} x2={centerX + drawBottomWidth / 2} y2={bottomDimY + 8} stroke="#94a3b8" strokeWidth="1" />
            <text x={centerX} y={bottomDimY + 25} textAnchor="middle" fill="#111827" fontSize="13" fontWeight="700">{widthLabel}</text>
        </svg>
    );
};

function OptimizationGraph({ data, onClose, optimizationDone, isWsConnected }) {
    const graphRef = useRef(null);

    const toPositiveNumber = (value, fallback = 0) => {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
    };

    const finiteValues = (...arrays) => arrays
        .flatMap((values) => Array.isArray(values) ? values : [])
        .map(Number)
        .filter(Number.isFinite);

    const bestVars = data.best?.vars || {};
    const bestDepth = toPositiveNumber(data.best?.y?.[0], 0);
    const bestSection = {
        depth: bestDepth,
        bfTop: toPositiveNumber(bestVars.bf_top, toPositiveNumber(bestVars.bf, 300)),
        bfBot: toPositiveNumber(bestVars.bf_bot, toPositiveNumber(bestVars.bf, toPositiveNumber(bestVars.bf_top, 300))),
        tw: toPositiveNumber(bestVars.tw, 8),
        tfTop: toPositiveNumber(bestVars.tf_top, toPositiveNumber(bestVars.tf, 8)),
        tfBot: toPositiveNumber(bestVars.tf_bot, toPositiveNumber(bestVars.tf, toPositiveNumber(bestVars.tf_top, 8))),
    };

    useEffect(() => {
        if (optimizationDone) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [optimizationDone, onClose]);

    const xValues = finiteValues(data.fease?.x, data.non_fease?.x, data.swarm_fease?.x, data.swarm_non_fease?.x, data.best?.x);
    const yValues = finiteValues(data.fease?.y, data.non_fease?.y, data.swarm_fease?.y, data.swarm_non_fease?.y, data.best?.y);
    const zValues = finiteValues(data.fease?.z, data.non_fease?.z, data.swarm_fease?.z, data.swarm_non_fease?.z, data.best?.z);

    const maxUR = xValues.length ? Math.max(1.2, Math.max(...xValues) * 1.08) : 4;
    const minDepth = yValues.length ? Math.max(0, Math.min(...yValues) - 100) : 0;
    const maxDepth = yValues.length ? Math.max(...yValues) + 100 : 2000;
    const maxWeight = zValues.length ? Math.max(1, Math.max(...zValues) * 1.15) : 100;
    const depthDtick = Math.max(100, Math.ceil(((maxDepth - minDepth) / 6) / 50) * 50);
    const weightDtick = Math.max(1, Math.ceil((maxWeight / 5) * 10) / 10);
    const urDtick = maxUR <= 2 ? 0.25 : 1;

    return (
        <div className='flex flex-col w-full h-full bg-white font-sans'>
            {/* Header */}
            <div className='flex flex-row h-12 px-6 items-center text-white bg-[#6b7d20] border-b border-[#556619] shadow-sm'>
                <div className='flex-1 font-bold text-sm tracking-wide flex items-center gap-3 uppercase'>
                    PSO Optimization Visualization
                </div>
                <div className='flex gap-12 items-center text-sm'>
                    <div className='font-bold uppercase tracking-tight'>ITERATION: <span className="text-white ml-1">{data.current_iter + 1}</span></div>
                    <div className='font-bold uppercase tracking-tight'>BEST: <span className="text-yellow-400 ml-1">{data.best.found ? `${data.best.val.toFixed(0)} kg` : "---"}</span></div>
                    <div className='font-bold uppercase tracking-tight opacity-90'>
                      PARTICLE: <span className="text-white ml-1">{data.best.found ? `${data.best.particle} @ Iter ${data.best.iter}` : "---"}</span>
                    </div>
                </div>
                <button onClick={onClose} className="ml-8 text-white/80 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>

            {/* Content Area */}
            <div className='flex-1 flex flex-row overflow-hidden p-2 bg-[#f8f9fa]'>
                <div className="flex-1 flex flex-row bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    {/* Plot Area */}
                    <div className="w-[65%] border-r border-gray-50 p-6 flex flex-col">
                        <h3 className="text-base font-bold text-gray-800 mb-4">3D Scatter: Utilization Ratio vs Depth vs Weight</h3>
                        
                        <div className="flex-1 min-h-0 relative">
                            <Plot
                                ref={graphRef}
                                data={[
                                    // Vertical plane at UR = 1
                                    {
                                        type: 'mesh3d',
                                        x: [1, 1, 1, 1],
                                        y: [minDepth, maxDepth, maxDepth, minDepth],
                                        z: [0, 0, maxWeight, maxWeight],
                                        i: [0, 0],
                                        j: [1, 2],
                                        k: [2, 3],
                                        opacity: 0.1,
                                        color: '#ef4444',
                                        showlegend: false,
                                        hoverinfo: 'skip'
                                    },
                                    // Infeasible points (History)
                                    {
                                        name: 'Utilization > 1',
                                        x: data.non_fease.x.length > 0 ? data.non_fease.x : [null],
                                        y: data.non_fease.y.length > 0 ? data.non_fease.y : [null],
                                        z: data.non_fease.z.length > 0 ? data.non_fease.z : [null],
                                        type: 'scatter3d',
                                        mode: 'markers',
                                        showlegend: true,
                                        marker: {
                                            size: 5,
                                            symbol: 'circle-open',
                                            color: '#f87171',
                                            line: { color: '#f87171', width: 2 }
                                        },
                                    },
                                    // Feasible points (History)
                                    {
                                        name: 'Utilization ≤ 1',
                                        x: data.fease.x.length > 0 ? data.fease.x : [null],
                                        y: data.fease.y.length > 0 ? data.fease.y : [null],
                                        z: data.fease.z.length > 0 ? data.fease.z : [null],
                                        type: 'scatter3d',
                                        mode: 'markers',
                                        showlegend: true,
                                        marker: {
                                            size: 5,
                                            symbol: 'circle-open',
                                            color: '#84cc16',
                                            line: { color: '#84cc16', width: 2 }
                                        },
                                    },
                                    // Current Live Swarm - Feasible
                                    {
                                        name: 'Live Feasible',
                                        x: data.swarm_fease?.x || [],
                                        y: data.swarm_fease?.y || [],
                                        z: data.swarm_fease?.z || [],
                                        type: 'scatter3d',
                                        mode: 'markers',
                                        marker: {
                                            size: 7,
                                            symbol: 'circle',
                                            color: '#84cc16',
                                            opacity: 0.9,
                                            line: { color: 'white', width: 1 }
                                        },
                                        showlegend: false
                                    },
                                    // Current Live Swarm - Infeasible
                                    {
                                        name: 'Live Infeasible',
                                        x: data.swarm_non_fease?.x || [],
                                        y: data.swarm_non_fease?.y || [],
                                        z: data.swarm_non_fease?.z || [],
                                        type: 'scatter3d',
                                        mode: 'markers',
                                        marker: {
                                            size: 7,
                                            symbol: 'circle',
                                            color: '#f87171',
                                            opacity: 0.9,
                                            line: { color: 'white', width: 1 }
                                        },
                                        showlegend: false
                                    },
                                    // Global Best
                                    {
                                        name: 'Global Best',
                                        x: data.best.x,
                                        y: data.best.y,
                                        z: data.best.z,
                                        type: 'scatter3d',
                                        mode: 'markers',
                                        marker: {
                                            size: 16,
                                            color: '#eab308',
                                            symbol: 'star',
                                            line: { color: '#854d0e', width: 2 }
                                        },
                                    }
                                ]}
                                layout={{
                                    font: { family: 'Segoe UI, Arial, sans-serif', size: 11 },
                                    legend: { 
                                        x: 0.95, y: 0.95, 
                                        xanchor: 'right',
                                        bgcolor: 'rgba(255,255,255,0.8)',
                                        bordercolor: '#eee',
                                        borderwidth: 1
                                    },
                                    margin: { l: 0, r: 0, t: 0, b: 0 },
                                    autosize: true,
                                    scene: {
                                        xaxis: { title: { text: "Utilization Ratio", font: { weight: 'bold' } }, gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1', range: [0, maxUR], dtick: urDtick },
                                        yaxis: { title: { text: "Depth (mm)", font: { weight: 'bold' } }, gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1', range: [maxDepth, minDepth], dtick: depthDtick },
                                        zaxis: { title: { text: "Weight (kg)", font: { weight: 'bold' } }, gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1', range: [0, maxWeight], dtick: weightDtick },
                                        camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } }
                                    },
                                    paper_bgcolor: 'white',
                                    plot_bgcolor: 'white',
                                }}
                                config={{ displayModeBar: false, responsive: true }}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-[35%] flex flex-col border-l border-gray-100 bg-white">
                        <div className='flex-1 min-h-0 p-6 flex flex-col items-center bg-white'>
                            <h4 className="font-bold text-base text-gray-700 mb-4 uppercase tracking-wider">Best Cross-Section (I-Beam)</h4>
                            <div className="w-full flex-1 min-h-[360px] flex items-center justify-center">
                                {data.best.found ? (
                                    <IBeamSVG 
                                      depth={bestSection.depth}
                                      bfTop={bestSection.bfTop}
                                      bfBot={bestSection.bfBot}
                                      tw={bestSection.tw}
                                      tfTop={bestSection.tfTop}
                                      tfBot={bestSection.tfBot}
                                    />
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                                        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#6b7d20] rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest">Searching...</span>
                                    </div>
                                )}
                            </div>
                            {data.best.found && (
                                <div className="mt-4 w-full px-4">
                                    <div className="grid grid-cols-4 border-y border-gray-200 text-[11px] font-mono bg-gray-50/50 text-center divide-x divide-gray-200">
                                        <div className="py-2">tw={bestSection.tw.toFixed(1)}</div>
                                        <div className="py-2">tf={bestSection.tfTop.toFixed(1)}</div>
                                        <div className="py-2">R1=4.0</div>
                                        <div className="py-2">R2=4.0</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Summary */}
            <div className='bg-white px-6 py-3 border-t border-gray-200 flex flex-col gap-3'>
                {data.best.found && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-1 border border-gray-300 rounded-md px-6 py-2 text-[12px] font-mono bg-gray-50 shadow-sm transition-all hover:border-[#6b7d20]">
                            <span className="font-black text-[#6b7d20] uppercase mr-2">Global Best</span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">Iter: <span className="text-gray-950 font-bold">{data.best.iter}</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">Particle: <span className="text-gray-950 font-bold">{data.best.particle}</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">Weight: <span className="text-gray-950 font-bold">{data.best.val.toFixed(1)} kg</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">D: <span className="text-gray-950 font-bold">{bestSection.depth.toFixed(0)} mm</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">B: <span className="text-gray-950 font-bold">{bestSection.bfBot.toFixed(0)} mm</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">tw: <span className="text-gray-950 font-bold">{bestSection.tw.toFixed(1)} mm</span></span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span className="text-gray-600">tf: <span className="text-gray-950 font-bold">{bestSection.tfTop.toFixed(1)} mm</span></span>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className={`w-2 h-2 rounded-full ${optimizationDone ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                        <span className='text-[10px] text-gray-500 font-black uppercase tracking-widest'>
                            {optimizationDone ? "Optimization Complete" : "Real-time Swarm Tracking..."}
                        </span>
                    </div>
                    <div className='flex gap-8 items-center text-[10px] font-bold text-gray-600'>
                        <div className='flex items-center gap-2'><span className="text-[#eab308] text-sm">★</span> Best</div>
                        <div className='flex items-center gap-2'><div className='w-3 h-3 rounded-full border-2 border-[#84cc16]'></div> Utilization ≤ 1</div>
                        <div className='flex items-center gap-2'><div className='w-3 h-3 rounded-full border-2 border-[#f87171]'></div> Utilization &gt; 1</div>
                        <button 
                          onClick={() => Plotly.downloadImage(graphRef.current.el, { format: 'png', height: 800, width: 1200, filename: 'pso_plot' })}
                          className="bg-[#334155] hover:bg-black text-white px-5 py-2 rounded shadow-sm flex items-center gap-2 transition-all uppercase"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Save Plot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OptimizationGraph;

