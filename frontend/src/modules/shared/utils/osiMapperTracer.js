import { INPUT_KEY_TO_LIST } from "../constants/moduleDataKeys";

/**
 * Utility to extract bidirectional key mappings dynamically for any engineering module config
 * by dry-running buildSubmissionParams with sentinel values.
 */
export function getModuleKeyMap(moduleConfig) {
  if (!moduleConfig || typeof moduleConfig.buildSubmissionParams !== "function") {
    return {};
  }
  const keyMap = {};
  const defaultInputs = moduleConfig.defaultInputs || {};
  const standardInputs = Object.keys(defaultInputs);

  // We run multiple mock sweeps to hit conditional branches and selections across all 22+ modules
  const sweeps = [
    { allSelected: false, boltType: "Bearing_Bolt", weldType: "Fillet", connectivity: "Column Flange-Beam Web" },
    { allSelected: true, boltType: "Friction_Grip_Bolt", weldType: "Groove", connectivity: "Column Web-Beam Web" },
    { allSelected: false, boltType: "Friction_Grip_Bolt", weldType: "Fillet", connectivity: "Beam-Beam" },
    { allSelected: true, boltType: "Bearing_Bolt", weldType: "Groove", connectivity: "Beam-Column" },
  ];

  sweeps.forEach(({ allSelected, boltType, weldType, connectivity }) => {
    const mockInputs = {};
    standardInputs.forEach(key => {
      mockInputs[key] = `__TRACER_VAL__:${key}`;
    });
    // Force specific conditional flag overrides to satisfy path conditions in parameter builders
    if (standardInputs.includes("bolt_type")) mockInputs.bolt_type = boltType;
    if (standardInputs.includes("weld_type")) mockInputs.weld_type = weldType;
    if (standardInputs.includes("connectivity")) mockInputs.connectivity = connectivity;

    const mockAllSelected = {};
    standardInputs.forEach(key => {
      mockAllSelected[key] = allSelected;
    });

    const mockLists = new Proxy({}, {
      get(target, prop) {
        let match = Object.keys(INPUT_KEY_TO_LIST).find(
          (k) => INPUT_KEY_TO_LIST[k] === prop
        );
        if (!match) {
          const possibleKey = prop.replace(/List$/, "").replace(/Select$/, "");
          match = standardInputs.find(k => {
            const normK = k.toLowerCase().replace(/_/g, "");
            const normP = possibleKey.toLowerCase().replace(/_/g, "");
            return normK.includes(normP) || normP.includes(normK);
          }) || possibleKey;
        }
        return [`__TRACER_VAL__:${match}`];
      }
    });

    try {
      const result = moduleConfig.buildSubmissionParams(mockInputs, mockAllSelected, mockLists, {});

      Object.entries(result).forEach(([osiKey, val]) => {
        if (typeof val === "string" && val.startsWith("__TRACER_VAL__:")) {
          const reactKey = val.split(":")[1];
          keyMap[osiKey] = reactKey;
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string" && val[0].startsWith("__TRACER_VAL__:")) {
          const reactKey = val[0].split(":")[1];
          keyMap[osiKey] = reactKey;
        }
      });
    } catch (e) {
      // Gracefully continue to next pass
    }
  });

  // Global baseline aliases for keys not returned by buildSubmissionParams
  const baselineAliases = {
    "Bolt.Bolt_Hole_Type": "bolt_hole_type",
    "Bolt.Diameter": "bolt_diameter",
    "Bolt.Grade": "bolt_grade",
    "Bolt.Slip_Factor": "bolt_slip_factor",
    "Bolt.TensionType": "bolt_tension_type",
    "Bolt.Type": "bolt_type",
    "Connector.Material": "connector_material",
    "Connector.Plate.Thickness_List": "plate_thickness",
    "Connector.Plate.Thickness_list": "plate_thickness",
    "Connector.Flange_Plate.Thickness_list": "flange_plate_thickness",
    "Connector.Flange_Plate.Thickness_List": "flange_plate_thickness",
    "Connector.Web_Plate.Thickness_List": "web_plate_thickness",
    "Connector.Web_Plate.Thickness_list": "web_plate_thickness",
    "Connector.Angle_List": "angle_list",
    "Connector.Top_Angle_List": "topangle_list",
    "Member.Profile": "section_profile",
    "Member.Profile *": "section_profile",
    "Member.Section_Profile": "section_profile",
    "Section.Profile": "section_profile",
    "Section Profile": "section_profile",
    "Section Profile *": "section_profile",
    "Member.End_1": "end_condition_1",
    "Member.End_2": "end_condition_2",
    "Member.End_1_Y": "end_condition_1_y",
    "Member.End_2_Y": "end_condition_2_y",
    "End_1": "end_condition_1",
    "End_2": "end_condition_2",
    "End_1_Y": "end_condition_1_y",
    "End_2_Y": "end_condition_2_y",
    "Actual.Length_zz": "actual_length_zz",
    "Actual.Length_yy": "actual_length_yy",
    "Member.Length_zz": "actual_length_zz",
    "Member.Length_yy": "actual_length_yy",
    "Length_zz": "actual_length_zz",
    "Length_yy": "actual_length_yy",
    "Design.Design_Method": "design_method",
    "Detailing.Corrosive_Influences": "detailing_corr_status",
    "Detailing.Edge_type": "detailing_edge_type",
    "Detailing.Gap": "detailing_gap",
    "Design.For": "design_for",
    "Load.Axial": "load_axial",
    "Load.Axial.Force": "axial_force",
    "Load.Shear.Force": "shear_force",
    "Load.Shear": "load_shear",
    "Material": "material",
    "Plate1Thickness": "plate1_thickness",
    "Plate2Thickness": "plate2_thickness",
    "PlateWidth": "plate_width",
    "Weld.Fab": "weld_fab",
    "Weld.Material_Grade_OverWrite": "weld_material_grade",
    "Weld.Size": "weld_size",
    "Weld.Type": "weld_type"
  };

  return { ...baselineAliases, ...keyMap };
}
