# Design preferences and material sync (desktop vs web)

**Canonical desktop GUI documentation** (all `osdag_gui` flows, hooks, edge cases, and the **per-module** `input_dictionary_without_design_pref` table) lives in the Osdag repo at:

`Osdag/src/osdag_gui/docs/GUI_ARCHITECTURE_AND_FLOWS.md`

The sections below keep a **shorter desktop summary** plus **web** sync notes for `Osdag-web`.

---

This document describes how **material** and **design preference (Additional Inputs)** values relate in the **desktop** GUI (`Osdag/src/osdag_gui/`) and how that compares to the **web** frontend (`Osdag-web/frontend/`). It is aimed at developers implementing sync logic or debugging drift between input dock, section tabs, and connector tab.

---

## 1. Terminology

| Term (desktop) | Meaning |
|----------------|--------|
| **Input dock** | Primary module inputs built from `main.input_values()`. |
| **Additional Inputs** | Modal dialog for design preferences (`AdditionalInputs` / `Window` in `additional_inputs.py`). |
| **`design_fn`** | `template_page.design_fn` — merges input dock + design pref into `self.design_inputs`. |
| **`design_pref_inputs`** | Dict of user-saved design-pref widget values (after **Save** on the dialog). |
| **`input_dock_inputs`** | Snapshot dict used to seed the Additional Inputs dialog and track “what the dock had” when merging. |

---

## 2. Desktop: where material appears

Material is not a single concept in the UI:

1. **Input dock** — often a main grade field (e.g. `KEY_MATERIAL` in connection modules).
2. **Design pref tabs** — separate widgets per tab, e.g. supporting column section material, supported beam section material, connector material, and module-specific tabs (angles, base plate, etc.).

These are **separate Qt widgets**. Consistency comes from **merge rules** in Python (`design_fn` + module callbacks), not from one shared combo.

---

## 3. Desktop: core merge (`design_fn`)

**File:** `Osdag/src/osdag_gui/ui/windows/template_page.py` — `design_fn`

Rough order:

1. **Read every input dock field** from widgets → `design_dictionary` and `self.input_dock_inputs`.
2. **Merge in** any `design_pref_inputs` keys that are not already in `input_dock_inputs` (so saved prefs participate in seeding the dialog dictionary).
3. **Branch on `self.designPrefDialog.flag`:**
   - **`flag` is True** — sections are considered selected (not `'Select Section'` in inputs). For keys listed in `main.input_dictionary_design_pref()`, values are read **from the live Additional Inputs widgets** (if the dialog exists and tab widgets are found).
   - **`flag` is False** — for each row in `main.input_dictionary_without_design_pref()`:
     - If the row’s source is **`'Input Dock'`**: every listed design-pref key is set to **`design_dictionary[input_dock_key]`** (same string as the dock combo).
     - Else: each key is filled via **`main.get_values_for_design_pref(key_name, design_dictionary)`** (module-defined defaults, often using dock material among other fields).
4. **Overlay** `design_pref_inputs` onto `design_dictionary` (saved overrides win for those keys).
5. Assign **`self.design_inputs = design_dictionary`** (used for design / OSI / etc.).

**Implication:** When `flag` is false, **input-dock-driven copy** and **defaults** run before the overlay. When `flag` is true, live dialog values dominate for keys in `input_dictionary_design_pref()`.

---

## 4. Desktop: linking input dock changes to design prefs

**Files:**

- `Osdag/src/osdag_gui/ui/components/docks/input_dock.py` — builds dock; calls `input_dp_connection` for “linked” keys.
- `Osdag/src/osdag_gui/ui/windows/template_page.py` — `input_dp_connection`, `clear_design_pref_dictionary`.

Mechanism:

- `main.input_dictionary_without_design_pref()` returns tuples; entries with source **`'Input Dock'`** contribute their **first element** (the input dock key) to `input_dp_conn_list`.
- For those fields, **`currentIndexChanged`** (combo) or **`textChanged`** (line edit) calls **`clear_design_pref_dictionary`**, which sets **`self.design_pref_inputs = {}`** (when `ui_loaded` is true).

**Intent:** Changing a linked dock field **drops persisted design-pref overrides** so the next `design_fn` can re-apply module copy/default rules without stale values.

**Caveat:** `currentIndexChanged` also fires when a combo is repopulated programmatically; linked fields can clear prefs more often than a user-only change.

---

## 5. Desktop: example module mapping (End plate connection)

**File:** `Osdag/src/osdag_core/design_type/connection/end_plate_connection.py`

- **`input_dictionary_without_design_pref`** — maps **`KEY_MATERIAL`** (input dock) to **`KEY_SUPTNGSEC_MATERIAL`** and **`KEY_SUPTDSEC_MATERIAL`** with source `'Input Dock'` (both section tab materials track the dock grade when the `flag`-false path runs).
- **`get_values_for_design_pref`** — e.g. sets **`KEY_CONNECTOR_MATERIAL`** from **`design_dictionary[KEY_MATERIAL]`** among other defaults (bolt, weld, detailing, etc.).

Other modules define **their own** tuples and `get_values_for_design_pref`; behaviour is **not identical** across all connection types.

---

## 6. Desktop: Additional Inputs lifecycle

**Files:** `additional_inputs.py` (`AdditionalInputs`, `Window`), `template_page.py` (`common_function_for_save_and_design`, `design_preferences`, `capture_design_pref_values`).

- Opening via **Design_Pref** trigger may **recreate** `AdditionalInputs` if `prev_inputs != input_dock_inputs` **or** the last dialog result was not **Accepted** (`designPrefDialog.changes != QDialog.Accepted`). See `common_function_for_save_and_design` when `trigger_type == "Design_Pref"`.
- **`AdditionalInputs.show`** — after `exec_()`, if not Accepted, sets **`flag = False`**. Always sets **`module_window.prev_inputs = module_window.input_dock_inputs`**.
- **Save** on the dialog — `close_designPref` → `accept`; **`capture_design_pref_values`** runs from `design_preferences` and copies widget values into **`design_pref_inputs`**.

---

## 7. Desktop: in-tab updates (Fu / Fy / images)

**Files:** `template_page.combined_design_prefer`, `tab_change`, `connect_combobox_for_tab`

- `main.tab_value_changed()` registers which combos/line edits on which tab drive which outputs.
- Handlers receive **`input_dock_inputs`** and **`main.design_button_status`** in addition to tab widget values.
- **Some modules disable this wiring** (e.g. certain flexure / compression column module names return early in `connect_combobox_for_tab` / `refresh_section`).

---

## 8. Desktop: other related mechanisms (easy to overlook)

| Topic | Where / what |
|--------|----------------|
| **Combo list repopulation** | `InputDock.change` / `on_change_connect` — dependent combos cleared/refilled from module rules; not the same as `input_dictionary_without_design_pref` copy, but can change index and trigger `currentIndexChanged`. |
| **Tab rename / remove** | `combined_design_prefer` + `main.edit_tabs()` — tabs follow connectivity labels or hide tabs. |
| **Section list refresh** | `main.refresh_input_dock()` + `refresh_section` — syncs section/material lists with DB or popup state. |
| **Custom material** | `input_dock.py` — `new_material_dialog`, DB insert, combobox refresh for `KEY_MATERIAL`. |
| **Defaults button** | `AdditionalInputs.default_fn` — resets several tabs from `get_values_for_design_pref` and current `input_dictionary`. |
| **Close without save** | `Window.closeEvent` — optional save prompt; reject keeps dialog open. |
| **Non-material design prefs** | Bolt / weld / detailing / design method defaults also come from `get_values_for_design_pref` in many modules. |

---

## 9. Web: current behaviour (summary)

**Material options list**

- `DesignPrefSections.jsx` builds `materialListForModals = moduleMaterialList ?? ctx.materialList ?? []` and passes it as **`materialList`** into section modals.

**Separate selected values**

- Column tab: `supporting_material` + context **`supporting_material_details`** (via `material_update` with `materialType: "supporting"`).
- Beam tab: `supported_material` + **`supported_material_details`** (`materialType: "supported"`).
- Connector tab: `connector_material` + **`conn_material_details`** (`materialType: "connector"`).

**Reducer mapping** — `Osdag-web/frontend/src/context/ModuleReducer.jsx` — `SAVE_MATERIAL_DETAILS`: connector / supported / supporting each map to the corresponding details array.

**Gap vs desktop**

- Web does **not** currently mirror desktop’s **`clear_design_pref_dictionary`** + **`design_fn`** merge on every linked input-dock material change.
- Section modals often use **fallback** display values from `inputs.connector_material` / `inputs.material` when design-pref state is empty, which can make tabs **look** tied when they are stored separately.
- **Single source for `materialList`** in children (`prop` only vs `prop ?? context`) is a maintainability choice; desktop always seeds the dialog from a merged `input_dictionary` at open time.

---

## 10. Parity checklist (web implementation)

When implementing desktop-like behaviour on web, consider:

1. **On input dock `material` (or module-defined “master” key) change:** clear or flag “user overrides” for linked design-pref keys (desktop: `design_pref_inputs = {}`).
2. **On merge before design / before opening design pref:** apply per-module rules:
   - copy master material into `supporting_material` / `supported_material` where desktop uses `'Input Dock'` rows;
   - set connector default from the same rules as `get_values_for_design_pref` for that module (may need API or shared config).
3. **Distinguish** “options list changed” vs “grade selection changed” if you need to avoid spurious clears.
4. **Match `flag` semantics** if web has an equivalent “sections not selected” state — either always read from controlled state or document divergence.
5. **Dispatch three `material_update` actions** (or one batched action) when syncing so Fu/Fy buckets stay aligned with dropdowns.
6. **Module table:** document each web module’s mapping alongside `osdag_core` `input_dictionary_without_design_pref` / `get_values_for_design_pref` for that module.

---

## 11. Reference paths (quick index)

| Area | Path |
|------|------|
| Desktop merge | `Osdag/src/osdag_gui/ui/windows/template_page.py` — `design_fn`, `input_dp_connection`, `clear_design_pref_dictionary`, `combined_design_prefer`, `tab_change`, `capture_design_pref_values` |
| Desktop input dock | `Osdag/src/osdag_gui/ui/components/docks/input_dock.py` |
| Desktop design pref UI | `Osdag/src/osdag_gui/ui/windows/additional_inputs.py` |
| Example module rules | `Osdag/src/osdag_core/design_type/connection/end_plate_connection.py` — `input_dictionary_without_design_pref`, `get_values_for_design_pref`, `tab_value_changed` |
| Web design pref shell | `Osdag-web/frontend/src/modules/shared/components/DesignPrefSections.jsx` |
| Web reducer | `Osdag-web/frontend/src/context/ModuleReducer.jsx` — `SAVE_MATERIAL_DETAILS` |

---

## 12. What this doc may still omit

- **Per-module** full tables for every connection type (only end plate is illustrated; others need the same read of their Python class).
- **Backend API** contract if web gets defaults from the server instead of porting `get_values_for_design_pref` logic.
- **Historical** `ui_template.py` (older GUI stack) if still used in some builds — this doc targets `osdag_gui` + `template_page.py`.
- **Persistence** (OSI / project) field names and migration — `design_inputs` keys on desktop vs web payload names should be verified module-by-module when wiring sync.

If you extend sync rules for one module, add a short subsection under §10 with that module’s key names and triggers.

---

## 13. Implementation notes (sync path) — addressing timing, guards, and policy

This section captures design decisions that are easy to under-specify in a high-level plan but matter for correctness and UX.

### 13.1 Input dock change: when to call the backend

- **Not** on every keystroke. Dock refresh is tied to **driving material fields** only (`material`, `member_material`) plus debounce (`useDesignPrefSync`, default **200 ms**), **abort** of the previous in-flight request, and **pause** while the Additional Inputs modal is open (the modal owns refresh then).
- Other dock fields still ride along in the JSON body via a ref to the latest `inputs` snapshot when a material-driven refresh fires.
- **Modal open** runs a separate `operation: "open"` request; loading/spinner blocks interaction until the first merged payload is applied.

### 13.2 Select Section guard (desktop `flag` / half-initialized dialog)

- Desktop avoids seeding the design-pref dialog with nonsense when sections are not chosen (`design_fn` branch when `flag` is false vs true — see §3).
- Web equivalent: **`canOpenAdditionalInputs`** (`frontend/src/modules/shared/utils/designPrefOpenGuard.js`) reuses each module’s existing **`validateInputs`** (same rules as “Run design”) before opening Additional Inputs from the dock or the **Design Preferences** menu item.
- If validation fails, the user sees a **warning** and the modal does not open — preventing stale or placeholder-driven material seeding.

### 13.3 Clearing overrides vs backend-only merge (`clear_design_pref_dictionary`)

- Desktop clears **`design_pref_inputs`** when linked dock combos change (§4).
- Sync path intent: backend merge on refresh/save is authoritative; the client should **not** keep a parallel hidden override map. Dock refresh overwrites merged keys in `inputs` from `resolved_inputs`; tab draft in the modal is separate until **Save**.
- If product requires a stricter “clear all pref keys on any linked dock change,” that should be an explicit follow-up (possibly a dedicated reducer action + sync `operation`).

### 13.4 Session name mapping — prerequisite, not paperwork

- **Normalize** web `sessionName` -> backend `sync_merge` keys in one place; mismatches (camelCase vs spaced titles) are the dominant failure mode. See `docs/DESIGN_PREF_MODULE_MAPPING.md` in the repo and keep it updated when adding modules.

### 13.5 Rollout gates

- "Internal -> staging -> prod" needs **pass/fail per module**: use the checklist in `docs/DESIGN_PREF_SYNC_ROLLOUT.md` and add **concrete** rows (connectivity, dock material, expected `supporting_material` / `connector_material`, and material-detail buckets) as you certify each module.

### 13.6 Mid-modal cross-tab dependencies

- Desktop **`tab_value_changed`** can update dependent combos while the dialog stays open. The web sync flow today reconciles on **open**, **refresh** (dock material while modal open), **save**, and **reset** — not on every intra-modal field change.
- Modules where one tab’s choice **changes options** on another tab may still show stale option lists until **Save** or the next **open**; call that out in per-module QA and consider a future **`operation: "tab_change"`** or field-scoped refresh if needed.
