import { apiClient } from "../utils/apiClient";
import { PROJECTS } from "./endpoints";

/**
 * List recent projects for the current authenticated user.
 */
export async function listProjects() {
  const res = await apiClient(PROJECTS.list, { method: "GET" });
  return res.json();
}

/**
 * Create a new project.
 * Accepts a payload compatible with the backend ProjectAPI.
 */
export async function createProject(payload) {
  const res = await apiClient(PROJECTS.create, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * Get a single project by ID.
 */
export async function getProjectById(projectId) {
  const res = await apiClient(PROJECTS.detail(projectId), { method: "GET" });
  return res.json();
}

/**
 * Delete a project by ID.
 */
export async function deleteProject(projectId) {
  const res = await apiClient(PROJECTS.detail(projectId), { method: "DELETE" });
  // Some DELETEs may not return JSON; guard accordingly.
  try {
    return await res.json();
  } catch {
    return { success: res.ok };
  }
}

