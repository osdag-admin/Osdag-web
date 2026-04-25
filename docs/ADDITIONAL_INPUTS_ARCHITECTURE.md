# Additional Inputs: End-to-End Architecture and Behavior

This document explains how **Additional Inputs** works in Osdag Web, including:

- where values come from,
- how values are synchronized,
- how overrides and defaults behave,
- and split defaults/sync API behavior.

---

## 1) Entry points (how the modal opens)

Additional Inputs can be opened from:

- `frontend/src/modules/shared/components/BaseInputDock.jsx` (`Additional Inputs` button)
- `frontend/src/modules/shared/utils/UnifiedDropdownMenu.jsx` (`Design Preferences` menu item)

Both paths run the same readiness guard:

- `frontend/src/modules/shared/utils/designPrefOpenGuard.js` (`canOpenAdditionalInputs`)
- It reuses each module's `validateInputs(...)` rule.
- If required base inputs (like section/designation) are missing, modal open is blocked with a warning.

---

## 2) Core data model

There are four important frontend state layers:

1. **Main dock inputs** (`inputs`)
  - Source-of-truth for input dock fields.
  - Managed in `useEngineeringModule` + `useModuleForm`.
2. **Modal working state** (`designPrefInputs`)
  - Local editable fields inside Additional Inputs tabs.
  - Initialized from merged view `{ ...inputs, ...designPrefOverrides }` using module-specific mapper in `designPrefModuleConfig.js`.
3. **Saved Additional Inputs overrides** (`designPrefOverrides`)
  - Web-only split dictionary for modal overrides.
  - Persisted separately from dock inputs in project `inputs_json.pref`.
  - Material override keys (`supporting_material`, `supported_material`, `connector_material`) are cleared when dock driver changes.
4. **Material detail buckets** (`conn_material_details`, `supported_material_details`, `supporting_material_details`)
  - Read-only material properties shown in tabs (Fu/Fy rows etc.).
  - Updated from backend sync response via reducer action `APPLY_DESIGN_PREF_SYNC_BUNDLE`.

Also tracked:

- `lastKnownGoodDesignPrefSnapshot` for rollback on sync errors.
- `designOutputsInvalidated` to mark old design/cad/report as stale after effective pref changes.

References:

- `frontend/src/context/ModuleState.jsx`
- `frontend/src/context/ModuleReducer.jsx`

---

## 3) Where values come from

### 3.1 Base options/material lists

Dropdown options and material catalog lists come from module options APIs loaded via:

- `frontend/src/datasources/modulesDataSource.js` (`fetchModuleOptions`)
- then stored through `ModuleContext` module data flow.

These lists feed tab components through `materialList` props.

### 3.2 Defaults + sync service responses

The backend exposes two endpoints:

- `POST /api/design-preferences/defaults/`
  - implemented in `backend/apps/core/api/design/design_pref_defaults_api.py`
  - returns `default_pref_inputs`, `material_details`, `section_details`, `metadata`
- `POST /api/design-preferences/sync/`
  - implemented in `backend/apps/core/api/design/design_pref_sync_api.py`
  - used for refresh/save semantics
  - returns `resolved_inputs`, `material_details`, `section_details`, `metadata`

Merge logic lives in:

- `backend/apps/core/api/design/sync_merge.py`

Material synchronization rules are module-specific in `_MATERIAL_SYNC_RULES`.

### 3.3 Module-specific tab fields/default mappers

Per-module tab set, initial tab, and input mapping are declared in:

- `frontend/src/modules/shared/config/designPrefModuleConfig.js`

Each module entry defines:

- `tabIds`
- `initialTabIndex`
- `getInitialPrefs(inputs)` mapping
- `getDefaultPrefs(...)` (module-level defaults definition)

---

## 4) Sync lifecycle (what happens when)

Two sync orchestrators run:

1. **Dock-side passive sync**
  - `frontend/src/modules/shared/hooks/useDesignPrefSync.js`
  - Watches driving dock material fields: `connector_material`, `material`, and `member_material`
  - Debounced (200ms), aborts previous request, and pauses while modal is open (`pause: designPrefModalStatus`)
2. **Modal-owned defaults/sync**
  - `frontend/src/modules/shared/components/DesignPrefSections.jsx`
  - Owns calls during modal lifecycle:
    - open-time defaults
    - save (sync API)
    - defaults reset (defaults API)
    - transitional in-modal material refresh (sync API)

Modal sync requests are now sent with merged runtime view:

- `inputs_for_sync = { ...inputs, ...designPrefOverrides }`

This keeps backend behavior desktop-aligned while preserving dock/pref separation in web state.

---

## 5) API semantics (all cases)

### Defaults API

- Triggered when modal mounts and when user clicks `Defaults`.
- Backend resolves defaults from current dock driver context and returns `default_pref_inputs`.
- Frontend stores resulting values in `designPrefOverrides`, rebuilds `designPrefInputs`, updates `section_details`, and refreshes material detail buckets.

### `refresh`

- Triggered when dock-driving material changes in the main form.
- Backend returns `resolved_inputs` plus linked-key metadata.
- Frontend rewrites only Additional Inputs override keys (not dock `inputs`) from response metadata.

### `save`

- Triggered by `Save` button in Additional Inputs.
- Backend behavior: apply `design_pref_draft` over current inputs, **without forced driver overwrite**.
- Meaning: user tab edits are preserved as intended on save.
- Frontend then:
  - stores returned `resolved_inputs` as `designPrefOverrides` (excluding dock drivers)
  - invalidates design outputs (requires re-run)
  - closes modal

## 6) Overrides and defaults behavior

### 6.1 Overriding values

- User edits inside modal update `designPrefInputs` only (local draft).
- Nothing is final until `Save`.
- On `Save`, backend merges draft into final `resolved_inputs`, and frontend persists it into `designPrefOverrides`.
- Dock `inputs` are not overwritten by Additional Inputs save.

### 6.2 Reset to defaults

- `Defaults` uses backend defaults endpoint.
- Result is contextual to current module + current driver grade.
- This is not just static hardcoded UI reset; it is server-resolved.
- Defaulted values are stored in `designPrefOverrides`.

### 6.3 Dock driver change after saved override

When dock driver changes (for example `material`, `member_material`, or `connector_material`):

- frontend clears only linked material override keys from `designPrefOverrides`:
  - `supporting_material`
  - `supported_material`
  - `connector_material`
- all non-material overrides (bolt/weld/detailing/etc.) remain untouched
- next modal open/refresh reseeds material-linked tabs from dock driver context

### 6.4 Module defaults definitions

`designPrefModuleConfig.js` still defines `getDefaultPrefs(...)` and module-specific defaults.

Current runtime flow relies on backend `reset` for final applied result; config defaults are primarily useful for module mapping consistency and initialization patterns.

---

## 7) Material property rows (Fu/Fy) in tabs

Tabs like Connector/Beam/Column show read-only material properties from context buckets:

- `conn_material_details`
- `supported_material_details`
- `supporting_material_details`

Those buckets are set from backend `material_details` in sync responses, not by local calculations.

Example consumer:

- `frontend/src/modules/shared/components/ConnectorSectionModal.jsx`

---

## 8) Error handling and rollback

If defaults/sync request fails:

- UI shows warning message,
- previous in-flight request is aborted (if any),
- modal attempts rollback to `lastKnownGoodDesignPrefSnapshot`.

This protects against stale/partial state from network/API failures.

---

## 9) Source-of-truth precedence

In practical terms:

1. Dock state: `inputs` owns dock fields.
2. Additional Inputs state: `designPrefOverrides` owns saved modal overrides.
3. Runtime backend sync/design payloads use merged view: `{ ...inputs, ...designPrefOverrides }`.
4. Modal local `designPrefInputs` is editable draft until save.
5. Dock drivers (`connector_material`, `material`, `member_material`) control linked reseed behavior.
6. Material/section detail rows come from backend sync response (`material_details`, `section_details`).

---

## 10) Key files map

Frontend:

- `frontend/src/modules/shared/components/BaseInputDock.jsx`
- `frontend/src/modules/shared/utils/UnifiedDropdownMenu.jsx`
- `frontend/src/modules/shared/utils/designPrefOpenGuard.js`
- `frontend/src/modules/shared/hooks/useEngineeringModule.js`
- `frontend/src/modules/shared/hooks/useDesignPrefSync.js`
- `frontend/src/modules/shared/components/DesignPrefSections.jsx`
- `frontend/src/modules/shared/config/designPrefModuleConfig.js`
- `frontend/src/modules/shared/hooks/useModuleForm.js`
- `frontend/src/modules/shared/components/EngineeringModule.jsx`
- `frontend/src/modules/shared/hooks/useDesignSubmission.js`
- `frontend/src/datasources/modulesDataSource.js`
- `frontend/src/datasources/endpoints.js`

Backend:

- `backend/apps/core/api/design/design_pref_sync_api.py`
- `backend/apps/core/api/design/design_pref_defaults_api.py`
- `backend/apps/core/api/design/sync_merge.py`
- `backend/apps/core/urls.py`
- `backend/apps/core/tests/test_design_pref_sync.py`

---

## 11) Developer notes

- When adding a new module, update:
  - frontend module config mapping (`designPrefModuleConfig.js`)
  - backend `_MATERIAL_SYNC_RULES` in `sync_merge.py`
  - test coverage in `test_design_pref_sync.py`
- Keep `module_session_name` exactly aligned with frontend module `sessionName`.
- If sync payload shape evolves, update datasource adaptation in one place:
  - `fetchDesignPrefSync(...)` in `modulesDataSource.js`

