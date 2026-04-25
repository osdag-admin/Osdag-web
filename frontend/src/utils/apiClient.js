import { apiBase } from "../api";
import { getAccessToken } from "../utils/auth";

/**
 * Shared fetch-based API client with Firebase token injection.
 *
 * Usage:
 *   import { apiClient } from "../utils/apiClient";
 *   const res = await apiClient("api/projects/", { method: "GET" });
 *   const data = await res.json();
 */
const createApiClient = (baseUrl) => {
  return async (url, options = {}) => {
    const token = await getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Let the browser set Content-Type when sending FormData
    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // ignore
        }
      }
      throw new Error(errorMessage);
    }

    return response;
  };
};

export const apiClient = createApiClient(apiBase);

