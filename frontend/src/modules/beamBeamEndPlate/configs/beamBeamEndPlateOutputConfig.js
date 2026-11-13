export const beamBeamEndPlateOutputConfig = {
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
      { key: "DetailingModal", label: "Typical Detailing" }
    ],
    "End Plate": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Width", label: "Width (mm)" },
      { key: "Plate.MomentCapacity", label: "Moment Capacity (kNm)" }
    ],
    "Stiffener Plate": [
      { key: "DimensionsModal", label: "Details" },
      { key: "SketchModal", label: "Typical Sketch" }
    ],
    "Weld at Web": [
      { key: "Weld.Size", label: "Size (mm)" },
      { key: "Weld.Length", label: "Total Length (mm)" },
      { key: "Weld.Stress", label: "Stress (N/mm)" },
      { key: "Weld.StressCombined", label: "Combined Stress (N/mm2)" },
      { key: "Weld.Strength", label: "Strength (N/mm2)" }
    ],
    "Weld at Flange": [
      { key: "Weld.Type", label: "Type" },
      { key: "SketchFlangeModal", label: "Details" }
    ]
  },

  modals: {
    DimensionsModal: { type: "details", buttonText: "Details" },
    DetailingModal:  { type: "endplate-detailing", buttonText: "Details" },
    SketchModal:     { type: "stiffener", buttonText: "Details" },
    SketchFlangeModal: { type: "groove", buttonText: "Details" }
  },

  modalTypes: {
    details: {
      title: "Stiffener Dimensions",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    "endplate-detailing": {
      title: "Typical Detailing",
      width: "65%",
      layout: "endplate-detailing",
      hasImage: false
    },
    stiffener: {
      title: "Stiffener Details",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "stiffener"
    },
    groove: {
      title: "Weld Detail - Beam Flange to End Plate Connection",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "groove"
    }
  },

  modalData: {
    details: {
      DimensionsModal: [
        { key: "Stiffener.Length", label: "Length (mm)" },
        { key: "Stiffener.Width", label: "Width (mm)" },
        { key: "Stiffener.Thickness", label: "Thickness (mm)" }
      ]
    },
    "endplate-detailing": {
      DetailingModal: {
        fields: [
          { key: "Detailing.No. of Bolts",               label: "No. of Bolts" },
          { key: "Detailing.No. of Columns",             label: "No. of Columns" },
          { key: "Detailing.No. of Rows",                label: "No. of Rows" },
          { key: "Detailing.PitchDistanceOut",           label: "Pitch Distance (mm)" },
          { key: "Detailing.GaugeDistanceOut",           label: "Gauge Distance (mm)" },
          { key: "Detailing.Cross-centre Gauge Distance",label: "Cross-centre Gauge (mm)" },
          { key: "Detailing.EndDistanceOut",             label: "End Distance (mm)" },
          { key: "Detailing.EdgeDistanceOut",            label: "Edge Distance (mm)" },
          { key: "Plate.Height",                         label: "Plate Height (mm)" }
        ],
        diagram: {
          props: {
            plateHeight:        "Plate.Height",
            plateThickness:     "Plate.Thickness",
            beamDepth:          "Beam.Depth",
            beamFlangeThick:    "Beam.FlangeThickness",
            stiffenerHeight:    "Stiffener.Height",
            stiffenerThickness: "Stiffener.Thickness",
            endplateType:       "EndPlateType"
          }
        }
      }
    }
  }
};
