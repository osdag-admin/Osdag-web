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
    "Section Details": [{ key: "SectionCapacityModal", label: "Capacity" }],
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
      layout: "endplate-capacity-sketch",
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
            key: "Member.shear_yielding",
            label: "Shear Yielding Capacity (kN)",
            section: "Failure Pattern due to Shear in Member",
          },
          {
            key: "Member.shear_rupture",
            label: "Rupture Capacity (kN)",
            section: "Failure Pattern due to Shear in Member",
          },
          {
            key: "Member.shear_blockshear",
            label: "Block Shear Capacity (kN)",
            section: "Failure Pattern due to Shear in Member",
          },
          {
            key: "Member.tension_yielding",
            label: "Tension Yielding Capacity (kN)",
            section: "Failure Pattern due to Tension in Member",
          },
          {
            key: "Member.tension_rupture",
            label: "Tension Rupture Capacity (kN)",
            section: "Failure Pattern due to Tension in Member",
          },
          {
            key: "Member.tension_blockshear",
            label: "Axial Block Shear Capacity (kN)",
            section: "Failure Pattern due to Tension in Member",
          },
        ],
        diagram: {
          diagramType: "plate",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            holeDia: "Bolt.Diameter",
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            edge: "Bolt.EdgeDist",
          },
        },
      },
      SectionCapacityModal: {
        fields: [
          {
            key: "EndPlate.SupportedShearYield",
            label: "Supported Section Shear Yielding Capacity (kN)",
            section: "Failure Pattern due to Shear in Supported Section",
          },
          {
            key: "EndPlate.SupportedShearAllowable",
            label: "Supported Section Allowable Shear Capacity (kN)",
            section: "Failure Pattern due to Shear in Supported Section",
          },
          {
            key: "EndPlate.SupportingTensionYield",
            label: "Supporting Section Tension Yielding Capacity (kN)",
            section: "Failure Pattern due to Tension in Supporting Section",
          },
          {
            key: "EndPlate.SupportedBlockShearAxial",
            label: "Section Tension Block Shear Capacity (kN)",
            section: "Failure Pattern due to Tension in Supporting Section",
          },
        ],
        diagram: {
          diagramType: "section",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            holeDia: "Bolt.Diameter",
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            edge: "Bolt.EdgeDist",
          },
        },
      },
    },
  },
};
