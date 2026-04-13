// Centralized endpoint path builders for Osdag web backend.
// These are relative to apiBase and consumed by datasources + services.

export const API_PREFIX = "api/";

// ----------------------
// Projects
// ----------------------
export const PROJECTS = {
  list: `${API_PREFIX}projects/`, // GET
  create: `${API_PREFIX}projects/`, // POST
  detail: (id) => `${API_PREFIX}projects/${id}/`, // GET/PUT/DELETE
};

// ----------------------
// OSI / input files
// ----------------------
export const OSI = {
  saveFromInputs: `${API_PREFIX}save-osi-from-inputs/`, // POST
  openUpload: `${API_PREFIX}open-osi/`, // POST (multipart)
  openById: (id) => `${API_PREFIX}open-osi/${id}/`, // GET
};

// ----------------------
// Reports
// ----------------------
export const REPORTS = {
  customize: `${API_PREFIX}report/customize/`, // POST (returns PDF stream)
};

// ----------------------
// Modules (design + CAD)
// ----------------------
export const MODULES = {
  options: (slug) => `${API_PREFIX}modules/${slug}/options/`, // GET
  design: (slug) => `${API_PREFIX}modules/${slug}/design/`, // POST
  cad: (slug) => `${API_PREFIX}modules/${slug}/cad/`, // POST
  reportGenerateInitial: (slug) =>
    `${API_PREFIX}modules/${slug}/report/generate-initial/`, // POST
};

// ----------------------
// CAD helper
// ----------------------
export const CAD = {
  download: `${API_PREFIX}design/downloadCad/`, // POST
};

// ----------------------
// Materials & design preferences
// ----------------------
export const MATERIALS = {
  customMaterial: `${API_PREFIX}materialDetails/`, // POST
};

export const DESIGN_PREFERENCES = {
  list: `${API_PREFIX}design-preferences/`, // GET with query
};

// ----------------------
// User custom sections (catalog-shaped rows; auth for mutations)
// ----------------------
export const SECTIONS = {
  /** GET xlsx — query: table=Columns|Beams|Angles|Channels */
  template: `${API_PREFIX}sections/template/`,
  /** POST multipart — form: file, table */
  import: `${API_PREFIX}sections/import/`,
  /** POST JSON — query: table=… */
  customCreate: `${API_PREFIX}sections/custom/`,
  /** GET xlsx — query: table=…&scope=user */
  export: `${API_PREFIX}sections/export/`,
  /** DELETE — query: table=…&designation=… */
  customDelete: `${API_PREFIX}sections/custom/`,
};

// ----------------------
// Auth / Firebase sync
// ----------------------
export const AUTH = {
  firebaseLogin: `${API_PREFIX}auth/firebase-login/`, // POST
};

// ----------------------
// Public catalog (no auth)
// ----------------------
export const CATALOG = {
  root: "osdag-web/", // GET
  designTypes: (conn) => `osdag-web/${conn}`,
  subDesignTypes: (designType, name) =>
    `osdag-web/${designType}/${name.toLowerCase().replaceAll("_", "-")}`,
  leafDesignType: (designType, prev, name) =>
    `osdag-web/${designType}/${prev
      .toLowerCase()
      .replaceAll("_", "-")}/${name.toLowerCase().replaceAll("_", "-")}`,
};

// ----------------------
// Company / assets
// ----------------------
export const COMPANY = {
  logo: `${API_PREFIX}company-logo/`, // POST
};

