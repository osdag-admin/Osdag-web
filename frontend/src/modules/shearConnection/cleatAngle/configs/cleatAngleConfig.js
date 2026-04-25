import { UI_STRINGS } from '../../../../constants/UIStrings';
import { MODULE_KEY_CLEAT_ANGLE, MODULE_DISPLAY_CLEAT_ANGLE } from '../../../../constants/DesignKeys';

export const cleatAngleConfig = {
  sessionName: MODULE_DISPLAY_CLEAT_ANGLE,
  routePath: "/design/connections/shear/cleatAngle",
  designType: MODULE_KEY_CLEAT_ANGLE, 
  cameraKey: "CleatAngle",
  cadOptions: ["Model", "Beam", "Column", "CleatAngle"],

  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "20",
    beam_section: "MB 300",
    column_section: "HB 150", 
    primary_beam: "MB 300",
    secondary_beam: "MB 300",
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Pre-tensioned",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
    cleat_section: [],
    module: MODULE_KEY_CLEAT_ANGLE,
  },

  modalConfig: [
    { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
    { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
    { key: "cleatSection", inputKey: "cleat_section", dataSource: "angleList" }, // Was cleatSectionList, now use angleList
  ],

  selectionConfig: [
    {
      key: "boltDiameterSelect",
      inputKey: "bolt_diameter",
      defaultValue: "All",
    },
    { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
    { key: "cleatSectionSelect", inputKey: "cleat_section", defaultValue: "All" },
  ],

  validateInputs: (inputs, extraState = {}, contextData = {}, selectionStates = {}) => {
    const allSelected = selectionStates?.cleatSectionSelect === 'All';
    const optionsList = (contextData && contextData.angleList) || [];
    const selectedList = Array.isArray(inputs.cleat_section) ? inputs.cleat_section : [];

    // Accept 'All' if the full options list is present and non-empty. Accept Customized if at least one chosen item.
    if (
      (allSelected && optionsList.length === 0) ||
      (!allSelected && selectedList.length === 0)
    ) {
      return { isValid: false, message: "Please select at least one section from the cleat section list" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const conn_map = {
      "Column Flange-Beam-Web": "Column Flange-Beam Web",
      "Column Web-Beam-Web": "Column Web-Beam Web", 
      "Beam-Beam": "Beam-Beam",
    };
    const connectivity = extraState?.selectedOption || inputs.connectivity || "Column Flange-Beam-Web";
    // Common parameters
    const baseParams = {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
      "Connectivity": conn_map[connectivity],
      "Connector.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Shear": inputs.load_shear || "",
      "Material": inputs.connector_material,
      "Module": MODULE_KEY_CLEAT_ANGLE,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Connector.Angle_List": allSelected.cleat_section ? lists.angleList : inputs.cleat_section,
    };
    // Connectivity-specific member assignments
    if (connectivity === "Beam-Beam") {
      return {
        ...baseParams,
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Material": inputs.supporting_material,
      };
    } else {
      return {
        ...baseParams,
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Material": inputs.supporting_material,
      };
    }
  },

  inputSections: [
    {
      title: UI_STRINGS.CONNECTING_MEMBERS,
      fields: [
        {
          key: "connectivity",
          label: UI_STRINGS.CONNECTIVITY,
          type: "connectivitySelect",
          onChange: (value, inputs, setInputs, contextData, extraState, setExtraState) => {
            setExtraState({ ...extraState, selectedOption: value });
            setInputs({ ...inputs, connectivity: value });
          }
        },
        {
          key: "column_section", 
          label: UI_STRINGS.COLUMN_SECTION,
          type: "select",
          options: "columnList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web";
          }
        },
        {
          key: "beam_section",
          label: UI_STRINGS.BEAM_SECTION, 
          type: "select",
          options: "beamList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web";
          }
        },
        {
          key: "primary_beam",
          label: UI_STRINGS.PRIMARY_BEAM,
          type: "select", 
          options: "beamList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Beam-Beam";
          }
        },
        {
          key: "secondary_beam",
          label: UI_STRINGS.SECONDARY_BEAM,
          type: "select",
          options: "beamList", 
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Beam-Beam";
          }
        },
        {
          key: "connector_material",
          label: UI_STRINGS.MATERIAL,
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find(item => item.id === value);
            setInputs({
              ...inputs,
              connector_material: material.Grade,
            });
          }
        }
      ]
    },
    {
      title: UI_STRINGS.FACTORED_LOADS,
      fields: [
        { key: "load_shear", label: UI_STRINGS.SHEAR_FORCE, type: "number" }
      ]
    },
    {
      title: UI_STRINGS.BOLT,
      fields: [
        {
          key: "bolt_diameter",
          label: UI_STRINGS.DIAMETER,
          type: "customizable",
          selectionKey: "boltDiameterSelect",
          modalKey: "boltDiameter",
          dataSource: "boltDiameterList"
        },
        {
          key: "bolt_type",
          label: UI_STRINGS.TYPE,
          type: "select",
          options: [
            { value: "Bearing_Bolt", label: "Bearing Bolt" },
            { value: "Friction_Grip_Bolt", label: "Friction Grip Bolt" }
          ]
        },
        {
          key: "bolt_grade",
          label: UI_STRINGS.PROPERTY_CLASS,
          type: "customizable",
          selectionKey: "propertyClassSelect",
          modalKey: "propertyClass",
          dataSource: "propertyClassList"
        }
      ]
    },
    {
      title: "Cleat Angle",
      fields: [
        {
          key: "cleat_section",
          label: "Cleat Section",
          type: "customizable",
          selectionKey: "cleatSectionSelect",
          modalKey: "cleatSection",
          dataSource: "angleList" // Use the same as previous angle_list
        }
      ]
    }
  ]
};
