export const coverPlateBoltedConfig = {
  sessionName: "Cover Plate Bolted Connection",
  routePath: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
  designType: "Cover-Plate-Bolted-Connection",
  cameraKey: "CoverPlateBolted",
  cadOptions: ["Model", "Beam", "CoverPlate"],
  
  defaultInputs: {
    bolt_hole_type: "Standard",
    bolt_diameter: [],
    bolt_grade: [],
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Pre-tensioned",
    bolt_type: "Bearing Bolt",
    flange_plate_preferences: "Outside",
    flange_plate_thickness: [],
    connector_material: "E 250 (Fe 410 W)A",
    web_plate_thickness: [],
    design_method: "Limit State Design",
    detailing_corr_status: "No",
    detailing_edge_type: "Sheared or hand flame cut",
    detailing_gap: "3",
    load_axial: "100",
    load_moment: "70",
    load_shear: "50",
    material: "E 250 (Fe 410 W)A",
    member_designation: "MB 300",
    member_material: "E 250 (Fe 410 W)A",
    module: "Cover-Plate-Bolted-Connection",
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
      key: "flangePlateThickness",
      inputKey: "flange_plate_thickness",
      dataSource: "thicknessList",
    },
    {
      key: "webPlateThickness",
      inputKey: "web_plate_thickness",
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
      key: "flangeThicknessSelect",
      inputKey: "flange_plate_thickness",
      defaultValue: "All",
    },
    {
      key: "webThicknessSelect",
      inputKey: "web_plate_thickness",
      defaultValue: "All",
    },
  ],

  validateInputs: (inputs) => {
    if (
      !inputs.member_designation ||
      inputs.member_designation === "Select Section" ||
      inputs.load_shear === ""
    ) {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists) => {
    return {
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
      "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
      "Connector.Flange_Plate.Thickness_list":
        allSelected.flange_plate_thickness
          ? lists.thicknessList
          : inputs.flange_plate_thickness,
      "Connector.Material": inputs.connector_material,
      "Connector.Web_Plate.Thickness_List": allSelected.web_plate_thickness
        ? lists.thicknessList
        : inputs.web_plate_thickness,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Moment": inputs.load_moment || "",
      "Load.Shear": inputs.load_shear || "",
      Material: inputs.material,
      "Member.Designation": inputs.member_designation,
      "Member.Material": inputs.member_material,
      Module: "Cover-Plate-Bolted-Connection",
    };
  },

  inputSections: [
    {
      title: "Connecting Members",
      fields: [
        {
          key: "member_designation",
          label: "Section Designation*",
          type: "select",
          options: "beamList",
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const material = materialList.find((item) => item.id === value);
            setInputs({
              ...inputs,
              material: material.Grade,
              connector_material: material.Grade,
              member_material: material.Grade,
            });
          },
        },
      ],
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_shear", label: "Shear Force(kN)", type: "number" },
        { key: "load_moment", label: "Moment Force(kN)", type: "number" },
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
      title: "Flange Splice Plate",
      fields: [
        {
          key: "flange_plate_preferences",
          label: "Type",
          type: "select",
          options: [
            { value: "Outside", label: "Outside" },
            { value: "Outside + Inside", label: "Outside + Inside" },
          ],
        },
        {
          key: "flange_plate_thickness",
          label: "Thickness(mm)",
          type: "customizable",
          selectionKey: "flangeThicknessSelect",
          modalKey: "flangePlateThickness",
          dataSource: "thicknessList",
        },
      ],
    },
    {
      title: "Web Splice Plate",
      fields: [
        {
          key: "web_plate_thickness",
          label: "Thickness(mm)",
          type: "customizable",
          selectionKey: "webThicknessSelect",
          modalKey: "webPlateThickness",
          dataSource: "thicknessList",
        },
      ],
    },
  ],
};
