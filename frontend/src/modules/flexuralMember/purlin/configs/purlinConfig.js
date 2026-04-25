// Config for Purlin (Matches Input Dock UI)

import {
  KEY_MODULE,
  KEY_SEC_PROFILE,
  KEY_SECSIZE,
  KEY_MATERIAL,
  KEY_SEC_MATERIAL,
  KEY_TORSIONAL_RES,
  KEY_WARPING_RES,
} from "../../../../constants/DesignKeys";

export const purlinConfig = {
  sessionName: "Purlin Design",
  routePath: "/design/flexure/purlin",
  designType: "Purlin",
  cameraKey: "FlexuralMember",
  cadOptions: ["Model", "Beam"],

  // ------------------ DEFAULT INPUTS ------------------
  defaultInputs: {
    module: "Purlin",
    section_profile: "Channels",
    section_designation: ["All"],
    material: "E 165 (Fe 290)",
    section_material: "E 165 (Fe 290)",

    cladding_type: "Brittle Cladding",

    torsional_restraint: "Fully Restrained",
    warping_restraint: "Both flanges fully restrained",

    effective_span: "",

    bending_moment_yy: "",
    bending_moment_zz: "",
    shear_force_yy: "",
    shear_force_zz: "",
  },

  // ------------------ MODAL CONFIG ------------------
  modalConfig: [
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null },
  ],

  selectionConfig: [
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],


  // ------------------ SECTION LIST ------------------
  getDynamicSectionList: (profile, beamList) => {
    return beamList || [];
  },

  // ------------------ VALIDATION ------------------
  validateInputs: (inputs) => {
    if (
      !inputs.section_designation ||
      !inputs.effective_span ||
      inputs.bending_moment_yy === "" ||
      inputs.bending_moment_zz === "" ||
      inputs.shear_force_yy === "" ||
      inputs.shear_force_zz === ""
    ) {
      return { isValid: false, message: "Please input all the required fields" };
    }

    if (parseFloat(inputs.effective_span) <= 0) {
      return { isValid: false, message: "Effective span must be positive" };
    }

    return { isValid: true };
  },

  // ------------------ BACKEND PARAM BUILD ------------------
  buildSubmissionParams: (inputs, allSelected, lists) => {
    const dynamicSectionList =
      lists.beamList || [];

    return {
      [KEY_MODULE]: "Purlin",

      [KEY_SEC_PROFILE]: String(inputs.section_profile),

      [KEY_SECSIZE]: allSelected.section_designation
        ? dynamicSectionList.filter(item => item !== "All")
        : (Array.isArray(inputs.section_designation)
            ? inputs.section_designation
            : [inputs.section_designation]),

      [KEY_MATERIAL]: String(inputs.material),
      [KEY_SEC_MATERIAL]: String(inputs.material),

      "Cladding.Type": String(inputs.cladding_type),

      "Load.Moment.YY": String(inputs.bending_moment_yy),
      "Load.Moment.ZZ": String(inputs.bending_moment_zz),

      "Load.Shear.YY": String(inputs.shear_force_yy),
      "Load.Shear.ZZ": String(inputs.shear_force_zz),

      "Member.Length": String(inputs.effective_span),

      [KEY_TORSIONAL_RES]: String(inputs.torsional_restraint),
      [KEY_WARPING_RES]: String(inputs.warping_restraint),
    };
  },

  // ------------------ INPUT DOCK STRUCTURE ------------------
  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "select",
          options: [
            { value: "Channels", label: "Channels" }
          ],
          defaultValue: "Channels"
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          defaultValue: ["All"],
          getDynamicDataSource: (inputs, contextData) => {
            return contextData.beamList || [];
          }
        },
        {
          key: "material",
          label: "Material*",
          type: "select",
          options: "materialList"
        }
      ]
    },
    {
      title: "Section Data",
      fields: [
        {
          key: "cladding_type",
          label: "Cladding (For Deflection)*",
          type: "select",
          options: [
            { value: "Brittle Cladding", label: "Brittle Cladding" },
            { value: "Non-Brittle Cladding", label: "Non-Brittle Cladding" }
          ]
        },
        {
          key: "torsional_restraint",
          label: "Torsional Restraint*",
          type: "select",
          options: [
            { value: "Fully Restrained", label: "Fully Restrained" },
            { value: "Partially Restrained-support connection", label: "Partially Restrained-support connection" },
            { value: "Partially Restrained-bearing support", label: "Partially Restrained-bearing support" }
          ]
        },
        {
          key: "warping_restraint",
          label: "Warping Restraint*",
          type: "select",
          options: [
            { value: "Both flanges fully restrained", label: "Both flanges fully restrained" },
            { value: "Compression flange fully restrained", label: "Compression flange fully restrained" },
            { value: "Compression flange partially restrained", label: "Compression flange partially restrained" },
            { value: "Warping not restrained in both flanges", label: "Warping not restrained in both flanges" }
          ]
        },
        {
          key: "effective_span",
          label: "Effective Span (m)*",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter effective span"
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        {
          key: "bending_moment_yy",
          label: "Bending Moment (y-y) (kNm)*",
          type: "number",
          validation: "number",
          placeholder: "Enter Myy"
        },
        {
          key: "bending_moment_zz",
          label: "Bending Moment (z-z) (kNm)*",
          type: "number",
          validation: "number",
          placeholder: "Enter Mzz"
        },
        {
          key: "shear_force_yy",
          label: "Shear Force (y-y) (kN)*",
          type: "number",
          validation: "number",
          placeholder: "Enter Vyy"
        },
        {
          key: "shear_force_zz",
          label: "Shear Force (z-z) (kN)*",
          type: "number",
          validation: "number",
          placeholder: "Enter Vzz"
        }
      ]
    }
  ]
};