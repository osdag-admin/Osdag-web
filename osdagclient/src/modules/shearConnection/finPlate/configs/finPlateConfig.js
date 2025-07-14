import { UI_STRINGS } from '../../../../constants/UIStrings';
import { MODULE_KEY_FIN_PLATE, MODULE_DISPLAY_FIN_PLATE } from '../../../../constants/DesignKeys';

export const finPlateConfig = {
  sessionName: MODULE_DISPLAY_FIN_PLATE,
  routePath: "/design/connections/shear/fin_plate",
  designType: MODULE_KEY_FIN_PLATE,
  cameraKey: "FinPlate",
  cadOptions: ["Model", "Beam", "Column", "Plate"],
  
  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "70",
    load_axial: "30",
    module: MODULE_KEY_FIN_PLATE,
    plate_thickness: [],
    beam_section: "MB 300",
    column_section: "HB 150",
    primary_beam: "JB 200",
    secondary_beam: "JB 150",
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    // Hardcoded defaults for undefined fields:
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Pre-tensioned",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
  },

  modalConfig: [
    { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
    { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
    { key: "plateThickness", inputKey: "plate_thickness", dataSource: "thicknessList" },
  ],

  selectionConfig: [
    { key: "boltDiameterSelect", inputKey: "bolt_diameter", defaultValue: "All" },
    { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
    { key: "thicknessSelect", inputKey: "plate_thickness", defaultValue: "All" },
  ],

  validateInputs: (inputs) => {
    const connectivity = inputs.connectivity;
    
    if (connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web") {
      if (!inputs.beam_section || !inputs.column_section || 
          inputs.beam_section === "Select Section" || 
          inputs.column_section === "Select Section") {
        return { isValid: false, message: UI_STRINGS.PLEASE_INPUT_ALL_FIELDS };
      }
    } else if (connectivity === "Beam-Beam") {
      if (!inputs.primary_beam || !inputs.secondary_beam) {
        return { isValid: false, message: UI_STRINGS.PLEASE_INPUT_ALL_FIELDS };
      }
    }
    
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const conn_map = {
      "Column Flange-Beam-Web": "Column Flange-Beam Web",
      "Column Web-Beam-Web": "Column Web-Beam Web",
      "Beam-Beam": "Beam-Beam",
    };

    const connectivity = extraState?.selectedOption || inputs.connectivity;
    
    if (connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web") {
      return {
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
        "Load.Axial": inputs.load_axial || "",
        "Load.Shear": inputs.load_shear || "",
        "Material": inputs.connector_material,
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": MODULE_KEY_FIN_PLATE,
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? lists.thicknessList : inputs.plate_thickness,
      };
    } else {
      return {
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
        "Load.Axial": inputs.load_axial || "",
        "Load.Shear": inputs.load_shear || "",
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": MODULE_KEY_FIN_PLATE,
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? lists.thicknessList : inputs.plate_thickness,
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
          type: "connectivitySelect"
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
        { key: "load_shear", label: UI_STRINGS.SHEAR_FORCE, type: "number" },
        { key: "load_axial", label: UI_STRINGS.AXIAL_FORCE, type: "number" }
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
            { value: "Bearing_Bolt", label: UI_STRINGS.TYPE + " (Bearing Bolt)" },
            { value: "Friction_Grip_Bolt", label: UI_STRINGS.TYPE + " (Friction Grip Bolt)" }
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
      title: UI_STRINGS.PLATE,
      fields: [
        {
          key: "plate_thickness",
          label: UI_STRINGS.THICKNESS,
          type: "customizable",
          selectionKey: "thicknessSelect",
          modalKey: "plateThickness",
          dataSource: "thicknessList"
        }
      ]
    }
  ]
};