import { apiClient } from "../utils/apiClient";
import { AUTH } from "./endpoints";

/**
 * Sync a Firebase user to the Django backend using an ID token.
 */
export async function firebaseLoginWithToken(idToken) {
  const res = await apiClient(AUTH.firebaseLogin, {
    method: "POST",
    body: JSON.stringify({ token: idToken }),
  });
  return res.json();
}

