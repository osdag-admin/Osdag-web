// Output configuration for Purlin (FINAL – Backend-aligned)

export const purlinOutputConfig = {
  sections: {
    "Section Details": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "Beta.Constant", label: "Betaₐ" },
      { key: "MajorEffSecArea", label: "Eff. Sectional Area (cm²)" },
      { key: "Major.Effective_Length", label: "Eff. Length (m)" }
    ],

    "Design Results": [
      { key: "Shear.Strength_YY", label: "Shear Strength (y-y) (kN)" },
      { key: "Shear.Strength_ZZ", label: "Shear Strength (z-z) (kN)" },

      { key: "Moment.Strength_YY", label: "Moment Strength (y-y) (kNm)" },
      { key: "Moment.Strength_ZZ", label: "Moment Strength (z-z) (kNm)" },

      { key: "Shear.High_YY", label: "High Shear Check (y-y)" },
      { key: "Shear.High_ZZ", label: "High Shear Check (z-z)" }
    ],

    "Web Resistance Details": [
      { key: "Resistance.Bending_Cmp_Stress_yy", label: "Bending Compressive Stress (y-y)" },
      { key: "Resistance.Bending_Cmp_Stress_zz", label: "Bending Compressive Stress (z-z)" },

      { key: "Elastic.Moment_YY", label: "Critical Moment (y-y) (Mcr)" },
      { key: "Elastic.Moment_ZZ", label: "Critical Moment (z-z) (Mcr)" },

      { key: "MinorNDESR", label: "Non-dimensional Effective SR (y-y)" },
      { key: "MajorNDESR", label: "Non-dimensional Effective SR (z-z)" },

      { key: "Buckling Class", label: "Buckling Class" },
      { key: "ImperfectionFactor", label: "Imperfection Factor" },

      { key: "Resistance.Bending_Stress_RF_yy", label: "Stress Reduction Factor (y-y)" },
      { key: "Resistance.Bending_Stress_RF_zz", label: "Stress Reduction Factor (z-z)" },

      { key: "Resistance.Moment_YY", label: "Moment (y-y)" },
      { key: "Resistance.Moment_ZZ", label: "Moment (z-z)" }
    ]
  },

  modals: {
    StrengthModal: {
      type: "strength",
      buttonText: "Strength Details"
    },
    WebResistanceModal: {
      type: "webresistance",
      buttonText: "Web Resistance Details"
    }
  },

  modalTypes: {
    strength: {
      title: "Purlin Strength Details",
      width: "75%",
      layout: "two-column",
      hasImage: false,
      note: "Detailed biaxial shear and bending strength calculations"
    },
    webresistance: {
      title: "Web Resistance & Buckling Details",
      width: "75%",
      layout: "two-column",
      hasImage: false,
      note: "Buckling, critical moment and stress reduction calculations"
    }
  },

  modalData: {
    strength: {
      StrengthModal: [
        { key: "Shear.Strength_YY", label: "Shear Strength (y-y)" },
        { key: "Shear.Strength_ZZ", label: "Shear Strength (z-z)" },
        { key: "Moment.Strength_YY", label: "Moment Strength (y-y)" },
        { key: "Moment.Strength_ZZ", label: "Moment Strength (z-z)" },
        { key: "Shear.High_YY", label: "High Shear Check (y-y)" },
        { key: "Shear.High_ZZ", label: "High Shear Check (z-z)" }
      ]
    },

    webresistance: {
      WebResistanceModal: [
        { key: "Elastic.Moment_YY", label: "Critical Moment (y-y) (Mcr)" },
        { key: "Elastic.Moment_ZZ", label: "Critical Moment (z-z) (Mcr)" },
        { key: "MinorNDESR", label: "Non-dimensional Effective SR (y-y)" },
        { key: "MajorNDESR", label: "Non-dimensional Effective SR (z-z)" },
        { key: "Buckling Class", label: "Buckling Class" },
        { key: "ImperfectionFactor", label: "Imperfection Factor" },
        { key: "Resistance.Bending_Stress_RF_yy", label: "Stress Reduction Factor (y-y)" },
        { key: "Resistance.Bending_Stress_RF_zz", label: "Stress Reduction Factor (z-z)" }
      ]
    }
  }
};