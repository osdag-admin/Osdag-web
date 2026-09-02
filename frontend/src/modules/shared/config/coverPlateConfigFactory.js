import { validateRequiredFields } from '../utils/validation';

// Shared shape for coverPlateBolted / columnColumnCoverPlateBolted, which were
// identical except for ~8 values (session/route/designType strings, cadOptions'
// member label, default loads, and the section-options list key).
export function makeCoverPlateBoltedConfig({
  sessionName,
  routePath,
  designType,
  cadOptions,
  sectionOptionsKey,
  defaultLoads,
}) {
  const config = {
    sessionName,
    routePath,
    designType,
    cameraKey: "CoverPlateBolted",
    cadOptions,

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
      load_axial: defaultLoads.axial,
      load_moment: defaultLoads.moment,
      load_shear: defaultLoads.shear,
      material: "E 250 (Fe 410 W)A",
      member_designation: "MB 300",
      member_material: "E 250 (Fe 410 W)A",
      module: designType,
    },

    modalConfig: [
      { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
      { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
      { key: "flangePlateThickness", inputKey: "flange_plate_thickness", dataSource: "thicknessList" },
      { key: "webPlateThickness", inputKey: "web_plate_thickness", dataSource: "thicknessList" },
    ],

    selectionConfig: [
      { key: "boltDiameterSelect", inputKey: "bolt_diameter", defaultValue: "All" },
      { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },
      { key: "flangeThicknessSelect", inputKey: "flange_plate_thickness", defaultValue: "All" },
      { key: "webThicknessSelect", inputKey: "web_plate_thickness", defaultValue: "All" },
    ],

    buildSubmissionParams: (inputs, allSelected, lists) => ({
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
      "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
      "Connector.Flange_Plate.Thickness_list": allSelected.flange_plate_thickness
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
      Module: designType,
    }),

    inputSections: [
      {
        title: "Connecting Members",
        fields: [
          {
            key: "member_designation",
            label: "Section Designation",
            type: "select",
            options: sectionOptionsKey,
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
          { key: "load_shear", label: "Shear Force(kN)", type: "number", required: true },
          { key: "load_moment", label: "Moment Force(kN)", type: "number", required: true },
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

  config.validateInputs = (inputs, extraState, _lists, selectionStates) => {
    const requiredCheck = validateRequiredFields(config.inputSections, inputs, extraState, selectionStates);
    if (!requiredCheck.isValid) return requiredCheck;

    if (
      !inputs.member_designation ||
      inputs.member_designation === "Select Section" ||
      inputs.load_shear === ""
    ) {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  };

  return config;
}

// Shared shape for coverPlateWelded / columnColumnCoverPlateWelded. These two
// diverge slightly more than the bolted pair: the column variant sources
// "Member.Material" from a different input field and sends 2 extra submission
// params (flangespace/type) that the beam variant doesn't — both preserved
// exactly via memberMaterialField / extraSubmissionParams rather than unified,
// since this refactor is a pure dedup, not a behavior fix.
export function makeCoverPlateWeldedConfig({
  sessionName,
  routePath,
  designType,
  cadOptions,
  sectionOptionsKey,
  defaultLoads,
  memberMaterialField,
  extraSubmissionParams = {},
}) {
  const config = {
    sessionName,
    routePath,
    designType,
    cameraKey: "CoverPlateWelded",
    cadOptions,

    defaultInputs: {
      flange_plate_preferences: "Outside",
      flange_plate_thickness: [],
      connector_material: "E 165 (Fe 290)",
      web_plate_thickness: [],
      design_method: "Limit State Design",
      detailing_gap: "3",
      detailing_edge_type: "Sheared or hand flame cut",
      detailing_corr_status: "No",
      load_axial: defaultLoads.axial,
      load_moment: defaultLoads.moment,
      load_shear: defaultLoads.shear,
      material: "E 165 (Fe 290)",
      member_designation: "MB 600",
      member_material: "E 165 (Fe 290)",
      module: designType,
      weld_fab: "Shop Weld",
      weld_material_grade: "290",
      weld_type: "Fillet Weld",
    },

    modalConfig: [
      { key: "flangePlateThickness", inputKey: "flange_plate_thickness", dataSource: "thicknessList" },
      { key: "webPlateThickness", inputKey: "web_plate_thickness", dataSource: "thicknessList" },
    ],

    selectionConfig: [
      { key: "flangeThicknessSelect", inputKey: "flange_plate_thickness", defaultValue: "All" },
      { key: "webThicknessSelect", inputKey: "web_plate_thickness", defaultValue: "All" },
    ],

    buildSubmissionParams: (inputs, allSelected, lists) => ({
      "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
      "Connector.Flange_Plate.Thickness_list": allSelected.flange_plate_thickness
        ? lists.thicknessList : inputs.flange_plate_thickness,
      "Connector.Material": inputs.connector_material,
      "Connector.Web_Plate.Thickness_List": allSelected.web_plate_thickness
        ? lists.thicknessList : inputs.web_plate_thickness,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "0",
      "Load.Moment": inputs.load_moment || "0",
      "Load.Shear": inputs.load_shear || "0",
      "Material": inputs.material,
      "Member.Designation": inputs.member_designation,
      "Member.Material": inputs[memberMaterialField],
      "Module": designType,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade || "290",
      "Weld.Type": inputs.weld_type,
      "out_titles_status": [1, 1, 1, 1, 0],
      ...extraSubmissionParams,
    }),

    inputSections: [
      {
        title: "Connecting Members",
        fields: [
          {
            key: "member_designation",
            label: "Section Designation",
            type: "select",
            options: sectionOptionsKey,
            required: true,
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
                member_material: material.Grade,
              });
            }
          }
        ]
      },
      {
        title: "Factored Loads",
        fields: [
          { key: "load_shear", label: "Shear Force(kN)", type: "number", required: true },
          { key: "load_moment", label: "Moment Force(kN)", type: "number", required: true },
          { key: "load_axial", label: "Axial Force(kN)", type: "number" }
        ]
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
              { value: "Outside + Inside", label: "Outside + Inside" }
            ]
          },
          {
            key: "flange_plate_thickness",
            label: "Thickness(mm)",
            type: "customizable",
            selectionKey: "flangeThicknessSelect",
            modalKey: "flangePlateThickness",
            dataSource: "thicknessList"
          }
        ]
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
              { value: "Fillet Weld", label: "Fillet Weld" }
            ]
          }
        ]
      }
    ],
  };

  config.validateInputs = (inputs, extraState, _lists, selectionStates) => {
    const requiredCheck = validateRequiredFields(config.inputSections, inputs, extraState, selectionStates);
    if (!requiredCheck.isValid) return requiredCheck;

    if (!inputs.member_designation ||
        inputs.member_designation === "Select Section" ||
        inputs.load_shear === "") {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  };

  return config;
}
