// Output configuration for Plate Girder
// Sections match desktop UI exactly

export const plateGirderOutputConfig = {
  sections: {
    "Section Details": [
      { key: "Optimum.Designation", label: "Designation" },
      { key: "Optimum.SectionClassification", label: "Section Classification" },
      { key: "Optimum.UR", label: "Utilization Ratio" },
      { key: "MajorEffSecArea", label: "Eff. Sectional Area (cm²)" },
      { key: "Web.Thickness", label: "Web Thickness (mm)" },
      { key: "TopFlange.Thickness", label: "Top Flange Thickness (mm)" },
      { key: "BottomFlange.Thickness", label: "Bottom Flange Thickness (mm)" },
    ],
    "Moment Design Details": [
      { key: "Beta.Constant", label: "Beta_b" },
      { key: "W.Constant", label: "Warping Constant (mm⁶)" },
      { key: "T.Constant", label: "Torsional Constant (mm⁴)" },
      { key: "Elastic.Moment", label: "Critical Moment (M_cr) (kNm)" },
      { key: "Moment.Strength", label: "Design Bending Strength (kNm)" },
    ],
    "Shear Design Details": [
      { key: "Shear.Strength", label: "Shear Capacity (kN)" },
      { key: "Buckling.Strength", label: "Shear Buckling Resistance (kN)" },
      { key: "Crippling.Strength", label: "Web Crippling Strength (kN)" },
    ],
    "Stiffener Design": [
      { key: "ShearBucklingMethod", label: "Method" },
      { key: "EndpanelStiffener.Thickness", label: "End Panel Stiffener Thickness (mm)" },
      { key: "EndPanelStiffenerNo", label: "Number of End Panel Stiffeners" },
      { key: "IntermediateStiffener.Thickness", label: "Intermediate Stiffener Thickness (mm)" },
      { key: "IntermediateStiffener.Spacing", label: "Intermediate Stiffener Spacing (mm)" },
      { key: "LongitudnalStiffner.Thickness", label: "Longitudnal Stiffener Thickness (mm)" },
      { key: "LongitudnalStiffener.Numbers", label: "Number of Longitudnal Stiffeners" },
      { key: "LongitudnalStiffener1.Position", label: "Stiffener 1 Pos. from Comp. Flange (mm)" },
      { key: "LongitudnalStiffener2.Position", label: "Stiffener 2 Pos. from Comp. Flange (mm)" },
    ],
    "Deflection Check": [
      { key: "Deflection.Max", label: "Calculated Deflection (mm)" },
      { key: "DeflectionLimit", label: "Permissible Deflection (mm)" },
    ],
    "Weld Details": [
      { key: "WeldTopFlange", label: "Web-to-Top Flange Weld Size (mm)" },
      { key: "WeldBotFlange", label: "Web-to-Bottom Flange Weld Size (mm)" },
      { key: "WeldStiffener", label: "Stiffener Weld Size (mm)" },
    ],
  },

  modals: {
    LTBModal: { type: "ltb", buttonText: "LTB Details" },
    WebBucklingModal: { type: "webbuckling", buttonText: "Web Buckling Details" },
    StiffenerModal: { type: "stiffener", buttonText: "Stiffener Details" },
  },

  modalTypes: {
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
    },
    stiffener: {
      title: "Stiffener Details",
      width: "70%",
      layout: "two-column",
      hasImage: false,
      note: "Stiffener design and spacing details"
    }
  },

  modalData: {
    ltb: {
      LTBModal: [
        { key: "Elastic.Moment", label: "Elastic Critical Moment (kNm)" },
        { key: "T.Constant", label: "Torsional Constant (mm⁴)" },
        { key: "W.Constant", label: "Warping Constant (mm⁶)" },
        { key: "Imperfection.LTB", label: "Imperfection Factor" },
        { key: "SR.LTB", label: "Slenderness Ratio" },
      ]
    },
    webbuckling: {
      WebBucklingModal: [
        { key: "Buckling.Strength", label: "Web Buckling Strength (kN)" },
        { key: "Crippling.Strength", label: "Web Crippling Strength (kN)" },
      ]
    },
    stiffener: {
      StiffenerModal: [
        { key: "IntermediateStiffener.Thickness", label: "Intermediate Stiffener Thickness (mm)" },
        { key: "IntermediateStiffener.Spacing", label: "Intermediate Stiffener Spacing (mm)" },
        { key: "LongitudnalStiffner.Thickness", label: "Longitudinal Stiffener Thickness (mm)" },
        { key: "LongitudnalStiffener.Numbers", label: "Number of Longitudinal Stiffeners" },
      ]
    }
  }
};
