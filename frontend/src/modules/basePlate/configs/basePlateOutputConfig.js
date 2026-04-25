export const basePlateOutputConfig = {
  sections: {
    "Anchor Bolt - Outside Column Flange": [
      { key: "Anchor Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Anchor Bolt.Grade", label: "Property Class" },
      { key: "Anchor Bolt.No of Anchor Bolts", label: "No. of Anchors" },
      { key: "Anchor Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Anchor Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Anchor Bolt.Capacity", label: "Bolt Capacity (kN)" },
      { key: "Anchor Bolt.Tension_Demand", label: "Tension Demand (kN)" },
      { key: "Anchor Bolt.Tension", label: "Tension Capacity (kN)" },
      { key: "Anchor Bolt.Combined", label: "Combined Capacity (kN)" },
      { key: "Anchor Bolt.Length", label: "Anchor Length (mm)" },
    ],
    "Anchor Bolt - Inside Column Flange": [
      { key: "Anchor Bolt.Diameter_Uplift", label: "Diameter (mm)" },
      { key: "Anchor Bolt.Grade_Uplift", label: "Property Class" },
      { key: "Anchor Bolt.No of Anchor Bolts_Uplift", label: "No. of Anchor Bolts" },
      { key: "Anchor Bolt.Tension_Demand_Uplift", label: "Tension Demand (kN)" },
      { key: "Anchor Bolt.Tension_Uplift", label: "Tension Capacity (kN)" },
      { key: "Anchor Bolt.Length_Uplift", label: "Anchor Length (mm)" },
    ],
    "Base Plate Connection": [
      { key: "Baseplate.Thickness", label: "Thickness (mm)" },
      { key: "Baseplate.Length", label: "Length (mm)" },
      { key: "Baseplate.Width", label: "Width (mm)" },
      { key: "Baseplate.BearingStress", label: "Bearing Stress (MPa)" },
      { key: "Baseplate.MomentDemand", label: "Moment Demand (kNm)" },
      { key: "Baseplate.MomentCapacity", label: "Moment Capacity (kNm)" },
      { key: "BasePlate.Sketch", label: "Typical Sketch" },
    ],
    "Detailing - Outside Column Flange": [
      { key: "Detailing.EndDistanceOut", label: "End Distance (mm)" },
      { key: "Detailing.EdgeDistanceOut", label: "Edge Distance (mm)" },
      { key: "Detailing.PitchDistanceOut", label: "Pitch Distance (mm)" },
      { key: "Detailing.GaugeDistanceOut", label: "Gauge Distance (mm)" },
      { key: "Detailing.Projection", label: "Effective Projection (mm)" },
    ],
    "Detailing - Inside Column Flange": [
      { key: "Detailing.EndDistanceIn", label: "End Distance (mm)" },
      { key: "Detailing.EdgeDistanceIn", label: "Edge Distance (mm)" },
      { key: "Detailing.PitchDistanceIn", label: "Pitch Distance (mm)" },
      { key: "Detailing.GaugeDistanceIn", label: "Gauge Distance (mm)" },
    ],
    "Detailing": [
      { key: "BasePlate.TypicalDetailing", label: "Typical Detailing" },
    ],
    "Stiffener Plate along Column flange": [
      { key: "StiffenerPlate.Flange", label: "Stiffener Plate" },
    ],
    "Stiffener Plate along Column web": [
      { key: "StiffenerPlate.AlongWeb", label: "Stiffener Plate" },
    ],
    "Stiffener Plate across Column web": [
      { key: "StiffenerPlate.AcrossWeb", label: "Stiffener Plate" },
    ],
    "Stiffener Plate": [
      { key: "Stiffener.StiffenerPlate", label: "Stiffener Plate" },
    ],
    "Shear Design": [
      { key: "ShearDesign.Resistance", label: "Shear Resistance (kN)" },
      { key: "Shear_key.Required", label: "Key Required?" },
      { key: "ShearKey.Details", label: "Shear Key" },
    ],
    "Weld": [
      { key: "Weld.Details", label: "Weld" },
    ],
  },

  // Modal trigger: field.key -> { type: modalType, buttonText } (buttonText = desktop 4th tuple element)
  modals: {
    "BasePlate.Sketch": { type: "basePlateSketch", buttonText: "Typical Sketch" },
    "BasePlate.TypicalDetailing": { type: "basePlateDetailing", buttonText: "Typical Detailing" },
    "StiffenerPlate.Flange": { type: "stiffenerDetails", buttonText: "Stiffener Details" },
    "StiffenerPlate.AlongWeb": { type: "stiffenerDetails", buttonText: "Stiffener Details" },
    "StiffenerPlate.AcrossWeb": { type: "stiffenerDetails", buttonText: "Stiffener Details" },
    "Stiffener.StiffenerPlate": { type: "stiffenerDetails", buttonText: "Stiffener Details" },
    "ShearKey.Details": { type: "keyDetails", buttonText: "Key Details" },
    "Weld.Details": { type: "weldDetails", buttonText: "Typical Details" },
  },

  modalTypes: {
    basePlateSketch: {
      title: "Typical Sketch",
      layout: "image-only",
      imageType: "basePlateSketch",
      width: "60%",
    },
    basePlateDetailing: {
      title: "Typical Detailing",
      layout: "image-only",
      imageType: "basePlateDetailing",
      width: "60%",
    },
    stiffenerDetails: {
      title: "Stiffener Details",
      layout: "single-column",
      width: "50%",
    },
    keyDetails: {
      title: "Key Details",
      layout: "single-column",
      width: "50%",
    },
    keySketch: {
      title: "Sketch",
      layout: "image-only",
      imageType: "keySketch",
      width: "50%",
    },
    weldDetails: {
      title: "Typical Details",
      layout: "image-only",
      imageType: "weldDetails",
      width: "60%",
    },
  },

  // Stiffener Details modal: which output keys to show per button (adapter merges these into output)
  modalData: {
    basePlateSketch: {},
    basePlateDetailing: {},
    stiffenerDetails: {
      "StiffenerPlate.Flange": {
        fields: [
          { key: "Stiffener_Plate_Flange.Length", label: "Length (mm)" },
          { key: "Stiffener_Plate_Flange.Height", label: "Height (mm)" },
          { key: "Stiffener_Plate_Flange.Thickness", label: "Thickness (mm)" },
          { key: "Stiffener_Plate_Flange.Shear_Demand", label: "Shear Demand (kN)" },
          { key: "Stiffener_Plate_Flange.Shear", label: "Shear Capacity (kN)" },
          { key: "Stiffener_Plate_Flange.Moment_Demand", label: "Moment Demand (kNm)" },
          { key: "Stiffener_Plate_Flange.Moment", label: "Moment Capacity (kNm)" },
        ],
      },
      "StiffenerPlate.AlongWeb": {
        fields: [
          { key: "Stiffener_Plate_along_Web.Length", label: "Length (mm)" },
          { key: "Stiffener_Plate_along_Web.Height", label: "Height (mm)" },
          { key: "Stiffener_Plate_along_Web.Thickness", label: "Thickness (mm)" },
          { key: "Stiffener_Plate_along_Web.Shear_Demand", label: "Shear Demand (kN)" },
          { key: "Stiffener_Plate_along_Web.Shear", label: "Shear Capacity (kN)" },
          { key: "Stiffener_Plate_along_Web.Moment_Demand", label: "Moment Demand (kNm)" },
          { key: "Stiffener_Plate_along_Web.Moment", label: "Moment Capacity (kNm)" },
        ],
      },
      "StiffenerPlate.AcrossWeb": {
        fields: [
          { key: "Stiffener_Plate_across_Web.Length", label: "Length (mm)" },
          { key: "Stiffener_Plate_across_Web.Height", label: "Height (mm)" },
          { key: "Stiffener_Plate_across_Web.Thickness", label: "Thickness (mm)" },
          { key: "Stiffener_Plate_across_Web.Shear_Demand", label: "Shear Demand (kN)" },
          { key: "Stiffener_Plate_across_Web.Shear", label: "Shear Capacity (kN)" },
          { key: "Stiffener_Plate_across_Web.Moment_Demand", label: "Moment Demand (kNm)" },
          { key: "Stiffener_Plate_across_Web.Moment", label: "Moment Capacity (kNm)" },
        ],
      },
      "Stiffener.StiffenerPlate": {
        fields: [
          { key: "Stiffener.Length", label: "Length (mm)" },
          { key: "Stiffener.Height", label: "Height (mm)" },
          { key: "Stiffener.Thickness", label: "Thickness (mm)" },
          { key: "StiffenerPlate.Shear_Demand", label: "Shear Demand (kN)" },
          { key: "StiffenerPlate.Shear_Capacity", label: "Shear Capacity (kN)" },
          { key: "StiffenerPlate.Moment_Demand", label: "Moment Demand (kNm)" },
          { key: "StiffenerPlate.Moment_Capacity", label: "Moment Capacity (kNm)" },
        ],
      },
    },
    keyDetails: {},
    keySketch: {},
    weldDetails: {},
  },
};

export default basePlateOutputConfig;
