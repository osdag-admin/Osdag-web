export const axiallyLoadedColumnOutputConfig = {
  sections: {
    "Optimum Section": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "MajorEffSecArea", label: "Effective Sectional Area (mm²)" },
    ],
    "Major Axis (z-z)": [
      { key: "Major.Effective_Length", label: "Effective Length (m)" },
      { key: "MajorBucklingStress", label: "Euler Buckling Stress (MPa)" },
      { key: "MajorBC", label: "Buckling Curve Classification" },
      { key: "MajorIF", label: "Imperfection Factor" },
      { key: "MajorSRF", label: "Stress Reduction Factor" },
      { key: "MajorNDESR", label: "Non-dim. Eff. Slender. Ratio" },
      { key: "MajorDCS", label: "Design Compressive Stress (MPa)" },
    ],
    "Minor Axis (y-y)": [
      { key: "MinorEffLen", label: "Effective Length (m)" },
      { key: "MinorBucklingStress", label: "Euler Buckling Stress (MPa)" },
      { key: "MinorBC", label: "Buckling Curve Classification" },
      { key: "MinorIF", label: "Imperfection Factor" },
      { key: "MinorSRF", label: "Stress Reduction Factor" },
      { key: "MinorNDESR", label: "Non-dim. Eff. Slender. Ratio" },
      { key: "MinorDCS", label: "Design Compressive Stress (MPa)" },
    ],
    "Design Results": [
      { key: "MinCompStress", label: "Min. Design Comp.Stress (MPa)" },
      { key: "MaterialStress", label: "fy, γm0" },
      { key: "Fcd", label: "fcd" },
      { key: "Design.Strength", label: "Design Capacity (kN)" },
    ],
  },

  modals: {},
  modalTypes: {},
  modalData: {},
};
