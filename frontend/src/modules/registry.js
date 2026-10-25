// Single list of design modules. Routes, the module menu, API slugs and the
// per-module design preference data all come from MODULES.
//
// A module's id is its desktop module name (KEY_DISP_* in osdag_core/Common.py),
// the same value the backend uses as MODULE_ID and projects and .osi files store.
// To add a module, add one entry here (see documentation/chapter_6_dynamic_ui_form_engine.md).

import { UI_STRINGS } from "../constants/UIStrings";
import {
  KEY_DISP_FINPLATE,
  KEY_DISP_CLEATANGLE,
  KEY_DISP_HEADERPLATE,
  KEY_DISP_SEATED_ANGLE,
  KEY_DISP_COLUMNCOVERPLATE,
  KEY_DISP_COLUMNCOVERPLATEWELD,
  KEY_DISP_COLUMNENDPLATE,
  KEY_DISP_BEAMCOVERPLATE,
  KEY_DISP_BEAMCOVERPLATEWELD,
  KEY_DISP_BB_EP_SPLICE,
  KEY_DISP_BCENDPLATE,
  KEY_DISP_BASE_PLATE,
  KEY_DISP_BUTTJOINTBOLTED,
  KEY_DISP_BUTTJOINTWELDED,
  KEY_DISP_LAPJOINTBOLTED,
  KEY_DISP_LAPJOINTWELDED,
  KEY_DISP_TENSION_BOLTED,
  KEY_DISP_TENSION_WELDED,
  KEY_DISP_STRUT_BOLTED_END_GUSSET,
  KEY_DISP_STRUT_WELDED_END_GUSSET,
  KEY_DISP_COMPRESSION_COLUMN,
  KEY_DISP_FLEXURE,
  KEY_DISP_FLEXURE2,
  KEY_DISP_FLEXURE4,
  KEY_DISP_PLATE_GIRDER_WELDED,
} from "../constants/generated/coreKeys";

// Resolves a module's input config and output config from two lazy imports, so
// each module stays in its own chunk.
const loadConfigs = async (configImport, configName, outputImport, outputName) => {
  const [config, output] = await Promise.all([configImport, outputImport]);
  return { moduleConfig: config[configName], outputConfig: output[outputName] };
};

// Menu tabs shown on the module selection pages, keyed by the first URL segment.
// A section is a heading inside a tab; its options are the entries whose
// `menu.tab` and `menu.section` match.
export const MENU_GROUPS = {
  Connections: [
    { key: "Plated", label: UI_STRINGS.PLATED_CONNECTION, sections: [{ label: UI_STRINGS.PLATED_CONNECTION }] },
    { key: "Shear", label: UI_STRINGS.SHEAR_CONNECTION, sections: [{ label: UI_STRINGS.SHEAR_CONNECTIONS }] },
    {
      key: "Moment",
      label: UI_STRINGS.MOMENT_CONNECTION,
      sections: [
        { label: "Column Splices" },
        { label: "Beam Splices" },
        { label: "Beam to Column" },
        { label: "PEB", status: "development" },
      ],
    },
    { key: "BasePlate", label: UI_STRINGS.BASE_PLATE, sections: [{ label: "Base Plates" }] },
    { key: "Truss", label: "Truss Connection", status: "development", sections: [{ label: "Truss Connections" }] },
  ],
  TensionMember: [
    { key: "Tension", label: UI_STRINGS.TENSION_MEMBER, sections: [{ label: UI_STRINGS.TENSION_MEMBER }] },
  ],
  CompressionMember: [
    { key: "Compression", label: UI_STRINGS.COMPRESSION_MEMBER, sections: [{ label: UI_STRINGS.COMPRESSION_MEMBER }] },
  ],
  FlexureMember: [
    { key: "Flexure", label: UI_STRINGS.FLEXURE_MEMBER, sections: [{ label: UI_STRINGS.FLEXURE_MEMBER }] },
  ],
};

export const MODULES = [
  // Plated connections
  {
    id: KEY_DISP_LAPJOINTBOLTED,
    path: "/design/connections/simple/lap_joint_bolted",
    apiSlug: "simple-connection/lap-joint-bolted",
    title: UI_STRINGS.LAP_JOINT_BOLTED,
    menu: { tab: "Plated", section: UI_STRINGS.PLATED_CONNECTION, label: "Lap Joint — Bolted", img: "lap_joint_bolted_simple_connec.png" },
    load: () => loadConfigs(
      import("./SimpleConnection/LapJointBolted/config/lapJointBoltedConfig"), "lapJointBoltedConfig",
      import("./SimpleConnection/LapJointBolted/config/lapJointBoltedOutputConfig"), "lapJointBoltedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_LAPJOINTWELDED,
    path: "/design/connections/simple/lap_joint_welded",
    apiSlug: "simple-connection/lap-joint-welded",
    title: UI_STRINGS.LAP_JOINT_WELDED,
    menu: { tab: "Plated", section: UI_STRINGS.PLATED_CONNECTION, label: "Lap Joint — Welded", img: "lap_joint_welded_simple_connec.png" },
    load: () => loadConfigs(
      import("./SimpleConnection/LapJointWelded/config/lapJointWeldedConfig"), "lapJointWeldedConfig",
      import("./SimpleConnection/LapJointWelded/config/lapJointWeldedOutputConfig"), "lapJointWeldedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_BUTTJOINTBOLTED,
    path: "/design/connections/simple/butt_joint_bolted",
    apiSlug: "simple-connection/butt-joint-bolted",
    title: UI_STRINGS.BUTT_JOINT_BOLTED,
    menu: { tab: "Plated", section: UI_STRINGS.PLATED_CONNECTION, label: "Butt Joint — Bolted", img: "butt_joint_bolted_simple_connec.png" },
    load: () => loadConfigs(
      import("./SimpleConnection/ButtJointBolted/config/buttJointBoltedConfig"), "buttJointBoltedConfig",
      import("./SimpleConnection/ButtJointBolted/config/buttJointBoltedOutputConfig"), "buttJointBoltedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_BUTTJOINTWELDED,
    path: "/design/connections/simple/butt_joint_welded",
    apiSlug: "simple-connection/butt-joint-welded",
    title: UI_STRINGS.BUTT_JOINT_WELDED,
    menu: { tab: "Plated", section: UI_STRINGS.PLATED_CONNECTION, label: "Butt Joint — Welded", img: "butt_joint_welded_simple_connec.png" },
    load: () => loadConfigs(
      import("./SimpleConnection/ButtJointWelded/config/buttJointWeldedConfig"), "buttJointWeldedConfig",
      import("./SimpleConnection/ButtJointWelded/config/buttJointWeldedOutputConfig"), "buttJointWeldedOutputConfig",
    ),
  },

  // Shear connections
  {
    id: KEY_DISP_FINPLATE,
    path: "/design/connections/shear/fin_plate",
    apiSlug: "shear-connection/fin-plate",
    title: UI_STRINGS.FIN_PLATE,
    menu: { tab: "Shear", section: UI_STRINGS.SHEAR_CONNECTIONS, label: UI_STRINGS.FIN_PLATE, img: "shear_fin_plate_connec.png" },
    load: () => loadConfigs(
      import("./shearConnection/finPlate/configs/finPlateConfig"), "finPlateConfig",
      import("./shearConnection/finPlate/configs/finPlateOutputConfig"), "finPlateOutputConfig",
    ),
    designPref: {
      connectivityField: "Connectivity",
      fields: {
        memberSupported: "Member.Supported_Section.Designation",
        memberSupporting: "Member.Supporting_Section.Designation",
        plateThickness: "Connector.Plate.Thickness_List",
        angleList: "Connector.Angle_List",
        topAngleList: "Connector.Top_Angle_List",
      },
    },
  },
  {
    id: KEY_DISP_CLEATANGLE,
    path: "/design/connections/shear/cleat_angle",
    apiSlug: "shear-connection/cleat-angle",
    title: UI_STRINGS.CLEAT_ANGLE,
    menu: { tab: "Shear", section: UI_STRINGS.SHEAR_CONNECTIONS, label: UI_STRINGS.CLEAT_ANGLE, img: "shear_cleat_angle_connec.png" },
    load: () => loadConfigs(
      import("./shearConnection/cleatAngle/configs/cleatAngleConfig"), "cleatAngleConfig",
      import("./shearConnection/cleatAngle/configs/cleatAngleOutputConfig"), "cleatAngleOutputConfig",
    ),
  },
  {
    id: KEY_DISP_HEADERPLATE,
    path: "/design/connections/shear/end_plate",
    apiSlug: "shear-connection/header-plate",
    title: UI_STRINGS.HEADER_PLATE,
    menu: { tab: "Shear", section: UI_STRINGS.SHEAR_CONNECTIONS, label: UI_STRINGS.HEADER_PLATE, img: "header_plate_connec.png" },
    load: () => loadConfigs(
      import("./shearConnection/endPlate/configs/endPlateConfig"), "endPlateConfig",
      import("./shearConnection/endPlate/configs/endPlateOutputConfig"), "endPlateOutputConfig",
    ),
  },
  {
    id: KEY_DISP_SEATED_ANGLE,
    path: "/design/connections/shear/seatAngle",
    apiSlug: "shear-connection/seated-angle",
    title: UI_STRINGS.SEATED_ANGLE,
    menu: { tab: "Shear", section: UI_STRINGS.SHEAR_CONNECTIONS, label: UI_STRINGS.SEATED_ANGLE, img: "seated_angle_connec.png" },
    load: () => loadConfigs(
      import("./shearConnection/seatAngle/configs/seatedAngleConfig"), "seatedAngleConfig",
      import("./shearConnection/seatAngle/configs/seatedAngleOutputConfig"), "seatedAngleOutputConfig",
    ),
  },

  // Moment connections: column splices
  {
    id: KEY_DISP_COLUMNCOVERPLATE,
    path: "/design/connections/column-to-column-splice/cover_plate_bolted",
    apiSlug: "moment-connection/column-column-cover-plate-bolted",
    title: UI_STRINGS.COVER_PLATE_BOLTED,
    menu: { tab: "Moment", section: "Column Splices", label: "Cover Plate — Bolted", img: "cover_plate_bolted_ctc_moment_connec.png" },
    load: () => loadConfigs(
      import("./columnColumnCoverPlateBolted/configs/coverPlateBoltedConfig"), "coverPlateBoltedConfig",
      import("./columnColumnCoverPlateBolted/configs/coverPlateBoltedOutputConfig"), "coverPlateBoltedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_COLUMNCOVERPLATEWELD,
    path: "/design/connections/column-to-column-splice/cover_plate_welded",
    apiSlug: "moment-connection/column-column-cover-plate-welded",
    title: UI_STRINGS.COVER_PLATE_WELDED,
    menu: { tab: "Moment", section: "Column Splices", label: "Cover Plate — Welded", img: "cover_plate_welded_ctc_moment_connec.png" },
    load: () => loadConfigs(
      import("./columnColumnCoverPlateWelded/configs/coverPlateWeldedConfig"), "coverPlateWeldedConfig",
      import("./columnColumnCoverPlateWelded/configs/coverPlateWeldedOutputConfig"), "coverPlateWeldedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_COLUMNENDPLATE,
    path: "/design/connections/column-to-column-splice/end_plate",
    apiSlug: "moment-connection/column-column-end-plate",
    title: UI_STRINGS.END_PLATE,
    menu: { tab: "Moment", section: "Column Splices", label: UI_STRINGS.END_PLATE, img: "end_plate_ctc_moment_connec.png" },
    load: () => loadConfigs(
      import("./columnColumnEndPlate/configs/columnColumnEndPlateConfig"), "columnColumnEndPlateConfig",
      import("./columnColumnEndPlate/configs/columnColumnEndPlateOutputConfig"), "columnColumnEndPlateOutputConfig",
    ),
  },

  // Moment connections: beam splices
  {
    id: KEY_DISP_BEAMCOVERPLATE,
    path: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
    apiSlug: "moment-connection/beam-beam-cover-plate-bolted",
    title: UI_STRINGS.COVER_PLATE_BOLTED,
    menu: { tab: "Moment", section: "Beam Splices", label: "Cover Plate — Bolted", img: "cover_plate_bolted_btb_moment_connec.png" },
    load: () => loadConfigs(
      import("./coverPlateBolted/configs/coverPlateBoltedConfig"), "coverPlateBoltedConfig",
      import("./coverPlateBolted/configs/coverPlateBoltedOutputConfig"), "coverPlateBoltedOutputConfig",
    ),
    designPref: {
      fields: {
        memberDesignation: "Member.Designation",
        memberMaterial: "Member.Material",
        flangePreferences: "Connector.Flange_Plate.Preferences",
        flangePlateThickness: "Connector.Flange_Plate.Thickness_list",
        webPlateThickness: "Connector.Web_Plate.Thickness_List",
      },
    },
  },
  {
    id: KEY_DISP_BEAMCOVERPLATEWELD,
    path: "/design/connections/beam-to-beam-splice/cover_plate_welded",
    apiSlug: "moment-connection/beam-beam-cover-plate-welded",
    title: UI_STRINGS.COVER_PLATE_WELDED,
    menu: { tab: "Moment", section: "Beam Splices", label: "Cover Plate — Welded", img: "cover_plate_welded_btb_moment_connec.png" },
    load: () => loadConfigs(
      import("./coverPlateWelded/configs/coverPlateWeldedConfig"), "coverPlateWeldedConfig",
      import("./coverPlateWelded/configs/coverPlateWeldedOutputConfig"), "coverPlateWeldedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_BB_EP_SPLICE,
    path: "/design/connections/beam-to-beam-splice/end_plate",
    apiSlug: "moment-connection/beam-beam-end-plate",
    title: UI_STRINGS.END_PLATE,
    menu: { tab: "Moment", section: "Beam Splices", label: UI_STRINGS.END_PLATE, img: "end_plate_btb_moment_connec.png" },
    load: () => loadConfigs(
      import("./beamBeamEndPlate/configs/beamBeamEndPlateConfig"), "beamBeamEndPlateConfig",
      import("./beamBeamEndPlate/configs/beamBeamEndPlateOutputConfig"), "beamBeamEndPlateOutputConfig",
    ),
    designPref: {
      connectivityField: "Connectivity",
      endPlateField: "EndPlateType",
      connectivityMap: {
        "Flushed - Reversible Moment": "Flushed - Reversible Moment",
        "Extended One Way - Irreversible Moment": "Extended One Way - Irreversible Moment",
        "Extended Both Ways - Reversible Moment": "Extended Both Ways - Reversible Moment",
      },
      fields: {
        memberDesignation: "Member.Supported_Section.Designation",
        memberMaterial: "Member.Supported_Section.Material",
        plateThickness: "Connector.Plate.Thickness_List",
        weldFab: "Weld.Fab",
        weldMaterial: "Weld.Material_Grade_OverWrite",
        weldType: "Weld.Type",
      },
    },
  },

  // Moment connections: beam to column
  {
    id: KEY_DISP_BCENDPLATE,
    path: "/design/connections/column-beam/end_plate",
    apiSlug: "moment-connection/beam-column-end-plate",
    title: UI_STRINGS.END_PLATE,
    menu: { tab: "Moment", section: "Beam to Column", label: UI_STRINGS.END_PLATE, img: "end_plate_btc_moment_connec.png" },
    load: () => loadConfigs(
      import("./beamToColumnEndPlate/configs/beamToColumnEndPlateConfig"), "beamToColumnEndPlateConfig",
      import("./beamToColumnEndPlate/configs/beamToColumnEndPlateOutputConfig"), "beamToColumnEndPlateOutputConfig",
    ),
  },

  // Base plate
  {
    id: KEY_DISP_BASE_PLATE,
    path: "/design/connections/base_plate",
    apiSlug: "base-plate",
    title: UI_STRINGS.SLAB_AND_GUSSETED_BASES,
    menu: { tab: "BasePlate", section: "Base Plates", label: UI_STRINGS.SLAB_AND_GUSSETED_BASES, img: "base_plate_connec.png" },
    load: () => loadConfigs(
      import("./basePlate/configs/basePlateConfig"), "basePlateConfig",
      import("./basePlate/configs/basePlateOutputConfig"), "basePlateOutputConfig",
    ),
  },

  // Tension members
  {
    id: KEY_DISP_TENSION_BOLTED,
    path: "/design/tension-member/bolted_to_end_gusset",
    apiSlug: "tension-member/bolted",
    title: UI_STRINGS.BOLTED_TO_END_GUSSET,
    menu: { tab: "Tension", section: UI_STRINGS.TENSION_MEMBER, label: UI_STRINGS.BOLTED_TO_END_GUSSET, img: "bolted_tension_member.png" },
    load: () => loadConfigs(
      import("./TensionMembers/BoltedToEnd/configs/boltedToEndConfig"), "boltedToEndConfig",
      import("./TensionMembers/BoltedToEnd/configs/boltedToEndOutputConfig"), "boltedToEndOutputConfig",
    ),
  },
  {
    id: KEY_DISP_TENSION_WELDED,
    path: "/design/tension-member/welded_to_end_gusset",
    apiSlug: "tension-member/welded",
    title: UI_STRINGS.WELDED_TO_END_GUSSET,
    menu: { tab: "Tension", section: UI_STRINGS.TENSION_MEMBER, label: UI_STRINGS.WELDED_TO_END_GUSSET, img: "welded_tension_member.png" },
    load: () => loadConfigs(
      import("./TensionMembers/WeldedToEnd/configs/weldedToEndConfig"), "weldedToEndConfig",
      import("./TensionMembers/WeldedToEnd/configs/weldedToEndOutputConfig"), "weldedToEndOutputConfig",
    ),
  },

  // Compression members
  {
    id: KEY_DISP_STRUT_BOLTED_END_GUSSET,
    path: "/design/compression-member/struts_bolted_to_end_gusset",
    apiSlug: "compression-member/struts_bolted",
    title: UI_STRINGS.STRUTS_BOLTED_TO_END_GUSSET,
    menu: { tab: "Compression", section: UI_STRINGS.COMPRESSION_MEMBER, label: "Struts Bolted to End Gusset", img: "struts_bolt_end_gusset.png" },
    load: () => loadConfigs(
      import("./compressionMember/configs/strutsBoltedConfig"), "strutsBoltedConfig",
      import("./compressionMember/configs/strutsBoltedOutputConfig"), "strutsBoltedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_STRUT_WELDED_END_GUSSET,
    path: "/design/compression-member/struts_welded_to_end_gusset",
    apiSlug: "compression-member/struts_welded",
    title: UI_STRINGS.STRUTS_WELDED_TO_END_GUSSET,
    menu: { tab: "Compression", section: UI_STRINGS.COMPRESSION_MEMBER, label: "Struts Welded to End Gusset", img: "struts_weld_end_gusset.png" },
    load: () => loadConfigs(
      import("./compressionMember/configs/strutsWeldedConfig"), "strutsWeldedConfig",
      import("./compressionMember/configs/strutsWeldedOutputConfig"), "strutsWeldedOutputConfig",
    ),
  },
  {
    id: KEY_DISP_COMPRESSION_COLUMN,
    path: "/design/compression-member/axially_loaded_column",
    apiSlug: "compression-member/axially_loaded_column",
    title: UI_STRINGS.AXIALLY_LOADED_COLUMN,
    menu: { tab: "Compression", section: UI_STRINGS.COMPRESSION_MEMBER, label: "Axially Loaded Column", img: "axially_loaded_column.png" },
    load: () => loadConfigs(
      import("./compressionMember/configs/axiallyLoadedColumnConfig"), "axiallyLoadedColumnConfig",
      import("./compressionMember/configs/axiallyLoadedColumnOutputConfig"), "axiallyLoadedColumnOutputConfig",
    ),
  },

  // Flexural members
  {
    id: KEY_DISP_FLEXURE,
    path: "/design/flexure_member/simply_supported_beam",
    apiSlug: "flexure-member/simply-supported-beam",
    title: UI_STRINGS.SIMPLY_SUPPORTED_BEAM,
    menu: { tab: "Flexure", section: UI_STRINGS.FLEXURE_MEMBER, label: "Simply Supported Beam", img: "ss_beam_flexural_mem.png" },
    load: () => loadConfigs(
      import("./flexuralMember/simplySupportedBeam/configs/simplySupportedBeamConfig"), "simplySupportedBeamConfig",
      import("./flexuralMember/simplySupportedBeam/configs/simplySupportedBeamOutputConfig"), "simplySupportedBeamOutputConfig",
    ),
  },
  {
    id: KEY_DISP_FLEXURE2,
    path: "/design/flexure/on_cantilever",
    apiSlug: "flexure-member/on-cantilever",
    title: UI_STRINGS.ON_CANTILEVER_BEAM,
    menu: { tab: "Flexure", section: UI_STRINGS.FLEXURE_MEMBER, label: "Cantilever Beam", img: "cantilever_beam_flexural_mem.png" },
    load: () => loadConfigs(
      import("./flexuralMember/onCantilever/configs/onCantileverConfig"), "onCantileverConfig",
      import("./flexuralMember/onCantilever/configs/onCantileverOutputConfig"), "onCantileverOutputConfig",
    ),
  },
  {
    id: KEY_DISP_PLATE_GIRDER_WELDED,
    path: "/design/flexure/plate_girder",
    apiSlug: "flexure-member/plate-girder",
    title: "Plate Girder (Flexural Member)",
    menu: { tab: "Flexure", section: UI_STRINGS.FLEXURE_MEMBER, label: "Plate Girder", img: "plate_girder_flexural_mem.png" },
    load: () => loadConfigs(
      import("./flexuralMember/plateGirder/configs/plateGirderConfig"), "plateGirderConfig",
      import("./flexuralMember/plateGirder/configs/plateGirderOutputConfig"), "plateGirderOutputConfig",
    ),
  },
  {
    id: KEY_DISP_FLEXURE4,
    path: "/design/flexure/purlin",
    apiSlug: "flexure-member/purlin",
    title: UI_STRINGS.PURLIN,
    load: () => loadConfigs(
      import("./flexuralMember/purlin/configs/purlinConfig"), "purlinConfig",
      import("./flexuralMember/purlin/configs/purlinOutputConfig"), "purlinOutputConfig",
    ),
  },
];

const MODULES_BY_ID = new Map(MODULES.map((module) => [module.id, module]));

/** Registry entry for a module id (desktop module name), or undefined. */
export const findModule = (id) => MODULES_BY_ID.get(id);

/** Design page path for a module id, or undefined. */
export const getModuleRoute = (id) => findModule(id)?.path;

/** API slug for a module id; unknown ids are returned unchanged. */
export const getModuleSlug = (id) => findModule(id)?.apiSlug ?? id;

/** Design preference data (connectivity names, .osi field names) for a module id. */
export const getModuleDesignPref = (id) => findModule(id)?.designPref ?? {};

/** Loads a module's input and output configs: { moduleConfig, outputConfig }. */
export const loadModuleConfigs = (id) => findModule(id)?.load();

/**
 * Sections of a menu tab, each with its options in registry order:
 * [{ label, status?, options: [{ key (module id), label, img }] }]
 */
export const getMenuSections = (tabKey) => {
  const tab = Object.values(MENU_GROUPS).flat().find((candidate) => candidate.key === tabKey);
  if (!tab) return [];
  return tab.sections.map((section) => ({
    ...section,
    options: MODULES
      .filter((module) => module.menu?.tab === tabKey && module.menu.section === section.label)
      .map((module) => ({ key: module.id, label: module.menu.label, img: module.menu.img })),
  }));
};
