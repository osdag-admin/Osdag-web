import ANGLES from "../../../assets/CompressionMember/bA.png";
import BACK_TO_BACK_ANGLES from "../../../assets/CompressionMember/back_back_same_side_angles.png";
import STAR_ANGLES from "../../../assets/CompressionMember/bBBA.png";
import CHANNELS from "../../../assets/CompressionMember/bC.png";
import BACK_TO_BACK_CHANNELS from "../../../assets/CompressionMember/bBBC.png";
import ErrorImg from "../../../assets/notSelected.png";
import FIXED_FIXED from "../../../assets/CompressionMember/RRRRstrut.png";
import FIXED_HINGED from "../../../assets/CompressionMember/RFRFstrut.png";
import HINGED_FIXED from "../../../assets/CompressionMember/RRRFstrut.png";

export const strutsWeldedConfig = {
  sessionName: "Struts Welded to End Gusset",
  routePath: "/design/compression-member/struts_welded_to_end_gusset",
  designType: "Struts-Welded-Design",
  cameraKey: "CompressionMember",
  cadOptions: ["Model", "Member", "Plate"],

  defaultInputs: {
    connector_material: "E 250 (Fe 410 W)A",
    section_profile: "Angles",
    location: "Long Leg",
    length: "3000",
    axial_force: "100",
    module: "Struts-Welded-Design",
    plate_thickness: [],
    section_designation: [],
    material: "E 250 (Fe 410 W)A",
    member_designation: "All",
    design_method: "Limit State Design",
    end_condition_1: "Hinged",
    end_condition_2: "Hinged",
  },

  modalConfig: [
    { key: "plateThickness", inputKey: "plate_thickness", dataSource: "thicknessList" },
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null },
  ],

  selectionConfig: [
    { key: "thicknessSelect", inputKey: "plate_thickness", defaultValue: "All" },
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],

  getSectionImage: (profile) => {
    switch (profile) {
      case "Angles":
        return ANGLES;
      case "Back to Back Angles":
        return BACK_TO_BACK_ANGLES;
      case "Star Angles":
        return STAR_ANGLES;
      case "Channels":
        return CHANNELS;
      case "Back to Back Channels":
        return BACK_TO_BACK_CHANNELS;
      default:
        return ErrorImg;
    }
  },

  getEndConditionImage: (end1, end2) => {
    if (end1 === "Fixed" && end2 === "Fixed") {
      return FIXED_FIXED;
    } else if (end1 === "Fixed" && end2 === "Hinged") {
      return FIXED_HINGED;
    } else if (end1 === "Hinged" && end2 === "Fixed") {
      return HINGED_FIXED;
    } else if (end1 === "Hinged" && end2 === "Hinged") {
      return FIXED_HINGED;
    } else if (end1 === "Fixed" && end2 === "Free") {
      return FIXED_FIXED;
    }
    return FIXED_FIXED;
  },

  validateInputs: (inputs) => {
    if (!inputs.section_profile) {
      return { isValid: false, message: "Please select a Section Profile." };
    }
    if (!inputs.length || !inputs.axial_force) {
      return { isValid: false, message: "Please enter valid Length and Axial Force." };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists) => {
    const getList = (key, listName) => {
      if (allSelected?.[key]) {
        return lists?.[listName]?.map(item => String(item.value || item.Grade || item)) || [];
      }
      const val = inputs[key];
      if (Array.isArray(val)) return val.map(String);
      return val ? [String(val)] : [];
    };

    const normalizeSectionItem = (item) => {
      if (item == null) return "";
      if (typeof item === "string") return item.trim();
      return String(
        item.designation ?? item.Designation ?? item.value ?? item.Grade ?? item
      ).trim();
    };
    const normalizeSectionList = (list) => {
      if (!Array.isArray(list)) return [];
      return list.map(normalizeSectionItem).filter((s) => s !== "");
    };

    const dynamicSectionList = normalizeSectionList(
      strutsWeldedConfig.getDynamicSectionList(
        inputs.section_profile,
        lists?.angleList,
        lists?.channelList
      )
    );

    const memberDesignation = allSelected?.section_designation
      ? dynamicSectionList
      : normalizeSectionList(
          Array.isArray(inputs.section_designation)
            ? inputs.section_designation
            : inputs.section_designation
              ? [inputs.section_designation]
              : []
        );

    return {
      "Module": "Struts-Welded-Design",
      "Member.Profile": inputs.section_profile,
      "Member.Designation": memberDesignation,

      "Material": inputs.material,
      "Member.Material": inputs.material,

      "Member.Length": String(inputs.length),
      "Load.Axial": String(inputs.axial_force),

      "Conn_Location": inputs.location,
      "Member.End_1": inputs.end_condition_1,
      "Member.End_2": inputs.end_condition_2,

      "Connector.Material": inputs.connector_material,
      "Connector.Plate.Thickness_List": getList("plate_thickness", "thicknessList"),

      "Design.Design_Method": inputs.design_method,
    };
  },

  getLocationOptions: (profile) => {
    if (profile && profile.includes("Angle")) {
      return [
        { value: "Long Leg", label: "Long Leg" },
        { value: "Short Leg", label: "Short Leg" }
      ];
    }
    return [{ value: "Web", label: "Web" }];
  },

  getDynamicSectionList: (profile, angleList, channelList) => {
    if (profile && profile.includes("Angle")) {
      return angleList || [];
    }
    if (profile && profile.includes("Channel")) {
      return channelList || [];
    }
    return [];
  },

  inputSections: [
    {
      title: "Section Data",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "sectionProfileList",
          onChange: (value, setInputs, setExtraState) => {
            const imageSource = strutsWeldedConfig.getSectionImage(value);
            setExtraState((extState) => ({
              ...extState,
              selectedProfile: value,
              imageSource: imageSource
            }));
            setInputs((inps) => ({
              ...inps,
              section_profile: value,
              section_designation: [],
              location: strutsWeldedConfig.getLocationOptions(value)[0]?.value || "Long Leg"
            }));
          }
        },
        {
          key: "profile_image",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (extraState) => extraState?.imageSource || ANGLES,
          height: "100px",
          width: "100px"
        },
        {
          key: "location",
          label: "Conn_Location *",
          type: "dynamicSelect",
          getOptions: (inputs) => {
            return strutsWeldedConfig.getLocationOptions(inputs.section_profile);
          }
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          getDynamicDataSource: (inputs, contextData) => {
            return strutsWeldedConfig.getDynamicSectionList(
              inputs.section_profile,
              contextData.angleList,
              contextData.channelList
            );
          }
        },
        {
          key: "material",
          label: "Material *",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find(item => item.id === value);
            setInputs({
              ...inputs,
              material: material.Grade,
              connector_material: material.Grade,
            });
          }
        },
        {
          key: "length",
          label: "Length (mm) *",
          type: "number"
        }
      ]
    },
    {
      title: "End Conditions",
      fields: [
        {
          key: "end_condition_1",
          label: "End 1 Condition",
          type: "select",
          options: [
            { value: "Fixed", label: "Fixed" },
            { value: "Hinged", label: "Hinged" }
          ],
          onChange: (value, inputs, setInputs, setExtraState) => {
            const endImage = strutsWeldedConfig.getEndConditionImage(value, inputs.end_condition_2);
            setExtraState((extState) => ({
              ...extState,
              endConditionImage: endImage
            }));
            setInputs((inps) => ({
              ...inps,
              end_condition_1: value
            }));
          }
        },
        {
          key: "end_condition_2",
          label: "End 2 Condition",
          type: "select",
          options: [
            { value: "Fixed", label: "Fixed" },
            { value: "Hinged", label: "Hinged" }
          ],
          onChange: (value, inputs, setInputs, setExtraState) => {
            const endImage = strutsWeldedConfig.getEndConditionImage(inputs.end_condition_1, value);
            setExtraState((extState) => ({
              ...extState,
              endConditionImage: endImage
            }));
            setInputs((inps) => ({
              ...inps,
              end_condition_2: value
            }));
          }
        },
        {
          key: "end_condition_image",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (inputs) => {
            const end1 = inputs?.end_condition_1 || "Hinged";
            const end2 = inputs?.end_condition_2 || "Hinged";
            return strutsWeldedConfig.getEndConditionImage(end1, end2);
          },
          height: "120px",
          width: "180px"
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "axial_force", label: "Axial Force (kN)*", type: "number", required: true }
      ]
    },
    {
      title: "Plate",
      fields: [
        {
          key: "plate_thickness",
          label: "Thickness (mm) *",
          type: "customizable",
          selectionKey: "thicknessSelect",
          modalKey: "plateThickness",
          dataSource: "thicknessList"
        }
      ]
    }
  ]
};
