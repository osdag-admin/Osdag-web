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
    DetailingModal: { type: "detailing", buttonText: "Details" },
    SketchModal: { type: "stiffener", buttonText: "Details" },
    SketchFlangeModal: { type: "groove", buttonText: "Details" }
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
    stiffener: {
      title: "Stiffener Details",
      width: "40%",
      layout: "image-only", 
      hasImage: true,
      imageType: "stiffener"
    },
    groove: {
      title: "Stiffener Details",
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
    }
  }
};
