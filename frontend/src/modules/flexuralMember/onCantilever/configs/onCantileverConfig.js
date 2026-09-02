import { validateRequiredFields } from '../../../shared/utils/validation';


export const onCantileverConfig = {
  sessionName: "On Cantilever Beam Design",
  routePath: "/design/flexure/on_cantilever",
  designType: "On-Cantilever-Beam",
  cameraKey: "FlexuralMember",

  cadOptions: ["Model"],

  defaultInputs: {
    module: "On-Cantilever-Beam",

    section_profile: "Beams and Columns",
    // "ISMB 200" doesn't exist in the sections DB at all (real prefix is
    // "MB", not "ISMB") and even "MB 200" fails this module's own default
    // loads (Load.Moment=100kNm, Load.Shear=50kN). "MB 400" passes with a
    // comfortable margin (UR 0.376, verified via a live design run).
    section_designation: ["MB 400"],
    material: "E 250 (Fe 410 W)A",
    section_material: "E 250 (Fe 410 W)A",

    support_type: "Major Laterally Supported",
    support_restraint: "Continuous, with lateral restraint to top flange",
    top_restraint: "Free",

    member_length: "5000",
    shear_force: "50",
    bending_moment: "100",

    design_method: "Limit State Design",
    allowable_class: "Yes",
    effective_area_parameter: "1.0",
    length_overwrite: "NA",
    bearing_length: "NA",
    loading_condition: "Normal",
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

  // Helper: get list of sections based on profile (mirrors simply-supported beam)
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
    const requiredCheck = validateRequiredFields(onCantileverConfig.inputSections, inputs, extraState, selectionStates);
    if (!requiredCheck.isValid) return requiredCheck;

    if (
      !inputs.section_designation ||
      inputs.section_designation.length === 0 ||
      inputs.member_length === "" ||
      inputs.shear_force === "" ||
      inputs.bending_moment === ""
    ) {
      return { isValid: false, message: "Please input all the fields" };
    }
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
    const dynamicSectionList = onCantileverConfig.getDynamicSectionList(
      inputs.section_profile,
      lists.beamList,
      lists.columnList
    );

    const sectionList = allSelected.section_designation
      ? dynamicSectionList.filter((item) => item !== "All")
      : Array.isArray(inputs.section_designation)
        ? inputs.section_designation.filter((item) => item !== "All")
        : [inputs.section_designation].filter(Boolean);

    return {
      // Module identification
      "Module": "On-Cantilever-Beam",

      // Section
      "Member.Profile": inputs.section_profile || "Beams and Columns",
      "Member.Designation": sectionList,

      // Material
      "Material": inputs.material || "",
      "Member.Material": inputs.section_material || inputs.material || "",

      // Cantilever-specific restraints
      "Flexure.Type": inputs.support_type || "Major Laterally Supported",
      "Cantilever.Support": inputs.support_restraint || "Continuous, with lateral restraint to top flange",
      "Cantilever.Top": inputs.top_restraint || "Free",

      // Geometry
      "Member.Length": inputs.member_length,

      // Loads
      "Load.Shear": inputs.shear_force,
      "Load.Moment": inputs.bending_moment,

      // Design preferences
      "Design.Design_Method": inputs.design_method || "Limit State Design",
      "Optimum.Class": inputs.allowable_class || "Yes",
      "Effective.Area_Para": inputs.effective_area_parameter || "1.0",
      "Length.Overwrite": inputs.length_overwrite || "NA",
      "Bearing.Length": inputs.bearing_length || "NA",
      "Loading.Condition": inputs.loading_condition || "Normal",
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
          defaultValue: "Beams and Columns",
          onChange: (value, inputs, setInputs) => {
            setInputs({
              ...inputs,
              section_profile: value,
              section_designation: [],
            });
          },
        },
        {
          key: "section_designation",
          label: "Section Designation",
          type: "customizable",
          selectionKey: "sectionDesignationSelect",
          modalKey: "sectionDesignation",
          defaultValue: ["MB 400"], // see defaultInputs comment above
          getDynamicDataSource: (inputs, contextData) => {
            return onCantileverConfig.getDynamicSectionList(
              inputs.section_profile,
              contextData.beamList,
              contextData.columnList
            );
          },
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find((m) => m.id === value);
            setInputs({
              ...inputs,
              material: material?.Grade || "",
              section_material: material?.Grade || "",
            });
          },
        },
      ],
    },

    {
      title: "Section Data",
      fields: [
        {
          key: "support_type",
          label: "Support Type",
          type: "select",
          options: [
            {
              value: "Major Laterally Supported",
              label: "Major Laterally Supported",
            },
            {
              value: "Minor Laterally Unsupported",
              label: "Minor Laterally Unsupported",
            },
            {
              value: "Major Laterally Unsupported",
              label: "Major Laterally Unsupported",
            },
          ],
        },
        {
          key: "support_restraint",
          label: "Support Restraint",
          type: "select",
          options: [
            {
              value: "Continuous, with lateral restraint to top flange",
              label: "Continuous, with lateral restraint to top flange",
            },
            {
              value: "Continuous, with partial torsional restraint",
              label: "Continuous, with partial torsional restraint",
            },
            {
              value: "Continuous, with lateral and torsional restraint",
              label: "Continuous, with lateral and torsional restraint",
            },
            {
              value: "Restrained laterally, torsionally and against rotation on flange",
              label: "Restrained laterally, torsionally and against rotation on flange",
            },
          ],
        },
        {
          key: "top_restraint",
          label: "Top Restraint",
          type: "select",
          options: [
            { value: "Free", label: "Free" },
            {
              value: "Lateral restraint to top flange",
              label: "Lateral restraint to top flange",
            },
            {
              value: "Torsional restraint",
              label: "Torsional restraint",
            },
            {
              value: "Lateral and Torsional restraint",
              label: "Lateral and Torsional restraint",
            },
          ],
        },
        {
          key: "member_length",
          label: "Effective Span (mm)",
          type: "number",
          validation: "positive_number",
          placeholder: "Enter member length",
        },
      ],
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
          placeholder: "Enter shear force", required: true },
      ],
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
    },
  ],
};