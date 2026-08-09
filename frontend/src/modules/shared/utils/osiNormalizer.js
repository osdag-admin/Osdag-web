import { getModuleKeyMap } from "./osiMapperTracer";

/**
 * Normalizes flat OSI key-value dictionary into nested JSON format
 * e.g. { inputs: { dock: {...}, pref: {...} } }
 */
export function normalizeOsiPayload(flatObj, moduleConfig = null) {
  if (!flatObj || typeof flatObj !== "object") {
    return { dock: {}, pref: {} };
  }

  // If already nested under dock/pref, return it as-is
  if (flatObj.dock || flatObj.pref) {
    return {
      dock: flatObj.dock || {},
      pref: flatObj.pref || {}
    };
  }
  if (flatObj.inputs && (flatObj.inputs.dock || flatObj.inputs.pref)) {
    return {
      dock: flatObj.inputs.dock || {},
      pref: flatObj.inputs.pref || {}
    };
  }

  const keyMap = getModuleKeyMap(moduleConfig);
  const dock = {};
  const pref = {};

  Object.entries(flatObj).forEach(([key, value]) => {
    // 1. Group Pref. fields
    if (key.startsWith("Pref.")) {
      const prefKey = key.substring(5);
      pref[prefKey] = value;
    }
    // 2. Map via tracer keyMap
    else if (keyMap[key]) {
      dock[keyMap[key]] = value;
    }
    // 3. Fallback: string clean mapping
    else {
      // e.g. "Bolt.Bolt_Hole_Type" -> "bolt_hole_type"
      // Remove common prefix categories
      const cleanKey = key
        .replace(/^(Bolt|Connector|Design|Detailing|Load|Member|Weld)\./, "")
        .replace(/\./g, "_")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase();
      
      // If moduleConfig.defaultInputs has it, map it
      if (moduleConfig?.defaultInputs && cleanKey in moduleConfig.defaultInputs) {
        dock[cleanKey] = value;
      } else {
        dock[cleanKey] = value;
      }
    }
  });

  // Handle Connectivity wildcard mapping
  const connectivity = flatObj["Connectivity *"] || flatObj["Connectivity"];
  if (connectivity) {
    dock.connectivity = String(connectivity).trim();
  }

  // Handle common designation sectional aliases
  const supportingDesc = flatObj["Member.Supporting_Section.Designation"] || flatObj["Supporting_Section.Designation"];
  if (supportingDesc) {
    dock.supporting_designation = supportingDesc;
    dock.column_section = supportingDesc;
    dock.member_designation = supportingDesc;
  }

  const supportedDesc = flatObj["Member.Supported_Section.Designation"] || flatObj["Supported_Section.Designation"];
  if (supportedDesc) {
    dock.supported_designation = supportedDesc;
    dock.beam_section = supportedDesc;
    if (!dock.member_designation) {
      dock.member_designation = supportedDesc;
    }
  }

  // Baseline fallbacks if designation is mapped directly to Designation
  const directDesc = flatObj["Member.Designation"] || flatObj["Designation"];
  if (directDesc) {
    dock.member_designation = directDesc;
  }

  // Handle plate_thickness / thickness list aliases
  if (dock.plate_thickness_list && !dock.plate_thickness) {
    dock.plate_thickness = dock.plate_thickness_list;
  }
  if (dock.flange_plate_thickness_list && !dock.flange_plate_thickness) {
    dock.flange_plate_thickness = dock.flange_plate_thickness_list;
  }
  if (dock.web_plate_thickness_list && !dock.web_plate_thickness) {
    dock.web_plate_thickness = dock.web_plate_thickness_list;
  }
  if (dock.profile && !dock.section_profile) {
    dock.section_profile = dock.profile;
  }
  if (dock.end_1 && !dock.end_condition_1) dock.end_condition_1 = dock.end_1;
  if (dock.end_2 && !dock.end_condition_2) dock.end_condition_2 = dock.end_2;
  if (dock.end_1_y && !dock.end_condition_1_y) dock.end_condition_1_y = dock.end_1_y;
  if (dock.end_2_y && !dock.end_condition_2_y) dock.end_condition_2_y = dock.end_2_y;
  if (dock.load_axial) {
    if (!dock.axial_load) dock.axial_load = dock.load_axial;
    if (!dock.axial_force) dock.axial_force = dock.load_axial;
  }

  const e1 = flatObj["Member.End_1"] || flatObj["End_1"] || flatObj["End 1"];
  if (e1) dock.end_condition_1 = String(e1).trim();
  const e2 = flatObj["Member.End_2"] || flatObj["End_2"] || flatObj["End 2"];
  if (e2) dock.end_condition_2 = String(e2).trim();
  const e1y = flatObj["Member.End_1_Y"] || flatObj["End_1_Y"] || flatObj["End 1 (y-y)"];
  if (e1y) dock.end_condition_1_y = String(e1y).trim();
  const e2y = flatObj["Member.End_2_Y"] || flatObj["End_2_Y"] || flatObj["End 2 (y-y)"];
  if (e2y) dock.end_condition_2_y = String(e2y).trim();

  const memberProfile = flatObj["Member.Profile"] || flatObj["Member.Profile *"] || flatObj["Section Profile"] || flatObj["Section.Profile"];
  if (memberProfile) {
    dock.section_profile = String(memberProfile).trim();
  }

  return { dock, pref };
}
