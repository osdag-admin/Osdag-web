const rawBase = import.meta.env.VITE_BASE_URL;
let apiBase = `${window.location.protocol}//${window.location.host}/`;

if (typeof rawBase === "string" && rawBase && rawBase !== "undefined") {
  apiBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
}

export { apiBase };
