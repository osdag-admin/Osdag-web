export const endPlateOutputConfig = {
  sections: {
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
      { key: "Bolt.Tension", label: "Bolt Tension Capacity (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Shear Force (kN)" },
      { key: "Bolt.TensionForce", label: "Bolt Tension Force (kN)" },
      { key: "Bolt.PryingForce", label: "Bolt Prying Force (kN)" },
      { key: "Bolt.TensionTotal", label: "Total Bolt Tension (kN)" },
      { key: "Bolt.IR", label: "Interaction Ratio" },
      { key: "Bolt.Rows", label: "Rows of Bolts" },
      { key: "Bolt.Betalj", label: "β<sub>lj</sub>" },
      { key: "Bolt.Betalg", label: "β<sub>lg</sub>" },
      { key: "Bolt.Betapk", label: "β<sub>pk</sub>" },
      { key: "BoltCapacityModal", label: "Capacity" },
    ],
    Plate: [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Width (mm)" },
      { key: "Plate.Shear", label: "Shear Yielding Capacity (kN)" },
      { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)" },
      { key: "Plate.MomDemand", label: "Moment Demand per Bolt (kNm)" },
      { key: "Plate.MomCapacity", label: "Moment Capacity per Bolt (kNm)" },
      { key: "PlateSpacingModal", label: "Spacing" },
    ],
    "Section Details": [{ key: "SectionCapacityModal", label: "Capacity" }],
    Weld: [
      { key: "Weld.Size", label: "Size (mm)" },
      { key: "Weld.Strength", label: "Strength (N/mm2)" },
      { key: "Weld.Stress", label: "Stress (N/mm)" },
    ],
  },

  modals: {
    BoltCapacityModal: { type: "capacity", buttonText: "Bolt Capacity" },
    PlateSpacingModal: { type: "spacing", buttonText: "Plate Spacing" },
    SectionCapacityModal: {
      type: "capacity",
      buttonText: "Section Details Capacity",
    },
  },

  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "spacing-diagram",
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
      PlateSpacingModal: {
        fields: [
          {
            key: "Bolt.Pitch",
            label: "Pitch Distance (mm)",
          },
          {
            key: "Bolt.EndDist",
            label: "End Distance (mm)",
          },
          {
            key: "Bolt.Gauge",
            label: "Gauge Distance (mm)",
          },
          {
            key: "Bolt.EdgeDist",
            label: "Edge Distance (mm)",
          },
        ],
        diagram: {
          origin: "right",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            rows: "Bolt.Rows",
            cols: "Bolt.Line",
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            gauge: "Bolt.Gauge",
            edge: "Bolt.EdgeDist",
            holeDiameter: "Bolt.Diameter",
            weldSize: "Weld.Size",
          },
        },
      },
    },

    capacity: {
      PlateCapacityModal: [
        {
          key: "Plate.Shear",
          label: "Shear Yielding Capacity (kN)",
        },
        {
          key: "Plate.BlockShear",
          label: "Block Shear Capacity (kN)",
        },
        {
          key: "Plate.MomDemand",
          label: "Moment Demand per Bolt (kNm)",
        },
        {
          key: "Plate.MomCapacity",
          label: "Moment Capacity per Bolt (kNm)",
        },
      ],
      SectionCapacityModal: [
        {
          key: "Plate.MomDemand",
          label: "Moment Demand (kNm)",
        },
        {
          key: "Plate.MomCapacity",
          label: "Moment Capacity (kNm)",
        },
      ],
    },
  },
};
