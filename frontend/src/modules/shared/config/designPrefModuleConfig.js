/**
 * Per-module config for Design Prefs (Additional Inputs) modal: tabs, initial tab, initial prefs, default prefs.
 * Keyed by module session name (e.g. "Butt Joint Bolted", "Fin Plate Connection").
 * Tab ids: 0 Column Section*, 1 Beam Section*, 2 Connector, 3 Bolt, 4 Weld, 5 Detailing, 6 Design.
 */

const ALL_TABS = [
  { id: 0, name: "Column Section*" },
  { id: 1, name: "Beam Section*" },
  { id: 2, name: "Connector" },
  { id: 3, name: "Bolt" },
  { id: 4, name: "Weld" },
  { id: 5, name: "Detailing" },
  { id: 6, name: "Design" },
];

const DEFAULT_INITIAL_PREFS = (inputs) => ({
  supported_material: inputs.supported_material,
  supporting_material: inputs.supporting_material,
  connector_material: inputs.connector_material,
  bolt_tension_type: inputs.bolt_tension_type,
  bolt_hole_type: inputs.bolt_hole_type,
  bolt_slip_factor: inputs.bolt_slip_factor,
  weld_fab: inputs.weld_fab,
  weld_material_grade: inputs.weld_material_grade,
  detailing_edge_type: inputs.detailing_edge_type,
  detailing_gap: inputs.detailing_gap,
  detailing_corr_status: inputs.detailing_corr_status,
  design_method: inputs.design_method,
  design_for: inputs.design_for,
});

const DESIGN_PREF_CONFIG = {
  "Butt Joint Bolted": {
    tabIds: [3, 5],
    initialTabIndex: 3,
    getInitialPrefs: (inputs) => ({
      bolt_tension_type: inputs.bolt_tension_type || "Non Pre-tensioned",
      bolt_hole_type: inputs.bolt_hole_type || "Standard",
      bolt_slip_factor: inputs.bolt_slip_factor || "0.3",
      detailing_edge_type: inputs.detailing_edge_type || "Sheared or hand flame cut",
      design_for: inputs.design_for || "Tension",
    }),
    getDefaultPrefs: () => ({
      bolt_tension_type: "Non Pre-tensioned",
      bolt_hole_type: "Standard",
      bolt_slip_factor: "0.3",
      detailing_edge_type: "Sheared or hand flame cut",
      design_for: "Tension",
    }),
  },
  "Lap Joint Bolted": {
    tabIds: [3, 5],
    initialTabIndex: 3,
    getInitialPrefs: (inputs) => ({
      bolt_tension_type: inputs.bolt_tension_type || "Non Pre-tensioned",
      bolt_hole_type: inputs.bolt_hole_type || "Standard",
      bolt_slip_factor: inputs.bolt_slip_factor || "0.3",
      detailing_edge_type: inputs.detailing_edge_type || "Sheared or hand flame cut",
      design_for: inputs.design_for || "Tension",
    }),
    getDefaultPrefs: () => ({
      bolt_tension_type: "Non Pre-tensioned",
      bolt_hole_type: "Standard",
      bolt_slip_factor: "0.3",
      detailing_edge_type: "Sheared or hand flame cut",
      design_for: "Tension",
    }),
  },
  "Butt Joint Welded": {
    tabIds: [4, 5],
    initialTabIndex: 4,
    getInitialPrefs: (inputs) => ({
      weld_fab: inputs.weld_fab || "Shop weld",
      weld_material_grade: inputs.weld_material_grade || "",
      detailing_edge_type: inputs.detailing_edge_type || "Sheared or hand flame cut",
      detailing_packing_plate: inputs.detailing_packing_plate || "No",
      design_for: inputs.design_for || "Tension",
    }),
    getDefaultPrefs: (inputs) => {
      const defs = {
        weld_fab: "Shop weld",
        weld_material_grade: inputs.weld_material_grade || "",
        detailing_edge_type: "Sheared or hand flame cut",
        design_for: "Tension",
      };
      defs.detailing_packing_plate = "Yes";
      return defs;
    },
  },
  "Lap Joint Welded": {
    tabIds: [4, 5],
    initialTabIndex: 4,
    getInitialPrefs: (inputs) => ({
      weld_fab: inputs.weld_fab || "Shop weld",
      weld_material_grade: inputs.weld_material_grade || "",
      detailing_edge_type: inputs.detailing_edge_type || "Sheared or hand flame cut",
      detailing_packing_plate: inputs.detailing_packing_plate,
      design_for: inputs.design_for || "Tension",
    }),
    getDefaultPrefs: (inputs) => {
      const defs = {
        weld_fab: "Shop weld",
        weld_material_grade: inputs.weld_material_grade || "",
        detailing_edge_type: "Sheared or hand flame cut",
        design_for: "Tension",
      };
      return defs;
    },
  },
  "Cover Plate Bolted Connection": {
    tabIds: [1, 2, 3, 5, 6],
    initialTabIndex: 1,
    getInitialPrefs: (inputs) => ({
      supported_material: inputs.member_material,
      connector_material: inputs.connector_material,
      bolt_tension_type: inputs.bolt_tension_type,
      bolt_hole_type: inputs.bolt_hole_type,
      bolt_slip_factor: inputs.bolt_slip_factor,
      detailing_edge_type: inputs.detailing_edge_type,
      detailing_gap: inputs.detailing_gap,
      detailing_corr_status: inputs.detailing_corr_status,
      design_method: inputs.design_method,
    }),
    getDefaultPrefs: (_inputs, _module, contextDefaults) => contextDefaults || {},
  },
  "Beam Beam End Plate Connection": {
    tabIds: [1, 2, 3, 4, 5, 6],
    initialTabIndex: 1,
    getInitialPrefs: (inputs) => ({
      supported_material: inputs.supported_material,
      connector_material: inputs.connector_material,
      bolt_tension_type: inputs.bolt_tension_type,
      bolt_hole_type: inputs.bolt_hole_type,
      bolt_slip_factor: inputs.bolt_slip_factor,
      weld_fab: inputs.weld_fab,
      weld_material_grade: inputs.weld_material_grade,
      detailing_edge_type: inputs.detailing_edge_type,
      detailing_gap: inputs.detailing_gap,
      detailing_corr_status: inputs.detailing_corr_status,
      design_method: inputs.design_method,
    }),
    getDefaultPrefs: (_inputs, _module, contextDefaults) => contextDefaults || {},
  },
};

const DEFAULT_CONFIG = {
  tabIds: [0, 1, 2, 3, 4, 5, 6],
  initialTabIndex: 0,
  getInitialPrefs: (inputs) => DEFAULT_INITIAL_PREFS(inputs),
  getDefaultPrefs: (_inputs, _module, contextDefaults) => contextDefaults || {},
};

/**
 * @param {string} module - Module session name (e.g. "Butt Joint Bolted", "Fin Plate Connection")
 * @returns Config with tabIds, initialTabIndex, getInitialPrefs, getDefaultPrefs
 */
export function getDesignPrefConfig(module) {
  return DESIGN_PREF_CONFIG[module] || DEFAULT_CONFIG;
}

export function getDesignPrefTabs(module) {
  const config = getDesignPrefConfig(module);
  return ALL_TABS.filter((tab) => config.tabIds.includes(tab.id));
}
