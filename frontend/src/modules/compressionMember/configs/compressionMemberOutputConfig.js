// Output configuration for Compression Member
// Configuration matching the output fields from compression.py

export const compressionMemberOutputConfig = {
  sections: {
    "Section Details": [
      { key: "Title_OptimumDesignation", label: "Optimum Designation" },
      { key: "Optimum_UR_Compression", label: "Utilization Ratio" },
      { key: "Optimum_SC", label: "Section Classification" },
      { key: "Eff_Sec_Area", label: "Eff. Sectional Area (mm²)" },
      { key: "Eff_Len", label: "Eff. Length (mm)" }
    ],
    "Buckling Details": [
      { key: "ESR", label: "Effective Slenderness Ratio" },
      { key: "SR_lambdavv", label: "Lambda vv" },
      { key: "SR_lambdapsi", label: "Lambda psi" },
      { key: "Euler_Buckling_Stress", label: "Euler Buckling Stress (MPa)" },
      { key: "Buckling_Curve", label: "Buckling Curve" },
      { key: "Imperfection_Factor", label: "Imperfection Factor" },
      { key: "SR_Factor", label: "Stress Reduction Factor" },
      { key: "Non_Dim_ESR", label: "Non-Dimensional ESR" }
    ],
    "Design Results": [
      { key: "Comp_Stress", label: "Design Compressive Stress (MPa)" },
      { key: "Design_Strength_Compression", label: "Design Strength (kN)" }
    ],
    "Weld Details": [
      { key: "Weld.Type", label: "Weld Type" },
      { key: "Weld.Size", label: "Weld Size (mm)" },
      { key: "Weld.Strength", label: "Weld Strength (kN)" }
    ],
    "Bolt Details": [
      { key: "Bolts_One_Line_S", label: "Bolts in One Line" },
      { key: "Bolt_Line", label: "Number of Bolt Lines" },
      { key: "Pitch", label: "Pitch (mm)" },
      { key: "End_Dist", label: "End Distance (mm)" },
      { key: "Gauge", label: "Gauge (mm)" },
      { key: "Edge_Dist", label: "Edge Distance (mm)" }
    ]
  },

  modals: {
    BucklingModal: { type: "buckling", buttonText: "Buckling Details" },
    StrengthModal: { type: "strength", buttonText: "Strength Details" }
  },

  modalTypes: {
    buckling: {
      title: "Buckling Analysis Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Detailed buckling calculations for compression member"
    },
    strength: {
      title: "Strength Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Design strength calculations"
    }
  },

  modalData: {
    buckling: {
      BucklingModal: [
        { key: "ESR", label: "Effective Slenderness Ratio" },
        { key: "SR_lambdavv", label: "Lambda vv" },
        { key: "SR_lambdapsi", label: "Lambda psi" },
        { key: "Euler_Buckling_Stress", label: "Euler Buckling Stress (MPa)" },
        { key: "Buckling_Curve", label: "Buckling Curve" },
        { key: "Imperfection_Factor", label: "Imperfection Factor" },
        { key: "SR_Factor", label: "Stress Reduction Factor" },
        { key: "Non_Dim_ESR", label: "Non-Dimensional ESR" }
      ]
    },
    strength: {
      StrengthModal: [
        { key: "Comp_Stress", label: "Design Compressive Stress (MPa)" },
        { key: "Design_Strength_Compression", label: "Design Strength (kN)" }
      ]
    }
  }
};


