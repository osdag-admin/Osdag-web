import { MODULE_ROUTES, normalizeModuleKey } from "./modules";

/**
 * Get the route path for a stable module key.
 * @param {string} moduleKey
 * @returns {string|undefined}
 */
export function getModuleRoute(moduleKey) {
  const stableKey = normalizeModuleKey(moduleKey);
  return MODULE_ROUTES[stableKey];
}

export { MODULE_ROUTES as ROUTES_BY_KEY };
