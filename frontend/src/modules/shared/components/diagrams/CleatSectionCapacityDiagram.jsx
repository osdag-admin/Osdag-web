/* eslint-disable react/prop-types */

const BlueBolt = ({ cx, cy }) => (
  <ellipse cx={cx} cy={cy} rx={13} ry={13} stroke="#1E2DFF" strokeWidth="3" fill="white" />
);

const CleatSectionCapacityDiagram = ({
  connectivity = "Beam-Column",
  pitch = 60,
  end = 40,
  edge = 50,
  className = "",
}) => {
  const isBeamBeam = connectivity === "Beam-Beam";

  // Calculate coordinates for the second diagram (block shear)
  const p = Number(pitch) || 60;
  const e = Number(end) || 40;
  const ed = Number(edge) || 50;

  const totalRealH = 2 * e + p;
  const scale = totalRealH > 0 ? 420 / totalRealH : 1;

  const weldW = 18;
  const plateX = 80;
  const plateY = 80;
  const plateW = 280;
  
  const boltX = plateX + weldW + ed * scale;
  const topBoltY = plateY + e * scale;
  const botBoltY = plateY + (e + p) * scale;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Section Capacity Diagram */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern in Section</p>
        <svg viewBox="100 80 530 680" className="w-full max-w-xl h-auto bg-white border border-gray-200 rounded-md">
          {/* I-Beam Profile */}
          {/* Top Flange: cx=365, w=360, t=18, y=150 */}
          <rect x={365 - 180} y={150} width={360} height={18} fill="#9A9A9A" stroke="#5E5E5E" strokeWidth="2" />
          {/* Web: cx=365, w=14, y1=168, y2=700 */}
          <rect x={365 - 7} y={168} width={14} height={532} fill="#9A9A9A" stroke="#5E5E5E" strokeWidth="2" />
          {/* Bottom Flange: cx=365, w=360, t=18, y=700 */}
          <rect x={365 - 180} y={700} width={360} height={18} fill="#9A9A9A" stroke="#5E5E5E" strokeWidth="2" />

          {/* Cleat Angles */}
          {/* Left Angle: x=180, w=190, y=220, h=340 */}
          <rect x={180} y={220} width={190} height={340} fill="#F8F8F8" stroke="#444444" strokeWidth="2" />
          {/* Right Angle: x=360, w=190, y=220, h=340 */}
          <rect x={360} y={220} width={190} height={340} fill="#F8F8F8" stroke="#444444" strokeWidth="2" />

          {/* Weld Strips */}
          {/* Left Weld: x=cx - web_t/2 - 10, y=220, w=10, h=340 */}
          <rect x={365 - 7 - 10} y={220} width={10} height={340} fill="#D2905A" stroke="#C07840" strokeWidth="1" />
          {/* Right Weld: x=cx + web_t/2, y=220, w=10, h=340 */}
          <rect x={365 + 7} y={220} width={10} height={340} fill="#D2905A" stroke="#C07840" strokeWidth="1" />

          {/* Dashed boundary pattern */}
          <rect x={275} y={305} width={180} height={170} fill="none" stroke="#222" strokeWidth="1.5" strokeDasharray="6,4" />

          {/* Bolts */}
          <BlueBolt cx={275} cy={305} />
          <BlueBolt cx={275} cy={475} />
          <BlueBolt cx={455} cy={305} />
          <BlueBolt cx={455} cy={475} />
        </svg>
      </div>

      {/* Optional Block Shear Diagram for Beam-Beam connectivity */}
      {isBeamBeam && (
        <div>
          <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern due to Block Shear in Section</p>
          <svg viewBox="-40 -20 520 600" className="w-full max-w-xl h-auto bg-white border border-gray-200 rounded-md">
            {/* Plate */}
            <rect x={plateX} y={plateY} width={plateW} height={420} fill="#F8F8F8" stroke="#444444" strokeWidth="2" />
            {/* Weld Strip */}
            <rect x={plateX} y={plateY} width={weldW} height={420} fill="#9A9A9A" stroke="#777777" strokeWidth="1" />

            {/* Fracture path (L-shape) */}
            {/* Vertical from plate top to bottom bolt */}
            <line x1={boltX} y1={plateY} x2={boltX} y2={botBoltY} stroke="#E8A000" strokeWidth="2.5" strokeDasharray="6,4" />
            {/* Horizontal from bottom bolt to weld strip edge */}
            <line x1={plateX + weldW} y1={botBoltY} x2={boltX} y2={botBoltY} stroke="#E8A000" strokeWidth="2.5" strokeDasharray="6,4" />

            {/* Bolts */}
            <BlueBolt cx={boltX} cy={topBoltY} />
            <BlueBolt cx={boltX} cy={botBoltY} />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CleatSectionCapacityDiagram;
