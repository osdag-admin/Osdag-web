export const endPlateOutputConfig = {
  sections: {
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.Rows", label: "Rows of Bolts" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
      { key: "Bolt.Tension", label: "Bolt Tension Capacity (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Shear Force (kN)" },
      { key: "Bolt.TensionForce", label: "Bolt Tension Force (kN)" },
      { key: "Bolt.PryingForce", label: "Bolt Prying Force (kN)" },
      { key: "BoltCapacityModal", label: "Capacity" },
      { key: "PlateSpacingModal", label: "Spacing" },
    ],
    Plate: [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Width (mm)" },
      { key: "PlateCapacityModal", label: "Capacity" },
    ],
    // "Section Details": [{ key: "SectionCapacityModal", label: "Capacity" }],
    Weld: [
      { key: "Weld.Size", label: "Size (mm)" },
      { key: "Weld.Stress", label: "Stress (N/mm)" },
      { key: "Weld.Strength", label: "Strength (N/mm2)" },
    ],
  },

  modals: {
    BoltCapacityModal: { type: "details", buttonText: "Bolt Capacity" },
    PlateSpacingModal: { type: "spacing", buttonText: "Plate Spacing" },
    PlateCapacityModal: { type: "capacity", buttonText: "Plate Capacity" },
    SectionCapacityModal: { type: "capacity", buttonText: "Section Capacity" },
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
      title: "Capacity Details",
      width: "68%",
      layout: "capacity-complex",
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
          {
            key: "Bolt.Diameter",
            label: "Hole Distance (mm)",
          },
        ],
        diagram: {
          origin: "right",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            rows: "Bolt.Rows",
            cols: 2,
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            gauge: "Bolt.Gauge",
            edge: "Bolt.EdgeDist",
            holeDiameter: "Bolt.Diameter",
            weldSize: "Weld.Size",
            weldPattern: "center-gap",
            weldGap: "Beam.WebThickness",
          },
        },
      },
    },

    details: {
      BoltCapacityModal: [
        {
          key: "Bolt.Shear",
          label: "Shear Capacity (kN)",
        },
        {
          key: "Bolt.Bearing",
          label: "Bearing Capacity (kN)",
        },
        {
          key: "Bolt.Betalj",
          label: "β<sub>lj</sub>",
        },
        {
          key: "Bolt.Betalg",
          label: "β<sub>lg</sub>",
        },
        {
          key: "Bolt.Betapk",
          label: "β<sub>pk</sub>",
        },
        {
          key: "Bolt.Capacity",
          label: "Bolt Value (kN)",
        },
        {
          key: "Bolt.Tension",
          label: "Bolt Tension Capacity (kN)",
        },
        {
          key: "Bolt.Force (kN)",
          label: "Bolt Shear Force (kN)",
        },
        {
          key: "Bolt.TensionForce",
          label: "Bolt Tension Force (kN)",
        },
        {
          key: "Bolt.PryingForce",
          label: "Bolt Prying Force (kN)",
        },
        {
          key: "Bolt.TensionTotal",
          label: "Total Bolt Tension (kN)",
        },
        {
          key: "Bolt.IR",
          label: "Interaction Ratio",
        },
      ],
    },

    capacity: {
      PlateCapacityModal: {
        fields: [
          {
            key: "Plate.Shear",
            label: "Shear Yielding Capacity (kN)",
            section: "Failure Pattern due to Shear in Member",
          },
          {
            key: "Plate.BlockShear",
            label: "Block Shear Capacity (kN)",
            section: "Failure Pattern due to Shear in Member",
          },
          {
            key: "Plate.MomDemand",
            label: "Moment Demand per Bolt (kNm)",
            section: "Moment Analysis",
          },
          {
            key: "Plate.MomCapacity",
            label: "Moment Capacity per Bolt (kNm)",
            section: "Moment Analysis",
          },
        ],
        diagram: {
          origin: "right",
          diagramType: "plate",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            rows: "Bolt.Rows",
            cols: 2,
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            gauge: "Bolt.Gauge",
            edge: "Bolt.EdgeDist",
            holeDiameter: "Bolt.Diameter",
            weldSize: "Weld.Size",
            weldPattern: "center-gap",
            weldGap: "Beam.WebThickness",
          },
        },
      },
      SectionCapacityModal: {
        fields: [
          {
            key: "Plate.MomDemand",
            label: "Moment Demand (kNm)",
            section: "Moment Analysis",
          },
          {
            key: "Plate.MomCapacity",
            label: "Moment Capacity (kNm)",
            section: "Moment Analysis",
          },
        ],
        diagram: {
          origin: "right",
          diagramType: "section",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            rows: "Bolt.Rows",
            cols: 2,
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            gauge: "Bolt.Gauge",
            edge: "Bolt.EdgeDist",
            holeDiameter: "Bolt.Diameter",
            weldSize: "Weld.Size",
            weldPattern: "center-gap",
            weldGap: "Beam.WebThickness",
          },
        },
      },
    },
  },
};
