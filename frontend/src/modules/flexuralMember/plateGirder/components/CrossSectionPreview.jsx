import { useMemo } from 'react';

/**
 * Cross-Section Preview Component
 * 
 * SVG drawing of plate girder cross-section showing best solution
 * Updates only on feasible global best (UR <= 1.0)
 */
function CrossSectionPreview({ data, variableNames, bounds }) {
  const sectionData = useMemo(() => {
    if (!data?.globalBest || !variableNames || !bounds) return null;

    // Only show if feasible
    if (data.globalBest.ur > 1.0) return null;

    const position = data.globalBest.position;
    if (!position || position.length === 0) return null;

    // Extract dimensions based on variable names
    const getValue = (varName) => {
      const idx = variableNames.indexOf(varName);
      if (idx === -1) return null;
      return position[idx];
    };

    // Try to find dimensions (handle both symmetric and unsymmetric)
    const D = getValue('D') || getValue('total_depth');
    const tw = getValue('tw') || getValue('web_thickness');
    const bf_top = getValue('bf_top') || getValue('top_flange_width') || getValue('bf');
    const bf_bot = getValue('bf_bot') || getValue('bottom_flange_width') || getValue('bf');
    const tf_top = getValue('tf_top') || getValue('top_flange_thickness') || getValue('tf');
    const tf_bot = getValue('tf_bot') || getValue('bottom_flange_thickness') || getValue('tf');

    if (!D || !tw || !bf_top || !bf_bot || !tf_top || !tf_bot) return null;

    return {
      D: D,
      tw: tw,
      bf_top: bf_top,
      bf_bot: bf_bot,
      tf_top: tf_top,
      tf_bot: tf_bot
    };
  }, [data, variableNames, bounds]);

  if (!sectionData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 text-center">
        <div>
          <div className="text-xl font-black mb-2">Best Cross-Section</div>
          <div className="text-sm">No Feasible Solution Yet<br />(Searching...)</div>
        </div>
      </div>
    );
  }

  // Calculate SVG dimensions (to scale)
  const maxWidth = Math.max(sectionData.bf_top, sectionData.bf_bot);
  const totalHeight = sectionData.D;
  const scale = Math.min(200 / maxWidth, 300 / totalHeight); // Fit in ~200x300px viewBox

  const svgWidth = maxWidth * scale + 100; // Add margin for labels
  const svgHeight = totalHeight * scale + 80; // Add margin for labels

  const centerX = svgWidth / 2;
  const startY = 40; // Top margin
  const webCenterX = centerX;

  // Calculate positions
  const topFlangeY = startY;
  const topFlangeHeight = sectionData.tf_top * scale;
  const webStartY = topFlangeY + topFlangeHeight;
  const webHeight = (sectionData.D - sectionData.tf_top - sectionData.tf_bot) * scale;
  const bottomFlangeY = webStartY + webHeight;
  const bottomFlangeHeight = sectionData.tf_bot * scale;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-lg font-black mb-2">Best Cross-Section</div>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full max-h-full"
      >
        {/* Bottom Flange */}
        <rect
          x={webCenterX - (sectionData.bf_bot * scale) / 2}
          y={bottomFlangeY}
          width={sectionData.bf_bot * scale}
          height={bottomFlangeHeight}
          fill="#4A90E2"
          stroke="#000"
          strokeWidth="1"
        />
        {/* Bottom Flange Label */}
        <text
          x={webCenterX}
          y={bottomFlangeY + bottomFlangeHeight + 15}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
        >
          bf_bot: {sectionData.bf_bot.toFixed(0)} mm
        </text>
        <text
          x={webCenterX}
          y={bottomFlangeY + bottomFlangeHeight + 27}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
        >
          tf_bot: {sectionData.tf_bot.toFixed(0)} mm
        </text>

        {/* Web */}
        <rect
          x={webCenterX - (sectionData.tw * scale) / 2}
          y={webStartY}
          width={sectionData.tw * scale}
          height={webHeight}
          fill="#E8E8E8"
          stroke="#000"
          strokeWidth="1"
        />

        {/* Top Flange */}
        <rect
          x={webCenterX - (sectionData.bf_top * scale) / 2}
          y={topFlangeY}
          width={sectionData.bf_top * scale}
          height={topFlangeHeight}
          fill="#4A90E2"
          stroke="#000"
          strokeWidth="1"
        />
        {/* Top Flange Label */}
        <text
          x={webCenterX}
          y={topFlangeY - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
        >
          bf_top: {sectionData.bf_top.toFixed(0)} mm
        </text>
        <text
          x={webCenterX}
          y={topFlangeY - 17}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
        >
          tf_top: {sectionData.tf_top.toFixed(0)} mm
        </text>

        {/* Center Dimension Lines and Labels */}
        {/* Depth (D) */}
        <line
          x1={webCenterX + (sectionData.bf_top * scale) / 2 + 20}
          y1={topFlangeY}
          x2={webCenterX + (sectionData.bf_top * scale) / 2 + 20}
          y2={bottomFlangeY + bottomFlangeHeight}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <text
          x={webCenterX + (sectionData.bf_top * scale) / 2 + 25}
          y={(topFlangeY + bottomFlangeY + bottomFlangeHeight) / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#333"
          transform={`rotate(-90 ${webCenterX + (sectionData.bf_top * scale) / 2 + 25} ${(topFlangeY + bottomFlangeY + bottomFlangeHeight) / 2})`}
        >
          D: {sectionData.D.toFixed(0)} mm
        </text>

        {/* Web Thickness (tw) */}
        <line
          x1={webCenterX - (sectionData.tw * scale) / 2 - 15}
          y1={webStartY + webHeight / 2}
          x2={webCenterX + (sectionData.tw * scale) / 2 + 15}
          y2={webStartY + webHeight / 2}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <text
          x={webCenterX}
          y={webStartY + webHeight / 2 - 5}
          textAnchor="middle"
          fontSize="11"
          fill="#333"
        >
          tw: {sectionData.tw.toFixed(0)} mm
        </text>
      </svg>
    </div>
  );
}

export default CrossSectionPreview;

