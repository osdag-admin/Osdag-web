export const boltedToEndConfig = {
  sessionName: "Tension Member Bolted Design",
  routePath: "/design/tension-member/bolted_to_end_gusset",
  designType: "Tension-Member-Bolted-Design",
  cameraKey: "TensionMember",
  
  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    section_profile: "Angles",
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
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: "dynamicList" },
  ],

  selectionConfig: [
    { key: "boltDiameterSelect", inputKey: "bolt_diameter", defaultValue: "All" },
    { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
    { key: "thicknessSelect", inputKey: "plate_thickness", defaultValue: "All" },
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],

  validateInputs: (inputs) => {
    if (!inputs.section_designation || 
        !inputs.length || 
        !inputs.axial_force || 
        inputs.section_designation === "Select Section") {
      return { isValid: false, message: "Please input all the required fields" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraData) => {
    const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
      if (allSelectedFlag) {
        return fullList.filter(item => item !== "All");
      }
      if (Array.isArray(selectedList)) {
        return selectedList.filter(item => item !== "All");
      }
      return [selectedList].filter(item => item !== "All");
    };

    // Get the appropriate list based on section profile
    const getSectionList = () => {
      if (inputs.section_profile && inputs.section_profile.includes("Angle")) {
        return lists.angleList || [];
      }
      return lists.channelList || [];
    };

    return {
      "Bolt.Bolt_Hole_Type": String(inputs.bolt_hole_type),
      "Bolt.Diameter": getArrayParam(allSelected.bolt_diameter, lists.boltDiameterList, inputs.bolt_diameter),
      "Bolt.Grade": getArrayParam(allSelected.bolt_grade, lists.propertyClassList, inputs.bolt_grade),
      "Bolt.Slip_Factor": String(inputs.bolt_slip_factor),
      "Bolt.Type": String(inputs.bolt_type),
      "Connector.Material": String(inputs.connector_material),
      "Material": String(inputs.material),
      "Member.Material": String(inputs.material),
      "Design.Design_Method": String(inputs.design_method),
      "Detailing.Corrosive_Influences": String(inputs.detailing_corr_status),
      "Detailing.Edge_type": String(inputs.detailing_edge_type),
      "Detailing.Gap": String(inputs.detailing_gap),
      "Load.Axial": String(inputs.axial_force),
      "Member.Designation": getArrayParam(
        allSelected.section_designation,
        getSectionList(),
        inputs.section_designation
      ),
      "Member.Length": String(inputs.length),
      "Member.Profile": String(inputs.section_profile),
      "Conn_Location": String(inputs.location),
      "Module": "Tension Member Bolted Design",
      "Connector.Plate.Thickness_List": getArrayParam(allSelected.plate_thickness, lists.thicknessList, inputs.plate_thickness),
    };
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "select",
          options: "sectionProfileList",
          required: true,
          hasImage: true,
          imageMap: {
            "Angles": "ANGLES",
            "Back to Back Angles": "BACK_TO_BACK_ANGLES", 
            "Star Angles": "STAR_ANGLES",
            "Channels": "CHANNELS"
          }
        },
        {
          key: "location",
          label: "Conn_Location *",
          type: "conditionalSelect",
          condition: (inputs) => inputs.section_profile && inputs.section_profile.includes("Angle"),
          options: {
            true: [
              { value: "Long Leg", label: "Long Leg" },
              { value: "Short Leg", label: "Short Leg" }
            ],
            false: [
              { value: "Web", label: "Web" }
            ]
          }
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          dataSource: "dynamicList",
          required: true
        },
        {
          key: "material",
          label: "Material *",
          type: "select",
          options: "materialList",
          required: true
        },
        {
          key: "length",
          label: "Length (mm) *",
          type: "number",
          required: true
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        {
          key: "axial_force",
          label: "Axial Force (kN)",
          type: "number"
        }
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