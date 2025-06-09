export const coverPlateWeldedOutputConfig = {
  // Output sections and field mappings
  sections: {
    "Member Capacity": [
      { key: "MemberCapacityModal", label: "Member Capacity" }
    ],
    "Web Splice Plate": [
      { key: "Web_Plate.Height (mm)", label: "Height (mm)" },
      { key: "Web_Plate.Width", label: "Width (mm)" },
      { key: "Web_Plate.Thickness", label: "Thickness (mm)*" },
      { key: "WebCapacityModal", label: "Capacity" },
      { key: "WebWeldDetailsModal", label: "Weld Details" }
    ],
    "Flange Splice Plate": [
      { key: "Flange_Plate.Width (mm)", label: "Width (mm)" },
      { key: "flange_plate.Length", label: "Length (mm)" },
      { key: "Connector.Flange_Plate.Thickness_list", label: "Thickness (mm)*" },
      { key: "FlangeCapacityModal", label: "Capacity" },
      { key: "FlangeWeldDetailsModal", label: "Weld Details" }
    ]
  },

  // Modal trigger mappings
  modals: {
    WebWeldDetailsModal: { type: "spacing", buttonText: "Web Weld Details" },
    FlangeWeldDetailsModal: { type: "spacing", buttonText: "Flange Weld Details" },
    WebCapacityModal: { type: "capacity", buttonText: "Web Capacity" },
    FlangeCapacityModal: { type: "capacity", buttonText: "Flange Capacity" },
    WeldWebCapacityModal: { type: "details", buttonText: "Web Weld Capacity" },
    WeldFlangeCapacityModal: { type: "details", buttonText: "Flange Weld Capacity" },
    MemberCapacityModal: { type: "details", buttonText: "Member Capacity" }
  },

  // Modal type configurations (NO JSX HERE)
  modalTypes: {
    spacing: {
      title: "Weld Details",
      width: "68%",
      layout: "two-column", // ← Configuration instead of JSX
      hasImage: true
    },
    
    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column", // ← Configuration instead of JSX
      hasImage: false
    },

    capacity: {
      title: "Plate Capacity Details", 
      width: "68%",
      layout: "two-column", // ← Configuration instead of JSX
      hasImage: true
    }
  },

  // Modal data - what fields appear in each modal
  modalData: {
    spacing: {
      WebWeldDetailsModal: [
        { key: "Web_weld.effective_length_web_weld", label: "Effective Length (mm)" },
        { key: "Web_weld.weld_size_web_weld", label: "Weld Size (mm)" },
        { key: "Web_weld.throat_thickness_web_weld", label: "Throat Thickness (mm)" },
        { key: "Web_weld.weld_strength_web_weld", label: "Weld Strength (N/mm)" }
      ],
      FlangeWeldDetailsModal: [
        { key: "Flange_weld.effective_length_flange_weld", label: "Effective Length (mm)" },
        { key: "Flange_weld.weld_size_flange_weld", label: "Weld Size (mm)" },
        { key: "Flange_weld.throat_thickness_flange_weld", label: "Throat Thickness (mm)" },
        { key: "Flange_weld.weld_strength_flange_weld", label: "Weld Strength (N/mm)" }
      ]
    },
    
    capacity: {
      WebCapacityModal: [
        { key: "section.Tension_capacity_web_web_capacity", label: "Web Tension Capacity (kN)" },
        { key: "Web_plate.capacity_web_capacity", label: "Web Plate Tension Capacity (kN)" },
        { key: "web_plate.shear_capacity_web_plate_web_capacity", label: "Web Plate Shear Capacity (kN)" },
        { key: "Web_Plate.MomDemand_web_capacity", label: "Web Moment Demand (kNm)" }
      ],
      FlangeCapacityModal: [
        { key: "Section.flange_capacity_flange_capacity", label: "Flange Tension Capacity (kN)" },
        { key: "flange_plate.tension_capacity_flange_plate_flange_capacity", label: "Flange Plate Tension Capacity (kN)" }
      ]
    },
    
    details: {
      MemberCapacityModal: [
        { key: "Section.AxialCapacity", label: "Axial Capacity Member (kN)" },
        { key: "Section.MomCapacity", label: "Moment Capacity Member (kNm)" },
        { key: "Section.ShearCapacity", label: "Shear Capacity Member (kN)" }
      ],
      WeldFlangeCapacityModal: [
        { key: "Flange_weld.effective_length_flange_weld_capacity", label: "Effective Length (mm)" },
        { key: "Flange_weld.throat_area_flange_weld_capacity", label: "Throat Area (mm²)" },
        { key: "Flange_weld.stress_flange_weld_capacity", label: "Weld Stress (N/mm²)" },
        { key: "Flange_weld.shear_capacity_flange_weld_capacity", label: "Shear Capacity (kN)" },
        { key: "Flange_weld.tension_capacity_flange_weld_capacity", label: "Tension Capacity (kN)" },
        { key: "Flange_weld.resultant_stress_flange_weld_capacity", label: "Resultant Stress (N/mm²)" },
        { key: "Flange_weld.capacity_flange_weld_capacity", label: "Capacity (kN)" },
        { key: "Flange_weld.force_flange_weld_capacity", label: "Weld Force (kN)" }
      ],
      WeldWebCapacityModal: [
        { key: "Web_weld.effective_length_web_weld_capacity", label: "Effective Length (mm)" },
        { key: "Web_weld.throat_area_web_weld_capacity", label: "Throat Area (mm²)" },
        { key: "Web_weld.stress_web_weld_capacity", label: "Weld Stress (N/mm²)" },
        { key: "Web_weld.shear_capacity_web_weld_capacity", label: "Shear Capacity (kN)" },
        { key: "Web_weld.tension_capacity_web_weld_capacity", label: "Tension Capacity (kN)" },
        { key: "Web_weld.resultant_stress_web_weld_capacity", label: "Resultant Stress (N/mm²)" },
        { key: "Web_weld.capacity_web_weld_capacity", label: "Capacity (kN)" },
        { key: "Web_weld.force_web_weld_capacity", label: "Weld Force (kN)" }
      ]
    }
  }
};
