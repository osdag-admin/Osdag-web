export const endPlateOutputConfig = {
  sections: {
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.PropertyClass", label: "Property Class" },
      { key: "Bolt.ShearCapacity", label: "shear Capacity (KN)" },
      { key: "Bolt.BoltForce", label: "Bolt Force (KN)" },
      { key: "Bolt.BoltColumn", label: "Bolt Column (nos)" },
      { key: "Bolt.BoltRows", label: "Bolt Rows (nos)" },
      { key: "BoltCapacityModal", label: "Capacity" },
    ],
    Plate: [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Length (mm)" },
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
      buttonText: "Sectin Details Capacity",
    },
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
      PlateSpacingModal: [
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
    },

    capacity: {
      PlateCapacityModal: [
        {
          key: "Plate.Shear",
          label: "Shear Yielding Capacity (kN)",
        },
        {
          key: "Plate.Rupture",
          label: "Rupture Capacity (kN)",
        },
        {
          key: "Plate.BlockShear",
          label: "Block Shear Capacity (kN)",
        },
        {
          key: "Plate.TensionYield",
          label: "Tension Yielding Capacity (kN)",
        },
        {
          key: "Plate.TensionRupture",
          label: "Tension Rupture Capacity (kN)",
        },
        {
          key: "Plate.BlockShearAxial",
          label: "Axial Block Shear Capacity (kN)",
        },
        {
          key: "Plate.MomDemand",
          label: "Moment Demand (kNm)",
        },
        {
          key: "Plate.MomCapacity",
          label: "Moment Capacity (kNm)",
        },
      ],
      SectionCapacityModal: [
        {
          key: "Member.shear_yielding",
          label: "Shear Yielding Capacity (kN)",
        },
        {
          key: "Member.shear_rupture",
          label: "Rupture Capacity (kN)",
        },
        {
          key: "Member.shear_blockshear",
          label: "Block Shear Capacity (kN)",
        },
        {
          key: "Member.tension_yielding",
          label: "Tension Yielding Capacity (kN)",
        },
        {
          key: "Member.tension_rupture",
          label: "Tension Rupture Capacity (kN)",
        },
        {
          key: "Member.tension_blockshear",
          label: "Axial Block Shear Capacity (kN)",
        },
        {
          key: "Plate.MomDemand",
          label: "Moment Demand (kNm)",
        },
        {
          key: "Section.MomCapacity",
          label: "Moment Capacity (kNm)",
        },
      ],
    },
  },
};
