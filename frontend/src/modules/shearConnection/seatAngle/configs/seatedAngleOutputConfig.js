export const seatedAngleOutputConfig = {
  // --- Defines the sections and fields on the main output panel ---
  sections: {
    "Bolt": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.number", label: "Number of Bolts" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Betalg", label: "β<sub>lg</sub>" },
      { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Shear Force (kN)" },
    ],
    "SeatedAngleConnection": [
      { key: "SeatedAngle.Designation", label: "Designation" },
      { key: "TopAngle.Width", label: "Width (mm)" },
      { key: "CapacityModal", label: "Capacity" },
      { key: "SpacingModal_Seated_col", label: "Bolt Spacing Details" },
      { key: "SpacingModal_Seated_beam", label: "Bolt Spacing Details" },
    ],
    "Top Angle": [
      { key: "TopAngle.Designation", label: "Designation" },
      { key: "TopAngle.Width", label: "Width (mm)" },
      { key: "SpacingModal_Top_col", label: "Bolt Spacing Details" },
      { key: "SpacingModal_Top_beam", label: "Bolt Spacing Details" },
    ],
  },

  // --- Maps the modal trigger keys from 'sections' to a modal type and button text ---
  modals: {
    SpacingModal_Seated_col: { type: "spacing", buttonText: "On Column" },
    SpacingModal_Seated_beam: { type: "spacing", buttonText: "On Beam" },
    SpacingModal_Top_col: { type: "spacing", buttonText: "On Column" },
    SpacingModal_Top_beam: { type: "spacing", buttonText: "On Beam" },
    CapacityModal: { type: "capacity", buttonText: "Capacity Details" },
  },

  // --- Defines the properties of each type of modal ---
  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "spacing-diagram",
      note: "Note: Representative image for Spacing Details - 3 x 3 pattern considered",
    },
    capacity: {
      title: "Capacity Details",
      width: "30%",
      layout: "single-column",
      hasImage: false,
      note: null,
    },
  },

  // --- Contains the data to be displayed inside each specific modal ---
  modalData: {
    spacing: {
      SpacingModal_Seated_col: {
        fields: [
          { key: "Bolt.Rows_seated_col", label: "Rows of Bolts" },
          { key: "Bolt.Cols_seated_col", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_seated_col", label: "End Distance (mm)" },
          { key: "Central Gauge (mm)", label: "Central Gauge (mm)" },
          { key: "Bolt.Gauge_seated_col", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_seated_col", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "left",
          props: {
            plateWidth: "SeatedAngle.Width",
            plateHeight: "SeatedAngle.LegLength",
            rows: "Bolt.Rows_seated_col",
            cols: "Bolt.Cols_seated_col",
            end: "Bolt.EndDist_seated_col",
            pitch: "Bolt.Pitch_seated_col",
            gauge: ["Central Gauge (mm)", "Bolt.Gauge_seated_col"],
            edge: "Bolt.EdgeDist_seated_col",
            holeDiameter: "Bolt.Diameter",
          },
        },
      },
      SpacingModal_Seated_beam: {
        fields: [
          { key: "Bolt.Rows_seated_beam", label: "Rows of Bolts" },
          { key: "Bolt.Cols_seated_beam", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_seated_beam", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_seated_beam", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_seated_beam", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "left",
          props: {
            plateWidth: "SeatedAngle.Width",
            plateHeight: "SeatedAngle.LegLength",
            rows: "Bolt.Rows_seated_beam",
            cols: "Bolt.Cols_seated_beam",
            end: "Bolt.EndDist_seated_beam",
            pitch: "Bolt.Pitch_seated_beam",
            gauge: "Bolt.Gauge_seated_beam",
            edge: "Bolt.EdgeDist_seated_beam",
            holeDiameter: "Bolt.Diameter",
          },
        },
      },
      SpacingModal_Top_col: {
        fields: [
          { key: "Bolt.Rows_top_col", label: "Rows of Bolts" },
          { key: "Bolt.Cols_top_col", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_top_col", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_top_col", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_top_col", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "left",
          props: {
            plateWidth: "TopAngle.Width",
            plateHeight: "TopAngle.LegALength",
            rows: "Bolt.Rows_top_col",
            cols: "Bolt.Cols_top_col",
            end: "Bolt.EndDist_top_col",
            pitch: "Bolt.Pitch_top_col",
            gauge: "Bolt.Gauge_top_col",
            edge: "Bolt.EdgeDist_top_col",
            holeDiameter: "Bolt.Diameter",
          },
        },
      },
      SpacingModal_Top_beam: {
        fields: [
          { key: "Bolt.Rows_top_beam", label: "Rows of Bolts" },
          { key: "Bolt.Cols_top_beam", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_top_beam", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_top_beam", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_top_beam", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "left",
          props: {
            plateWidth: "TopAngle.Width",
            plateHeight: "TopAngle.LegALength",
            rows: "Bolt.Rows_top_beam",
            cols: "Bolt.Cols_top_beam",
            end: "Bolt.EndDist_top_beam",
            pitch: "Bolt.Pitch_top_beam",
            gauge: "Bolt.Gauge_top_beam",
            edge: "Bolt.EdgeDist_top_beam",
            holeDiameter: "Bolt.Diameter",
          },
        },
      },
    },
    capacity: {
      CapacityModal: [
        { key: "Plate.ShearDemand", label: "Shear Demand (kN)" },
        { key: "Plate.Shear", label: "Shear Yielding Capacity (kN)" },
        { key: "Plate.MomDemand", label: "Moment Demand (kNm)" },
        { key: "Plate.MomCapacity", label: "Moment Capacity (kNm)" },
      ],
    },
  },
};