export const axiallyLoadedColumnOutputConfig = {
  sections: {
    "Optimum Section": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "MajorEffSecArea", label: "Effective Sectional Area (mm²)" },
    ],
    "Buckling (z-z)": [
      { key: "Major.Effective_Length", label: "Effective Length (m)" },
      { key: "MajorBucklingStress", label: "Euler Buckling Stress (MPa)" },
      { key: "MajorBC", label: "Buckling Curve Classification" },
      { key: "MajorIF", label: "Imperfection Factor" },
      { key: "MajorSRF", label: "Stress Reduction Factor" },
      { key: "MajorNDESR", label: "Non-dimensional Effective SR (z-z)" },
      { key: "MajorDCS", label: "Design Compressive Stress (MPa)" },
    ],
    "Buckling (y-y)": [
      { key: "MinorEffLen", label: "Effective Length (m)" },
      { key: "MinorBucklingStress", label: "Euler Buckling Stress (MPa)" },
      { key: "MinorBC", label: "Buckling Curve Classification" },
      { key: "MinorIF", label: "Imperfection Factor" },
      { key: "MinorSRF", label: "Stress Reduction Factor" },
      { key: "MinorNDESR", label: "Non-dimensional Effective SR (y-y)" },
      { key: "MinorDCS", label: "Design Compressive Stress (MPa)" },
    ],
    "Design Compression": [
      { key: "MinCompStress", label: "Min. Design Comp.Stress (MPa)" },
      { key: "MaterialStress", label: "fy/γm0" },
      { key: "Fcd", label: "Design Compressive Stress fcd (MPa)" },
      { key: "Design.Strength", label: "Design Strength (kN)" },
    ],
  },

  modals: {},
  modalTypes: {},
  modalData: {},
};

