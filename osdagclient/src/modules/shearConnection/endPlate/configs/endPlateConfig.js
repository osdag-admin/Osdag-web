export const endPlateConfig = {
  sessionName: "End Plate Connection",
  routePath: "/design/connections/shear/end_plate",
  designType: "End-Plate-Connection",
  cameraKey: "EndPlate",

  defaultInputs: {
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "20",
    load_axial: "10",
    connectivity: "Column Flange-Beam-Web",
    plate_thickness: [],
    beam_section: "MB 300",
    column_section: "HB 150",
    primary_beam: "MB 300",
    secondary_beam: "MB 300",
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
    module: "End Plate Connection",
  },

  modalConfig: [
    {
      key: "boltDiameter",
      inputKey: "bolt_diameter",
      dataSource: "boltDiameterList",
    },
    {
      key: "propertyClass",
      inputKey: "bolt_grade",
      dataSource: "propertyClassList",
    },
    {
      key: "plateThickness",
      inputKey: "plate_thickness",
      dataSource: "thicknessList",
    },
  ],

  selectionConfig: [
    {
      key: "boltDiameterSelect",
      inputKey: "bolt_diameter",
      defaultValue: "All",
    },
    { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
    {
      key: "thicknessSelect",
      inputKey: "plate_thickness",
      defaultValue: "All",
    },
  ],

  validateInputs: (inputs, extraState) => {
    const connectivity = extraState?.selectedOption || inputs.connectivity;
    
    if (connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web") {
      if (
        !inputs.beam_section ||
        !inputs.column_section ||
        inputs.beam_section === "Select Section" ||
        inputs.column_section === "Select Section" ||
        inputs.beam_section === "" ||
        inputs.column_section === ""
      ) {
        return { isValid: false, message: "Please select all sections from the dropdown lists" };
      }
    } else if (connectivity === "Beam-Beam") {
      if (!inputs.primary_beam || !inputs.secondary_beam || 
          inputs.primary_beam === "" || inputs.secondary_beam === "") {
        return { isValid: false, message: "Please select all beam sections from the dropdown lists" };
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
    
    const connectivity = extraState?.selectedOption || inputs.connectivity || "Column Flange-Beam-Web";
    
    console.log("End Plate - buildSubmissionParams inputs:", inputs);
    console.log("End Plate - connectivity:", connectivity);
    console.log("End Plate - extraState:", extraState);
    console.log("End Plate - allSelected:", allSelected);
    console.log("End Plate - lists:", lists);
    
    const params = {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter
        ? lists.boltDiameterList
        : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade
        ? lists.propertyClassList
        : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
      "Connectivity": conn_map[connectivity] || connectivity,
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
      "Module": "End-Plate-Connection",
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Connector.Plate.Thickness_List": allSelected.plate_thickness
        ? lists.thicknessList
        : inputs.plate_thickness,
    };
    
    console.log("End Plate - Final submission params:", params);
    return params;
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "connectivity",
          label: "Connectivity",
          type: "connectivitySelect"
        },
        {
          key: "primary_beam",
          label: "Primary Beam*",
          type: "select",
          options: "beamList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Beam-Beam";
          }
        },
        {
          key: "secondary_beam",
          label: "Secondary Beam*",
          type: "select",
          options: "beamList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Beam-Beam";
          }
        },
        {
          key: "column_section",
          label: "Column Section*",
          type: "select",
          options: "columnList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web";
          }
        },
        {
          key: "beam_section",
          label: "Beam Section*",
          type: "select",
          options: "beamList",
          conditionalDisplay: (extraState) => {
            const connectivity = extraState?.selectedOption;
            return connectivity === "Column Flange-Beam-Web" || connectivity === "Column Web-Beam-Web";
          }
        },
        {
          key: "connector_material",
          label: "Material",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList, setShowModal) => {
            if (value == -1) {
              setShowModal(true);
              return;
            }
            const material = materialList.find((item) => item.id === value);
            console.log(material);
            setInputs({
              ...inputs,
              connector_material: material.Grade,
            });
          },
        },
      ],
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_shear", label: "Shear Force(kN)", type: "number" },
        { key: "load_axial", label: "Axial Force(kN)", type: "number" },
      ],
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
          dataSource: "boltDiameterList",
        },
        {
          key: "bolt_type",
          label: "Type",
          type: "select",
          options: [
            { value: "Bearing_Bolt", label: "Bearing Bolt" },
            { value: "Friction_Grip_Bolt", label: "Friction Grip Bolt" },
          ],
        },
        {
          key: "bolt_grade",
          label: "Property Class",
          type: "customizable",
          selectionKey: "propertyClassSelect",
          modalKey: "propertyClass",
          dataSource: "propertyClassList",
        },
      ],
    },
    {
      title: "Plate",
      fields: [
        {
          key: "plate_thickness",
          label: "Thickness(mm)",
          type: "customizable",
          selectionKey: "thicknessSelect",
          modalKey: "plateThickness",
          dataSource: "thicknessList",
        },
      ],
    },
  ],
};
