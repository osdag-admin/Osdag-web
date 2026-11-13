# Chapter 5: OSI File Specification & Exchange System

Osdag-Web maintains full cross-compatibility with the Osdag desktop application through support for the **Osdag Input (`.osi`) file format**.

---

## 5.1 The OSI Format Anatomy

An `.osi` file is a serialized state payload containing all user-entered inputs and preferences. The backend utility [osi_files.py](../backend/apps/core/utils/osi_files.py) processes this in two formats:

### 1. The Desktop Dotted Flat Format (YAML-like)
The desktop Osdag application saves project inputs in a flat, dotted namespace format. This is the active, native file format used by the Osdag desktop application (not a legacy or deprecated format). Dictionaries are serialized into plain-text lines separated by colons, and lists are formatted with leading hyphens:
```yaml
Bolt.Bolt_Hole_Type: Standard
Bolt.Diameter:
- '20'
- '24'
Bolt.Grade:
- '4.6'
Module: Fin Plate Connection
```
* Osdag-Web reads these files with PyYAML (`_parse_flat_yaml`, a `SafeLoader` subclass), so everything YAML allows is handled: comments, quoting, and the anchors (`&id001`) and aliases (`*id001`) PyYAML writes when the same list occurs twice (for example the plate thickness lists of the cover plate modules). Each key gets its own copy of a shared list.
* Keys stay flat and dotted. Every value stays a string (`No`, `08` and `1.0` are not converted to a bool or number); lists are lists of strings; an empty value becomes an empty list.
* Text that is not a mapping, or a file without a `Module:` line, is rejected.

### 2. The Modern Nested Format (JSON)
For complex web configurations (including split input docks and design preference overrides), Osdag-Web also parses and serializes payloads as standard JSON:
```json
{
  "version": "1.0",
  "name": "Fin Plate Join",
  "module_id": "Fin Plate Connection",
  "inputs": {
    "dock": {
      "bolt_type": "Bearing Bolt",
      "bolt_diameter": ["20"]
    },
    "pref": {
      "detailing_gap": "10",
      "supporting_member_fy": "250"
    }
  },
  "meta": {
    "saved_at": "2026-06-13T12:00:00Z"
  }
}
```

---

## 5.2 Exporting OSI Files

The export endpoint [SaveOsiFromInputs](../backend/apps/core/api/projects/osi_api.py) processes client export requests:

### Guest Users (Base64 Inline Stream)
Since guest users have no cloud database storage permissions:
1. The backend builds the `.osi` payload.
2. It serializes the text file and encodes the content into a **Base64 ASCII string**.
3. It returns the Base64 data inline inside the HTTP response.
4. The React frontend receives the string, decodes it into a blob, and triggers an in-browser local file download.

### Authenticated Users (Database Storage)
For verified authenticated users:
1. The backend writes the payload into an `.osi` text file.
2. It instantiates a database record in the `OsiFile` model.
3. It saves the physical file to disk storage (`/osifiles/`) and returns the file's static URL path to the frontend.

---

## 5.3 Importing OSI Files

When a user imports an `.osi` file via the UI:

### 1. Upload & Parsing
1. The frontend posts the file to the `/api/open-osi/` endpoint.
2. The [OpenOsiUpload](../backend/apps/core/api/projects/osi_api.py) view intercepts the stream and reads it into memory.
3. The parser detects if the file starts with a JSON brace (`{`) or a YAML dotted structure.
4. It parses the file and returns `{ dock, pref, flat }`: `flat` holds the keys exactly as written in the file, `dock` and `pref` are a module-independent translation of them (section 5.4).

### 2. Module Routing
The parsed response carries the module name from the file's `Module:` line (`module_id`). A module's id is its desktop module name (`KEY_DISP_*` in `osdag_core/Common.py`), so the frontend resolves it directly with `findModule` from [registry.js](../frontend/src/modules/registry.js) and navigates to that module's `path`. A name that matches no registry entry is rejected as an unsupported module.

Desktop compatibility notes:
* The desktop calls the shear header plate module `End Plate Connection`; the web module id is `Header Plate Connection`. `parse_osi` maps the desktop name (`DESKTOP_MODULE_NAMES` in `osi_files.py`), so those files open the header plate page.
* Names that older desktop releases used and the desktop has since renamed (for example `Beam-Beam End Plate Splice`, `Beam Coverplate Connection`, `Struts in Trusses`) are not supported and are rejected as unsupported modules.

---

## 5.4 Key Translation & Frontend Prefill Normalizer

Because the Python desktop engine uses dotted PascalCase parameters (e.g. `Bolt.TensionType`, `Detailing.Gap`) while Osdag-Web uses snake_case keys (e.g. `bolt_tension_type`, `detailing_gap`), the frontend translates these configurations during import:

1. **`normalizeOsiPayload`:** Translates the file's keys (`flat`) into the web form keys of the active module. [osiMapperTracer.js](../frontend/src/modules/shared/utils/osiMapperTracer.js) finds the mapping by running the module's `buildSubmissionParams` on sentinel values, so one `.osi` key can feed several fields (for example `Member.Supported_Section.Designation` fills `beam_section` and `secondary_beam`). A module config can add `osiKeyAliases` for keys the desktop writes under a different name than the web sends (the base plate config maps `Load.Axial_Compression` and `Anchor Bolt.OCF/ICF.*`). When several keys share one field the more specific key wins (`Material`, then `Connector.Material`, then the member and section materials). Desktop output-panel state (`out_titles_status`, `Label_*`) is ignored.
2. **`loadStateFromOsi`:** An observer utility in [osiLoader.js](../frontend/src/modules/shared/utils/osiLoader.js) that hydrates the React states with the normalized payload.
   * Restores input form states (`setInputs`).
   * Configures customized selections (`setSelectionStates` and `setSelectedItems`).
   * Recovers design preference overrides (`setDesignPrefOverrides`).
   * Sanitizes case variances and string formatting (e.g., standardizing `"Standard"` or `"Over-Sized"` hole types).
   * Selects the connectivity (or, for the end plate modules, the end plate type from `EndPlateType`) in the option dropdown.

### Connectivity names

The web forms use the desktop connectivity names throughout (`CONN_CFBW` = `Column Flange-Beam Web`, `CONN_CWBW` = `Column Web-Beam Web`, `Beam-Beam`; generated into `coreKeys.js` from `osdag_core/Common.py`). The backend options endpoints serve the same values (`VALUES_CONN`, `VALUES_CONN_1`), the form submits the selection unchanged, and an `.osi` file's `Connectivity` is loaded as is. No conversion table is needed in either direction.

### Desktop keys the web has no field for

The desktop saves design preferences the web forms do not expose; they are loaded under cleaned-up key names and not sent: `Bolt.Material_Grade_OverWrite`, and for the base plate `Base_Plate.*`, `Stiffener_Key.*`, `Member.Fu/Fy/Material` and `DesignPreferences.*`. Where the desktop keeps separate materials (`Material`, `Connector.Material`, `Member.*.Material`) and the web has one field, the member or section material is kept.

---

## 5.5 Project-to-OSI Exporter Converter

When downloading an existing project, the backend merges the nested states into a flat desktop-compatible dictionary inside `ProjectOsiDownload`:
1. It extracts `dock` (inputs) and `pref` (preferences).
2. It flattens all `pref` overrides by prefixing their keys with `Pref.`:
   ```python
   combined = {**dock}
   for k, v in pref.items():
       combined[f"Pref.{k}"] = v
   ```
3. It serializes the combined dictionary into a standard flat `.osi` file format. This allows web projects to be downloaded and imported directly back into the Osdag Desktop application seamlessly.

---

## 5.6 Stateless Backend-Assisted Import & Frontend Configs

Osdag-Web relies on a hybrid flow that uses **backend-assisted parsing** combined with **frontend configuration normalization**:

### 1. In-Memory Stateless Parsing (Backend)
When a user uploads a `.osi` file using the **Load Input** option:
* **Backend parsing is required:** The frontend **does** dispatch the raw file payload directly to the `POST /api/open-osi/` endpoint (mapped to `OpenOsiUpload` on the backend). The Python backend parses the raw `.osi` file (handling both native desktop flat dotted syntax and nested JSON syntax) in-memory and returns a clean, parsed input JSON payload in the HTTP response.
* **No Database Operations:** The backend database is completely untouched during this process. Because this parsing is stateless, guest users can import and populate their input docks without needing a relational account or verified database record.

### 2. Frontend Configuration Normalizer & Hydrator (Frontend)
Once the backend returns the parsed dictionary:
* **Client-Side Key Resolution:** The frontend uses module-specific configurations (like the `*Config.js` files and `osiNormalizer.js`) to translate the parsed keys (e.g. mapping desktop dotted PascalCase parameters from the backend into snake_case) and map standard dropdown inputs.
* This separates concerns: the backend performs raw file format deserialization, while the frontend handles visual form binding, default values, and interface state hydration.

---

## 5.7 Bidirectional Exchange & Round-Trip Compatibility Scenarios

Osdag-Web ensures full bidirectional compatibility for three main round-trip exchange scenarios:

| Scenario | Export Source | Import Target | Processing & Formatting |
| :--- | :--- | :--- | :--- |
| **Web-to-Desktop** | Osdag-Web | Osdag Desktop | The web app exports files using backend-assisted serialization (`SaveOsiFromInputs`). Overrides are prefixed with `Pref.` and flattened to compile with the native desktop dotted flat format. The Osdag Desktop application reads the generated file directly. |
| **Desktop-to-Web** | Osdag Desktop | Osdag-Web | Osdag Desktop saves files in the native flat format. When uploaded to Osdag-Web, the backend parses the YAML-like structure into JSON statelessly (`OpenOsiUpload`). The React frontend normalizes PascalCase keys to snake_case using `normalizeOsiPayload` and hydrates forms. |
| **Web-to-Web** | Osdag-Web | Osdag-Web (later) | Users can export their design configuration from the web, and re-import it later to restore all inputs and design preferences. Hydration restores exact form values, customized selections (such as specific multi-select dropdown values), and preference overrides. |

Since the serialization and parsing logic is centralized in the Python backend, we guarantee that the same formatting rules and engineering dictionary mappings apply across both Desktop and Web, eliminating validation drift.

---

## 5.8 Architecture Assessment & Scopes of Improvement

### 1. Download OSI in Module Page (DB & Storage Accumulation) (Resolved)
* **The Problem:** When an authenticated user downloaded/exported an OSI file from a module page, the backend endpoint `SaveOsiFromInputs` generated a physical file on disk (`/osifiles/`) and registered an `OsiFile` record in the database, causing storage accumulation and DB write bloat.
* **Resolution:** Refactored `SaveOsiFromInputs` to always stream the generated OSI file directly inline in the HTTP response using Base64 encoding. This completely bypasses saving files to disk or database records for simple exports.

### 2. Download OSI in Project / Dashboard List Page (Key Flattening Drift) (Resolved)
* **The Problem:** When downloading an existing project as an `.osi` file from the dashboard, the backend endpoint `ProjectOsiDownload` reads the stored nested JSON, flattens it by prefixing overrides with `Pref.`, and streams the flat text file. This flattening logic was duplicated separately in Python, leading to a sync drift risk.
* **Resolution:** Centralized the key translation mappings (`baseline_aliases` and their reverse mapping) in `osi_files.py`. Refactored `build_osi_payload` to automatically flatten and translate the input keys on the backend before serialization, ensuring that any download from `ProjectOsiDownload` or `SaveOsiFromInputs` outputs consistent, Osdag-desktop-compatible flat files.

### 3. Import OSI from Homepage / Dashboard (Inconsistent Parsing Engine) (Resolved)
* **The Problem:** The homepage import flow (in `Header.jsx`) parsed the `.osi` file using client-side JavaScript (`yaml-js`), which could fail or diverge from Python's parsing behaviors on complex YAML flat structures.
* **Resolution:** Updated the onChange handler in `Header.jsx` to upload files directly to the stateless backend endpoint `/api/open-osi/`. The homepage now routes the file to the same python-based parser used on the module pages, guaranteeing parser parity, and stores the parsed inputs in `sessionStorage` for routing prefill.

### 4. Import OSI in Module Page (Key Mapping & Translation Drift) (Resolved)
* **The Problem:** The module-level import uploaded the file to the stateless parser and received raw dotted PascalCase engineering keys, leaving the translation mapping logic to be hardcoded client-side in the frontend normalizers.
* **Resolution:** Moved key normalization and translation mapping dictionary to the backend engine inside `osi_files.py`. The `parse_osi` utility returns a translated `{ dock, pref }` dictionary inside `inputs`, together with the file's own keys (`flat`). The module-independent `dock` translation cannot know each module's form fields, so the frontend maps `flat` with the module's own config (section 5.4) and uses `dock`/`pref` only for payloads that have no `flat`, such as saved projects.

