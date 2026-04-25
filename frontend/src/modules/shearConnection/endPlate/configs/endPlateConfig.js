import { MODULE_KEY_END_PLATE, MODULE_DISPLAY_END_PLATE } from "../../../../constants/DesignKeys";

export const endPlateConfig = {
  sessionName: MODULE_DISPLAY_END_PLATE,
  routePath: "/design/connections/shear/end_plate",
  designType: MODULE_KEY_END_PLATE,
  cameraKey: MODULE_KEY_END_PLATE,
  cadOptions: ["Model", "Beam", "Column", "Plate"],

  // IMPROVEMENT: Removed hardcoded defaults for API-driven lists (e.g., beam_section).
  // Defaults should be set dynamically after fetching data to prevent mismatches.
  defaultInputs: {
    connectivity: "Column Flange-Beam-Web",
    column_section: "", // Set to empty string, to be populated from list
    beam_section: "",   // Set to empty string, to be populated from list
    primary_beam: "",   // Set to empty string, to be populated from list
    secondary_beam: "", // Set to empty string, to be populated from list
    bolt_type: "Bearing Bolt", // Default to a clean value from the new list

    // Default selections for customizable fields
    bolt_diameter: [],
    bolt_grade: [],
    plate_thickness: [],

    // Static defaults
    load_shear: "20",
    load_axial: "10",
    connector_material: "E 250 (Fe 410 W)A",
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
    
    bolt_tension_type: "Pre-tensioned",
    module: MODULE_KEY_END_PLATE,
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

  validateInputs: (inputs, extraState) => {
    const connectivity = extraState?.selectedOption || inputs.connectivity;
    // IMPROVEMENT: Simplified validation logic for conciseness.
    if (connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web") {
      if (!inputs.beam_section || !inputs.column_section) {
        return { isValid: false, message: "Please select all required sections." };
      }
    } else if (connectivity === "Beam-Beam") {
      if (!inputs.primary_beam || !inputs.secondary_beam) {
        return { isValid: false, message: "Please select both primary and secondary beam sections." };
      }
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    // Ensure plate thickness list is always List[str]
    const toStrList = (arr = []) => (Array.isArray(arr) ? arr.map((v) => `${v}`) : []);
    const plateList = allSelected.plate_thickness
      ? toStrList(lists.thicknessList)
      : toStrList(inputs.plate_thickness);

    const conn_map = {
      "Column Flange-Beam-Web": "Column Flange-Beam Web",
      "Column Web-Beam-Web": "Column Web-Beam Web",
      "Beam-Beam": "Beam-Beam",
    };
    const connectivity = extraState?.selectedOption || inputs.connectivity;
    const params = {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type, // No need for replaceAll now
      "Connectivity": conn_map[connectivity],
      "Connector.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Shear": inputs.load_shear || "",
      "Material": inputs.connector_material,
      "Member.Supported_Section.Designation": connectivity === "Beam-Beam" ? inputs.secondary_beam : inputs.beam_section,
      "Member.Supported_Section.Material": inputs.supported_material,
      "Member.Supporting_Section.Designation": connectivity === "Beam-Beam" ? inputs.primary_beam : inputs.column_section,
      "Member.Supporting_Section.Material": inputs.supporting_material,
      "Module": MODULE_KEY_END_PLATE,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Connector.Plate.Thickness_List": plateList,
    };
    return params;
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        { key: "connectivity", label: "Connectivity", type: "connectivitySelect", options: "connectivityList" },
        { key: "primary_beam", label: "Primary Beam*", type: "select", options: "beamList", conditionalDisplay: (extraState) => extraState?.selectedOption === "Beam-Beam" },
        { key: "secondary_beam", label: "Secondary Beam*", type: "select", options: "beamList", conditionalDisplay: (extraState) => extraState?.selectedOption === "Beam-Beam" },
        { key: "column_section", label: "Column Section*", type: "select", options: "columnList", conditionalDisplay: (extraState) => ["Column Flange-Beam-Web", "Column Web-Beam-Web"].includes(extraState?.selectedOption) },
        { key: "beam_section", label: "Beam Section*", type: "select", options: "beamList", conditionalDisplay: (extraState) => ["Column Flange-Beam-Web", "Column Web-Beam-Web"].includes(extraState?.selectedOption) },
        {
          key: "connector_material", label: "Material", type: "select", options: "materialList",
          onChange: (value, inputs, setInputs, materialList, setShowModal) => {
            if (value == -1) {
              setShowModal(true);
              return;
            }
            const material = materialList.find((item) => item.id === value);
            if (material) {
              setInputs({ ...inputs, connector_material: material.Grade });
            }
          },
        },
      ],
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_shear", label: "Shear Force (kN)", type: "number" },
        { key: "load_axial", label: "Axial Force (kN)", type: "number" },
      ],
    },
    {
      title: "Bolt",
      fields: [
        { key: "bolt_diameter", label: "Diameter (mm)", type: "customizable", selectionKey: "boltDiameterSelect", modalKey: "boltDiameter", dataSource: "boltDiameterList" },
        {
          // Use API data for bolt types
          key: "bolt_type",
          label: "Type",
          type: "select",
          options: "boltTypeList",
        },
        { key: "bolt_grade", label: "Property Class", type: "customizable", selectionKey: "propertyClassSelect", modalKey: "propertyClass", dataSource: "propertyClassList" },
      ],
    },
    {
      title: "Plate",
      fields: [
        { key: "plate_thickness", label: "Thickness (mm)", type: "customizable", selectionKey: "thicknessSelect", modalKey: "plateThickness", dataSource: "thicknessList" },
      ],
    },
  ],
};