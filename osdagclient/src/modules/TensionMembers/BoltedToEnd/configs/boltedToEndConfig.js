import ANGLES from "../../../../assets/TensionMember/Angles.png";
import BACK_TO_BACK_ANGLES from "../../../../assets/TensionMember/back_back_angles.png";
import STAR_ANGLES from "../../../../assets/TensionMember/star_angles.png";
import CHANNELS from "../../../../assets/TensionMember/Channels.png";
import ErrorImg from "../../../../assets/notSelected.png";
import {
  KEY_MODULE, KEY_SEC_PROFILE, KEY_LOCATION, KEY_SECSIZE, KEY_MATERIAL,
  KEY_LENGTH, KEY_AXIAL, KEY_D, KEY_TYP, KEY_GRD, KEY_DP_BOLT_HOLE_TYPE,
  KEY_DP_BOLT_SLIP_FACTOR, KEY_CONNECTOR_MATERIAL, KEY_DP_DETAILING_EDGE_TYPE,
  KEY_DP_DETAILING_GAP, KEY_DP_DETAILING_CORROSIVE_INFLUENCES,
  KEY_DP_DESIGN_METHOD, KEY_PLATETHK, KEY_SEC_MATERIAL
} from "../../../../constants/DesignKeys";

export const boltedToEndConfig = {
  sessionName: "Tension Member Bolted Design",
  routePath: "/design/tension-member/bolted_to_end_gusset",
  designType: "Tension-Member-Bolted-Design",
  cameraKey: "TensionMember",
  cadOptions: ["Model", "Member", "Plate", "Endplate"],

  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    section_profile: "Back to Back Angles",
    location: "Long Leg",
    length: "1250",
    axial_force: "60",
    module: "Tension Member Bolted Design",
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
  },

  modalConfig: [
    { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
    { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
    { key: "plateThickness", inputKey: "plate_thickness", dataSource: "thicknessList" },
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: null }, // Dynamic data source handled in EngineeringModule
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
      default:
        return ErrorImg;
    }
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
    return channelList || [];
  },

  validateInputs: (inputs) => {
    if (!inputs.section_designation ||
      !inputs.length ||
      !inputs.axial_force ||
      inputs.section_designation === "Select Section") {
      return { isValid: false, message: "Please input all the required fields" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
      if (allSelectedFlag) {
        // Exclude "All" if present in the list
        return fullList.filter(item => item !== "All");
      }
      // Ensure always array
      if (Array.isArray(selectedList)) {
        return selectedList.filter(item => item !== "All");
      }
      return [selectedList].filter(item => item !== "All");
    };

    const dynamicSectionList = boltedToEndConfig.getDynamicSectionList(
      inputs.section_profile,
      lists.angleList,
      lists.channelList
    );

    return {
      [KEY_DP_BOLT_HOLE_TYPE]: String(inputs.bolt_hole_type),
      [KEY_D]: getArrayParam(allSelected.bolt_diameter, lists.boltDiameterList, inputs.bolt_diameter),
      [KEY_GRD]: getArrayParam(allSelected.bolt_grade, lists.propertyClassList, inputs.bolt_grade),
      [KEY_DP_BOLT_SLIP_FACTOR]: String(inputs.bolt_slip_factor),
      [KEY_TYP]: String(inputs.bolt_type),
      [KEY_CONNECTOR_MATERIAL]: String(inputs.connector_material),
      [KEY_MATERIAL]: String(inputs.material),
      [KEY_SEC_MATERIAL]: String(inputs.material),
      [KEY_DP_DESIGN_METHOD]: String(inputs.design_method),
      [KEY_DP_DETAILING_CORROSIVE_INFLUENCES]: String(inputs.detailing_corr_status),
      [KEY_DP_DETAILING_EDGE_TYPE]: String(inputs.detailing_edge_type),
      [KEY_DP_DETAILING_GAP]: String(inputs.detailing_gap),
      [KEY_AXIAL]: String(inputs.axial_force),
      [KEY_SECSIZE]: allSelected.section_designation
        ? dynamicSectionList  // Entire list if "All" selected
        : (Array.isArray(inputs.section_designation)
          ? inputs.section_designation
          : [inputs.section_designation || ""]),
      [KEY_LENGTH]: String(inputs.length),
      [KEY_SEC_PROFILE]: String(inputs.section_profile),
      [KEY_LOCATION]: String(inputs.location),
      [KEY_MODULE]: "Tension-Member-Bolted-Design",
      [KEY_PLATETHK]: getArrayParam(allSelected.plate_thickness, lists.thicknessList, inputs.plate_thickness),
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
          onChange: (value, inputs, setInputs, contextData, extraState, setExtraState) => {
            // Update image and reset section designation when profile changes
            const imageSource = boltedToEndConfig.getSectionImage(value);
            setExtraState({
              ...extraState,
              selectedProfile: value,
              imageSource: imageSource
            });
            setInputs({
              ...inputs,
              section_profile: value,
              section_designation: [], // Reset section designation
              location: boltedToEndConfig.getLocationOptions(value)[0]?.value || "Long Leg"
            });
          }
        },
        {
          key: "profile_image",
          label: "",
          type: "image",
          conditionalDisplay: () => true,
          imageSource: (extraState) => extraState?.imageSource || BACK_TO_BACK_ANGLES,
          height: "100px",
          width: "100px"
        },
        {
          key: "location",
          label: "Conn_Location *",
          type: "dynamicSelect",
          getOptions: (inputs, extraState) => {
            return boltedToEndConfig.getLocationOptions(inputs.section_profile);
          }
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          getDynamicDataSource: (inputs, contextData) => {
            return boltedToEndConfig.getDynamicSectionList(
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
      title: "Factored Loads",
      fields: [
        { key: "axial_force", label: "Axial Force (kN)", type: "number" }
      ]
    },
    {
      title: "Bolt",
      fields: [
        {
          key: "bolt_diameter",
          label: "Diameter (mm)",
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
          label: "Thickness (mm)",
          type: "customizable",
          selectionKey: "thicknessSelect",
          modalKey: "plateThickness",
          dataSource: "thicknessList"
        }
      ]
    }
  ]
}; 