/**
 * Per-module config for Design Prefs (Additional Inputs) modal: tabs, initial tab, initial prefs, default prefs.
 * Keyed by module session name (e.g. "Butt Joint Bolted", "Fin Plate Connection").
 * Tab ids: 0 Column Section*, 1 Beam Section*, 2 Connector, 3 Bolt, 4 Weld, 5 Detailing, 6 Design.
 */

const ALL_TABS = [
  { id: 0, name: "Column Section*" },
  { id: 1, name: "Beam Section*" },
  { id: 2, name: "Angle Section" },
  { id: 3, name: "Connector" },
  { id: 4, name: "Cleat Angle" },
  { id: 5, name: "Seated Angle Connection" },
  { id: 6, name: "Bolt" },
  { id: 7, name: "Base Plate" },
  { id: 8, name: "Stiffener/Shear Key" },
  { id: 9, name: "Anchor Bolt" },
  { id: 10, name: "Weld" },
  { id: 11, name: "Detailing" },
  { id: 12, name: "Optimization" },
  { id: 13, name: "Design" },
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
    tabIds: [6, 11],
    initialTabIndex: 6,
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
    tabIds: [6, 11],
    initialTabIndex: 6,
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
    tabIds: [10, 11],
    initialTabIndex: 10,
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
    tabIds: [10, 11],
    initialTabIndex: 10,
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
  "Column Cover Plate Bolted Connection": {
    tabIds: [0, 3, 6, 11, 13],
    initialTabIndex: 0,
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
  "Beam Cover Plate Bolted Connection": {
    tabIds: [1, 3, 6, 11, 13],
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
  "Column Cover Plate Welded Connection": {
    tabIds: [0, 3, 10, 11, 13],
    initialTabIndex: 0,
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
  "Beam Cover Plate Welded Connection": {
    tabIds: [1, 3, 10, 11, 13],
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
  "Column Column End Plate Connection": {
    tabIds: [0, 3, 6, 10, 11, 13],
    initialTabIndex: 0,
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
    tabIds: [1, 3, 6, 10, 11, 13],
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
  "Beam to Column End Plate Connection": {
    tabIds: [0, 1, 3, 6, 10, 11, 13],
    initialTabIndex: 0,
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
  "Base Plate":{
    tabIds: [0, 7, 8, 9, 10, 11, 13],
    initialTabIndex: 0,
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
  "CleatAngleConnection":{
    tabIds: [0, 1, 4, 6, 11, 13],
    initialTabIndex: 0,
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
  "Tension Member Bolted Design":{
    tabIds: [2, 3, 6, 11, 13],
    initialTabIndex: 2,
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
  "Tension Member Welded Design":{
    tabIds: [2, 3, 10, 11, 13],
    initialTabIndex: 2,
    getInitialPrefs: (inputs) => ({
      supported_material: inputs.member_material,
      connector_material: inputs.connector_material,
      weld_fab: inputs.weld_fab,
      weld_material_grade: inputs.weld_material_grade,
      detailing_edge_type: inputs.detailing_edge_type,
      detailing_gap: inputs.detailing_gap,
      detailing_corr_status: inputs.detailing_corr_status,
      design_method: inputs.design_method,
    }),
    getDefaultPrefs: (_inputs, _module, contextDefaults) => contextDefaults || {},
  },
  "Axially Loaded Column": {
    tabIds: [0, 12, 13],
    initialTabIndex: 0,
    getInitialPrefs: (inputs) => ({
      supported_material: inputs.member_material,
      connector_material: inputs.connector_material,
      design_method: inputs.design_method,
      allow_ur: inputs.allow_ur,
      effective_area_parameter: inputs.effective_area_parameter,
    }),
    getDefaultPrefs: (_inputs, _module, contextDefaults) => contextDefaults || {},
  },
  "Struts Bolted to End Gusset":{
    tabIds: [2, 3, 6, 11, 13],
    initialTabIndex: 2,
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
  "Simply Supported Beam Design":{
    tabIds: [0, 12, 13],
    initialTabIndex: 0,
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
  "On Cantilever Beam Design":{
    tabIds: [0, 12, 13],
    initialTabIndex: 0,
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
  // "SeatedAngleConnection":{
  //   tabIds: [0, 1, 4, 5, 7, 8],
  //   initialTabIndex: 0,
  //   getInitialPrefs: (inputs) => ({
  //     weld_fab: inputs.weld_fab || "Shop weld",
  //     weld_material_grade: inputs.weld_material_grade || "",
  //     detailing_edge_type: inputs.detailing_edge_type || "Sheared or hand flame cut",
  //     detailing_packing_plate: inputs.detailing_packing_plate,
  //     design_for: inputs.design_for || "Tension",
  //   }),
  //   getDefaultPrefs: (inputs) => {
  //     const defs = {
  //       weld_fab: "Shop weld",
  //       weld_material_grade: inputs.weld_material_grade || "",
  //       detailing_edge_type: "Sheared or hand flame cut",
  //       design_for: "Tension",
  //     };
  //     return defs;
  //   },
  // },
  "SeatedAngleConnection": {
    tabIds: [0, 1, 5, 6, 11, 13],
    initialTabIndex: 0,
  
    getInitialPrefs: (inputs) => ({
      // Designation
      designation: inputs.designation || "50 x 50 x 3",
  
      // Material
      material: inputs.material || "E 165 (Fe 290)",
  
      // Mechanical Properties
      fu: inputs.fu || 290,
      fy: inputs.fy || 165,
      elastic_modulus: inputs.elastic_modulus || 200,
      shear_modulus: inputs.shear_modulus || 76.9,
      poisson_ratio: inputs.poisson_ratio || 0.3,
      thermal_coefficient: inputs.thermal_coefficient || 12,
  
      // Type & Source
      type: inputs.type || "Rolled",
      source: inputs.source || "IS808 Rev",
  
      // Dimensions
      long_leg: inputs.long_leg || 50,
      short_leg: inputs.short_leg || 50,
      thickness: inputs.thickness || 3,
      root_radius: inputs.root_radius || 6,
      toe_radius: inputs.toe_radius || 0,
  
      // Existing fields
      weld_fab: inputs.weld_fab || "Shop weld",
      weld_material_grade: inputs.weld_material_grade || "",
      detailing_edge_type:
        inputs.detailing_edge_type || "Sheared or hand flame cut",
      detailing_packing_plate: inputs.detailing_packing_plate,
      design_for: inputs.design_for || "Tension",
    }),
  
    getDefaultPrefs: (inputs) => ({
      designation: "50 x 50 x 3",
      material: "E 165 (Fe 290)",
  
      fu: 290,
      fy: 165,
      elastic_modulus: 200,
      shear_modulus: 76.9,
      poisson_ratio: 0.3,
      thermal_coefficient: 12,
  
      type: "Rolled",
      source: "IS808 Rev",
  
      long_leg: 50,
      short_leg: 50,
      thickness: 3,
      root_radius: 6,
      toe_radius: 0,
  
      weld_fab: "Shop weld",
      weld_material_grade: inputs.weld_material_grade || "",
      detailing_edge_type: "Sheared or hand flame cut",
      design_for: "Tension",
    }),
  },
};

const DEFAULT_CONFIG = {
  tabIds: [0, 1, 3, 6, 10, 11, 13],
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
  console.log("module:", module)
  const config = getDesignPrefConfig(module);
  console.log('config:', config)
  return ALL_TABS.filter((tab) => config.tabIds.includes(tab.id));
}
