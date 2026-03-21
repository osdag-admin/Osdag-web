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
} from "./DesignKeys";
import { UI_STRINGS } from "./UIStrings";

export const MODULE_SUBMODULES = {
    Connections: [
        { key: "Plated", label: UI_STRINGS.PLATED_CONNECTION },
        { key: "Shear", label: UI_STRINGS.SHEAR_CONNECTION },
        { key: "Moment", label: UI_STRINGS.MOMENT_CONNECTION },
        { key: "BasePlate", label: UI_STRINGS.BASE_PLATE },
        { key: "Truss", label: "Truss Connection" },
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
                { key: MODULE_KEY_BUTT_JOINT_WELDED, label: "Butt Joint — Welded", img: "butt_joint_welded_simple_connec.png" },
                { key: MODULE_KEY_BUTT_JOINT_BOLTED, label: "Butt Joint — Bolted", img: "butt_joint_bolted_simple_connec.png" },
                { key: MODULE_KEY_LAP_JOINT_WELDED, label: "Lap Joint — Welded", img: "lap_joint_welded_simple_connec.png" },
                { key: MODULE_KEY_LAP_JOINT_BOLTED, label: "Lap Joint — Bolted", img: "lap_joint_bolted_simple_connec.png" },
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
            label: "Column Splices",
            options: [
                { key: MODULE_KEY_CC_COVER_PLATE_BOLTED, label: "Cover Plate — Bolted", img: "cover_plate_bolted_ctc_moment_connec.png" },
                { key: MODULE_KEY_CC_COVER_PLATE_WELDED, label: "Cover Plate — Welded", img: "cover_plate_welded_ctc_moment_connec.png" },
                { key: MODULE_KEY_CC_END_PLATE, label: UI_STRINGS.END_PLATE, img: "end_plate_ctc_moment_connec.png" },
            ],
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
                { key: MODULE_KEY_BOLTED_TO_END_GUSSET, label: UI_STRINGS.BOLTED_TO_END_PLATE, img: "bolted_tension_member.png" },
                { key: MODULE_KEY_WELDED_TO_END_GUSSET, label: UI_STRINGS.WELDED_TO_END_PLATE, img: "welded_tension_member.png" },
            ],
        },
    ],
    Compression: [
        {
            label: UI_STRINGS.COMPRESSION_MEMBER,
            options: [
                { key: MODULE_KEY_STRUTS_BOLTED, label: "Struts Bolted to End Gusset", img: "struts_bolt_end_gusset.png" },
                { key: "StrutsInTrusses", label: "Struts Welded to End Gusset", img: "struts_weld_end_gusset.png" },
            ],

        },
    ],
    Flexure: [
        {
            label: UI_STRINGS.FLEXURE_MEMBER,
            options: [
                { key: MODULE_KEY_SIMPLY_SUPPORTED_BEAM, label: "Simply Supported Beam", img: "ss_beam_flexural_mem.png" },
                { key: "OnCantilever", label: "Cantilever Beam", img: "cantilever_beam_flexural_mem.png" },
                { key: "PlateGirder", label: "Plate Girder", img: "plate_girder_flexural_mem.png" },
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
    [MODULE_KEY_TENSION_BOLTED]: "/design/tension-member/bolted_to_end_gusset",
    [MODULE_KEY_TENSION_WELDED]: "/design/tension-member/welded_to_end_gusset",
    [MODULE_KEY_BOLTED_TO_END_GUSSET]: "/design/tension-member/bolted_to_end_gusset",
    [MODULE_KEY_WELDED_TO_END_GUSSET]: "/design/tension-member/welded_to_end_gusset",
    [MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT]: "/design/connections/column-beam/end_plate",
    [MODULE_KEY_STRUTS_WELDED]: "/design/compression_member/compression_member/struts_welded_to_end_gusset",
    [MODULE_KEY_STRUTS_BOLTED]: "/design/compression-member/struts_bolted_to_end_gusset",
    [MODULE_KEY_AXIALLY_LOADED_COLUMN]: "/design/compression_member/compression_member/axially_loaded_column",
    // Add other needed routes
};

// Mapping from .osi Module names (desktop) → web module keys used above
// Extend as more modules are supported
export const MODULE_NAME_TO_KEY = {
    "Shear Connection - Fin Plate": MODULE_KEY_FIN_PLATE,
    "Shear Connection - End Plate": MODULE_KEY_END_PLATE,
    "Shear Connection - Cleat Angle": MODULE_KEY_CLEAT_ANGLE,
    "Shear Connection - Seated Angle": MODULE_KEY_SEAT_ANGLE,
    // Tension Members
    "Tension Member Bolted Design": MODULE_KEY_BOLTED_TO_END_GUSSET,
    // Moment Connection
    "Beam-to-Column End Plate Connection": MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
    "Beam-to-Beam-Cover-Plate-Bolted-Connection": MODULE_KEY_COVER_PLATE_BOLTED,
    "Beam-to-Beam-Cover-Plate-Welded-Connection": MODULE_KEY_COVER_PLATE_WELDED,
    "Beam-Beam-End-Plate-Connection": MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
    "Column-to-Column-Cover-Plate-Welded-Connection": MODULE_KEY_CC_COVER_PLATE_WELDED,
    "Column-to-Column-Cover-Plate-Bolted-Connection": MODULE_KEY_CC_COVER_PLATE_BOLTED,
    "Column-to-Column-End-Plate-Connection": MODULE_KEY_CC_END_PLATE,
    "Base-Plate": "BasePlateConnection",
};
