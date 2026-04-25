import { MODULE_KEY_FIN_PLATE } from '../../../constants/DesignKeys';
import { INPUT_KEY_TO_LIST } from '../constants/moduleDataKeys';
import { getModuleConfig, getFinPlateMemberData } from './moduleConfig';

const formatArrayForText = (arr) => {
  if (!arr || arr.length === 0) return '';
  let text = '';
  for (let i = 0; i < arr.length; i++) {
    if (i !== arr.length - 1) text += `- '${arr[i]}'\n`;
    else text += `- '${arr[i]}'`;
  }
  return text;
};

/**
 * Expands inputs for "All" selections using contextData and INPUT_KEY_TO_LIST.
 * @param {Object} baseInputs - Current form inputs
 * @param {Object} allSelected - Map of inputKey -> true when "All" is selected
 * @param {Object} contextData - Module lists (e.g. boltDiameterList, angleList)
 */
export const expandAllSelectedInputs = (baseInputs, allSelected, contextData = {}) => {
  const expanded = { ...baseInputs };
  Object.entries(INPUT_KEY_TO_LIST).forEach(([inputKey, listKey]) => {
    if (allSelected?.[inputKey]) {
      const fullList = Array.isArray(contextData[listKey]) ? contextData[listKey] : [];
      expanded[inputKey] = Array.isArray(fullList)
        ? fullList.map((val) => {
            if (typeof val === 'object' && val !== null) {
              return val.value || val.Grade || String(val);
            }
            return String(val);
          })
        : [];
    }
  });
  return expanded;
};

export const buildOsiContent = ({
  inputs,
  allSelected,
  boltDiameterList,
  propertyClassList,
  thicknessList,
  angleList,
  topAngleList,
  selectedOption,
}) => {
  if (!inputs || typeof inputs !== 'object') {
    return '';
  }

  let content = '';
  const moduleConfig = getModuleConfig(inputs?.module);
  const moduleName = inputs?.module || '';

  // Basic bolt and connector fields with null checks
  content += `Bolt.Bolt_Hole_Type: ${inputs?.bolt_hole_type || ''}\n`;
  content += `Bolt.Diameter:\n${formatArrayForText(
    allSelected?.bolt_diameter ? boltDiameterList : inputs?.bolt_diameter || []
  )}\n`;
  content += `Bolt.Grade:\n${formatArrayForText(
    allSelected?.bolt_grade ? propertyClassList : inputs?.bolt_grade || []
  )}\n`;
  content += `Bolt.Slip_Factor: ${inputs?.bolt_slip_factor || ''}\n`;
  content += `Bolt.TensionType: ${inputs?.bolt_tension_type || ''}\n`;
  content += `Bolt.Type: ${inputs?.bolt_type?.replaceAll('_', ' ') || ''}\n`;

  // Module-specific connectivity handling
  if (moduleName === MODULE_KEY_FIN_PLATE) {
    content += `Connectivity: ${moduleConfig.connectivityMap?.[selectedOption]}\n`;
  } else if (moduleName === 'Beam-to-Beam End Plate Connection') {
    content += `Connectivity *: ${inputs.connectivity}\n`;
    content += `EndPlateType: ${moduleConfig.connectivityMap?.[selectedOption]}\n`;
  }

  content += `Connector.Material: ${inputs?.connector_material || ''}\n`;
  content += `Design.Design_Method: ${inputs?.design_method || ''}\n`;
  content += `Detailing.Corrosive_Influences: ${inputs?.detailing_corr_status || ''}\n`;
  content += `Detailing.Edge_type: ${inputs?.detailing_edge_type || ''}\n`;
  content += `Detailing.Gap: ${inputs?.detailing_gap || ''}\n`;
  content += `Load.Axial: ${inputs?.load_axial || ''}\n`;
  content += `Load.Shear: ${inputs?.load_shear || ''}\n`;

  if (inputs?.load_moment !== undefined) {
    content += `Load.Moment: ${inputs.load_moment || ''}\n`;
  }

  content += `Material: ${inputs?.material || inputs?.connector_material || ''}\n`;
  content += `Module: ${inputs?.module || ''}\n`;

  // Module-specific member designation handling with null checks
  if (moduleName === MODULE_KEY_FIN_PLATE) {
    try {
      const memberData = getFinPlateMemberData(selectedOption, inputs);
      if (memberData) {
        content += `Member.Supported_Section.Designation: ${memberData?.memberSupported || ''}\n`;
        content += `Member.Supported_Section.Material: ${inputs?.supported_material || ''}\n`;
        content += `Member.Supporting_Section.Designation: ${memberData?.memberSupporting || ''}\n`;
        content += `Member.Supporting_Section.Material: ${inputs?.supporting_material || ''}\n`;
      }
    } catch (_) {
      // swallow, keep content best-effort
    }
  } else if (moduleName === 'Beam-to-Beam End Plate Connection') {
    content += `Member.Supported_Section.Designation: ${inputs?.supported_designation || ''}\n`;
    content += `Member.Supported_Section.Material: ${inputs?.supported_material || ''}\n`;
  } else if (moduleName === 'Beam-to-Beam Cover Plate Bolted Connection') {
    content += `Member.Designation: ${inputs?.member_designation || ''}\n`;
    content += `Member.Material: ${inputs?.member_material || ''}\n`;
    content += `Connector.Flange_Plate.Preferences: ${inputs?.flange_plate_preferences || ''}\n`;
  }

  // Weld information (not for cover plate bolted)
  if (moduleName !== 'Beam-to-Beam Cover Plate Bolted Connection') {
    content += `Weld.Fab: ${inputs?.weld_fab || ''}\n`;
    content += `Weld.Material_Grade_OverWrite: ${inputs?.weld_material_grade || ''}\n`;
    if (inputs?.weld_type) {
      content += `Weld.Type: ${inputs.weld_type}\n`;
    }
  }

  // Thickness lists based on module with null checks
  if (inputs?.plate_thickness) {
    content += `Connector.Plate.Thickness_List:\n${formatArrayForText(
      allSelected?.plate_thickness ? thicknessList : inputs.plate_thickness
    )}\n`;
  }
  if (inputs?.flange_plate_thickness) {
    content += `Connector.Flange_Plate.Thickness_list:\n${formatArrayForText(
      allSelected?.flange_plate_thickness ? thicknessList : inputs.flange_plate_thickness
    )}\n`;
  }
  if (inputs?.web_plate_thickness) {
    content += `Connector.Web_Plate.Thickness_List:\n${formatArrayForText(
      allSelected?.web_plate_thickness ? thicknessList : inputs.web_plate_thickness
    )}\n`;
  }
  if (inputs?.angle_list) {
    content += `Connector.Angle_List:\n${formatArrayForText(
      allSelected?.angle_list ? angleList : inputs.angle_list
    )}\n`;
  }
  if (inputs?.topangle_list) {
    content += `Connector.Top_Angle_List:\n${formatArrayForText(
      allSelected?.topangle_list ? (topAngleList || angleList) : inputs.topangle_list
    )}\n`;
  }

  return content;
};

