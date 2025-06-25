export const boltedToEndOutputConfig = {
  // Define output sections and their display configuration
  sections: [
    {
      key: "Member",
      title: "Member",
      fields: [
        { key: "Member_Length", label: "Length (mm)" },
        { key: "Member_Area", label: "Area (mm²)" },
        { key: "Member_Designation", label: "Designation" },
        { key: "Member_Material", label: "Material" },
        { key: "Member_Moment_Capacity", label: "Moment Capacity (kNm)" },
        { key: "Member_Yield_Stress", label: "Yield Stress (N/mm²)" },
        { key: "Member_Ultimate_Stress", label: "Ultimate Stress (N/mm²)" }
      ]
    },
    {
      key: "Bolt",
      title: "Bolt",
      fields: [
        { key: "Bolt_Designation", label: "Designation" },
        { key: "Bolt_Diameter", label: "Diameter (mm)" },
        { key: "Bolt_Grade", label: "Grade" },
        { key: "Bolt_Type", label: "Type" },
        { key: "Bolt_Shear_Capacity", label: "Shear Capacity (kN)" },
        { key: "Bolt_Bearing_Capacity", label: "Bearing Capacity (kN)" },
        { key: "Bolt_Capacity", label: "Capacity (kN)" },
        { key: "Bolt_Count", label: "Count" }
      ]
    },
    {
      key: "Plate",
      title: "Plate",
      fields: [
        { key: "Plate_Thickness", label: "Thickness (mm)" },
        { key: "Plate_Material", label: "Material" },
        { key: "Plate_Yield_Stress", label: "Yield Stress (N/mm²)" },
        { key: "Plate_Ultimate_Stress", label: "Ultimate Stress (N/mm²)" },
        { key: "Plate_Height", label: "Height (mm)" },
        { key: "Plate_Width", label: "Width (mm)" }
      ]
    },
    {
      key: "Design",
      title: "Design",
      fields: [
        { key: "Design_Status", label: "Status" },
        { key: "Design_Ratio", label: "Design Ratio" },
        { key: "Design_Member_Capacity", label: "Member Capacity (kN)" },
        { key: "Design_Connection_Capacity", label: "Connection Capacity (kN)" },
        { key: "Design_Governing_Case", label: "Governing Case" },
        { key: "Design_Safety_Factor", label: "Safety Factor" }
      ]
    },
    {
      key: "Weld",
      title: "Weld",
      fields: [
        { key: "Weld_Size", label: "Size (mm)" },
        { key: "Weld_Length", label: "Length (mm)" },
        { key: "Weld_Type", label: "Type" },
        { key: "Weld_Strength", label: "Strength (N/mm²)" }
      ]
    }
  ],

  // Define any custom formatting or processing for specific fields
  formatters: {
    "Design_Status": (value) => {
      if (value === "Pass" || value === "OK") {
        return { value, className: "status-pass" };
      } else if (value === "Fail" || value === "NOT OK") {
        return { value, className: "status-fail" };
      }
      return { value };
    },
    "Design_Ratio": (value) => {
      const numValue = parseFloat(value);
      if (numValue > 1.0) {
        return { value, className: "ratio-fail" };
      } else if (numValue > 0.8) {
        return { value, className: "ratio-warning" };
      }
      return { value, className: "ratio-pass" };
    }
  },

  // Define which sections should be collapsible
  collapsibleSections: ["Weld"],

  // Define default expanded sections
  defaultExpandedSections: ["Member", "Bolt", "Plate", "Design"]
}; 