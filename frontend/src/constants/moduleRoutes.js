import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
  MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
  MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
  MODULE_KEY_TENSION_BOLTED,
  MODULE_KEY_TENSION_WELDED,
  MODULE_KEY_BASE_PLATE,
  MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
} from "./DesignKeys";

// Centralized route paths keyed by canonical module keys.
const ROUTES_BY_KEY = {
  [MODULE_KEY_FIN_PLATE]: "/design/connections/shear/fin_plate",
  [MODULE_KEY_CLEAT_ANGLE]: "/design/connections/shear/cleat_angle",
  [MODULE_KEY_END_PLATE]: "/design/connections/shear/end_plate",
  [MODULE_KEY_SEAT_ANGLE]: "/design/connections/shear/seatAngle",
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED]: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED]: "/design/connections/beam-to-beam-splice/cover_plate_welded",
  [MODULE_KEY_BEAM_BEAM_END_PLATE_ALT]: "/design/connections/beam-to-beam-splice/end_plate",
  [MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT]: "/design/connections/column-beam/end_plate",
  [MODULE_KEY_TENSION_BOLTED]: "/design/tension-member/bolted_to_end_gusset",
  [MODULE_KEY_TENSION_WELDED]: "/design/tension-member/welded_to_end_gusset",
  [MODULE_KEY_BASE_PLATE]: "/design/connections/base_plate",
  [MODULE_KEY_SIMPLY_SUPPORTED_BEAM]: "/design/FlexureMember/simply_supported_beam",
};

/**
 * Get the route path for a canonical module key.
 * @param {string} canonicalKey
 * @returns {string|undefined}
 */
export function getModuleRoute(canonicalKey) {
  return ROUTES_BY_KEY[canonicalKey];
}

export { ROUTES_BY_KEY };

