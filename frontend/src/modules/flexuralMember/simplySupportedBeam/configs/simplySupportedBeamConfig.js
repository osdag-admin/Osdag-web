// Config for Simply Supported Beam (Flexural Member)
// Keys must match backend API (see flexure.py input_values)

import ISECTION from "../../../../assets/ISection.png";
import ErrorImg from "../../../../assets/notSelected.png";
import {
  KEY_MODULE, KEY_SEC_PROFILE, KEY_SECSIZE, KEY_MATERIAL, KEY_SEC_MATERIAL,
  KEY_DP_DESIGN_METHOD, KEY_ALLOW_CLASS, KEY_EFFECTIVE_AREA_PARA, 
  KEY_LENGTH_OVERWRITE, KEY_BEARING_LENGTH, KEY_SHEAR, KEY_MOMENT,
  KEY_LENGTH, KEY_SUPPORT, KEY_TORSIONAL_RES, KEY_WARPING_RES
} from "../../../../constants/DesignKeys";

import { validateRequiredFields } from '../../../shared/utils/validation';
export const simplySupportedBeamConfig = {
  sessionName: "Simply Supported Beam Design",
  routePath: "/design/flexure/simply_supported_beam",
  designType: "Simply-Supported-Beam",
  cameraKey: "FlexuralMember", 
  cadOptions: ["Model"],

  defaultInputs: {
    module: "Simply-Supported-Beam",
    section_profile: "Beams and Columns",
    // "ISMB 200" doesn't exist in the sections DB at all (real prefix is
    // "MB", not "ISMB" — confirmed against all 407 "Beams and Columns"
    // designations) and even "MB 200" fails this module's own default
    // loads (Load.Moment=100kNm, Load.Shear=50kN). "MB 400" passes with a
    // comfortable margin (UR 0.376, verified via a live design run).
    section_designation: ["MB 400"],
    material: "E 250 (Fe 410 W)A",
    section_material: "E 250 (Fe 410 W)A",
    design_method: "Limit State Design",
    // KEY_ALLOW_CLASS ('Optimum.Class') is a Yes/No toggle for "allow
    // Semi-Compact sections in the optimization search" (flexure.py:869,
    // `if self.allow_class == "Yes"`) — matches desktop's own default
    // (flexure.py:172, KEY_ALLOW_CLASS: 'Yes'). NOT a section-class name.
    allowable_class: "Yes",
    effective_area_parameter: "1.0",
    length_overwrite: "NA",
    bearing_length: "NA",
    loading_condition: "Normal",
    shear_force: "50",
    bending_moment: "100",
    member_length: "6000",
    beam_support_type: "Major Laterally Supported",
    torsional_restraint: "Fully Restrained",
    warping_restraint: "Both flanges fully restrained",
  },

  modalConfig: [
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null }, // Dynamic data source
  ],

  selectionConfig: [
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],

  // Helper function to get section image
  getSectionImage: (profile) => {
    switch (profile) {
      case "Beams":
      case "Columns":
      case "Beams and Columns":
        return ISECTION;
      default:
        return ErrorImg;
    }
  },

  // Helper function to get section list based on profile  
  getDynamicSectionList: (profile, beamList, columnList) => {
    if (profile === "Beams") {
      return beamList || [];
    } else if (profile === "Columns") {
      return columnList || [];
    } else if (profile === "Beams and Columns") {
      return [...(beamList || []), ...(columnList || [])];
    }
    return [];
  },

  validateInputs: (inputs, extraState, _lists, selectionStates) => {
    const requiredCheck = validateRequiredFields(simplySupportedBeamConfig.inputSections, inputs, extraState, selectionStates);
    if (!requiredCheck.isValid) return requiredCheck;

    if (!inputs.section_designation ||
      !inputs.member_length ||
      !inputs.shear_force ||
      !inputs.bending_moment ||
      !inputs.design_method ||
      !inputs.allowable_class ||
      !inputs.effective_area_parameter ||
      inputs.section_designation === "Select Section") {
      return { isValid: false, message: "Please input all the required fields" };
    }
    
    // Validate numeric inputs
    if (isNaN(parseFloat(inputs.member_length)) || parseFloat(inputs.member_length) <= 0) {
      return { isValid: false, message: "Member length must be a positive number" };
    }
    if (isNaN(parseFloat(inputs.shear_force)) || parseFloat(inputs.shear_force) <= 0) {
      return { isValid: false, message: "Shear force must be a positive number" };
    }
    if (isNaN(parseFloat(inputs.bending_moment)) || parseFloat(inputs.bending_moment) <= 0) {
      return { isValid: false, message: "Bending moment must be a positive number" };
    }
    
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists) => {

    const dynamicSectionList = simplySupportedBeamConfig.getDynamicSectionList(
      inputs.section_profile,
      lists.beamList,
      lists.columnList
    );

    return {
      [KEY_MODULE]: "Simply-Supported-Beam",
      [KEY_SEC_PROFILE]: String(inputs.section_profile),
      [KEY_SECSIZE]: allSelected.section_designation
        ? dynamicSectionList
        : (Array.isArray(inputs.section_designation)
          ? inputs.section_designation
          : [inputs.section_designation || ""]),
      [KEY_MATERIAL]: String(inputs.material),
      [KEY_SEC_MATERIAL]: String(inputs.section_material),
      [KEY_DP_DESIGN_METHOD]: String(inputs.design_method),
      [KEY_ALLOW_CLASS]: String(inputs.allowable_class),
      [KEY_EFFECTIVE_AREA_PARA]: String(inputs.effective_area_parameter),
      [KEY_LENGTH_OVERWRITE]: String(inputs.length_overwrite),
      [KEY_BEARING_LENGTH]: String(inputs.bearing_length),
      [KEY_SHEAR]: String(inputs.shear_force),
      [KEY_MOMENT]: String(inputs.bending_moment),
      [KEY_LENGTH]: String(inputs.member_length),
      "Flexure.Type": String(inputs.beam_support_type),
      "Flexure.Support": "Simply Supported", // Fixed value for simply supported beams
      [KEY_TORSIONAL_RES]: String(inputs.torsional_restraint),
      [KEY_WARPING_RES]: String(inputs.warping_restraint),
      "Loading.Condition": String(inputs.loading_condition || "Normal"),
    };
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile",
          type: "select",
          options: "sectionProfileList",
          defaultValue: "Beams and Columns", // Default to the only available option
          onChange: (value, inputs, setInputs, contextData, extraState, setExtraState) => {
            const imageSource = simplySupportedBeamConfig.getSectionImage(value);
            setExtraState({
              ...extraState,
              selectedProfile: value,
              imageSource: imageSource
            });
            setInputs({
              ...inputs,
              section_profile: value,
              section_designation: [], // Reset section designation
            });
          }
        },
        {
          key: "section_designation",
          label: "Section Designation",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          defaultValue: ["MB 400"], // Default to a common beam section (see defaultInputs comment above)
          getDynamicDataSource: (inputs, contextData) => {
            return simplySupportedBeamConfig.getDynamicSectionList(
              inputs.section_profile,
              contextData.beamList,
              contextData.columnList
            );
          }
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find(item => item.id === value);
            setInputs({
              ...inputs,
              material: material.Grade,
              section_material: material.Grade,
            });
          }
        }
      ]
    },
    {
      title: "Section Data",
      fields: [
        {
          key: "beam_support_type",
          label: "Support Type",
          type: "select",
          options: [
            // From VALUES_SUPP_TYPE_temp in Common.py
            { value: "Major Laterally Supported", label: "Major Laterally Supported" },
            { value: "Minor Laterally Unsupported", label: "Minor Laterally Unsupported" },
            { value: "Major Laterally Unsupported", label: "Major Laterally Unsupported" }
          ]
        },
        {
          key: "torsional_restraint",
          label: "Torsional Restraint",
          type: "select", 
          options: [
            // From Torsion_Restraint_list in Common.py
            { value: "Fully Restrained", label: "Fully Restrained" },
            { value: "Partially Restrained-support connection", label: "Partially Restrained-support connection" },
            { value: "Partially Restrained-bearing support", label: "Partially Restrained-bearing support" }
          ]
        },
        {
          key: "warping_restraint",
          label: "Warping Restraint",
          type: "select",
          options: [
            // From Warping_Restraint_list in Common.py
            { value: "Both flanges fully restrained", label: "Both flanges fully restrained" },
            { value: "Compression flange fully restrained", label: "Compression flange fully restrained" },
            { value: "Compressicm flange partially restrained", label: "Compressicm flange partially restrained" },
            { value: "Warping not restrained in both flanges", label: "Warping not restrained in both flanges" }
          ]
        },
        {
          key: "member_length", 
          label: "Effective Span (m)",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter member length"
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        {
          key: "bending_moment",
          label: "Bending Moment (kNm)", 
          type: "number",
          validation: "positive_number",
          placeholder: "Enter bending moment", required: true },
        {
          key: "shear_force",
          label: "Shear Force (kN)",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter shear force", required: true }
      ]
    },
    {
      title: "Optimization",
      fields: [
        {
          key: "allowable_class",
          label: "Allow Semi-Compact Sections",
          type: "select",
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
          ],
          defaultValue: "Yes"
        },
        {
          key: "effective_area_parameter",
          label: "Effective Area Parameter",
          type: "number",
          validation: "positive_number"
        },
        {
          key: "length_overwrite",
          label: "Effective Length Parameter",
          type: "text",
          placeholder: "NA or a value in mm"
        },
        {
          key: "bearing_length",
          label: "Bearing Length (mm)",
          type: "text",
          placeholder: "NA or a value in mm"
        },
        {
          key: "loading_condition",
          label: "Loading Condition",
          type: "select",
          options: [
            { value: "Normal", label: "Normal" },
            { value: "Destabilizing", label: "Destabilizing" }
          ],
          defaultValue: "Normal"
        }
      ]
    }
  ],

  backendKeys: {
    "Member.Profile": KEY_SEC_PROFILE,
    "Member.Designation": KEY_SECSIZE,
    "Material": KEY_MATERIAL,
    "Member.Material": KEY_SEC_MATERIAL,
    "Design.Design_Method": "Flexure.Type",      // KEY_DESIGN_TYPE_FLEXURE actual value
    "Optimum.Class": KEY_ALLOW_CLASS,
    "Effective.Area_Para": KEY_EFFECTIVE_AREA_PARA,
    "Design.Length_Overwrite": KEY_LENGTH_OVERWRITE,
    "Design.Bearing_Length": KEY_BEARING_LENGTH,
    "Load.Shear": KEY_SHEAR,
    "Load.Moment": KEY_MOMENT,
    "Member.Length": KEY_LENGTH,
    "Support.Type": KEY_SUPPORT,
    "Torsional.Restraint": KEY_TORSIONAL_RES,
    "Warping.Restraint": KEY_WARPING_RES,
  },
}; 