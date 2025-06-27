// Output configuration for Simply Supported Beam
// Comprehensive configuration matching the required fields

export const simplySupportedBeamOutputConfig = {
  sections: {
    "Section Details": [
      { key: "section_size.designation", label: "Designation" },
      { key: "UtilizationRatio", label: "Utilization Ratio" },
      { key: "SectionClass", label: "Section Classification" },
      { key: "Beta_b", label: "Beta_b" },
      { key: "EffectiveArea", label: "Eff. Sectional Area (mm²)" },
      { key: "EffectiveLength", label: "Eff. Length (m)" }
    ],
    "Design Results": [
      { key: "ShearStrength", label: "Shear Strength (kN)" },
      { key: "MomentStrength", label: "Moment Strength (kNm)" },
      { key: "BucklingResistance", label: "Buckling Resistance (kN)" },
      { key: "CripplingStrength", label: "Crippling Strength (kN)" },
      { key: "HighShearCheck", label: "High Shear Check" }
    ],
    "Web Buckling Details": [
      { key: "EffectiveSR", label: "Effective SR" },
      { key: "BucklingStress", label: "Buckling Stress (MPa)" },
      { key: "BucklingCurve", label: "Buckling Curve" },
      { key: "Imperfection", label: "Imperfection" },
      { key: "StressReduction", label: "Stress Reduction" },
      { key: "NDEffSenderness", label: "ND Eff. Senderness" }
    ],
    "Design Status": [
      { key: "Status", label: "Design Status" }
    ],
    "Lateral Torsional Buckling": [
      { key: "LateralTorsionalBuckling", label: "LTB Details" }
    ]
  },

  modals: {
    StrengthModal: { type: "strength", buttonText: "Strength Details" },
    LTBModal: { type: "ltb", buttonText: "LTB Details" },
    WebBucklingModal: { type: "webbuckling", buttonText: "Web Buckling Details" }
  },

  modalTypes: {
    strength: {
      title: "Flexural Strength Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Detailed strength calculations for flexural member"
    },
    ltb: {
      title: "Lateral Torsional Buckling Details", 
      width: "70%",
      layout: "two-column",
      hasImage: true,
      note: "Lateral torsional buckling analysis details"
    },
    webbuckling: {
      title: "Web Buckling Analysis",
      width: "70%",
      layout: "two-column", 
      hasImage: false,
      note: "Web buckling and crippling analysis details"
    }
  },

  modalData: {
    strength: {
      StrengthModal: [
        { key: "MomentStrength", label: "Bending Strength (kNm)" },
        { key: "ShearStrength", label: "Shear Strength (kN)" },
        { key: "BucklingResistance", label: "Buckling Resistance (kN)" }
      ]
    },
    ltb: {
      LTBModal: [
        { key: "LateralTorsionalBuckling", label: "Lateral Torsional Buckling Details" }
      ]
    },
    webbuckling: {
      WebBucklingModal: [
        { key: "EffectiveSR", label: "Effective Slenderness Ratio" },
        { key: "BucklingStress", label: "Buckling Stress (MPa)" },
        { key: "BucklingCurve", label: "Buckling Curve" },
        { key: "Imperfection", label: "Imperfection Factor" },
        { key: "StressReduction", label: "Stress Reduction Factor" }
      ]
    }
  }
}; 