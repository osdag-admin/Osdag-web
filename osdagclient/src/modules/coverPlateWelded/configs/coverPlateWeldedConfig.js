export const coverPlateWeldedConfig = {
  sessionName: "Cover Plate Welded Connection",
  routePath: "/design/connections/beam-to-beam-splice/cover_plate_welded",
  designType: "Cover-Plate-Welded-Connection",
  cameraKey: "CoverPlateWelded",
  cadOptions: ["Model", "Beam", "CoverPlate"],
  
  defaultInputs: {
    flange_plate_preferences: "Outside",
    flange_plate_thickness: [],
    connector_material: "E 165 (Fe 290)",
    web_plate_thickness: [],
    design_method: "Limit State Design",
    detailing_gap: "3",
    load_axial: "100",
    load_moment: "100",
    load_shear: "100",
    material: "E 165 (Fe 290)",
    member_designation: "MB 600",
    member_material: "E 165 (Fe 290)",
    module: "Cover-Plate-Welded-Connection",
    weld_fab: "Shop Weld",
    weld_material_grade_overwrite: "290",
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

  validateInputs: (inputs) => {
    if (!inputs.member_designation || 
        inputs.member_designation === "Select Section" || 
        inputs.load_shear === "") {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  },
  buildSubmissionParams: (inputs, allSelected, lists) => {
    return {
      "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
      "Connector.Flange_Plate.Thickness_list": allSelected.flange_plate_thickness 
        ? lists.thicknessList : inputs.flange_plate_thickness,
      "Connector.Material": inputs.connector_material,
      "Connector.Web_Plate.Thickness_List": allSelected.web_plate_thickness 
        ? lists.thicknessList : inputs.web_plate_thickness,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "0",
      "Load.Moment": inputs.load_moment || "0", 
      "Load.Shear": inputs.load_shear || "0",
      "Material": inputs.material,
      "Member.Designation": inputs.member_designation,
      "Member.Material": inputs.member_material,
      "Module": "Cover-Plate-Welded-Connection",
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade_overwrite,
      "Weld.Type": inputs.weld_type,
      "out_titles_status": [1, 1, 1, 1, 0]
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
              member_material: material.Grade,
            });
          }
        }
      ]
    },
    {
      title: "Factored Loads",
      fields: [
        { key: "load_shear", label: "Shear Force(kN)", type: "number" },
        { key: "load_moment", label: "Moment Force(kN)", type: "number" },
        { key: "load_axial", label: "Axial Force(kN)", type: "number" }
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
        },
        {
          key: "weld_fab",
          label: "Fabrication",
          type: "select",
          options: [
            { value: "Shop Weld", label: "Shop Weld" },
            { value: "Field Weld", label: "Field Weld" }
          ]
        },
        {
          key: "weld_material_grade_overwrite",
          label: "Material Grade Overwrite",
          type: "number"
        }
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
    }
  ]
};
