export const finPlateOutputConfig = {
  sections: {
    "Bolt": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade", label: "Property Class" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Capacity", label: "Capacity (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
      { key: "Bolt.Line", label: "Bolt Columns (nos)" },
      { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
      { key: "SpacingModal", label: "Spacing" },
    ],
    "Plate": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Length (mm)" },
      { key: "PlateCapacityModal", label: "Capacity" },
    ],
    "Section Details": [
      { key: "SectionCapacityModal", label: "Capacity" },
    ],
    "Weld": [
      { key: "Weld.Size", label: "Size (mm)" },
      { key: "Weld.Strength", label: "Strength (N/mm2)" },
      { key: "Weld.Stress", label: "Stress (N/mm)" },
    ],
  },

  modals: {
    SpacingModal: { type: "spacing", buttonText: "Spacing" },
    PlateCapacityModal: { type: "capacity", buttonText: "Capacity" },
    SectionCapacityModal: { type: "capacity", buttonText: "Capacity" }
  },

  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "two-column",
      hasImage: true,
      note: "Representative image for Spacing Details - 3 x 3 pattern considered"
    },
    capacity: {
      title: "Capacity Details", 
      width: "68%",
      layout: "capacity-complex",
      hasImage: true,
      note: "Representative image for Failure Pattern (Half Plate) - 2 x 3 Bolt pattern considered"
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
        { key: "Plate.Shear", label: "Shear Yielding Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        { key: "Plate.Rupture", label: "Rupture Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        
        { key: "Plate.TensionYield", label: "Tension Yielding Capacity (kN)", section: "Failure due Tension in Plate" },
        { key: "Plate.TensionRupture", label: "Tension Rupture Capacity (kN)", section: "Failure due Tension in Plate" },
        { key: "Plate.BlockShearAxial", label: "Axial Block Shear Capacity (kN)", section: "Failure due Tension in Plate" },
        
        { key: "Plate.MomDemand", label: "Moment Demand (kNm)", section: "Moment Analysis" },
        { key: "Plate.MomCapacity", label: "Moment Capacity (kNm)", section: "Moment Analysis" },
      ],
      SectionCapacityModal: [
        { key: "Member.shear_yielding", label: "Shear Yielding Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        { key: "Member.shear_rupture", label: "Rupture Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        { key: "Member.shear_blockshear", label: "Block Shear Capacity (kN)", section: "Failure Pattern due Shear in Plate" },
        
        { key: "Member.tension_yielding", label: "Tension Yielding Capacity (kN)", section: "Failure due Tension in Plate" },
        { key: "Member.tension_rupture", label: "Tension Rupture Capacity (kN)", section: "Failure due Tension in Plate" },
        { key: "Member.tension_blockshear", label: "Axial Block Shear Capacity (kN)", section: "Failure due Tension in Plate" },
        
        { key: "Plate.MomDemand", label: "Moment Demand (kNm)", section: "Moment Analysis" },
        { key: "Section.MomCapacity", label: "Moment Capacity (kNm)", section: "Moment Analysis" },
      ]
    }
  }
};