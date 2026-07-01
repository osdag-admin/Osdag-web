import ANGLES from "../../../assets/CompressionMember/bA.png";
import BACK_TO_BACK_ANGLES from "../../../assets/CompressionMember/bBBA.png";
import STAR_ANGLES from "../../../assets/CompressionMember/bSA.png";
import CHANNELS from "../../../assets/CompressionMember/bC.png";
import BACK_TO_BACK_CHANNELS from "../../../assets/CompressionMember/bBBC.png";
import ErrorImg from "../../../assets/notSelected.png";
import FIXED_FIXED from "../../../assets/CompressionMember/RRRRstrut.png";
import FIXED_HINGED from "../../../assets/CompressionMember/RFRFstrut.png";
import HINGED_FIXED from "../../../assets/CompressionMember/RRRFstrut.png";

export const strutsBoltedConfig = {
  sessionName: "Struts Bolted to End Gusset",
  routePath: "/design/compression-member/struts_bolted_to_end_gusset",
  designType: "Struts-Bolted-Design",
  cameraKey: "CompressionMember",
  cadOptions: ["Model", "Member", "Plate"],

  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    section_profile: "Angles",
    location: "Long Leg",
    is_leg_loaded: "Yes",
    length: "3000",
    axial_force: "100",
    module: "Struts-Bolted-Design",
    plate_thickness: [],
    section_designation: [],
    material: "E 250 (Fe 410 W)A",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    member_designation: "All",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
    end_condition_1: "Hinged",
    end_condition_2: "Hinged",
  },

  modalConfig: [
    { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
    { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
    { key: "plateThickness", inputKey: "plate_thickness", dataSource: "thicknessList" },
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null },
  ],

  selectionConfig: [
    { key: "boltDiameterSelect", inputKey: "bolt_diameter", defaultValue: "All" },
    { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
    { key: "thicknessSelect", inputKey: "plate_thickness", defaultValue: "All" },
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],

  // Helper function to get section image based on profile
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

  // Helper function to get end condition image based on end1 and end2
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
    // Default: Fixed-Fixed
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
    // Helper to resolve lists
    const getList = (key, listName) => {
      if (allSelected?.[key]) {
        return lists?.[listName]?.map(item => String(item.value || item.Grade || item)) || [];
      }
      const val = inputs[key];
      if (Array.isArray(val)) return val.map(String);
      return val ? [String(val)] : [];
    };

    // Normalize section list items to designation strings (matches All/Customized list patterns elsewhere)
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
      strutsBoltedConfig.getDynamicSectionList(
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
      "Module": "Struts-Bolted-Design",
      "Member.Profile": inputs.section_profile,
      "Member.Designation": memberDesignation,

      "Material": inputs.material,
      "Member.Material": inputs.material,

      "Member.Length": String(inputs.length),
      "Load.Axial": String(inputs.axial_force),

      "Conn_Location": inputs.location,
      "Member.End_1": inputs.end_condition_1,
      "Member.End_2": inputs.end_condition_2,
      "is_leg_loaded": inputs.is_leg_loaded,

      "Bolt.Diameter": getList("bolt_diameter", "boltDiameterList"),
      "Bolt.Grade": getList("bolt_grade", "propertyClassList"),
      "Bolt.Type": inputs.bolt_type,
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Slip_Factor": String(inputs.bolt_slip_factor),

      "Connector.Material": inputs.connector_material,
      "Connector.Plate.Thickness_List": getList("plate_thickness", "thicknessList"),

      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": String(inputs.detailing_gap),
    };
  },

  // Helper function to get location options based on profile
  getLocationOptions: (profile) => {
    if (profile && profile.includes("Angle")) {
      return [
        { value: "Long Leg", label: "Long Leg" },
        { value: "Short Leg", label: "Short Leg" }
      ];
    }
    return [{ value: "Web", label: "Web" }];
  },

  // Helper function to get section list based on profile
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
          onChange: (value, setInputs,setExtraState) => {
            const imageSource = strutsBoltedConfig.getSectionImage(value);
            setExtraState((extState) => ({
              ...extState,
              selectedProfile: value,
              imageSource: imageSource
            }));
            setInputs((inps) => ({
              ...inps,
              section_profile: value,
              section_designation: [],
              location: strutsBoltedConfig.getLocationOptions(value)[0]?.value || "Long Leg"
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
            return strutsBoltedConfig.getLocationOptions(inputs.section_profile);
          }
        },
        {
          key: "is_leg_loaded",
          label: "Loaded through one leg",
          type: "select",
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
          ]
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          getDynamicDataSource: (inputs, contextData) => {
            return strutsBoltedConfig.getDynamicSectionList(
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
            const endImage = strutsBoltedConfig.getEndConditionImage(value, inputs.end_condition_2);
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
            const endImage = strutsBoltedConfig.getEndConditionImage(inputs.end_condition_1, value);
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
            return strutsBoltedConfig.getEndConditionImage(end1, end2);
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
      title: "Bolt",
      fields: [
        {
          key: "bolt_diameter",
          label: "Diameter (mm) *",
          type: "customizable",
          selectionKey: "boltDiameterSelect",
          modalKey: "boltDiameter",
          dataSource: "boltDiameterList"
        },
        {
          key: "bolt_type",
          label: "Type *",
          type: "select",
          options: [
            { value: "Bearing Bolt", label: "Bearing Bolt" },
            { value: "Friction Grip Bolt", label: "Friction Grip Bolt" }
          ]
        },
        {
          key: "bolt_grade",
          label: "Property Class *",
          type: "customizable",
          selectionKey: "propertyClassSelect",
          modalKey: "propertyClass",
          dataSource: "propertyClassList"
        }
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
