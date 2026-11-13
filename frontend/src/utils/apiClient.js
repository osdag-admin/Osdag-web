import { apiBase } from "../api";
import { auth } from "../Auth/firebase";
import { parseApiError } from "./apiError";

export const getAccessToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
};

const createApiClient = (baseUrl) => {
  const client = async (url, options = {}, isRetry = false) => {
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

    if (response.status === 401 && !isRetry) {
      const user = auth.currentUser;
      if (user) {
        console.warn("401 hit. Force-refreshing token and retrying...");
        const freshToken = await getAccessToken(true);

        if (!freshToken) {
          throw new Error("Unable to obtain a fresh session token.");
        }

        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${freshToken}`,
        };
        return await client(url, {
          ...options,
          headers: retryHeaders,
        }, true);
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorData = {};
      let errorCode = null;
      let errorFields = null;
      try {
        const text = await response.text().catch(() => "");
        if (text) {
          try {
            errorData = JSON.parse(text);
            const parsed = parseApiError(errorData);
            if (parsed.message) errorMessage = parsed.message;
            errorCode = parsed.code;
            errorFields = parsed.fields;
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // ignore
      }

      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      errorObj.code = errorCode;
      // { <input key>: <message> } when the backend reports per-field errors
      errorObj.fields = errorFields;
      errorObj.data = errorData;
      if (errorData.pending_deletion) {
        errorObj.pending_deletion = true;
        errorObj.uid = errorData.uid;
      }
      throw errorObj;
    }

    return response;
  };

  return client;
};

export const apiClient = createApiClient(apiBase);

export async function pollTask(taskId, delayMs = 1000, maxRetries = 300) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await apiClient(`api/tasks/${taskId}/`, { method: "GET" });
    const data = await res.json();
    if (data.status === "SUCCESS") {
      return data.result;
    }
    if (data.status === "FAILURE") {
      throw new Error(data.error || "Async task execution failed");
    }
    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("Task polling timed out");
}

/**
 * Wait for a Celery task over its WebSocket and resolve with its final result.
 *
 * `onProgress(data)` is called for messages a task sends before it finishes, for example
 * the design outputs sent ahead of the 3D model (`data.status` names the stage and
 * `data.result` holds its payload). A client that connects late never sees these, so the
 * resolved result must always be complete on its own.
 */
export function subscribeToTask(taskId, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const maxRetries = 3;
    let socket = null;
    let completed = false;

    function connect() {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let host = window.location.host;
      if (apiBase && (apiBase.startsWith("http://") || apiBase.startsWith("https://"))) {
        try {
          const urlObj = new URL(apiBase);
          host = urlObj.host;
        } catch {
          // ignore parsing error
        }
      }
      
      const wsUrl = `${wsProtocol}//${host}/ws/tasks/${taskId}/`;
      console.log(`Connecting to task WebSocket: ${wsUrl}`);
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "SUCCESS") {
            completed = true;
            if (data.result !== undefined && data.result !== null) {
              resolve(data.result);
            } else {
              console.log(`Task ${taskId} succeeded. Fetching result via HTTP...`);
              apiClient(`api/tasks/${taskId}/`, { method: "GET" })
                .then((res) => res.json())
                .then((taskData) => {
                  if (taskData.status === "SUCCESS") {
                    resolve(taskData.result);
                  } else {
                    reject(new Error(taskData.error || "Async task execution failed"));
                  }
                })
                .catch((err) => {
                  reject(new Error(`Failed to retrieve task result: ${err.message}`));
                });
            }
            socket.close();
          } else if (data.status === "FAILURE" || data.status === "REVOKED") {
            completed = true;
            reject(new Error(data.error || "Async task execution failed"));
            socket.close();
          } else if (onProgress) {
            onProgress(data);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error on task ${taskId}:`, error);
      };

      socket.onclose = (event) => {
        if (completed) return;

        if (event.wasClean) {
          console.log(`WebSocket closed cleanly for task ${taskId} before completion. Falling back to HTTP polling...`);
          completed = true;
          pollTask(taskId).then(resolve).catch(reject);
        } else {
          console.warn(`WebSocket closed unexpectedly for task ${taskId}. Code: ${event.code}`);
          if (retries < maxRetries) {
            retries++;
            const delay = 1000 * retries;
            console.log(`Retrying WebSocket connection in ${delay}ms (Attempt ${retries}/${maxRetries})`);
            setTimeout(connect, delay);
          } else {
            console.warn(`WebSocket connection failed after multiple retries for task ${taskId}. Falling back to HTTP polling...`);
            completed = true;
            pollTask(taskId).then(resolve).catch(reject);
          }
        }
      };
    }

    connect();
  });
}
