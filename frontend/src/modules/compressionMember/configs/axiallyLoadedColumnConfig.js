import { MODULE_KEY_AXIALLY_LOADED_COLUMN } from "../../../constants/DesignKeys";
import img_1_RRFF from "../../../assets/CompressionMember/1.RRFF.PNG";
import img_1_RRFF_rotated from "../../../assets/CompressionMember/1.RRFF_rotated.PNG";
import img_2_FRFR from "../../../assets/CompressionMember/2.FRFR.PNG";
import img_2_FRFR_rotated from "../../../assets/CompressionMember/2.FRFR_rotated.PNG";
import img_3_RFRF from "../../../assets/CompressionMember/3.RFRF.PNG";
import img_4_RRFR from "../../../assets/CompressionMember/4.RRFR.PNG";
import img_4_RRFR_rotated from "../../../assets/CompressionMember/4.RRFR_rotated.PNG";
import img_5_RRRF from "../../../assets/CompressionMember/5.RRRF.PNG";
import img_5_RRRF_rotated from "../../../assets/CompressionMember/5.RRRF_rotated.PNG";
import img_6_RRRR from "../../../assets/CompressionMember/6.RRRR.PNG";

export const axiallyLoadedColumnConfig = {
  sessionName: "Axially Loaded Column",
  routePath: "/design/compression-member/axially_loaded_column",
  designType: MODULE_KEY_AXIALLY_LOADED_COLUMN,
  cameraKey: "AxiallyLoadedColumn",
  cadOptions: ["Model"],

  defaultInputs: {
    module: MODULE_KEY_AXIALLY_LOADED_COLUMN,
    section_profile: "Beams and Columns",
    section_designation: [],
    material: "E 250 (Fe 410 W)A",
    actual_length_zz: "3000",
    actual_length_yy: "3000",
    end_condition_1: "Fixed",
    end_condition_2: "Fixed",
    end_condition_1_y: "Fixed",
    end_condition_2_y: "Fixed",
    axial_load: "100",
  },

  modalConfig: [
    {
      key: "sectionDesignation",
      inputKey: "section_designation",
      dataSource: null,
    },
  ],

  selectionConfig: [
    {
      key: "sectionDesignationSelect",
      inputKey: "section_designation",
      defaultValue: "All",
    },
  ],

  getEnd2Values: (end1) => {
    if (end1 === "Fixed") {
      return ["Fixed", "Free", "Hinged", "Roller"];
    }
    if (end1 === "Free") {
      return ["Fixed"];
    }
    if (end1 === "Hinged") {
      return ["Fixed", "Hinged", "Roller"];
    }
    if (end1 === "Roller") {
      return ["Fixed", "Hinged"];
    }
    return ["Fixed", "Free", "Hinged", "Roller"];
  },

  getEnd2Options: (end1) => {
    const values = axiallyLoadedColumnConfig.getEnd2Values(end1);
    return values.map((v) => ({ value: v, label: v }));
  },

  getEndConditionImageZZ: (end1, end2) => {
    if (end1 === "Fixed") {
      if (end2 === "Fixed") return img_6_RRRR;
      if (end2 === "Free") return img_1_RRFF_rotated;
      if (end2 === "Hinged") return img_5_RRRF_rotated;
      if (end2 === "Roller") return img_4_RRFR_rotated;
    } else if (end1 === "Free") {
      return img_1_RRFF;
    } else if (end1 === "Hinged") {
      if (end2 === "Fixed") return img_5_RRRF;
      if (end2 === "Hinged") return img_3_RFRF;
      if (end2 === "Roller") return img_2_FRFR_rotated;
    } else if (end1 === "Roller") {
      if (end2 === "Fixed") return img_4_RRFR;
      if (end2 === "Hinged") return img_2_FRFR;
    }
    return img_6_RRRR;
  },

  getEndConditionImageYY: (end1, end2) => {
    return axiallyLoadedColumnConfig.getEndConditionImageZZ(end1, end2);
  },

  buildSubmissionParams: (inputs, allSelected, lists) => {
    const {
      beamList = [],
      columnList = [],
      rhsList = [],
      shsList = [],
      angleList = [],
      channelList = [],
    } = lists || {};

    const getSectionDesignations = () => {
      const profile = inputs.section_profile;
      const uiSelection = inputs.section_designation;

      const makeArray = (value) => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
      };

      let baseList = [];
      if (profile === "Beams and Columns") {
        baseList = [...beamList, ...columnList];
      } else if (profile === "RHS and SHS") {
        baseList = [...rhsList, ...shsList];
      } else if (profile === "CHS") {
        baseList = [];
      } else if (profile === "Angles" || profile === "Back to Back Angles") {
        baseList = angleList || [];
      } else if (profile === "Channels" || profile === "Back to Back Channels") {
        baseList = channelList || [];
      }

      if (allSelected?.section_designation) {
        return baseList;
      }

      const selected = makeArray(uiSelection).filter((x) => x && x !== "All");
      // Desktop default is effectively "All" until the user customizes.
      return selected.length > 0 ? selected : baseList;
    };

    return {
      Module: MODULE_KEY_AXIALLY_LOADED_COLUMN,
      "Member.Profile": String(inputs.section_profile),
      "Member.Designation": getSectionDesignations(),
      Material: String(inputs.material),
      "Actual.Length_zz": String(inputs.actual_length_zz),
      "Actual.Length_yy": String(inputs.actual_length_yy),
      End_1: String(inputs.end_condition_1),
      End_2: String(inputs.end_condition_2),
      End_1_Y: String(inputs.end_condition_1_y),
      End_2_Y: String(inputs.end_condition_2_y),
      "Load.Axial": String(inputs.axial_load),
    };
  },

  validateInputs: (inputs) => {
    if (
      !inputs.section_profile ||
      !inputs.section_designation ||
      !inputs.material ||
      !inputs.actual_length_zz ||
      !inputs.actual_length_yy ||
      !inputs.end_condition_1 ||
      !inputs.end_condition_2 ||
      !inputs.end_condition_1_y ||
      !inputs.end_condition_2_y ||
      !inputs.axial_load
    ) {
      return {
        isValid: false,
        message: "Please input all the required fields",
      };
    }

    const toNumber = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : NaN;
    };

    if (toNumber(inputs.actual_length_zz) <= 0 || toNumber(inputs.actual_length_yy) <= 0) {
      return { isValid: false, message: "Actual lengths must be positive numbers" };
    }

    if (toNumber(inputs.axial_load) <= 0) {
      return { isValid: false, message: "Axial load must be a positive number" };
    }

    return { isValid: true };
  },

  inputSections: [
    {
      title: "Section Property",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "select",
          options: "sectionProfileList",
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          getDynamicDataSource: (inputs, contextData) => {
            const profile = inputs.section_profile;
            if (!profile || !contextData) return [];

            if (profile === "Beams and Columns") {
              return [
                ...(contextData.beamList || []),
                ...(contextData.columnList || []),
              ];
            }
            if (profile === "RHS and SHS") {
              return [
                ...(contextData.rhsList || []),
                ...(contextData.shsList || []),
              ];
            }
            if (profile === "CHS") {
              return contextData.chsList || [];
            }
            if (profile === "Angles" || profile === "Back to Back Angles") {
              return contextData.angleList || [];
            }
            if (profile === "Channels" || profile === "Back to Back Channels") {
              return contextData.channelList || [];
            }
            return [];
          },
        },
        {
          key: "material",
          label: "Material*",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find((item) => item.id === value);
            setInputs({
              ...inputs,
              material: material?.Grade || inputs.material,
            });
          },
        },
      ],
    },
    {
      title: "Section Data",
      fields: [
        {
          key: "actual_length_zz",
          label: "Actual Length (z-z), mm*",
          type: "number",
          validation: "positive_number",
        },
        {
          key: "actual_length_yy",
          label: "Actual Length (y-y), mm*",
          type: "number",
          validation: "positive_number",
        },
      ],
    },
    {
      title: "End Condition",
      fields: [
        {
          key: "end_condition_1",
          label: "End 1*",
          type: "select",
          options: "endConditionList",
          onChange: (value, inputs, setInputs) => {
            const nextValues = axiallyLoadedColumnConfig.getEnd2Values(value);
            const nextEnd2 = nextValues[0] || inputs.end_condition_2 || "Fixed";
            setInputs({
              ...inputs,
              end_condition_1: value,
              end_condition_2: nextEnd2,
            });
          },
        },
        {
          key: "end_condition_2",
          label: "End 2*",
          type: "dynamicSelect",
          getOptions: (inputs) =>
            axiallyLoadedColumnConfig.getEnd2Options(inputs.end_condition_1),
        },
        {
          key: "end_condition_image_zz",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (extraState, inputs) =>
            axiallyLoadedColumnConfig.getEndConditionImageZZ(
              inputs?.end_condition_1 || "Fixed",
              inputs?.end_condition_2 || "Fixed"
            ),
          height: "120px",
          width: "180px",
        },
      ],
    },
    {
      title: "End Condition 2",
      fields: [
        {
          key: "end_condition_1_y",
          label: "End 1 (y-y)*",
          type: "select",
          options: "endConditionList",
          onChange: (value, inputs, setInputs) => {
            const nextValues = axiallyLoadedColumnConfig.getEnd2Values(value);
            const nextEnd2Y = nextValues[0] || inputs.end_condition_2_y || "Fixed";
            setInputs({
              ...inputs,
              end_condition_1_y: value,
              end_condition_2_y: nextEnd2Y,
            });
          },
        },
        {
          key: "end_condition_2_y",
          label: "End 2 (y-y)*",
          type: "dynamicSelect",
          getOptions: (inputs) =>
            axiallyLoadedColumnConfig.getEnd2Options(inputs.end_condition_1_y),
        },
        {
          key: "end_condition_image_yy",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (extraState, inputs) =>
            axiallyLoadedColumnConfig.getEndConditionImageYY(
              inputs?.end_condition_1_y || "Fixed",
              inputs?.end_condition_2_y || "Fixed"
            ),
          height: "120px",
          width: "180px",
        },
      ],
    },
    {
      title: "Factored Loads",
      fields: [
        {
          key: "axial_load",
          label: "Axial Force (kN)*",
          type: "number",
          validation: "positive_number",
          required: true,
        },
      ],
    },
  ],
};

