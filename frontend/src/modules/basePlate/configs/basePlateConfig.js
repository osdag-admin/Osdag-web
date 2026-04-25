import { UI_STRINGS } from '../../../constants/UIStrings';

export const basePlateConfig = {
  sessionName: "Base Plate",
  routePath: "/design/connections/base_plate",
  designType: "BasePlateConnection",
  cameraKey: "BasePlateConnection",
  cadOptions: ["Model", "Column", "Plate"],

  defaultInputs: {
    module: "BasePlateConnection",
    member_designation: "",
    material: "E 165 (Fe 290)",
    connectivity: "Welded Column Base",
    end_condition: "Pinned",
    load_axial: "",
    load_axial_tension: "",
    load_shear_major: "",
    load_shear_minor: "",
    load_moment_major: "",
    load_moment_minor: "",
    anchor_diameter_ocf: [],
    anchor_grade_ocf: [],
    anchor_diameter_icf: [],
    anchor_grade_icf: [],
    anchor_type: "End Plate Type",
    footing_grade: "Select Grade",
    weld_type: "Fillet Weld",
  },

  validateInputs: (inputs, extraState, lists, selectionStates) => {
    if (!inputs.connectivity || !inputs.material) {
      return { isValid: false, message: UI_STRINGS.PLEASE_INPUT_ALL_FIELDS };
    }
    const designation = inputs.member_designation;
    if (!designation || designation === "Select Section" || String(designation).trim() === "") {
      return { isValid: false, message: "Please select a column section." };
    }
    const axial = parseFloat(inputs.load_axial);
    if (inputs.load_axial !== "" && isNaN(axial)) {
      return { isValid: false, message: UI_STRINGS.PLEASE_INPUT_ALL_FIELDS };
    }
    if (inputs.load_axial === "") {
      return { isValid: false, message: "Please enter Axial Compression (kN)." };
    }
    const shearMaj = inputs.load_shear_major !== "" ? parseFloat(inputs.load_shear_major) : NaN;
    if (inputs.load_shear_major !== "" && isNaN(shearMaj)) {
      return { isValid: false, message: UI_STRINGS.PLEASE_INPUT_ALL_FIELDS };
    }
    if (selectionStates?.anchorDiameterOcfSelect === "Customized" && (!Array.isArray(inputs.anchor_diameter_ocf) || !inputs.anchor_diameter_ocf.length)) {
      return { isValid: false, message: "Please select at least one anchor diameter (OCF)." };
    }
    if (selectionStates?.anchorGradeOcfSelect === "Customized" && (!Array.isArray(inputs.anchor_grade_ocf) || !inputs.anchor_grade_ocf.length)) {
      return { isValid: false, message: "Please select at least one property class (OCF)." };
    }
    if (selectionStates?.anchorDiameterIcfSelect === "Customized" && (!Array.isArray(inputs.anchor_diameter_icf) || !inputs.anchor_diameter_icf.length)) {
      return { isValid: false, message: "Please select at least one anchor diameter (ICF)." };
    }
    if (selectionStates?.anchorGradeIcfSelect === "Customized" && (!Array.isArray(inputs.anchor_grade_icf) || !inputs.anchor_grade_icf.length)) {
      return { isValid: false, message: "Please select at least one property class (ICF)." };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const section = inputs.member_designation;
    const memberDesignation =
      section != null && String(section).trim() !== "" ? String(section).trim() : "";
    const toArr = (v) => (Array.isArray(v) && v.length ? v : []);
    const diameterOcf = allSelected?.anchor_diameter_ocf ? (lists.anchorDiameterList || []) : toArr(inputs.anchor_diameter_ocf);
    const gradeOcf = allSelected?.anchor_grade_ocf ? (lists.anchorGradeList || []) : toArr(inputs.anchor_grade_ocf);
    const diameterIcf = allSelected?.anchor_diameter_icf ? (lists.anchorDiameterList || []) : toArr(inputs.anchor_diameter_icf);
    const gradeIcf = allSelected?.anchor_grade_icf ? (lists.anchorGradeList || []) : toArr(inputs.anchor_grade_icf);
    return {
      Module: "BasePlateConnection",
      "Member.Designation": memberDesignation,
      Material: inputs.material || "E 165 (Fe 290)",
      Connectivity: inputs.connectivity || "Welded Column Base",
      "End Condition": inputs.end_condition || "Pinned",
      "Load.Axial": inputs.load_axial ?? "",
      "Load.Axial_Tension": inputs.load_axial_tension ?? "",
      "Load.Shear.Major": inputs.load_shear_major ?? "",
      "Load.Shear.Minor": inputs.load_shear_minor ?? "",
      "Load.Moment.Major": inputs.load_moment_major ?? "",
      "Load.Moment.Minor": inputs.load_moment_minor ?? "",
      "Anchor Bolt.Type": inputs.anchor_type || "End Plate Type",
      "Footing.Grade": (inputs.footing_grade && inputs.footing_grade !== "Select Grade") ? inputs.footing_grade : "M20",
      "Weld.Type": inputs.weld_type || "Fillet Weld",
      "Anchor.Diameter": diameterOcf.length ? diameterOcf : ["M20"],
      "Anchor.Grade": gradeOcf.length ? gradeOcf : ["8.8"],
      "Anchor.Diameter.ICF": diameterIcf.length ? diameterIcf : diameterOcf.length ? diameterOcf : ["M20"],
      "Anchor.Grade.ICF": gradeIcf.length ? gradeIcf : gradeOcf.length ? gradeOcf : ["8.8"],
    };
  },

  modalConfig: [
    { key: "anchorDiameterOcf", inputKey: "anchor_diameter_ocf", dataSource: "anchorDiameterList" },
    { key: "anchorGradeOcf", inputKey: "anchor_grade_ocf", dataSource: "anchorGradeList" },
    { key: "anchorDiameterIcf", inputKey: "anchor_diameter_icf", dataSource: "anchorDiameterList" },
    { key: "anchorGradeIcf", inputKey: "anchor_grade_icf", dataSource: "anchorGradeList" },
  ],
  selectionConfig: [
    { key: "anchorDiameterOcfSelect", inputKey: "anchor_diameter_ocf", defaultValue: "All" },
    { key: "anchorGradeOcfSelect", inputKey: "anchor_grade_ocf", defaultValue: "All" },
    { key: "anchorDiameterIcfSelect", inputKey: "anchor_diameter_icf", defaultValue: "All" },
    { key: "anchorGradeIcfSelect", inputKey: "anchor_grade_icf", defaultValue: "All" },
  ],

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        { key: "connectivity", label: "Connectivity *", type: "select", options: "connectivityList" },
        { key: "end_condition", label: "End Condition (Major Axis z-z axis)", type: "text", disabled: true },
        { key: "member_designation", label: "Column Section *", type: "select", options: "sectionDesignation" },
        { key: "material", label: "Material *", type: "select", options: "materialList" },
      ],
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_axial", label: "Axial Compression (kN) *", type: "number" },
        { key: "load_axial_tension", label: "Axial Tension/Uplift (kN)", type: "number", conditionalDisplay: (extraState, inputs) => inputs?.connectivity === "Moment Base Plate" },
        { key: "load_shear_major", label: "Shear Force (kN) * - Along major axis (z-z)", type: "number" },
        { key: "load_shear_minor", label: "Shear Force (kN) * - Along minor axis (y-y)", type: "number" },
        { key: "load_moment_major", label: "Bending Moment (kNm) * - Major axis (M\u2082-z)", type: "number", conditionalDisplay: (extraState, inputs) => inputs?.connectivity !== "Welded Column Base" },
        { key: "load_moment_minor", label: "Bending Moment (kNm) * - Minor axis (My-y)", type: "number", conditionalDisplay: (extraState, inputs) => inputs?.connectivity !== "Welded Column Base" },
      ],
    },
    {
      title: "Anchor Bolt Outside Column Flange",
      fields: [
        { key: "anchor_diameter_ocf", label: "Diameter (mm) *", type: "customizable", selectionKey: "anchorDiameterOcfSelect", modalKey: "anchorDiameterOcf", dataSource: "anchorDiameterList" },
        { key: "anchor_grade_ocf", label: "Property Class *", type: "customizable", selectionKey: "anchorGradeOcfSelect", modalKey: "anchorGradeOcf", dataSource: "anchorGradeList" },
      ],
    },
    {
      title: "Anchor Bolt Inside Column Flange",
      fields: [
        { key: "anchor_diameter_icf", label: "Diameter (mm) *", type: "customizable", selectionKey: "anchorDiameterIcfSelect", modalKey: "anchorDiameterIcf", dataSource: "anchorDiameterList" },
        { key: "anchor_grade_icf", label: "Property Class *", type: "customizable", selectionKey: "anchorGradeIcfSelect", modalKey: "anchorGradeIcf", dataSource: "anchorGradeList" },
        { key: "anchor_type", label: "Anchor Type *", type: "select", options: "anchorTypeList" },
      ],
    },
    {
      title: "Pedestal/Footing",
      fields: [
        { key: "footing_grade", label: "Grade*", type: "select", options: "footingGradeList" },
      ],
    },
    {
      title: "Weld",
      fields: [
        { key: "weld_type", label: "Type *", type: "select", options: "weldTypeList" },
      ],
    },
  ],
};
