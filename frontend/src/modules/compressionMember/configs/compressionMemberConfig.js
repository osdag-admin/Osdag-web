// Config for Compression Member (Struts in Trusses)
// Keys must match backend API (see compression.py input_values)

export const compressionMemberConfig = {
  sessionName: "Compression Member Design",
  // Must stay in sync with App route `/design/:designType/compression_member/struts_in_trusses/:projectId?`
  // and MODULE_ROUTES.StrutsInTrusses
  routePath: "/design/compression_member/compression_member/struts_in_trusses",
  designType: "Compression-Member-Design",
  cameraKey: "CompressionMember", 
  cadOptions: ["Model", "Member"],

  defaultInputs: {
    module: "Compression-Member-Design",
    section_profile: "Angles",
    section_designation: [],
    material: "E 250 (Fe 410 W)A",
    section_material: "E 250 (Fe 410 W)A",
    design_method: "Limit State Design",
    member_length: "3000",
    axial_load: "100",
    end_condition_1: "Fixed",
    end_condition_2: "Fixed",
    location: "Long Leg",
  },

  modalConfig: [
    { key: "sectionDesignation", inputKey: "section_designation", dataSource: "angleList" },
  ],

  selectionConfig: [
    { key: "sectionDesignationSelect", inputKey: "section_designation", defaultValue: "All" },
  ],


  // Helper function to get section list based on profile  
  getDynamicSectionList: (profile, angleList) => {
    switch (profile) {
      case "Angles":
      case "Back to Back Angles":
      case "Back to Back Angles - Same side of gusset":
      case "Back to Back Angles - Opposite side of gusset":
        return angleList || [];
      default:
        return [];
    }
  },

  validateInputs: (inputs) => {
    if (!inputs.section_designation ||
      !inputs.member_length ||
      !inputs.axial_load ||
      !inputs.design_method ||
      inputs.section_designation === "Select Section") {
      return { isValid: false, message: "Please input all the required fields" };
    }
    
    // Validate numeric inputs
    if (isNaN(parseFloat(inputs.member_length)) || parseFloat(inputs.member_length) <= 0) {
      return { isValid: false, message: "Member length must be a positive number" };
    }
    if (isNaN(parseFloat(inputs.axial_load)) || parseFloat(inputs.axial_load) <= 0) {
      return { isValid: false, message: "Axial load must be a positive number" };
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

    const dynamicSectionList = compressionMemberConfig.getDynamicSectionList(
      inputs.section_profile,
      lists.angleList
    );

    return {
      "Module": "Compression-Member-Design",
      "Member.Profile": String(inputs.section_profile),
      "Member.Designation": allSelected.section_designation
        ? dynamicSectionList
        : (Array.isArray(inputs.section_designation)
          ? inputs.section_designation
          : [inputs.section_designation || ""]),
      "Material": String(inputs.material),
      "Member.Material": String(inputs.section_material),
      "Design.Design_Method": String(inputs.design_method),
      "Member.Length": String(inputs.member_length),
      "Load.Axial": String(inputs.axial_load),
      "End_1": String(inputs.end_condition_1),
      "End_2": String(inputs.end_condition_2),
      "Conn_Location": String(inputs.location),
    };
  },

  inputSections: [
    {
      title: "Section Data",
      fields: [
        {
          key: "section_profile",
          label: "Section Profile*",
          type: "sectionProfileSelect",
          options: [
            { value: "Angles", label: "Angles" },
            { value: "Back to Back Angles - Same side of gusset", label: "Back to Back Angles - Same side of gusset" },
            { value: "Back to Back Angles - Opposite side of gusset", label: "Back to Back Angles - Opposite side of gusset" }
          ],
          defaultValue: "Angles",
          onChange: (value, inputs, setInputs, contextData, extraState, setExtraState) => {
            setInputs({
              ...inputs,
              section_profile: value,
              section_designation: [],
            });
          }
        },
        {
          key: "location",
          label: "Location*",
          type: "select",
          options: [
            { value: "Long Leg", label: "Long Leg" },
            { value: "Short Leg", label: "Short Leg" }
          ],
          defaultValue: "Long Leg"
        },
        {
          key: "section_designation",
          label: "Section Designation*",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          defaultValue: [],
          getDynamicDataSource: (inputs, contextData) => {
            return compressionMemberConfig.getDynamicSectionList(
              inputs.section_profile,
              contextData.angleList
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
      title: "Member Details",
      fields: [
        {
          key: "member_length", 
          label: "Member Length (mm)*",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter member length"
        },
        {
          key: "end_condition_1",
          label: "End Condition 1*",
          type: "select",
          options: [
            { value: "Fixed", label: "Fixed" },
            { value: "Hinged", label: "Hinged" }
          ],
          defaultValue: "Fixed"
        },
        {
          key: "end_condition_2",
          label: "End Condition 2*",
          type: "select",
          options: [
            { value: "Fixed", label: "Fixed" },
            { value: "Hinged", label: "Hinged" }
          ],
          defaultValue: "Fixed"
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        {
          key: "axial_load",
          label: "Axial Load (kN)*",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter axial load"
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
        }
      ]
    }
  ],

  backendKeys: {
    "Member.Profile": "Member.Profile",
    "Member.Designation": "Member.Designation",
    "Material": "Material",
    "Member.Material": "Member.Material",
    "Design.Design_Method": "Design.Design_Method",
    "Member.Length": "Member.Length",
    "Load.Axial": "Load.Axial",
    "End_1": "End_1",
    "End_2": "End_2",
    "Conn_Location": "Conn_Location",
  },
};

