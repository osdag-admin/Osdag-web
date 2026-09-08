/* eslint-disable react/prop-types */
import SpacingDiagram from "./SpacingDiagram";

/**
 * CapacityDiagram wraps SpacingDiagram and layers failure paths (block shear, yielding, rupture lines)
 * on top of the computed SVG bolt grid coordinates.
 */
const CapacityDiagram = ({ fracturePattern, ...props }) => {
  return (
    <SpacingDiagram {...props}>
      {({ offsetX, offsetY, scale, boltColsPositions, boltRowsPositions, numericParams }) => {
        if (!boltColsPositions.length || !boltRowsPositions.length) {
          return null;
        }

        // We use the leftmost column for fracture path logic, mirroring if origin is right.
        const x_cut = offsetX + boltColsPositions[0] * scale;
        const y_top_bolt = offsetY + boltRowsPositions[0] * scale;
        const y_bot_bolt = offsetY + boltRowsPositions[boltRowsPositions.length - 1] * scale;
        const w_pixel = offsetX + numericParams.width * scale;
        const h_pixel = offsetY + numericParams.height * scale;
        const x_left_edge = offsetX;

        const paths = [];

        if (fracturePattern === "shear") {
          // Failure Pattern due to Shear in Plate (left weld, right free edge)
          // Vertical line: top bolt -> bottom plate edge
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: x_cut,
            y2: h_pixel,
          });
          // Horizontal line: top bolt -> right plate edge
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: w_pixel,
            y2: y_top_bolt,
          });
        } else if (fracturePattern === "tension") {
          // Failure Pattern due to Tension in Plate (left weld, right free edge)
          // Vertical line: top bolt -> bottom bolt
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: x_cut,
            y2: y_bot_bolt,
          });
          // Horizontal line: top bolt -> right plate edge
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: w_pixel,
            y2: y_top_bolt,
          });
          // Horizontal line: bottom bolt -> right plate edge
          paths.push({
            x1: x_cut,
            y1: y_bot_bolt,
            x2: w_pixel,
            y2: y_bot_bolt,
          });
        } else if (fracturePattern === "section-shear") {
          // Failure Pattern in Section Shear (right weld/interface, left free edge)
          // Vertical line: top bolt -> bottom edge
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: x_cut,
            y2: h_pixel,
          });
          // Horizontal line: left plate edge -> top bolt
          paths.push({
            x1: x_left_edge,
            y1: y_top_bolt,
            x2: x_cut,
            y2: y_top_bolt,
          });
        } else if (fracturePattern === "section-tension") {
          // Failure Pattern in Section Tension (right weld/interface, left free edge)
          // Vertical line: top bolt -> bottom bolt
          paths.push({
            x1: x_cut,
            y1: y_top_bolt,
            x2: x_cut,
            y2: y_bot_bolt,
          });
          // Horizontal line: left plate edge -> top bolt
          paths.push({
            x1: x_left_edge,
            y1: y_top_bolt,
            x2: x_cut,
            y2: y_top_bolt,
          });
          // Horizontal line: left plate edge -> bottom bolt
          paths.push({
            x1: x_left_edge,
            y1: y_bot_bolt,
            x2: x_cut,
            y2: y_bot_bolt,
          });
        } else if (fracturePattern === "section-block-shear") {
          // Block Shear in Supporting Section / Copied beam flange (Beam-Beam)
          // Vertical line: top plate edge -> bottom bolt
          paths.push({
            x1: x_cut,
            y1: offsetY,
            x2: x_cut,
            y2: y_bot_bolt,
          });
          // Horizontal line: left plate edge -> bottom bolt
          paths.push({
            x1: x_left_edge,
            y1: y_bot_bolt,
            x2: x_cut,
            y2: y_bot_bolt,
          });
        }

        return (
          <g key="capacity-paths">
            {paths.map((p, idx) => (
              <line
                key={`path-${idx}`}
                x1={p.x1}
                y1={p.y1}
                x2={p.x2}
                y2={p.y2}
                stroke="#dc143c"
                strokeWidth="3"
                strokeDasharray="6,4"
              />
            ))}
          </g>
        );
      }}
    </SpacingDiagram>
  );
};

export default CapacityDiagram;
