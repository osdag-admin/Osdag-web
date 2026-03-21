import { apiClient } from "../utils/apiClient";
import { MODULES, CAD, MATERIALS, DESIGN_PREFERENCES } from "./endpoints";
import { getModuleSlug } from "../constants/apiRoutes";

/**
 * Fetch module options / lists for a given module key.
 */
export async function fetchModuleOptions(moduleKey, { connectivity, email } = {}) {
  if (!moduleKey) return { success: false, error: "Module name is required" };

  const slug = getModuleSlug(moduleKey);
  let url = MODULES.options(slug);

  const params = new URLSearchParams();
  if (connectivity) params.append("connectivity", connectivity);
  if (email) params.append("email", email);
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const res = await apiClient(url, { method: "GET" });
  const data = await res.json();
  return { success: true, data };
}

/**
 * Create design calculation for a module.
 */
export async function createDesign(moduleKey, inputs) {
  const slug = getModuleSlug(moduleKey);
  const url = MODULES.design(slug);
  const res = await apiClient(url, {
    method: "POST",
    body: JSON.stringify({ inputs }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

/**
 * Create 3D CAD model for a module.
 */
export async function createCad(moduleKey, inputs) {
  const slug = getModuleSlug(moduleKey);
  const url = MODULES.cad(slug);
  const res = await apiClient(url, {
    method: "POST",
    body: JSON.stringify({ inputs }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

/**
 * Download CAD model in the specified format.
 */
export async function downloadCad(format) {
  const res = await apiClient(CAD.download, {
    method: "POST",
    body: JSON.stringify({ format, section: "Model" }),
  });
  const blob = await res.blob();
  return { success: true, blob };
}

/**
 * Add a custom material via materialDetails API.
 */
export async function addCustomMaterial(materialData) {
  const { grade, inputs } = materialData;
  const email = localStorage.getItem("email");
  const res = await apiClient(MATERIALS.customMaterial, {
    method: "POST",
    body: JSON.stringify({
      email,
      materialName: grade,
      fy_20: parseInt(inputs.fy_20),
      fy_20_40: parseInt(inputs.fy_20_40),
      fy_40: parseInt(inputs.fy_40),
      fu: parseInt(inputs.fu),
    }),
  });
  const data = await res.json();
  return { success: true, data };
}

/**
 * Get design preferences for connections.
 */
export async function fetchDesignPreferences(params = {}) {
  let url = DESIGN_PREFERENCES.list;
  const { supported_section, supporting_section, connectivity } = params;
  const qs = new URLSearchParams();
  if (supported_section) qs.append("supported_section", supported_section);
  if (supporting_section) qs.append("supporting_section", supporting_section);
  if (connectivity) qs.append("connectivity", connectivity);
  const query = qs.toString();
  if (query) url += `?${query}`;

  const res = await apiClient(url, { method: "GET" });
  const data = await res.json();
  return { success: true, data };
}

