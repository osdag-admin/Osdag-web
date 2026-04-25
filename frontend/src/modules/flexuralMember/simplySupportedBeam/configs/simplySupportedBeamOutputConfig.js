// Output configuration for Simply Supported Beam
// Updated to match backend response keys exactly

export const simplySupportedBeamOutputConfig = {
  sections: {
    "Section Details": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "Beta.Constant", label: "Beta_b" },
      { key: "MajorEffSecArea", label: "Eff. Sectional Area (mm²)" },
      { key: "Major.Effective_Length", label: "Eff. Length (mm)" }
    ],

    "Design Results": [
      { key: "Shear.Strength", label: "Shear Strength (kN)" },
      { key: "Moment.Strength", label: "Moment Strength (kNm)" },
      { key: "Buckling.Strength", label: "Buckling Resistance (kN)" },
      { key: "Crippling.Strength", label: "Crippling Strength (kN)" },
      { key: "Shear.High", label: "High Shear Check" }
    ],

    "Web Buckling Details": [
      { key: "ESR", label: "Effective Slenderness Ratio" },
      { key: "MajorBucklingStress", label: "Buckling Stress (MPa)" },
      { key: "BucklingCurve", label: "Buckling Curve" },
      { key: "ImperfectionFactor", label: "Imperfection Factor" },
      { key: "StressReductionFactor", label: "Stress Reduction Factor" },
      { key: "NDESR", label: "ND Effective Slenderness" }
    ]
  },

  modals: {
    StrengthModal: { type: "strength", buttonText: "Strength Details" },
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
        { key: "Moment.Strength", label: "Bending Strength (kNm)" },
        { key: "Shear.Strength", label: "Shear Strength (kN)" },
        { key: "Buckling.Strength", label: "Buckling Resistance (kN)" }
      ]
    },

    webbuckling: {
      WebBucklingModal: [
        { key: "ESR", label: "Effective Slenderness Ratio" },
        { key: "MajorBucklingStress", label: "Buckling Stress (MPa)" },
        { key: "BucklingCurve", label: "Buckling Curve" },
        { key: "ImperfectionFactor", label: "Imperfection Factor" },
        { key: "StressReductionFactor", label: "Stress Reduction Factor" }
      ]
    }
  }
};