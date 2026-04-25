// Module identifier helpers.
// We use stable MODULE_KEY_* values everywhere.

/**
 * Normalize a module identifier to its stable key.
 * Since we don't support legacy short codes anymore, this is currently a no-op.
 * @param {string} id
 * @returns {string}
 */
export function normalizeModuleId(id) {
  return id;
}

