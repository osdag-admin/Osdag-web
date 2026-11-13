export const beamToColumnEndPlateOutputConfig = {
  sections: {
    "Critical Bolt Design": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.Force (kN)", label: "Shear Demand (kN)" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Betalg", label: "β<sub>lg</sub>" },
      { key: "Bolt.Capacity", label: "Bolt Capacity" },
      { key: "Bolt.TensionForce", label: "Tension Due to Moment (kN)" },
      { key: "Bolt.PryingForce", label: "Prying Force (kN)" },
      { key: "Bolt.TensionTotal", label: "Tension Demand (kN)" },
      { key: "Bolt.Tension", label: "Tension Capacity (kN)" },
      { key: "Bolt.IR", label: "Combined Capacity, I.R" }
    ],
    "Detailing": [
      { key: "Detailing.No. of Bolts", label: "No. of Bolts" },
      { key: "Detailing.No. of Columns", label: "No. of Columns" },
      { key: "Detailing.No. of Rows", label: "No. of Rows" },
      { key: "Detailing.PitchDistanceOut", label: "Pitch Distance (mm)" },
      { key: "Detailing.GaugeDistanceOut", label: "Gauge Distance (mm)" },
      { key: "Detailing.Cross-centre Gauge Distance", label: "Cross-centre Gauge (mm)" },
      { key: "Detailing.EndDistanceOut", label: "End Distance (mm)" },
      { key: "Detailing.EdgeDistanceOut", label: "Edge Distance (mm)" },
      { key: "DetailingModal", label: "Typical Detailing" },
      { key: "BoltPatternModal", label: "Bolt Pattern" }
    ],
    "End Plate": [
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Width", label: "Width (mm)" },
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.MomentCapacity", label: "Moment Capacity (kNm)" }
    ],
    "Weld": [
        { key: "Weld.Size", label: "Size (mm)" },
        { key: "Weld.Length", label: "Total Length (mm)" },
        { key: "Weld.NormalStress", label: "Normal Stress (N/mm2)" },
        { key: "Weld.ShearStress", label: "Shear Stress (N/mm2)" },
        { key: "Weld.StressCombined", label: "Equivalent Stress (N/mm2)" },
        { key: "Weld.Strength", label: "Strength (N/mm2)" }
    ],
    "Section Weld": [
        { key: "Weld.Type", label: "Type" },
        { key: "SketchFlangeModal", label: "Typical Sketch" }
    ],
    "Continuity Plate": [
      { key: "ContinuityPlateModal", label: "Continuity Plate Details" },
    ],
    "Column Web Stiffener Plate": [
      { key: "WebStiffenerModal", label: "Web Stiffener Details" },
    ],
    "Stiffener": [
        { key: "Stiffener.Length", label: "Length (mm)" },
        { key: "Stiffener.Height", label: "Height (mm)" },
        { key: "Stiffener.Thickness", label: "Thickness (mm)" }
    ]
  },
  modals: {
    DetailingModal: { type: "detailing", buttonText: "Details" },
    ContinuityPlateModal: { type: "details", buttonText: "Details" },
    WebStiffenerModal: { type: "details", buttonText: "Details" },
    SketchFlangeModal: { type: "groove", buttonText: "Details" },
    BoltPatternModal: { type: "boltPattern", buttonText: "Details" }
  },
  modalTypes: {
    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    detailing: {
      title: "Typical Detailing",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "detailing"
    },
    groove: {
      title: "Weld Detail - Beam Flange to End Plate Connection",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "groove"
    },
    boltPattern: {
      title: "Bolt Pattern Details",
      width: "68%",
      layout: "beamcolumn-endplate-diagram",
      note: "Traced from the desktop's actual bolt-pattern drawing for the selected End Plate Type, not a generic grid."
    }
  },

  modalData: {
    details: {
      ContinuityPlateModal: [
        { key: "ContinuityPlate.Number", label: "Number of Plates" },
        { key: "ContinuityPlate.Length", label: "Length (mm)" },
        { key: "ContinuityPlate.Width", label: "Width (mm)" },
        { key: "ContinuityPlate.Thickness", label: "Thickness (mm)" }
      ],
      WebStiffenerModal: [
        { key: "WebStiffener.Number", label: "Number of Stiffener(s)" },
        { key: "WebStiffener.Length", label: "Length (mm)" },
        { key: "WebStiffener.Width", label: "Width (mm)" },
        { key: "WebStiffener.Thickness", label: "Thickness (mm)" }
      ]
    },

    boltPattern: {
      BoltPatternModal: {
        fields: [
          { key: "Plate.Width", label: "Plate Width (mm)" },
          { key: "Plate.Height", label: "Plate Height (mm)" },
          { key: "Detailing.No. of Rows", label: "No. of Rows" },
          { key: "Detailing.No. of Columns", label: "No. of Columns" },
          { key: "Detailing.PitchDistanceOut", label: "Pitch Distance (mm)" },
          { key: "Detailing.GaugeDistanceOut", label: "Gauge Distance (mm)" },
          { key: "Detailing.Cross-centre Gauge Distance", label: "Cross-centre Gauge (mm)" },
          { key: "Detailing.EndDistanceOut", label: "End Distance (mm)" },
          { key: "Detailing.EdgeDistanceOut", label: "Edge Distance (mm)" }
        ],
        diagram: {
          props: {
            endplateType: "EndPlateType",
            plateWidth: "Plate.Width",
            plateHeight: "Plate.Height",
            rows: "Detailing.No. of Rows",
            cols: "Detailing.No. of Columns",
            pitch: "Detailing.PitchDistanceOut",
            gauge: "Detailing.GaugeDistanceOut",
            crossGauge: "Detailing.Cross-centre Gauge Distance",
            end: "Detailing.EndDistanceOut",
            edge: "Detailing.EdgeDistanceOut",
            holeDia: "Bolt.Diameter",
            webThickness: "Beam.WebThickness",
            flangeThickness: "Beam.FlangeThickness",
            stiffenerLength: "Stiffener.Length",
            stiffenerThickness: "Stiffener.Thickness",
            middleBolts: "Detailing.MiddleBolts"
          }
        }
      }
    }
  }
};
