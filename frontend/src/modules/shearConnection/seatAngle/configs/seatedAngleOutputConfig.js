export const seatedAngleOutputConfig = {
  // --- Defines the sections and fields on the main output panel ---
  sections: {
    "Bolt": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.number", label: "Number of Bolts" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Betalg", label: "βlg" },
      { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Shear Force (kN)" },
    ],
    "Seated Angle": [
      { key: "SeatedAngle.Designation", label: "Designation" },
      { key: "SeatedAngle.Thickness", label: "Leg Thickness (mm)" },
      { key: "SeatedAngle.LegLength", label: "Leg Length (mm)" },
      { key: "SeatedAngle.Width", label: "Width (mm)" },
      { key: "CapacityModal", label: "Capacity" },
      { key: "SpacingModal_Seated_col", label: "Bolt Spacing Details" },
      { key: "SpacingModal_Seated_beam", label: "Bolt Spacing Details" },
    ],
    "Section Details": [
      { key: "SectionCapacityModal", label: "Section Capacity" },
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
    SectionCapacityModal: { type: "sectionCapacity", buttonText: "Capacity Details" },
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
      width: "68%",
      layout: "seated-angle-capacity-sketch",
      note: "Note: Representative image for Failure Pattern",
    },
    sectionCapacity: {
      title: "Section Capacity Details",
      width: "68%",
      layout: "seated-section-capacity",
      hasImage: false,
      note: "Note: Capacity details of the supported / supporting section used in seated angle design",
    },
  },

  // --- Contains the data to be displayed inside each specific modal ---
  modalData: {
    spacing: {
      SpacingModal_Seated_col: {
        fields: [
          // { key: "Bolt.Rows_seated_col", label: "Rows of Bolts" },
          // { key: "Bolt.Cols_seated_col", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_seated_col", label: "End Distance (mm)" },
          // { key: "Bolt.GaugeCentral_seated_col", label: "Central Gauge (mm)" },
          { key: "Bolt.GaugeCentral_seated_col", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_seated_col", label: "Edge Distance (mm)" },
          { key: "Bolt.Diameter", label: "Hole Distance (mm)" },
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
            gauge: ["Bolt.GaugeCentral_seated_col", "Bolt.Gauge_seated_col"],
            edge: "Bolt.EdgeDist_seated_col",
            holeDiameter: "Bolt.Diameter",
            angleDesignation: "SeatedAngle.Designation",
            thicknessBand: "bottom",
          },
        },
      },
      SpacingModal_Seated_beam: {
        fields: [
          // { key: "Bolt.Rows_seated_beam", label: "Rows of Bolts" },
          // { key: "Bolt.Cols_seated_beam", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_seated_beam", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_seated_beam", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_seated_beam", label: "Edge Distance (mm)" },
          { key: "Bolt.Diameter", label: "Hole Distance (mm)" },
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
            angleDesignation: "SeatedAngle.Designation",
            thicknessBand: "top",
          },
        },
      },
      SpacingModal_Top_col: {
        fields: [
          // { key: "Bolt.Rows_top_col", label: "Rows of Bolts" },
          // { key: "Bolt.Cols_top_col", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_top_col", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_top_col", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_top_col", label: "Edge Distance (mm)" },
          { key: "Bolt.Diameter", label: "Hole Distance (mm)" },
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
            angleDesignation: "TopAngle.Designation",
            thicknessBand: "bottom",
          },
        },
      },
      SpacingModal_Top_beam: {
        fields: [
          // { key: "Bolt.Rows_top_beam", label: "Rows of Bolts" },
          // { key: "Bolt.Cols_top_beam", label: "Columns of Bolts" },
          { key: "Bolt.EndDist_top_beam", label: "End Distance (mm)" },
          { key: "Bolt.Gauge_top_beam", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist_top_beam", label: "Edge Distance (mm)" },
          { key: "Bolt.Diameter", label: "Hole Distance (mm)" },
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
            angleDesignation: "TopAngle.Designation",
            thicknessBand: "top",
          },
        },
      },
    },
    capacity: {
      CapacityModal: {
        fields: [
          { key: "Plate.ShearDemand", label: "Shear Demand (kN)", section: "Failure Pattern due to Shear in Plate" },
          { key: "Plate.Shear", label: "Shear Yielding Capacity (kN)", section: "Failure Pattern due to Shear in Plate" },
          { key: "Plate.MomDemand", label: "Moment Demand (kNm)", section: "Failure Pattern due to Moment in Plate" },
          { key: "Plate.MomCapacity", label: "Moment Capacity (kNm)", section: "Failure Pattern due to Moment in Plate" },
        ],
        diagram: {
          props: {
            plateWidth: "SeatedAngle.Width",
            plateHeight: "SeatedAngle.LegLength",
            cols: "Bolt.Cols_seated_col",
            end: "Bolt.EndDist_seated_col",
            gauge: "Bolt.GaugeCentral_seated_col",
            edge: "Bolt.EdgeDist_seated_col",
            holeDia: "Bolt.Diameter",
          },
        },
      },
    },
    sectionCapacity: {
      SectionCapacityModal: {
        fields: [
          { key: "Plate.ShearDemand", label: "Factored Shear Force (kN)", section: "Failure Pattern due to Shear in Supported Section" },
          { key: "Member.shear_yielding", label: "Supported Section Shear Yielding Capacity (kN)", section: "Failure Pattern due to Shear in Supported Section" },
          { key: "Allowable Shear Capacity (kN)", label: "Supported Section Allowable Shear Capacity (kN)", section: "Failure Pattern due to Shear in Supported Section" },
          { key: "Member.tension_yielding", label: "Supporting Section Tension Yielding Capacity (kN)", section: "Failure Pattern due to Tension in Supporting Section" },
        ],
        diagram: {
          props: {
            gauge: "Bolt.GaugeCentral_seated_col",
          },
        },
      },
    },
  },
};