import { MODULE_KEY_BEAM_BEAM_END_PLATE, MODULE_KEY_BEAM_BEAM_END_PLATE_ALT } from "../../../constants/DesignKeys";

export const beamBeamEndPlateConfig = {
  sessionName: "Beam Beam End Plate Connection",
  routePath: "/design/connections/beam-to-beam-splice/end_plate",
  designType: MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
  cameraKey: MODULE_KEY_BEAM_BEAM_END_PLATE,
  cadOptions: ["Model", "Beam", "EndPlate"],
  
  defaultInputs: {
    bolt_hole_type: "Standard",
    bolt_diameter: [],
    bolt_grade: [],
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Non pre-tensioned",
    bolt_type: "Bearing Bolt",
    connectivity: "Coplanar Tension-Compression Flange",
    plate_thickness: [],
    connector_material: "E 250 (Fe 410 W)A",
    design_method: "Limit State Design",
    detailing_corr_status: "No",
    detailing_edge_type: "Sheared or hand flame cut",
    detailing_gap: "0",
    load_axial: "100",
    load_moment: "100",
    load_shear: "100",
    material: "E 250 (Fe 410 W)A",
    supported_designation: "WPB 900 X 300 X 291.46",
    supported_material: "E 250 (Fe 410 W)A",
    module: MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
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
    if (!inputs.supported_designation || 
        inputs.supported_designation === "Select Section" || 
        inputs.load_shear === "") {
      return { isValid: false, message: "Please input all the fields" };
    }
    return { isValid: true };
  },

  buildSubmissionParams: (inputs, allSelected, lists, extraData) => {
    const conn_map = {
      "Flushed - Reversible Moment": "Flushed - Reversible Moment",
      "Extended One Way - Irreversible Moment": "Extended One Way - Irreversible Moment",
      "Extended Both Ways - Reversible Moment": "Extended Both Ways - Reversible Moment",
    };

    return {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.TensionType": inputs.bolt_tension_type,
      "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
      "Connectivity *": inputs.connectivity,
      "Connectivity": inputs.connectivity,
      EndPlateType: conn_map[extraData?.selectedOption] || "Flushed - Reversible Moment",
      "Connector.Plate.Thickness_List": allSelected.plate_thickness 
        ? lists.thicknessList : inputs.plate_thickness,
      "Connector.Material": inputs.supported_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Moment": inputs.load_moment || "",
      "Load.Shear": inputs.load_shear || "",
      Material: inputs.material,
      "Member.Supported_Section.Designation": inputs.supported_designation,
      "Member.Supported_Section.Material": inputs.supported_material,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Weld.Type": inputs.weld_type,
    Module: MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
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
            { value: "Coplanar Tension-Compression Flange", label: "Coplanner Tension-Compression Flange" },
            { value: "Coplanar Tension Flange", label: "Coplanner Tension Flange", disabled: true },
            { value: "Coplanar Compression Flange", label: "Coplanner Compression Flange", disabled: true }
          ]
        },
        {
          key: "endPlateType",
          label: "End Plate Type *",
          type: "endPlateSelect"
        },
        {
          key: "supported_designation",
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
            { value: "Bearing Bolt", label: "Bearing Bolt" },
            { value: "Friction Grip Bolt", label: "Friction Grip Bolt" }
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
            { value: "Groove Weld", label: "Groove Weld" }
          ]
        }
      ]
    }
  ]
};