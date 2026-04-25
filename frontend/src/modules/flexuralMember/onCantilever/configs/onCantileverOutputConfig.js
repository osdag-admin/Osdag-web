// Output configuration for On-Cantilever Beam (Flexural Member)
// Keys match the output from Flexure_Cantilever.output_values()

export const onCantileverOutputConfig = {
  sections: {
    "Section Details": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "Beta.Constant", label: "Beta_b" },
      { key: "MajorEffSecArea", label: "Eff. Sectional Area (cm²)" },
      { key: "Major.Effective_Length", label: "Eff. Length (m)" },
    ],

    "Design Results": [
      { key: "Shear.Strength", label: "Shear Strength (kN)" },
      { key: "Moment.Strength", label: "Moment Strength (kNm)" },
      { key: "Buckling.Strength", label: "Buckling Resistance (kN)" },
      { key: "Crippling.Strength", label: "Crippling Strength (kN)" },
      { key: "Shear.High", label: "High Shear Check" },
    ],

    "Web Buckling Details": [
      { key: "ESR", label: "Effective Slenderness Ratio" },
      { key: "MajorBucklingStress", label: "Buckling Stress (MPa)" },
      { key: "BucklingCurve", label: "Buckling Curve" },
      { key: "ImperfectionFactor", label: "Imperfection Factor" },
      { key: "StressReductionFactor", label: "Stress Reduction Factor" },
      { key: "NDESR", label: "ND Effective Slenderness" },
    ],

    "Lateral Torsional Buckling (LTB)": [
      { key: "T.Constant", label: "Torsional Constant (mm⁴)" },
      { key: "W.Constant", label: "Warping Constant (mm⁶)" },
      { key: "Imperfection.LTB", label: "Imperfection Factor (LTB)" },
      { key: "SR.LTB", label: "Stress Reduction Factor (LTB)" },
      { key: "NDESR.LTB", label: "ND Effective SR (LTB)" },
      { key: "Design.Strength", label: "Compressive Stress (MPa)" },
      { key: "Elastic.Moment", label: "Critical Moment Mcr (kNm)" },
    ],
  },

  modals: {
    StrengthModal: { type: "strength", buttonText: "Strength Details" },
    WebBucklingModal: { type: "webbuckling", buttonText: "Web Buckling Details" },
    LTBModal: { type: "ltb", buttonText: "LTB Details" },
  },

  modalTypes: {
    strength: {
      title: "Flexural Strength Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Detailed strength calculations for cantilever beam",
    },
    webbuckling: {
      title: "Web Buckling Analysis",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Web buckling and crippling analysis details",
    },
    ltb: {
      title: "Lateral Torsional Buckling Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "LTB analysis for cantilever beam",
    },
  },

  modalData: {
    strength: {
      StrengthModal: [
        { key: "Moment.Strength", label: "Bending Strength (kNm)" },
        { key: "Shear.Strength", label: "Shear Strength (kN)" },
        { key: "Buckling.Strength", label: "Buckling Resistance (kN)" },
      ],
    },
    webbuckling: {
      WebBucklingModal: [
        { key: "ESR", label: "Effective Slenderness Ratio" },
        { key: "MajorBucklingStress", label: "Buckling Stress (MPa)" },
        { key: "BucklingCurve", label: "Buckling Curve" },
        { key: "ImperfectionFactor", label: "Imperfection Factor" },
        { key: "StressReductionFactor", label: "Stress Reduction Factor" },
      ],
    },
    ltb: {
      LTBModal: [
        { key: "T.Constant", label: "Torsional Constant (mm⁴)" },
        { key: "W.Constant", label: "Warping Constant (mm⁶)" },
        { key: "Imperfection.LTB", label: "Imperfection Factor (LTB)" },
        { key: "SR.LTB", label: "Stress Reduction Factor (LTB)" },
        { key: "NDESR.LTB", label: "ND Effective SR (LTB)" },
        { key: "Design.Strength", label: "Compressive Stress (MPa)" },
        { key: "Elastic.Moment", label: "Critical Moment Mcr (kNm)" },
      ],
    },
  },
};
