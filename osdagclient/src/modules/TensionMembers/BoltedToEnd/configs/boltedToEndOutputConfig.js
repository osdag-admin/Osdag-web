export const boltedToEndOutputConfig = {
  sections: {
    "Bolt": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Capacity", label: "Capacity (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
      { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
      { key: "Bolt.Line", label: "Bolt Columns (nos)" },
      { key: "SpacingModal", label: "Spacing Details" },
    ],
    "Plate": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Width (mm)" },
      { key: "PlateCapacityModal", label: "Capacity" },
    ],
    "Member": [
      { key: "section_size.designation", label: "Section Designation" },
      { key: "Member.tension_capacity", label: "Tension Capacity (kN)" },
      { key: "Member.tension_yielding", label: "Yielding Capacity (kN)" },
    ],
    "Design Status": [
      { key: "Member.efficiency", label: "Design Status" },
    ],
  },

  modals: {
    SpacingModal: { type: "spacing", buttonText: "Spacing Details" },
    PlateCapacityModal: { type: "capacity", buttonText: "Plate Capacity" }
  },

  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "two-column",
      hasImage: true,
      note: "Representative image for Spacing Details"
    },
    capacity: {
      title: "Capacity Details", 
      width: "68%",
      layout: "capacity-complex",
      hasImage: true,
      note: "Representative image for Failure Pattern"
    }
  },

  modalData: {
    spacing: {
      SpacingModal: [
        { key: "Bolt.Pitch", label: "Pitch Distance (mm)" },
        { key: "Bolt.EndDist", label: "End Distance (mm)" },
        { key: "Bolt.Gauge", label: "Gauge Distance (mm)" },
        { key: "Bolt.EdgeDist", label: "Edge Distance (mm)" },
      ]
    },
    capacity: {
      PlateCapacityModal: [
        { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)", section: "Failure due to Tension in Plate" },
        { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)", section: "Failure due to Tension in Plate" },
        { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)", section: "Failure due to Block Shear in Plate" },
        { key: "Plate.Capacity", label: "Tension Capacity (kN)", section: "Overall Plate Capacity" },
      ]
    }
  }
}; 