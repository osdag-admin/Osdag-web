// Config for Purlin (Flexural Member)
// Based on simplySupportedBeamConfig — adjust as needed

import ISECTION from "../../../../assets/ISection.png";
import ErrorImg from "../../../../assets/notSelected.png";
import {
  KEY_MODULE, KEY_SEC_PROFILE, KEY_SECSIZE, KEY_MATERIAL, KEY_SEC_MATERIAL,
  KEY_DP_DESIGN_METHOD, KEY_ALLOW_CLASS, KEY_EFFECTIVE_AREA_PARA,
  KEY_LENGTH_OVERWRITE, KEY_BEARING_LENGTH, KEY_SHEAR, KEY_MOMENT,
  KEY_LENGTH, KEY_SUPPORT, KEY_TORSIONAL_RES, KEY_WARPING_RES, KEY_DESIGN_TYPE_FLEXURE
} from "../../../../constants/DesignKeys";

export const purlinConfig = {
  sessionName: "Purlin Design",
  routePath: "/design/flexure/purlin",
  designType: "Purlin",
  cameraKey: "FlexuralMember",
  cadOptions: ["Model", "Beam"],

  defaultInputs: {
    module: "Purlin",
    section_profile: "C Sections",
    section_designation: ["C100"],
    material: "E 250 (Fe 410 W)A",
    section_material: "E 250 (Fe 410 W)A",
    design_method: "Limit State Design",
    allowable_class: "Plastic",
    effective_area_parameter: "1.0",
    length_overwrite: "NA",
    bearing_length: "NA",
    shear_force: "10",
    bending_moment: "20",
    member_length: "3000",
    beam_support_type: "Purlin",
    torsional_restraint: "Fully Restrained",
    warping_restraint: "Both flanges fully restrained",
  },

  modalConfig: [
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null },
  ],

  selectionConfig: [
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],

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

  getDynamicSectionList: (profile, beamList, columnList) => {
    // For purlins, use beam list or custom list if provided
    return beamList || [];
  },

  validateInputs: (inputs) => {
    if (!inputs.section_designation || !inputs.member_length || !inputs.shear_force || !inputs.bending_moment) {
      return { isValid: false, message: "Please input all the required fields" };
    }
    if (isNaN(parseFloat(inputs.member_length)) || parseFloat(inputs.member_length) <= 0) {
      return { isValid: false, message: "Member length must be a positive number" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
      if (allSelectedFlag) {
        return fullList.filter(item => item !== "All");
      }
      if (Array.isArray(selectedList)) {
        return selectedList.filter(item => item !== "All");
      }
      return [selectedList].filter(item => item !== "All");
    };

    const dynamicSectionList = purlinConfig.getDynamicSectionList(
      inputs.section_profile,
      lists.beamList,
      lists.columnList
    );

    return {
      [KEY_MODULE]: "Purlin",
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
      "Flexure.Support": "Purlin",
      [KEY_TORSIONAL_RES]: String(inputs.torsional_restraint),
      [KEY_WARPING_RES]: String(inputs.warping_restraint),
    };
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "sectionProfileList",
          defaultValue: "Beams and Columns",
          onChange: (value, inputs, setInputs, contextData, extraState, setExtraState) => {
            const imageSource = purlinConfig.getSectionImage(value);
            setExtraState({
              ...extraState,
              selectedProfile: value,
              imageSource: imageSource
            });
            setInputs({
              ...inputs,
              section_profile: value,
              section_designation: [],
            });
          }
        },
        {
          key: "profile_image",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (extraState) => extraState?.imageSource || ISECTION,
          height: "100px",
          width: "100px"
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          defaultValue: ["C100"],
          getDynamicDataSource: (inputs, contextData) => {
            return purlinConfig.getDynamicSectionList(
              inputs.section_profile,
              contextData.beamList,
              contextData.columnList
            );
          }
        },
        {
          key: "material",
          label: "Material*",
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
          label: "Support Type*",
          type: "select",
          options: [
            { value: "Purlin", label: "Purlin" },
            { value: "Major Laterally Supported", label: "Major Laterally Supported" },
            { value: "Minor Laterally Unsupported", label: "Minor Laterally Unsupported" }
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
            { value: "Compressicm flange partially restrained", label: "Compressicm flange partially restrained" },
            { value: "Warping not restrained in both flanges", label: "Warping not restrained in both flanges" }
          ]
        },
        {
          key: "member_length",
          label: "Effective Span (m)*",
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
          label: "Bending Moment (kNm)*",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter bending moment"
        },
        {
          key: "shear_force",
          label: "Shear Force (kN)*",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter shear force"
        }
      ]
    },
    {
      title: "Design Preferences",
      fields: [
        {
          key: "design_method",
          label: "Design Method",
          type: "select",
          options: [
            { value: "Limit State Design", label: "Limit State Design" }
          ],
          defaultValue: "Limit State Design"
        },
        {
          key: "allowable_class",
          label: "Allowable Class",
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
          defaultValue: "1.0",
          placeholder: "Enter effective area parameter"
        },
        {
          key: "length_overwrite",
          label: "Length Overwrite",
          type: "select",
          options: [
            { value: "NA", label: "NA" }
          ],
          defaultValue: "NA"
        },
        {
          key: "bearing_length",
          label: "Bearing Length",
          type: "select",
          options: [
            { value: "NA", label: "NA" }
          ],
          defaultValue: "NA"
        }
      ]
    }
  ],

  backendKeys: {
    "Member.Profile": KEY_SEC_PROFILE,
    "Member.Designation": KEY_SECSIZE,
    "Material": KEY_MATERIAL,
    "Member.Material": KEY_SEC_MATERIAL,
    "Design.Design_Method": "Flexure.Type",
    "Design.Allowable_Class": KEY_ALLOW_CLASS,
    "Design.Effective_Area_Parameter": KEY_EFFECTIVE_AREA_PARA,
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
