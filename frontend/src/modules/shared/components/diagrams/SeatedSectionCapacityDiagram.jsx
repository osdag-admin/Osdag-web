/* eslint-disable react/prop-types */

const BlueBolt = ({ cx, cy }) => (
  <ellipse cx={cx} cy={cy} rx={8} ry={8} stroke="#1E2DFF" strokeWidth="2.5" fill="white" />
);

const SeatedSectionCapacityDiagram = ({
  gauge = 70.0,
  className = "",
}) => {
  const gVal = Number(gauge) || 70.0;
  
  // Coordinates based on the desktop client geometry
  const leftOuter1 = 75;
  const leftOuter2 = 82;
  const rightOuter1 = 258;
  const rightOuter2 = 265;

  const topY = 70;
  const botY = 560;

  const topPlateX = 115;
  const topPlateY = 95;
  const plateW = 110;
  const plateH = 60;
  const botPlateY = 390;

  // Bolts centered wrt plate
  const plateCx = topPlateX + plateW / 2;
  let leftBoltX = plateCx - gVal / 2;
  let rightBoltX = plateCx + gVal / 2;

  // Boundary limits to keep bolts within the plate visually
  const leftLimit = topPlateX + 12;
  const rightLimit = topPlateX + plateW - 12;
  if (leftBoltX < leftLimit || rightBoltX > rightLimit) {
    leftBoltX = topPlateX + 20;
    rightBoltX = topPlateX + plateW - 20;
  }

  const topBoltY = 125;
  const bottomBoltY = 420;

  const topBolts = [[leftBoltX, topBoltY], [rightBoltX, topBoltY]];
  const bottomBolts = [[leftBoltX, bottomBoltY], [rightBoltX, bottomBoltY]];

  const webTop = topPlateY + plateH + 5;
  const webBottom = botPlateY - 5;
  const innerGap = 5.0;
  const innerLeftX = plateCx - innerGap / 2;
  const innerRightX = plateCx + innerGap / 2;

  return (
    <div className={`flex flex-col gap-4 items-center ${className}`}>
      <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Failure Pattern in Section
      </p>
      <svg
        viewBox="0 0 520 660"
        className="w-full max-w-[400px] h-auto bg-white dark:bg-gray-800 border border-gray-200 rounded-md shadow-sm"
      >
        {/* Steel Section Outline (Vertical lines) */}
        <line x1={leftOuter1} y1={topY} x2={leftOuter1} y2={botY} stroke="#777777" strokeWidth="1" />
        <line x1={leftOuter2} y1={topY} x2={leftOuter2} y2={botY} stroke="#777777" strokeWidth="1" />
        <line x1={rightOuter1} y1={topY} x2={rightOuter1} y2={botY} stroke="#777777" strokeWidth="1" />
        <line x1={rightOuter2} y1={topY} x2={rightOuter2} y2={botY} stroke="#777777" strokeWidth="1" />

        {/* Top Plate */}
        <rect x={topPlateX} y={topPlateY} width={plateW} height={plateH} fill="#EAE7D6" stroke="black" strokeWidth="1.2" />
        <line x1={topPlateX - 5} y1={topPlateY + plateH} x2={topPlateX + plateW + 5} y2={topPlateY + plateH} stroke="black" strokeWidth="1.2" />
        <line x1={topPlateX - 5} y1={topPlateY + plateH + 5} x2={topPlateX + plateW + 5} y2={topPlateY + plateH + 5} stroke="#777777" strokeWidth="1" />

        {/* Bottom Plate */}
        <rect x={topPlateX} y={botPlateY} width={plateW} height={plateH} fill="#EAE7D6" stroke="black" strokeWidth="1.2" />
        <line x1={topPlateX - 5} y1={botPlateY - 5} x2={topPlateX + plateW + 5} y2={botPlateY - 5} stroke="#777777" strokeWidth="1" />
        <line x1={topPlateX - 5} y1={botPlateY} x2={topPlateX + plateW + 5} y2={botPlateY} stroke="black" strokeWidth="1.2" />

        {/* Supported section rectangle */}
        <line x1={topPlateX} y1={webTop} x2={topPlateX} y2={webBottom} stroke="#777777" strokeWidth="1" />
        <line x1={topPlateX + plateW} y1={webTop} x2={topPlateX + plateW} y2={webBottom} stroke="#777777" strokeWidth="1" />
        
        {/* Inner web gap lines */}
        <line x1={innerLeftX} y1={webTop} x2={innerLeftX} y2={webBottom} stroke="#777777" strokeWidth="1" />
        <line x1={innerRightX} y1={webTop} x2={innerRightX} y2={webBottom} stroke="#777777" strokeWidth="1" />

        {/* Failure Paths (Dashed lines connecting bolts) */}
        <line x1={topBolts[0][0]} y1={topBolts[0][1]} x2={bottomBolts[0][0]} y2={bottomBolts[0][1]} stroke="#777777" strokeWidth="1" strokeDasharray="6,4" />
        <line x1={topBolts[1][0]} y1={topBolts[1][1]} x2={bottomBolts[1][0]} y2={bottomBolts[1][1]} stroke="#777777" strokeWidth="1" strokeDasharray="6,4" />
        <line x1={topBolts[0][0]} y1={topBolts[0][1]} x2={topBolts[1][0]} y2={topBolts[1][1]} stroke="#777777" strokeWidth="1" strokeDasharray="6,4" />
        <line x1={bottomBolts[0][0]} y1={bottomBolts[0][1]} x2={bottomBolts[1][0]} y2={bottomBolts[1][1]} stroke="#777777" strokeWidth="1" strokeDasharray="6,4" />

        {/* Bolts */}
        <BlueBolt cx={topBolts[0][0]} cy={topBolts[0][1]} />
        <BlueBolt cx={topBolts[1][0]} cy={topBolts[1][1]} />
        <BlueBolt cx={bottomBolts[0][0]} cy={bottomBolts[0][1]} />
        <BlueBolt cx={bottomBolts[1][0]} cy={bottomBolts[1][1]} />

        {/* Dimensions */}
        {/* Horizontal Dimensions at top */}
        <line x1={topPlateX} y1={40} x2={leftBoltX} y2={40} stroke="black" strokeWidth="1" />
        <line x1={leftBoltX} y1={40} x2={rightBoltX} y2={40} stroke="black" strokeWidth="1" />
        <line x1={rightBoltX} y1={40} x2={topPlateX + plateW} y2={40} stroke="black" strokeWidth="1" />
        
        {/* Dimension labels */}
        <text x={(topPlateX + leftBoltX) / 2} y={35} fontSize="9" textAnchor="middle" fill="black" className="dark:fill-white">
          {((leftBoltX - topPlateX) / scaleFactor(gVal)).toFixed(1)}
        </text>
        <text x={(leftBoltX + rightBoltX) / 2} y={35} fontSize="9" textAnchor="middle" fill="black" className="dark:fill-white">
          {gVal.toFixed(1)}
        </text>
        <text x={(rightBoltX + topPlateX + plateW) / 2} y={35} fontSize="9" textAnchor="middle" fill="black" className="dark:fill-white">
          {((topPlateX + plateW - rightBoltX) / scaleFactor(gVal)).toFixed(1)}
        </text>

        {/* Total plate width */}
        <line x1={topPlateX} y1={18} x2={topPlateX + plateW} y2={18} stroke="black" strokeWidth="1" />
        <text x={plateCx} y={13} fontSize="9" textAnchor="middle" fill="black" className="dark:fill-white">
          {plateW.toFixed(1)} mm
        </text>
      </svg>
    </div>
  );
};

// Simple scale factor helper to make dimension readings relative
const scaleFactor = () => {
  return 1;
};

export default SeatedSectionCapacityDiagram;
