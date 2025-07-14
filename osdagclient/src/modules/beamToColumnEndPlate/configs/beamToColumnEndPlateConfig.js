export const beamToColumnEndPlateConfig = {
  sessionName: "Beam to Column End Plate Connection",
  routePath: "/design/connections/column-beam/end_plate",
  designType: "Beam-to-Column-End-Plate-Connection",
  cameraKey: "BeamToColumnEndPlate",
  cadOptions: ["Model", "Beam", "Column", "EndPlate"],
  
  defaultInputs: {
    bolt_hole_type: "Standard",
    bolt_diameter: [],
    bolt_grade: [],
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Pre-tensioned",
    bolt_type: "Bearing Bolt",
    connectivity: "Column-Flange-Beam-Web",
    plate_thickness: [],
    connector_material: "E 165 (Fe 290)",
    design_method: "Limit State Design",
    detailing_corr_status: "No",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    load_axial: "0",
    load_moment: "2",
    load_shear: "2",
    material: "E 165 (Fe 290)",
    beam_section: "JB 150",
    column_section: "HB 150",
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    module: "Beam-to-Column End Plate Connection",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    weld_type: "Groove Weld",
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
    if (!inputs.beam_section || 
        inputs.beam_section === "Select Section" || 
        inputs.load_shear === "") {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  },
  buildSubmissionParams: (inputs, allSelected, lists, extraData) => {
    const conn_map = {
      "Extended One-Way": "Extended One-Way",
      "Extended Both Ways": "Extended Both Ways",
      "Flushed - Reversible Moment": "Flushed - Reversible Moment",
    };

    return {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
      "Connectivity": inputs.connectivity,
      EndPlateType: conn_map[extraData?.selectedOption] || "Extended One-Way",
      "Connector.Plate.Thickness_List": allSelected.plate_thickness 
        ? lists.thicknessList : inputs.plate_thickness,
      "Connector.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Moment": inputs.load_moment || "",
      "Load.Shear": inputs.load_shear || "",
      Material: inputs.material,
      "Member.Supported_Section.Designation": inputs.beam_section,
      "Member.Supported_Section.Material": inputs.supported_material,
      "Member.Supporting_Section.Designation": inputs.column_section,
      "Member.Supporting_Section.Material": inputs.supporting_material,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Weld.Type": inputs.weld_type,
      Module: "Beam-to-Column-End-Plate-Connection",
    };
  },
  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "connectivity",
          label: "Connectivity *",
          type: "select",
          options: [
            { value: "Column-Flange-Beam-Web", label: "Column-Flange-Beam-Web" },
            { value: "Column-Web-Beam-Web", label: "Column-Web-Beam-Web" }
          ]
        },
        {
          key: "endPlateType",
          label: "End Plate Type *",
          type: "endPlateSelect"
        },
        {
          key: "column_section",
          label: "Column Section*",
          type: "select",
          options: "columnList",
          required: true
        },
        {
          key: "beam_section",
          label: "Beam Section*",
          type: "select",
          options: "beamList",
          required: true
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find(item => item.id === value);
            setInputs({
              ...inputs,
              material: material.Grade,
              connector_material: material.Grade,
              supported_material: material.Grade,
              supporting_material: material.Grade,
            });
          }
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_shear", label: "Shear Force(kN)", type: "number" },
        { key: "load_moment", label: "Bending Moment (kNm)", type: "number" },
        { key: "load_axial", label: "Axial Force(kN)", type: "number" }
      ]
    },
    {
      title: "Bolt",
      fields: [
        {
          key: "bolt_diameter",
          label: "Diameter(mm)",
          type: "customizable",
          selectionKey: "boltDiameterSelect",
          modalKey: "boltDiameter",
          dataSource: "boltDiameterList"
        },
        {
          key: "bolt_type",
          label: "Type",
          type: "select",
          options: [
            { value: "Bearing_Bolt", label: "Bearing Bolt" },
            { value: "Friction_Grip_Bolt", label: "Friction Grip Bolt" }
          ]
        },
        {
          key: "bolt_grade",
          label: "Property Class",
          type: "customizable",
          selectionKey: "propertyClassSelect",
          modalKey: "propertyClass",
          dataSource: "propertyClassList"
        }
      ]
    },
    {
      title: "End Plate",
      fields: [
        {
          key: "plate_thickness",
          label: "Thickness(mm)",
          type: "customizable",
          selectionKey: "thicknessSelect",
          modalKey: "plateThickness",
          dataSource: "thicknessList"
        }
      ]
    },
    {
      title: "Weld",
      fields: [
        {
          key: "weld_type",
          label: "Type",
          type: "select",
          options: [
            { value: "Groove Weld", label: "Groove Weld" },
            { value: "Fillet Weld", label: "Fillet Weld" }
          ]
        }
      ]
    }
  ]
};
