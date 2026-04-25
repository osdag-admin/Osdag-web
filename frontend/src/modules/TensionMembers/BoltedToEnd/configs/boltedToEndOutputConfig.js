export const boltedToEndOutputConfig = {
  sections: {

    "Section Details": [
      { key: "section_size.designation", label: "Designation" },
      { key: "Member.tension_yielding", label: "Tension Yielding Capacity (kN)" },
      { key: "Member.tension_rupture", label: "Tension Rupture Capacity (kN)" },
      { key: "Member.tension_blockshear", label: "Block Shear Capacity (kN)" },
      { key: "SectionPatternModal", label: "Pattern" },
      { key: "Member.tension_capacity", label: "Tension Capacity (kN)" },
      { key: "Member.Slenderness", label: "Slenderness Ratio" },
      { key: "Member.efficiency", label: "Utilization Ratio" }
    ],

    "Bolt Details": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "bolt.long_joint", label: "Long Joint Red. Factor" },
      { key: "bolt.large_grip", label: "Large Grip Red. Factor" },
      { key: "Bolt.Capacity", label: "Capacity (kN)" },
      { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
      { key: "SpacingModal", label: "Spacing" }
    ],

    "Gusset Plate Details": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Min. Height (mm)" },
      { key: "Plate.Length", label: "Min. Plate Length (mm)" },
      { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)" },
      { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)" },
      { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)" },
      { key: "PlatePatternModal", label: "Pattern" },
      { key: "Plate.Capacity", label: "Tension Capacity (kN)" }
    ],

    "Connection Details": [
      { key: "Intermittent.Connection", label: "Connection (nos)" },
      { key: "Intermittent.Spacing", label: "Spacing (mm)" }
    ],

    "Intermittent Bolt Details": [
      { key: "Bolt.InterDiameter", label: "Diameter (mm)" },
      { key: "Bolt.InterGrade", label: "Grade" },
      { key: "Bolt.InterLine", label: "Columns (nos)" },
      { key: "Bolt.InterOneLine", label: "Rows (nos)" }
    ],

    "Plate Details": [
      { key: "Plate.InterHeight", label: "Height (mm)" },
      { key: "Plate.InterLength", label: "Length (mm)" }
    ]
  },

  modals: {
    SpacingModal: { type: "spacing", buttonText: "Spacing" },
    PlateCapacityModal: { type: "capacity", buttonText: "Capacity" },
    SectionPatternModal: { type: "pattern", buttonText: "Pattern" },
    PlatePatternModal: { type: "pattern", buttonText: "Pattern" }
  },

  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "spacing-diagram"
    },
    capacity: {
      title: "Capacity Details",
      width: "68%",
      layout: "capacity-complex",
      hasImage: true
    },
    pattern: {
      title: "Shear Pattern",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "plate_block_shear" 
    }
  },

  modalData: {
    spacing: {
      SpacingModal: {
        fields: [
          { key: "Bolt.Pitch", label: "Pitch Distance (mm)" },
          { key: "Bolt.EndDist", label: "End Distance (mm)" },
          { key: "Bolt.Gauge", label: "Gauge Distance (mm)" },
          { key: "Bolt.EdgeDist", label: "Edge Distance (mm)" }
        ],
        diagram: {
          origin: "right",
          props: {
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            rows: "Bolt.OneLine",
            cols: "Bolt.Line",
            end: "Bolt.EndDist",
            pitch: "Bolt.Pitch",
            gauge: "Bolt.Gauge",
            edge: "Bolt.EdgeDist",
            holeDiameter: "Bolt.Diameter"
          }
        }
      }
    },

    capacity: {
      PlateCapacityModal: [
        { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)" },
        { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)" },
        { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)" },
        { key: "Plate.Capacity", label: "Tension Capacity (kN)" }
      ]
    }
  }
};