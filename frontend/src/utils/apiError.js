/**
 * Read an API error body.
 *
 * The backend returns
 *   { error: { code, message, fields?: { <key>: <message> } } }
 * (see documentation: backend architecture, "API error format").
 *
 * The legacy shapes ({ error: "text" }, { message }, { detail }, or a DRF field
 * dict) are still understood until every backend response is converted.
 *
 * @param {unknown} body - parsed JSON body of an error response
 * @returns {{ message: string|null, code: string|null, fields: Record<string, string>|null }}
 */
export function parseApiError(body) {
  const result = { message: null, code: null, fields: null };
  if (!body || typeof body !== "object") return result;

  const { error } = body;
  if (error && typeof error === "object") {
    result.message = typeof error.message === "string" ? error.message : null;
    result.code = typeof error.code === "string" ? error.code : null;
    if (error.fields && typeof error.fields === "object") {
      result.fields = error.fields;
    }
    return result;
  }

  // Legacy shapes
  if (typeof error === "string" && error) {
    result.message = error;
  } else if (typeof body.message === "string" && body.message) {
    result.message = body.message;
  } else if (typeof body.detail === "string" && body.detail) {
    result.message = body.detail;
  } else {
    const fieldErrors = [];
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        fieldErrors.push(`${key}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        fieldErrors.push(`${key}: ${value}`);
      }
    }
    if (fieldErrors.length > 0) result.message = fieldErrors.join(" | ");
  }
  return result;
}

/**
 * Convenience: the human-readable message of an error body, or `fallback`.
 */
export function getErrorMessage(body, fallback = "Request failed") {
  return parseApiError(body).message || fallback;
}
