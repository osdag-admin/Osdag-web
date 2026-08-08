import { apiClient, subscribeToTask } from "../utils/apiClient";
import { MODULES, CAD, MATERIALS, DESIGN_PREFERENCES } from "./endpoints";
import { getModuleSlug } from "../constants/apiRoutes";

/**
 * Fetch module options / lists for a given module key.
 */
export async function fetchModuleOptions(moduleKey, { connectivity } = {}) {
  if (!moduleKey) return { success: false, error: "Module name is required" };

  const slug = getModuleSlug(moduleKey);
  let url = MODULES.options(slug);

  const params = new URLSearchParams();
  if (connectivity) params.append("connectivity", connectivity);
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
  
  if (res.status === 202) {
    const acceptedBody = await res.json();
    const taskId = acceptedBody.task_id;
    try {
      const taskResult = await subscribeToTask(taskId);
      const finalBody = {
        ...taskResult,
        project_saved: acceptedBody.project_saved,
        project_id: acceptedBody.project_id,
        project_error: acceptedBody.project_error
      };
      return { status: 200, body: finalBody };
    } catch (err) {
      return { status: 400, body: { success: false, error: err.message } };
    }
  }

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
  
  if (res.status === 202) {
    const acceptedBody = await res.json();
    const taskId = acceptedBody.task_id;
    try {
      const taskResult = await subscribeToTask(taskId);
      const isComingSoon = !taskResult.files || Object.keys(taskResult.files).length === 0;
      const finalData = {
        status: isComingSoon ? 'coming_soon' : 'success',
        files: taskResult.files || {},
        hover_dict: taskResult.hover_dict || {},
        warnings: taskResult.warnings || [],
        message: isComingSoon ? '3D model generation is coming soon' : 'CAD models generated successfully'
      };
      return { status: isComingSoon ? 200 : 201, data: finalData };
    } catch (err) {
      return { status: 500, data: { status: 'error', message: err.message } };
    }
  }

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
 * Export CAD for requested format by regenerating from input_values.
 */
export async function exportCad(module_id, input_values, format, section = "Model") {
  const res = await apiClient(CAD.export, {
    method: "POST",
    body: JSON.stringify({
      module_id,
      section,
      format,
      input_values,
    }),
  });

  if (!res.ok) {
    let errorMsg = "CAD export failed";
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch (_e) { }
    return { success: false, error: errorMsg };
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  return { success: true, blob, disposition };
}

/**
 * Add a custom material via materialDetails API.
 */
export async function addCustomMaterial(materialData) {
  const { grade, inputs } = materialData;
  const res = await apiClient(MATERIALS.customMaterial, {
    method: "POST",
    body: JSON.stringify({
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
/**
 * Server-resolved design-preference sync.
 * @param {object} body - { module_session_name, inputs, operation, design_pref_draft? }
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function fetchDesignPrefSync(body, signal) {
  try {
    const res = await apiClient(DESIGN_PREFERENCES.sync, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, error: data.error || "Preference sync failed" };
    }
    return {
      success: true,
      data: {
        ...data,
        resolved_inputs: data.resolved_inputs || {},
        section_details: data.section_details || { supporting: {}, supported: {} },
      },
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { success: false, error: "aborted", aborted: true };
    }
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Resolve Additional Inputs defaults for a module + dock state.
 * @param {object} body - { module_session_name, inputs }
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function fetchDesignPrefDefaults(body, signal) {
  try {
    const res = await apiClient(DESIGN_PREFERENCES.defaults, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, error: data.error || "Preference defaults failed" };
    }
    return {
      success: true,
      data: {
        ...data,
        default_pref_inputs: data.default_pref_inputs || {},
        section_details: data.section_details || { supporting: {}, supported: {} },
      },
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { success: false, error: "aborted", aborted: true };
    }
    return { success: false, error: err.message || String(err) };
  }
}

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
