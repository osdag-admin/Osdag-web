import { apiClient, subscribeToTask } from "../utils/apiClient";
import { REPORTS, MODULES } from "./endpoints";
import { getModuleSlug } from "../constants/apiRoutes";

/**
 * Generate initial report with metadata, module info and inputs.
 *
 * Uses slug-based module endpoints only:
 *   POST /api/modules/{module_slug}/report/generate-initial/
 */
export async function generateInitialReport(moduleKey, reportData) {
  const slug = moduleKey ? getModuleSlug(moduleKey) : null;
  if (!slug) {
    return {
      success: false,
      error: "Missing or invalid module key for slug-based report endpoint",
    };
  }

  const url = MODULES.reportGenerateInitial(slug);
  const res = await apiClient(url, {
    method: "POST",
    body: JSON.stringify(reportData),
  });

  if (res.status === 202) {
    const acceptedBody = await res.json();
    const taskId = acceptedBody.task_id;
    try {
      const taskResult = await subscribeToTask(taskId);
      const payload = taskResult.payload || {};
      const statusCode = taskResult.status_code || 200;
      
      if (statusCode >= 200 && statusCode < 300 && payload.success) {
        return {
          success: true,
          report_id: payload.report_id,
          sections: payload.sections,
        };
      }
      return { success: false, error: payload.error || "Failed to generate report" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const result = await res.json();
  if (res.ok && result.success) {
    return {
      success: true,
      report_id: result.report_id,
      sections: result.sections,
    };
  }

  return { success: false, error: result.error || "Failed to generate report" };
}

/**
 * Customize report and generate PDF blob.
 */
export async function customizeReport(reportId, selectedSections) {
  const res = await apiClient(REPORTS.customize, {
    method: "POST",
    body: JSON.stringify({
      report_id: reportId,
      selected_sections: selectedSections,
    }),
  });
  const blob = await res.blob();
  return { success: true, blob };
}

