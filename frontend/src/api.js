// API base URL is now driven by Vite env:
//   VITE_BASE_URL=http://127.0.0.1:8000/
// defined in frontend/.env (not hard-coded here).
// Fallback: current origin if env is not set.
const rawBase = import.meta.env.VITE_BASE_URL;
console.log(rawBase);
let apiBase = `${window.location.protocol}//${window.location.hostname}/`;

if (typeof rawBase === "string" && rawBase && rawBase !== "undefined") {
  apiBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
}

export { apiBase };
