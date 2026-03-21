// Module identifier helpers.
// We use canonical MODULE_KEY_* values everywhere.

/**
 * Normalize a module identifier to its canonical key.
 * Since we don't support legacy short codes anymore, this is currently a no-op.
 * @param {string} id
 * @returns {string}
 */
export function normalizeModuleId(id) {
  return id;
}

