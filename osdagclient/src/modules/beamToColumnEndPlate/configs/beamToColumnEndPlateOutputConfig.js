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
      { key: "DetailingModal", label: "Typical Detailing" }
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
        { key: "Weld.Strength", label: "Strength (N/mm2)" },
        { key: "Weld.Type", label: "Type" }
    ],
    "Continuity Plate": [
      { key: "ContinuityPlateModal", label: "Continuity Plate Details" },
      { key: "ContinuityPlate.Number", label: "Number of Plates" }
    ],
    "Column Web Stiffener Plate": [
      { key: "WebStiffenerModal", label: "Web Stiffener Details" },
      { key: "WebStiffener.Number", label: "Number of Stiffener(s)" }
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
    WebStiffenerModal: { type: "details", buttonText: "Details" }
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
    }
  },

  modalData: {
    details: {
      ContinuityPlateModal: [
        { key: "ContinuityPlate.Length", label: "Length (mm)" },
        { key: "ContinuityPlate.Width", label: "Width (mm)" },
        { key: "ContinuityPlate.Thickness", label: "Thickness (mm)" }
      ],
      WebStiffenerModal: [
        { key: "WebStiffener.Length", label: "Length (mm)" },
        { key: "WebStiffener.Width", label: "Width (mm)" },
        { key: "WebStiffener.Thickness", label: "Thickness (mm)" }
      ]
    }
  }
};
