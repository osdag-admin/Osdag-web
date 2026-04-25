import { MODULE_KEY_FIN_PLATE } from '../../../constants/DesignKeys';

// Centralized module-specific configurations previously in UnifiedDropdownMenu.
export const MODULE_CONFIGS = {
  [MODULE_KEY_FIN_PLATE]: {
    connectivityField: 'Connectivity',
    connectivityMap: {
      'Column Flange-Beam-Web': 'Column Flange-Beam Web',
      'Column Web-Beam-Web': 'Column Web-Beam Web',
      'Beam-Beam': 'Beam-Beam',
    },
    connectivityMapInverse: {
      'Column Flange-Beam Web': 'Column Flange-Beam-Web',
      'Column Web-Beam Web': 'Column Web-Beam-Web',
      'Beam-Beam': 'Beam-Beam',
    },
    fields: {
      memberSupported: 'Member.Supported_Section.Designation',
      memberSupporting: 'Member.Supporting_Section.Designation',
      plateThickness: 'Connector.Plate.Thickness_List',
      angleList: 'Connector.Angle_List',
      topAngleList: 'Connector.Top_Angle_List',
    },
  },
  'Beam-to-Beam End Plate Connection': {
    connectivityField: 'Connectivity',
    endPlateField: 'EndPlateType',
    connectivityMap: {
      'Flushed - Reversible Moment': 'Flushed - Reversible Moment',
      'Extended One Way - Irreversible Moment': 'Extended One Way - Irreversible Moment',
      'Extended Both Ways - Reversible Moment': 'Extended Both Ways - Reversible Moment',
    },
    fields: {
      memberDesignation: 'Member.Supported_Section.Designation',
      memberMaterial: 'Member.Supported_Section.Material',
      plateThickness: 'Connector.Plate.Thickness_List',
      weldFab: 'Weld.Fab',
      weldMaterial: 'Weld.Material_Grade_OverWrite',
      weldType: 'Weld.Type',
    },
  },
  'Beam-to-Beam Cover Plate Bolted Connection': {
    fields: {
      memberDesignation: 'Member.Designation',
      memberMaterial: 'Member.Material',
      flangePreferences: 'Connector.Flange_Plate.Preferences',
      flangePlateThickness: 'Connector.Flange_Plate.Thickness_list',
      webPlateThickness: 'Connector.Web_Plate.Thickness_List',
    },
  },
};

export const getModuleConfig = (moduleName) => MODULE_CONFIGS[moduleName] || {};

// Helper for Fin Plate memberSupported/memberSupporting resolution.
export const getFinPlateMemberData = (selectedOption, inputs) => {
  const config = MODULE_CONFIGS[MODULE_KEY_FIN_PLATE];
  if (!config || !config.connectivityMap[selectedOption]) return null;

  const connectivity = config.connectivityMap[selectedOption];
  if (connectivity === 'Column Flange-Beam Web' || connectivity === 'Column Web-Beam Web') {
    return {
      memberSupported: inputs.beam_section,
      memberSupporting: inputs.column_section,
    };
  }

  return {
    memberSupported: inputs.secondary_beam,
    memberSupporting: inputs.primary_beam,
  };
};

