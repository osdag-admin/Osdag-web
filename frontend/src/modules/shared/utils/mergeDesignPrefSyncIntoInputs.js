/**
 * Merge design-pref sync API results into form `inputs` without clobbering
 * input-dock driver fields (material / member_material), matching the
 * stricter policy in `useDesignPrefSync`.
 */

/** Keys that the input dock owns; never overwrite from server merge on save/reset. */
const DOCK_DRIVER_KEYS = ["material", "member_material"];

/**
 * @param {Object|null|undefined} metadata - `metadata` from design-pref sync response
 * @returns {Set<string>} Target keys that were copied from the dock driver
 */
export function collectLinkedPrefKeysFromMetadata(metadata) {
  const copied = metadata?.copied_from_input_dock_keys || {};
  const linkedKeys = new Set();
  Object.values(copied).forEach((targets) => {
    if (Array.isArray(targets)) {
      targets.forEach((k) => linkedKeys.add(k));
    }
  });
  return linkedKeys;
}

/**
 * Only apply preference keys that the server linked from the dock (e.g. supporting_material).
 * Use for `open` / `refresh` (and error rollback) so the dock selection is never reset.
 *
 * @param {Object} prev
 * @param {Object} resolvedInputs
 * @param {Object|null|undefined} metadata
 */
export function mergeLinkedParityKeysIntoInputs(prev, resolvedInputs, metadata) {
  if (!resolvedInputs || typeof resolvedInputs !== "object") {
    return { ...prev };
  }
  const next = { ...prev };
  const keys = collectLinkedPrefKeysFromMetadata(metadata);
  keys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(resolvedInputs, k)) {
      next[k] = resolvedInputs[k];
    }
  });
  return next;
}

/**
 * Full merge of server `resolved_inputs` (e.g. after save or defaults), but always
 * keep current dock driver values from `prev` so the material dropdown does not jump.
 *
 * @param {Object} prev
 * @param {Object} resolvedInputs
 */
export function mergeParityIntoInputsPreservingDockDrivers(prev, resolvedInputs) {
  if (!resolvedInputs || typeof resolvedInputs !== "object") {
    return { ...prev };
  }
  const out = { ...prev, ...resolvedInputs };
  for (const k of DOCK_DRIVER_KEYS) {
    if (Object.prototype.hasOwnProperty.call(prev, k)) {
      out[k] = prev[k];
    }
  }
  return out;
}
