export const cleatAngleOutputConfig = {
  sections: {
    "Cleat Angle": [
      { key: "Cleat.Angle", label: "Cleat Angle Designation" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Cleat.Shear", label: "Shear Yielding Capacity (kN)" },
      { key: "Cleat.BlockShear", label: "Block Shear Capacity (kN)" },
      { key: "Cleat.MomDemand", label: "Moment Demand (kNm)" },
      { key: "Cleat.MomCapacity", label: "Moment Capacity (kNm)" },
    ],
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
    ],
    "Bolts on Supported Leg": [
      { key: "Bolt.Line", label: "Bolt Columns (nos)" },
      { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
      { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
      { key: "Bolt.Capacity_sptd", label: "Bolt Value (kN)" },
      { key: "CapacityModal_supported", label: "Capacity Details" },
      { key: "SupportedSpacingModal", label: "Spacing" },
    ],
    "Bolts on Supporting Leg": [
      { key: "Cleat.Spting_leg.Line", label: "Bolt Columns (nos)" },
      { key: "Cleat.Spting_leg.OneLine", label: "Bolt Rows (nos)" },
      { key: "Cleat.Spting_leg.Force", label: "Bolt Force (kN)" },
      { key: "Bolt.Capacity_spting", label: "Bolt Value (kN)" },
      { key: "CapacityModal_supporting", label: "Capacity Details" },
      { key: "SupportingSpacingModal", label: "Spacing" },
    ],
  },

  modals: {
    SupportedSpacingModal: { type: "spacing", buttonText: "Supported Spacing" },
    SupportingSpacingModal: { type: "spacing", buttonText: "Supporting Spacing" },
    CapacityModal_supported: { type: "details", buttonText: "Capacity Details" },
    CapacityModal_supporting: { type: "details", buttonText: "Capacity Details" },
  },

  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "two-column",
      hasImage: true,
    },

    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false,
    },

    capacity: {
      title: "Plate Capacity Details",
      width: "68%",
      layout: "two-column",
      hasImage: true,
    },
  },

  modalData: {
    spacing: {
      SupportedSpacingModal: [
        { key: "Bolt.Bearing_supported", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supported", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supported", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supported", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supported", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supported", label: "Bolt Shear Force (kN)" },
      ],
      SupportingSpacingModal: [
        { key: "Bolt.Bearing_supporting", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supporting", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supporting", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supporting", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supporting", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supporting", label: "Bolt Shear Force (kN)" },
      ],
    },
    details: {
      CapacityModal_supported: [
        { key: "Bolt.Bearing_supported", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supported", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supported", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supported", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supported", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supported", label: "Bolt Shear Force (kN)" },
      ],
      CapacityModal_supporting: [
        { key: "Bolt.Bearing_supporting", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supporting", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supporting", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supporting", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supporting", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supporting", label: "Bolt Shear Force (kN)" },
      ],
    },
  },
};
