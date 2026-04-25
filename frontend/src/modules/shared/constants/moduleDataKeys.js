/**
 * Single source of truth for module data list keys and input-key → list-key mapping.
 * Used by useModuleData, contextData, expandAllSelectedInputs, useModuleForm, and InputSection.
 */

export const MODULE_DATA_LIST_KEYS = [
  'beamList',
  'columnList',
  'connectivityList',
  'materialList',
  'boltDiameterList',
  'thicknessList',
  'propertyClassList',
  'angleList',
  'boltTypeList',
  'sectionProfileList',
  'channelList',
  'sectionDesignation',
  'endConditionList',
  'profileList',
  'coverPlateList',
  'weldSizeList',
  'anchorDiameterList',
  'anchorGradeList',
  'footingGradeList',
  'weldTypeList',
  'anchorTypeList',
];

/** camelCase list key → snake_case API response key */
export const API_KEY_MAP = {
  beamList: 'beam_list',
  columnList: 'column_list',
  connectivityList: 'connectivity_list',
  materialList: 'material_list',
  boltDiameterList: 'bolt_diameter_list',
  thicknessList: 'thickness_list',
  propertyClassList: 'property_class_list',
  angleList: 'angle_list',
  boltTypeList: 'bolt_type_list',
  sectionProfileList: 'section_profile_list',
  channelList: 'channel_list',
  sectionDesignation: 'section_designation',
  endConditionList: 'end_condition_list',
  profileList: 'profile_list',
  coverPlateList: 'cover_plate_list',
  weldSizeList: 'weld_size_list',
  anchorDiameterList: 'anchor_diameter_list',
  anchorGradeList: 'anchor_grade_list',
  footingGradeList: 'footing_grade_list',
  weldTypeList: 'weld_type_list',
  anchorTypeList: 'anchor_type_list',
};

/**
 * Maps input keys (form field names) to contextData list keys for "All" expansion and customizable data source.
 */
export const INPUT_KEY_TO_LIST = {
  bolt_diameter: 'boltDiameterList',
  bolt_grade: 'propertyClassList',
  plate_thickness: 'thicknessList',
  flange_plate_thickness: 'thicknessList',
  web_plate_thickness: 'thicknessList',
  angle_list: 'angleList',
  topangle_list: 'angleList',
  cleat_section: 'angleList',
  weld_size: 'weldSizeList',
  member_designation: 'sectionDesignation',
  anchor_diameter_ocf: 'anchorDiameterList',
  anchor_grade_ocf: 'anchorGradeList',
  anchor_diameter_icf: 'anchorDiameterList',
  anchor_grade_icf: 'anchorGradeList',
};
