import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_COVER_PLATE_BOLTED,
  MODULE_KEY_COVER_PLATE_WELDED,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
  MODULE_KEY_COVER_PLATE_BOLTED_ALT,
  MODULE_KEY_COVER_PLATE_WELDED_ALT,
  MODULE_KEY_BEAM_BEAM_END_PLATE,
  MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
  MODULE_KEY_BEAM_COLUMN_END_PLATE,
  MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
  MODULE_KEY_CC_COVER_PLATE_BOLTED,
  MODULE_KEY_CC_COVER_PLATE_WELDED,
  MODULE_KEY_CC_END_PLATE,
  MODULE_KEY_BASE_PLATE,
  MODULE_KEY_BUTT_JOINT_BOLTED,
  MODULE_KEY_BUTT_JOINT_WELDED,
  MODULE_KEY_LAP_JOINT_BOLTED,
  MODULE_KEY_LAP_JOINT_WELDED,
  MODULE_KEY_TENSION_BOLTED,
  MODULE_KEY_TENSION_WELDED,
  MODULE_KEY_BOLTED_TO_END_GUSSET,
  MODULE_KEY_WELDED_TO_END_GUSSET,
  MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
  MODULE_KEY_STRUTS_BOLTED,
  MODULE_KEY_AXIALLY_LOADED_COLUMN,
  MODULE_KEY_PURLIN,
  MODULE_KEY_ON_CANTILEVER_BEAM,
} from "./DesignKeys";

// Centralized API route mappings for engineering modules.
export const MODULE_SLUGS = {
  // Shear
  [MODULE_KEY_FIN_PLATE]: 'shear-connection/fin-plate',
  [MODULE_KEY_CLEAT_ANGLE]: 'shear-connection/cleat-angle',
  [MODULE_KEY_END_PLATE]: 'shear-connection/end-plate',
  [MODULE_KEY_SEAT_ANGLE]: 'shear-connection/seated-angle',
  // Moment
  [MODULE_KEY_COVER_PLATE_BOLTED]: 'moment-connection/beam-beam-cover-plate-bolted',
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED]: 'moment-connection/beam-beam-cover-plate-bolted',
  [MODULE_KEY_COVER_PLATE_BOLTED_ALT]: 'moment-connection/beam-beam-cover-plate-bolted',
  [MODULE_KEY_COVER_PLATE_WELDED]: 'moment-connection/beam-beam-cover-plate-welded',
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED]: 'moment-connection/beam-beam-cover-plate-welded',
  [MODULE_KEY_COVER_PLATE_WELDED_ALT]: 'moment-connection/beam-beam-cover-plate-welded',
  [MODULE_KEY_BEAM_BEAM_END_PLATE]: 'moment-connection/beam-beam-end-plate',
  [MODULE_KEY_BEAM_BEAM_END_PLATE_ALT]: 'moment-connection/beam-beam-end-plate',
  [MODULE_KEY_BEAM_COLUMN_END_PLATE]: 'moment-connection/beam-column-end-plate',
  [MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT]: 'moment-connection/beam-column-end-plate',
  [MODULE_KEY_CC_COVER_PLATE_BOLTED]: 'moment-connection/column-column-cover-plate-bolted',
  [MODULE_KEY_CC_COVER_PLATE_WELDED]: 'moment-connection/column-column-cover-plate-welded',
  [MODULE_KEY_CC_END_PLATE]: 'moment-connection/column-column-end-plate',
  // Base Plate
  [MODULE_KEY_BASE_PLATE]: 'base-plate',
  // Simple
  [MODULE_KEY_BUTT_JOINT_BOLTED]: 'simple-connection/butt-joint-bolted',
  [MODULE_KEY_BUTT_JOINT_WELDED]: 'simple-connection/butt-joint-welded',
  [MODULE_KEY_LAP_JOINT_BOLTED]: 'simple-connection/lap-joint-bolted',
  [MODULE_KEY_LAP_JOINT_WELDED]: 'simple-connection/lap-joint-welded',
  // Tension
  [MODULE_KEY_TENSION_BOLTED]: 'tension-member/bolted',
  [MODULE_KEY_TENSION_WELDED]: 'tension-member/welded',
  [MODULE_KEY_BOLTED_TO_END_GUSSET]: 'tension-member/bolted',
  [MODULE_KEY_WELDED_TO_END_GUSSET]: 'tension-member/welded',
  // Flexure
  [MODULE_KEY_SIMPLY_SUPPORTED_BEAM]: 'flexure-member/simply-supported-beam',
  [MODULE_KEY_PURLIN]: 'flexure-member/purlin',
  [MODULE_KEY_ON_CANTILEVER_BEAM]: 'flexure-member/on-cantilever',
  // Compression
  [MODULE_KEY_STRUTS_BOLTED]: 'compression-member/struts_bolted',
  [MODULE_KEY_AXIALLY_LOADED_COLUMN]: 'compression-member/axially_loaded_column',
};

export const getModuleSlug = (moduleId) => MODULE_SLUGS[moduleId] || moduleId;

