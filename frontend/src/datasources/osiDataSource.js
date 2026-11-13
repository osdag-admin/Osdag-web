import { apiClient } from "../utils/apiClient";
import { OSI } from "./endpoints";

/**
 * Save OSI file from inputs.
 */
export async function saveOsiFromInputs({ name, moduleId, inputs, inline = false }) {
  const res = await apiClient(OSI.saveFromInputs, {
    method: "POST",
    body: JSON.stringify({
      name,
      module_id: moduleId,
      inputs,
      inline,
    }),
  });
  const data = await res.json();
  if (data.success) {
    return {
      success: true,
      content_base64: data.content_base64,
      filename: data.filename,
      is_guest: data.is_guest,
    };
  }
  return { success: false, error: data.error || "Failed to save OSI file" };
}

/**
 * Open an uploaded OSI file and return parsed inputs.
 */
export async function openOsiFile(formData) {
  const res = await apiClient(OSI.openUpload, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { ok: res.ok, ...data };
}


