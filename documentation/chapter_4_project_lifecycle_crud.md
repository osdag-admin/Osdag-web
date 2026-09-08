# Chapter 4: Project Lifecycle & CRUD Operations

Osdag-Web maintains relational project history for authenticated users. The database stores design parameters, calculations logs, and outputs to support project reloading, searching, and sharing.

---

## 4.1 Project Model & Data Structure

The relational state of a user project is managed in the `Project` model in [models.py](../backend/apps/core/models.py). 

### The `inputs_json` Schema
Instead of storing form inputs as flat fields, Osdag-Web encapsulates them inside a structured `inputs_json` JSON column:
* **`dock`:** Stores the active inputs populated inside the main web form dock (e.g. beam designations, weld sizes, load inputs).
* **`pref`:** Stores the design preference overrides configured inside the **Additional Inputs** tabs (e.g. connector details, detailing gaps, safety factors).

### The `outputs_json` Schema
Stores the raw calculated outputs returned by the Celery calculation solver. This JSON payload is loaded back into the Output Dock upon opening a saved project, avoiding the need to re-run calculations.

---

## 4.2 CRUD REST Endpoints

Project management endpoints are implemented in [project_api.py](../backend/apps/core/api/projects/project_api.py).

### 1. List Projects (`GET /api/projects/`)
* **Endpoint:** `GET /api/projects/` or `GET /api/projects/?q={search_term}`
* **Permissions:** Authenticated users only. Guest users receive `HTTP 403 Forbidden`.
* **Behavior:** Returns recent projects owned by the requesting user, ordered by `-updated_at`. If search query `q` is present, filters projects by name, module, or submodule.
* **Sample Response:**
  ```json
  {
    "success": true,
    "projects": [
      {
        "id": 12,
        "name": "Warehouse Column Joint",
        "module": "shear_connection",
        "submodule": "fin_plate",
        "module_id": "fin_plate",
        "osi_file_path": "file_storage/osi/project_12.osi",
        "created_at": "2026-06-13T10:33:00Z",
        "updated_at": "2026-06-13T10:34:15Z"
      }
    ]
  }
  ```

### 2. Create Project (`POST /api/projects/`)
* **Endpoint:** `POST /api/projects/`
* **Permissions:** Authenticated & Email-Verified users only.
* **Payload:** Contains `name`, `module`, `submodule`, `inputs_json` (optional), and `outputs_json` (optional).
* **Behavior:** Verifies verification status, maps request user email to `user_email`, creates the database row, and returns the new `project_id`.

### 3. Retrieve Project Details (`GET /api/projects/<id>/`)
* **Endpoint:** `GET /api/projects/<id>/`
* **Permissions:** Authenticated Owner only.
* **Behavior:** Validates that the requesting user's email matches the project's `user_email`. Returns full details including `inputs_json` and `outputs_json`.

### 4. Update / Save Project (`PUT /api/projects/<id>/`)
* **Endpoint:** `PUT /api/projects/<id>/`
* **Permissions:** Authenticated Owner & Email-Verified.
* **Behavior:** Updates specific project values on disk (name, inputs, outputs, file paths).

### 5. Delete Project (`DELETE /api/projects/<id>/`)
* **Endpoint:** `DELETE /api/projects/<id>/`
* **Permissions:** Authenticated Owner.
* **Behavior:** Deletes the project record from the database.

---

## 4.3 Client-Side Autosave Lifecycle

Osdag-Web implements an automated calculation-autosave flow within the [useDesignSubmission.js](../frontend/src/modules/shared/hooks/useDesignSubmission.js) frontend hook:

1. **Input Submission:** User fills inputs and triggers calculations.
2. **Success Capture:** Once the Celery worker replies with a successful design output, the hook checks for the existence of `projectId` in the URL params.
3. **API Autosave Trigger:** If a project ID is present, the hook immediately dispatches a background PUT request to `/api/projects/<id>/` using [useEngineeringService.js](../frontend/src/modules/shared/hooks/useEngineeringService.js):
   ```javascript
   await service.updateProject(projectId, {
     inputs_json: {
       dock: inputs,
       pref: designPrefOverrides,
     },
     outputs_json: designBody.data,
   });
   ```
4. **Synchronization:** This ensures that whenever a calculation executes, the latest parameters and successful designs are instantly updated in PostgreSQL.

---

## 4.4 Architecture Assessment & Scopes of Improvement

### 1. Database Redundancy for Compatibility (Resolved)
* **The Problem:** The backend returns duplicate JSON attributes for sub-module identification:
  ```python
  'submodule': getattr(project, 'submodule', None),
  'module_id': getattr(project, 'submodule', None),
  ```
  This is a compatibility layer introduced because some historical frontend components expected `module_id` while newer components expected `submodule`. 
* **Resolution:** Removed the legacy `module_id` fields from backend serialization. Modified all frontend components (recent projects rendering, action buttons, search menus) to consistently read `submodule`. Consolidated all varied module key translations (like hyphenated or cased variants) under a single centralized helper function `normalizeModuleKey` in `modules.js`.

### 2. High DB Write Volume on Auto-save (Resolved)
* **The Problem:** Saving the entire JSON payload to the database on *every* successful calculation execution can result in massive database write volumes under heavy user activity.
* **Resolution:** Implemented a debounced saving mechanism (5-second delay) in the `useDesignSubmission` submission pipeline hook. A React ref-backed timer ensures that successive calculation runs cancel any pending database writes and reschedule a single consolidated write. To prevent data loss when navigating away or unmounting the designer view, an unmount lifecycle cleanup effect triggers an immediate synchronous write of any pending changes.

### 3. Legacy & Unimplemented Database Schema Fields (Resolved)
* **Unused `Design` Model:** Removed the legacy `Design` table, model mappings in models and admin, and serializer definitions.
* **Unused `Project.osi_file_path` Column:** Deleted the `osi_file_path` field from the `Project` model and cleaned up all associated endpoints and serializer references.
* **Redundant output file mapping:** Removed `UserAccount.allInputValueFiles` (PostgreSQL `ArrayField`) from user models, cleaned authentication creation and sync logic, and completely removed the obsolete `ObtainInputFileView` endpoint along with its routing.

### 4. Project Creation Before Calculation Run (Resolved)
* **The Problem:** The user interface historically allowed users to click "Create Project" inside a module design page *before* running any calculations. This saved a project with valid inputs but `null` outputs.
* **Resolution:** Enforced a unified single flow: project creation is blocked (`Create Project` is disabled in the file dropdown menu, and warnings are thrown on keyboard shortcuts) if no calculations have run (i.e. `hasOutput` is false). Unused legacy project creation workflows (such as dashboard cards triggering modal confirmation) were removed, leaving calculation success as the sole gatekeeper for project registration.

