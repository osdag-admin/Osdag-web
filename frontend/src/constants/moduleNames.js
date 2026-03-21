import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_BEAM_COLUMN_END_PLATE,
  MODULE_KEY_BEAM_BEAM_END_PLATE,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
  MODULE_KEY_TENSION_BOLTED,
  MODULE_KEY_TENSION_WELDED,
  MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
  MODULE_DISPLAY_FIN_PLATE,
  MODULE_DISPLAY_CLEAT_ANGLE,
  MODULE_DISPLAY_SEAT_ANGLE,
} from "./DesignKeys";

// Centralized display names keyed by canonical module keys.
const DISPLAY_BY_KEY = {
  [MODULE_KEY_FIN_PLATE]: MODULE_DISPLAY_FIN_PLATE,
  [MODULE_KEY_CLEAT_ANGLE]: MODULE_DISPLAY_CLEAT_ANGLE,
  [MODULE_KEY_END_PLATE]: "End Plate Connection",
  [MODULE_KEY_SEAT_ANGLE]: MODULE_DISPLAY_SEAT_ANGLE,
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED]: "Cover Plate Bolted",
  [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED]: "Cover Plate Welded",
  [MODULE_KEY_BEAM_BEAM_END_PLATE]: "Beam-Beam End Plate",
  [MODULE_KEY_BEAM_COLUMN_END_PLATE]: "Beam-Column End Plate",
  [MODULE_KEY_TENSION_BOLTED]: "Tension Member Bolted",
  [MODULE_KEY_TENSION_WELDED]: "Tension Member Welded",
  [MODULE_KEY_SIMPLY_SUPPORTED_BEAM]: "Simply Supported Beam",
};

/**
 * Get a human-readable display name for a module key.
 * Falls back to the key itself if no display name is defined.
 * @param {string} canonicalKey
 * @returns {string}
 */
export function getModuleDisplayName(canonicalKey) {
  return DISPLAY_BY_KEY[canonicalKey] ?? canonicalKey;
}

