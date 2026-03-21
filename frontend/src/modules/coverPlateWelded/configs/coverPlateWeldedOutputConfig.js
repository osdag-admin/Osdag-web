export const coverPlateWeldedOutputConfig = {
  // Output sections and field mappings
  sections: {
    "Member Capacity": [
      { key: "Section.MomCapacity", label: "Moment Capacity (kNm)" },
      { key: "Section.ShearCapacity", label: "Shear Capacity (kN)" },
      { key: "Section.AxialCapacity", label: "Axial Capacity (kN)" }
    ],
    "Web Splice Plate": [
      { key: "Web_Plate.Height (mm)", label: "Height (mm)" },
      { key: "Web_Plate.Width", label: "Width (mm)" },
      { key: "Connector.Web_Plate.Thickness_List", label: "Thickness (mm)" },
      { key: "WebCapacityModal", label: "Capacity Details" },
      { key: "WebWeldDetailsModal", label: "Weld Details" }
    ],
    "Flange Splice Plate": [
      { key: "Flange_Plate.Width (mm)", label: "Width (mm)" },
      { key: "flange_plate.Length", label: "Length (mm)" },
      { key: "Connector.Flange_Plate.Thickness_list", label: "Thickness (mm)" },
      { key: "FlangeCapacityModal", label: "Capacity Details" },
      { key: "FlangeWeldDetailsModal", label: "Weld Details" }
    ],
    "Block Shear Pattern": [
      { key: "BlockShearPatternModal", label: "View Details" }
    ]
  },
  modals: {
    WebWeldDetailsModal: { type: "webWeld", buttonText: "Web Weld Details" },
    FlangeWeldDetailsModal: { type: "flangeWeld", buttonText: "Flange Weld Details" },
    WebCapacityModal: { type: "webCapacity", buttonText: "Web Capacity" },
    FlangeCapacityModal: { type: "flangeCapacity", buttonText: "Flange Capacity" },
    MemberCapacityModal: { type: "details", buttonText: "Member Capacity" },
    BlockShearPatternModal: { type: "blockShear", buttonText: "Block Shear Pattern" }
  },
  modalTypes: {
    webWeld: {
      title: "Web Plate Weld",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    flangeWeld: {
      title: "Flange Plate Weld",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    webCapacity: {
      title: "Web Capacity",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    flangeCapacity: {
      title: "Flange Capacity",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    blockShear: {
      title: "Block Shear Pattern",
      width: "68%",
      layout: "two-column",
      hasImage: true
    }
  },
  modalData: {
    webWeld: {
      WebWeldDetailsModal: [
        { key: "Web_Weld.Size", label: "Web Weld Size (mm)" },
        { key: "Web_Weld.Strength", label: "Web Weld Strength (N/mm)" },
        { key: "bolt.long_joint", label: "Strength Red.Factor" },
        { key: "Weld.Strength_red", label: "Red.Strength (N/mm)" },
        { key: "Web_Weld.Stress", label: "Web Weld Stress (N/mm)" }
      ]
    },
    flangeWeld: {
      FlangeWeldDetailsModal: [
        { key: "Flange_Weld.Size", label: "Flange Weld Size (mm)" },
        { key: "Flange_Weld.Strength", label: "Flange Weld Strength (N/mm)" },
        { key: "bolt.long_joint", label: "Strength Red.Factor" },
        { key: "Weld.Strength_red", label: "Red.Strength (N/mm)" },
        { key: "Flange_Weld.Stress", label: "Flange Weld Stress (N/mm)" }
      ]
    },
    webCapacity: {
      WebCapacityModal: [
        { key: "section.Tension_capacity_web", label: "Web Tension Capacity (kN)" },
        { key: "Web_plate.capacity", label: "Web Plate Tension Capacity (kN)" },
        { key: "web_plate.shear_capacity_web_plate", label: "Web Plate Shear Capacity (kN)" }
      ]
    },
    flangeCapacity: {
      FlangeCapacityModal: [
        { key: "Section.flange_capacity", label: "Flange Tension Capacity (kN)" },
        { key: "flange_plate.tension_capacity_flange_plate", label: "Flange Plate Tension Capacity (kN)" }
      ]
    },
    details: {
      MemberCapacityModal: [
        { key: "Section.AxialCapacity", label: "Axial Capacity Member (kN)" },
        { key: "Section.MomCapacity", label: "Moment Capacity Member (kNm)" },
        { key: "Section.ShearCapacity", label: "Shear Capacity Member (kN)" }
      ]
    },
    blockShear: {
      BlockShearPatternModal: [
        { key: "Weld.Lw", label: "Lw (mm)" },
        { key: "Weld.Hw", label: "Hw (mm)" }
      ]
    }
  }
};
