import {
    MODULE_KEY_FIN_PLATE,
    MODULE_KEY_CLEAT_ANGLE,
    MODULE_KEY_END_PLATE,
    MODULE_KEY_SEAT_ANGLE,
    MODULE_KEY_COVER_PLATE_BOLTED,
    MODULE_KEY_COVER_PLATE_WELDED,
    MODULE_KEY_BEAM_BEAM_END_PLATE,
    MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
    MODULE_KEY_BEAM_COLUMN_END_PLATE,
    MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
    MODULE_KEY_CC_COVER_PLATE_BOLTED,
    MODULE_KEY_CC_COVER_PLATE_WELDED,
    MODULE_KEY_CC_END_PLATE,
    MODULE_KEY_BUTT_JOINT_WELDED,
    MODULE_KEY_BUTT_JOINT_BOLTED,
    MODULE_KEY_LAP_JOINT_WELDED,
    MODULE_KEY_LAP_JOINT_BOLTED,
    MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
    MODULE_KEY_BOLTED_TO_END_GUSSET,
    MODULE_KEY_WELDED_TO_END_GUSSET,
    MODULE_KEY_TENSION_BOLTED,
    MODULE_KEY_TENSION_WELDED,
    MODULE_KEY_STRUTS_BOLTED,
    MODULE_KEY_AXIALLY_LOADED_COLUMN,
    MODULE_KEY_STRUTS_WELDED,
    MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
    MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
    MODULE_KEY_PURLIN,
    MODULE_KEY_PLATE_GIRDER,
    MODULE_KEY_BASE_PLATE,
} from "./DesignKeys";
import { UI_STRINGS } from "./UIStrings";

export const MODULE_SUBMODULES = {
    Connections: [
        { key: "Plated", label: UI_STRINGS.PLATED_CONNECTION },
        { key: "Shear", label: UI_STRINGS.SHEAR_CONNECTION },
        { key: "Moment", label: UI_STRINGS.MOMENT_CONNECTION },
        { key: "BasePlate", label: UI_STRINGS.BASE_PLATE },
        { key: "Truss", label: "Truss Connection", status: "development" },
    ],
    TensionMember: [{ key: "Tension", label: UI_STRINGS.TENSION_MEMBER }],
    CompressionMember: [{ key: "Compression", label: UI_STRINGS.COMPRESSION_MEMBER }],
    FlexureMember: [{ key: "Flexure", label: UI_STRINGS.FLEXURE_MEMBER }],
};

export const CONNECTIONS_TAB_CONTENT = {
    Plated: [
        {
            label: UI_STRINGS.PLATED_CONNECTION,
            options: [
                { key: MODULE_KEY_LAP_JOINT_BOLTED, label: "Lap Joint — Bolted", img: "lap_joint_bolted_simple_connec.png" },
                { key: MODULE_KEY_LAP_JOINT_WELDED, label: "Lap Joint — Welded", img: "lap_joint_welded_simple_connec.png" },
                { key: MODULE_KEY_BUTT_JOINT_BOLTED, label: "Butt Joint — Bolted", img: "butt_joint_bolted_simple_connec.png" },
                { key: MODULE_KEY_BUTT_JOINT_WELDED, label: "Butt Joint — Welded", img: "butt_joint_welded_simple_connec.png" },
           ],
        },
    ],
    Shear: [
        {
            label: UI_STRINGS.SHEAR_CONNECTIONS,
            options: [
                { key: MODULE_KEY_FIN_PLATE, label: UI_STRINGS.FIN_PLATE, img: "shear_fin_plate_connec.png" },
                { key: MODULE_KEY_CLEAT_ANGLE, label: UI_STRINGS.CLEAT_ANGLE, img: "shear_cleat_angle_connec.png" },
                { key: MODULE_KEY_END_PLATE, label: UI_STRINGS.HEADER_PLATE, img: "header_plate_connec.png" },
                { key: MODULE_KEY_SEAT_ANGLE, label: UI_STRINGS.SEATED_ANGLE, img: "seated_angle_connec.png" },
            ],
        },
    ],
    Moment: [
        { 
            label: "Column Splices",
            options: [
                { key: MODULE_KEY_CC_COVER_PLATE_BOLTED, label: "Cover Plate — Bolted", img: "cover_plate_bolted_ctc_moment_connec.png" },
                { key: MODULE_KEY_CC_COVER_PLATE_WELDED, label: "Cover Plate — Welded", img: "cover_plate_welded_ctc_moment_connec.png" },
                { key: MODULE_KEY_CC_END_PLATE, label: UI_STRINGS.END_PLATE, img: "end_plate_ctc_moment_connec.png" },
            ],
        },
        {
            label: "Beam Splices",
            options: [
                { key: MODULE_KEY_COVER_PLATE_BOLTED, label: "Cover Plate — Bolted", img: "cover_plate_bolted_btb_moment_connec.png" },
                { key: MODULE_KEY_COVER_PLATE_WELDED, label: "Cover Plate — Welded", img: "cover_plate_welded_btb_moment_connec.png" },
                { key: MODULE_KEY_BEAM_BEAM_END_PLATE, label: UI_STRINGS.END_PLATE, img: "end_plate_btb_moment_connec.png" },
            ],
        },
        {
            label: "Beam to Column",
            options: [
                { key: MODULE_KEY_BEAM_COLUMN_END_PLATE, label: UI_STRINGS.END_PLATE, img: "end_plate_btc_moment_connec.png" },
            ],
        },
        {
            label: "PEB",
            options: [],
            status: "development",
        },
    ],
    BasePlate: [
        {
            label: "Base Plates",
            options: [{ key: "BasePlateConnection", label: UI_STRINGS.SLAB_AND_GUSSETED_BASES, img: "base_plate_connec.png" }],
        },
    ],
    Truss: [{ label: "Truss Connections", options: [] }],
};

export const GENERIC_SUBMODULE_CONTENT = {
    Tension: [
        {
            label: UI_STRINGS.TENSION_MEMBER,
            options: [
                { key: MODULE_KEY_BOLTED_TO_END_GUSSET, label: UI_STRINGS.BOLTED_TO_END_GUSSET, img: "bolted_tension_member.png" },
                { key: MODULE_KEY_WELDED_TO_END_GUSSET, label: UI_STRINGS.WELDED_TO_END_GUSSET, img: "welded_tension_member.png" },
            ],
        },
    ],
    Compression: [
        {
            label: UI_STRINGS.COMPRESSION_MEMBER,
            options: [
                { key: MODULE_KEY_STRUTS_BOLTED, label: "Struts Bolted to End Gusset", img: "struts_bolt_end_gusset.png" },
                { key: MODULE_KEY_STRUTS_WELDED, label: "Struts Welded to End Gusset", img: "struts_weld_end_gusset.png" },
                { key: MODULE_KEY_AXIALLY_LOADED_COLUMN, label: "Axially Loaded Column", img: "axially_loaded_column.png" },
            ],

        },
    ],
    Flexure: [
        {
            label: UI_STRINGS.FLEXURE_MEMBER,
            options: [
                { key: MODULE_KEY_SIMPLY_SUPPORTED_BEAM, label: "Simply Supported Beam", img: "ss_beam_flexural_mem.png" },
                { key: "OnCantilever", label: "Cantilever Beam", img: "cantilever_beam_flexural_mem.png" },
                { key: MODULE_KEY_PLATE_GIRDER, label: "Plate Girder", img: "plate_girder_flexural_mem.png" },
            ],
        },
    ],
};

export const MODULE_ROUTES = {
    [MODULE_KEY_FIN_PLATE]: "/design/connections/shear/fin_plate",
    [MODULE_KEY_CLEAT_ANGLE]: "/design/connections/shear/cleat_angle",
    [MODULE_KEY_END_PLATE]: "/design/connections/shear/end_plate",
    [MODULE_KEY_SEAT_ANGLE]: "/design/connections/shear/seatAngle",
    [MODULE_KEY_CC_COVER_PLATE_BOLTED]: "/design/connections/column-to-column-splice/cover_plate_bolted",
    [MODULE_KEY_CC_COVER_PLATE_WELDED]: "/design/connections/column-to-column-splice/cover_plate_welded",
    [MODULE_KEY_CC_END_PLATE]: "/design/connections/column-to-column-splice/end_plate",
    [MODULE_KEY_COVER_PLATE_BOLTED]: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
    [MODULE_KEY_COVER_PLATE_WELDED]: "/design/connections/beam-to-beam-splice/cover_plate_welded",
    [MODULE_KEY_BEAM_BEAM_END_PLATE]: "/design/connections/beam-to-beam-splice/end_plate",
    [MODULE_KEY_BEAM_COLUMN_END_PLATE]: "/design/connections/column-beam/end_plate",
    [MODULE_KEY_BUTT_JOINT_WELDED]: "/design/connections/simple/butt_joint_welded",
    [MODULE_KEY_BUTT_JOINT_BOLTED]: "/design/connections/simple/butt_joint_bolted",
    [MODULE_KEY_LAP_JOINT_WELDED]: "/design/connections/simple/lap_joint_welded",
    [MODULE_KEY_LAP_JOINT_BOLTED]: "/design/connections/simple/lap_joint_bolted",
    BasePlateConnection: "/design/connections/base_plate",
    [MODULE_KEY_SIMPLY_SUPPORTED_BEAM]: "/design/flexure_member/simply_supported_beam",
    OnCantilever: "/design/flexure/on_cantilever",
    Purlin: "/design/flexure/purlin",
    [MODULE_KEY_PLATE_GIRDER]: "/design/flexure/plate_girder",
    PlateGirder: "/design/flexure/plate_girder",
    [MODULE_KEY_TENSION_BOLTED]: "/design/tension-member/bolted_to_end_gusset",
    [MODULE_KEY_TENSION_WELDED]: "/design/tension-member/welded_to_end_gusset",
    [MODULE_KEY_BOLTED_TO_END_GUSSET]: "/design/tension-member/bolted_to_end_gusset",
    [MODULE_KEY_WELDED_TO_END_GUSSET]: "/design/tension-member/welded_to_end_gusset",
    [MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT]: "/design/connections/column-beam/end_plate",
    [MODULE_KEY_STRUTS_WELDED]: "/design/compression-member/struts_welded_to_end_gusset",
    [MODULE_KEY_STRUTS_BOLTED]: "/design/compression-member/struts_bolted_to_end_gusset",
    [MODULE_KEY_AXIALLY_LOADED_COLUMN]: "/design/compression-member/axially_loaded_column",
    // Add other needed routes
};

// Mapping from .osi Module names (desktop) → web module keys used above
// Extend as more modules are supported
export const MODULE_NAME_TO_KEY = {
    // Shear Connections
    "Shear Connection - Fin Plate": MODULE_KEY_FIN_PLATE,
    "Fin Plate Connection": MODULE_KEY_FIN_PLATE,
    "FinPlateConnection": MODULE_KEY_FIN_PLATE,
    "Shear Connection - End Plate": MODULE_KEY_END_PLATE,
    "End Plate Connection": MODULE_KEY_END_PLATE,
    "Shear Connection - Cleat Angle": MODULE_KEY_CLEAT_ANGLE,
    "Cleat Angle Connection": MODULE_KEY_CLEAT_ANGLE,
    "Shear Connection - Seated Angle": MODULE_KEY_SEAT_ANGLE,
    "Seated Angle Connection": MODULE_KEY_SEAT_ANGLE,

    // Plated Connections (Simple Connections)
    "Lap Joint Bolted Connection": MODULE_KEY_LAP_JOINT_BOLTED,
    "Lap Joint - Bolted": MODULE_KEY_LAP_JOINT_BOLTED,
    "Lap Joint Bolted": MODULE_KEY_LAP_JOINT_BOLTED,
    "Lap Joint Welded Connection": MODULE_KEY_LAP_JOINT_WELDED,
    "Lap Joint - Welded": MODULE_KEY_LAP_JOINT_WELDED,
    "Lap Joint Welded": MODULE_KEY_LAP_JOINT_WELDED,
    "Butt Joint Bolted Connection": MODULE_KEY_BUTT_JOINT_BOLTED,
    "Butt Joint - Bolted": MODULE_KEY_BUTT_JOINT_BOLTED,
    "Butt Joint Bolted": MODULE_KEY_BUTT_JOINT_BOLTED,
    "Butt Joint Welded Connection": MODULE_KEY_BUTT_JOINT_WELDED,
    "Butt Joint - Welded": MODULE_KEY_BUTT_JOINT_WELDED,
    "Butt Joint Welded": MODULE_KEY_BUTT_JOINT_WELDED,

    // Base Plate
    "Base Plate Connection": "BasePlateConnection",
    "Base-Plate": "BasePlateConnection",
    "Base Plate": "BasePlateConnection",

    // Tension Members
    "Tension Member Design - Bolted to End Gusset": MODULE_KEY_BOLTED_TO_END_GUSSET,
    "Tension Member Bolted Design": MODULE_KEY_BOLTED_TO_END_GUSSET,
    "Tension Bolted": MODULE_KEY_BOLTED_TO_END_GUSSET,
    "Tension Member Design - Welded to End Gusset": MODULE_KEY_WELDED_TO_END_GUSSET,
    "Tension Member Welded Design": MODULE_KEY_WELDED_TO_END_GUSSET,
    "Tension Welded": MODULE_KEY_WELDED_TO_END_GUSSET,

    // Compression Members
    "Compression Member Design - Strut Design": MODULE_KEY_STRUTS_BOLTED,
    "Struts Bolted to End Gusset": MODULE_KEY_STRUTS_BOLTED,
    "Struts Welded to End Gusset": MODULE_KEY_STRUTS_WELDED,
    "Columns with known support conditions": MODULE_KEY_AXIALLY_LOADED_COLUMN,
    "Axially Loaded Column": MODULE_KEY_AXIALLY_LOADED_COLUMN,

    // Flexure Members
    "Flexural Members - Simply Supported": MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
    "Simply Supported Beam": MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
    "Flexural Members - Cantilever": "OnCantilever",
    "Cantilever Beam": "OnCantilever",
    "Flexural Members - Purlins": "Purlin",
    "Purlin": "Purlin",
    "Plate Girder": MODULE_KEY_PLATE_GIRDER,
    "Plate Girder Design": MODULE_KEY_PLATE_GIRDER,
    "Plate-Girder": MODULE_KEY_PLATE_GIRDER,

    // PEB / Member Splices / Moment Connections
    // Beam to Column
    "Beam-to-Column End Plate Connection": MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
    "Beam to Column End Plate Connection": MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
    
    // Beam to Beam
    "Beam-to-Beam End Plate Connection": MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
    "Beam-Beam-End-Plate-Connection": MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
    "Beam-to-Beam Cover Plate Bolted Connection": MODULE_KEY_COVER_PLATE_BOLTED,
    "Beam-to-Beam-Cover-Plate-Bolted-Connection": MODULE_KEY_COVER_PLATE_BOLTED,
    "Beam-to-Beam Cover Plate Welded Connection": MODULE_KEY_COVER_PLATE_WELDED,
    "Beam-to-Beam-Cover-Plate-Welded-Connection": MODULE_KEY_COVER_PLATE_WELDED,

    // Column to Column
    "Column-to-Column Cover Plate Bolted Connection": MODULE_KEY_CC_COVER_PLATE_BOLTED,
    "Column-to-Column-Cover-Plate-Bolted-Connection": MODULE_KEY_CC_COVER_PLATE_BOLTED,
    "Column-to-Column Cover Plate Welded Connection": MODULE_KEY_CC_COVER_PLATE_WELDED,
    "Column-to-Column-Cover-Plate-Welded-Connection": MODULE_KEY_CC_COVER_PLATE_WELDED,
    "Column-to-Column End Plate Connection": MODULE_KEY_CC_END_PLATE,
    "Column-to-Column-End-Plate-Connection": MODULE_KEY_CC_END_PLATE,

    "fp": MODULE_KEY_FIN_PLATE,
    "ca": MODULE_KEY_CLEAT_ANGLE,
    "ep": MODULE_KEY_END_PLATE,
    "sa": MODULE_KEY_SEAT_ANGLE,
    "cpb": MODULE_KEY_COVER_PLATE_BOLTED,
    "cpw": MODULE_KEY_COVER_PLATE_WELDED,
    "boltedtoendplate": MODULE_KEY_BOLTED_TO_END_GUSSET,
    "ssb": MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
};

/**
 * Normalizes any form of module identifier (e.g. from OSI fields, URLs, legacy variables)
 * to its canonical design key constant.
 * @param {string} id
 * @returns {string}
 */
export function normalizeModuleKey(id) {
    if (!id) return id;
    if (MODULE_NAME_TO_KEY[id]) return MODULE_NAME_TO_KEY[id];
    
    const lower = id.toLowerCase();
    if (MODULE_NAME_TO_KEY[lower]) return MODULE_NAME_TO_KEY[lower];
    
    const normHyphen = lower.replace(/_/g, '-').replace(/\s+/g, '-');
    if (MODULE_NAME_TO_KEY[normHyphen]) return MODULE_NAME_TO_KEY[normHyphen];
    
    const mapping = {
        'fin-plate': MODULE_KEY_FIN_PLATE,
        'end-plate': MODULE_KEY_END_PLATE,
        'cleat-angle': MODULE_KEY_CLEAT_ANGLE,
        'seated-angle': MODULE_KEY_SEAT_ANGLE,
        'beam-beam-cover-plate-bolted': MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
        'beam-beam-cover-plate-welded': MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
        'beam-beam-end-plate': MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
        'beam-column-end-plate': MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
        'bolted': MODULE_KEY_TENSION_BOLTED,
        'welded': MODULE_KEY_TENSION_WELDED,
        'simply-supported-beam': MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
        'on-cantilever': 'OnCantilever',
        'purlin': MODULE_KEY_PURLIN,
        'plate-girder': MODULE_KEY_PLATE_GIRDER,
        'lap-joint-welded': MODULE_KEY_LAP_JOINT_WELDED,
        'lap-joint-bolted': MODULE_KEY_LAP_JOINT_BOLTED,
        'butt-joint-welded': MODULE_KEY_BUTT_JOINT_WELDED,
        'butt-joint-bolted': MODULE_KEY_BUTT_JOINT_BOLTED,
        'column-to-column-cover-plate-bolted': MODULE_KEY_CC_COVER_PLATE_BOLTED,
        'column-to-column-cover-plate-welded': MODULE_KEY_CC_COVER_PLATE_WELDED,
        'column-to-column-end-plate': MODULE_KEY_CC_END_PLATE,
        'base-plate': MODULE_KEY_BASE_PLATE,
        'baseplateconnection': MODULE_KEY_BASE_PLATE,
        'struts-bolted': MODULE_KEY_STRUTS_BOLTED,
        'struts-welded': MODULE_KEY_STRUTS_WELDED,
        'axially-loaded-column': MODULE_KEY_AXIALLY_LOADED_COLUMN,
        'bolted-to-end-gusset': MODULE_KEY_BOLTED_TO_END_GUSSET,
        'welded-to-end-gusset': MODULE_KEY_WELDED_TO_END_GUSSET,
    };
    
    return mapping[normHyphen] || id;
}
