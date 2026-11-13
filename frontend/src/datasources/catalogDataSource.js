import { apiClient } from "../utils/apiClient";
import { CATALOG } from "./endpoints";

/**
 * Fetch top-level catalog (connection types, etc.).
 */
export async function fetchCatalogRoot() {
  const res = await apiClient(CATALOG.root, { method: "GET" });
  const json = await res.json();
  return json.result;
}

/**
 * Fetch design types for a given connection type.
 */
export async function fetchDesignTypes(connType) {
  const url = CATALOG.designTypes(connType);
  const res = await apiClient(url, { method: "GET" });
  const json = await res.json();
  return json.result;
}

/**
 * Fetch sub-design types for a given design type and name.
 */
export async function fetchSubDesignTypes(designType, name) {
  const url = CATALOG.subDesignTypes(designType, name);
  const res = await apiClient(url, { method: "GET" });
  const json = await res.json();
  return json.result;
}

/**
 * Fetch the leaf level design type details.
 */
export async function fetchLeafDesignType(designType, prev, name) {
  const url = CATALOG.leafDesignType(designType, prev, name);
  const res = await apiClient(url, { method: "GET" });
  const json = await res.json();
  return json.result;
}

