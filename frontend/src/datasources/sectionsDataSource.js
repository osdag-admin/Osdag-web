import { apiClient } from "../utils/apiClient";
import { SECTIONS } from "./endpoints";

/**
 * Parse RFC5987 filename* or quoted filename from Content-Disposition.
 * @param {string | null} header
 * @returns {string | null}
 */
export function parseContentDispositionFilename(header) {
  if (!header || typeof header !== "string") return null;
  const star = /filename\*\s*=\s*[^']*''([^;]+)|filename\*\s*=\s*UTF-8''([^;]+)/i.exec(
    header
  );
  if (star) {
    const raw = (star[1] || star[2] || "").trim();
    try {
      return decodeURIComponent(raw.replace(/"/g, ""));
    } catch {
      return raw.replace(/"/g, "");
    }
  }
  const m = /filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;\s]+)/i.exec(header);
  if (m) return (m[1] || m[2] || "").trim();
  return null;
}

export function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchBlobWithFilename(url) {
  const res = await apiClient(url, { method: "GET" });
  const blob = await res.blob();
  const fromHeader = parseContentDispositionFilename(
    res.headers.get("Content-Disposition")
  );
  return { blob, filename: fromHeader };
}

/**
 * @param {string} table - Columns | Beams | Angles | Channels
 */
export async function downloadSectionTemplate(table) {
  const url = `${SECTIONS.template}?${new URLSearchParams({ table }).toString()}`;
  const { blob, filename } = await fetchBlobWithFilename(url);
  triggerBrowserDownload(blob, filename || `${table}_SectionTemplate.xlsx`);
  return { success: true };
}

/**
 * Export current user's custom rows for `table` (scope=user).
 * @param {string} table
 */
export async function downloadSectionExportUser(table) {
  const qs = new URLSearchParams({ table, scope: "user" }).toString();
  const url = `${SECTIONS.export}?${qs}`;
  const { blob, filename } = await fetchBlobWithFilename(url);
  triggerBrowserDownload(blob, filename || `${table}_MySections.xlsx`);
  return { success: true };
}

/**
 * @param {string} table
 * @param {File} file
 * @returns {Promise<{ success: true, data: object } | { success: false, error: string }>}
 */
export async function importSectionXlsx(table, file) {
  const formData = new FormData();
  formData.append("table", table);
  formData.append("file", file);
  const res = await apiClient(SECTIONS.import, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { success: true, data };
}

/**
 * @param {string} table
 * @param {Record<string, unknown>} payload - one row (matches API / serializer fields)
 */
export async function addCustomSection(table, payload) {
  const url = `${SECTIONS.customCreate}?${new URLSearchParams({ table }).toString()}`;
  const res = await apiClient(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { success: true, status: res.status, data };
}

/**
 * @param {string} table
 * @param {string} designation
 */
export async function deleteCustomSection(table, designation) {
  const qs = new URLSearchParams({ table, designation }).toString();
  const url = `${SECTIONS.customDelete}?${qs}`;
  const res = await apiClient(url, { method: "DELETE" });
  return { success: true, status: res.status };
}
