# Chapter 2: Backend Architecture & Configuration

The Django backend serves as the orchestration layer of Osdag-Web. It handles API requests, database interactions, user authentication, and dispatches heavy computations to Celery.

---

## 2.1 Django Application Structure

Osdag-Web uses a clean modular app structure inside the `backend` folder:

```
backend/
├── apps/
│   ├── core/                  # Base platform logic
│   │   ├── api/               # Platform REST endpoints (projects, OSI, tasks)
│   │   ├── models.py          # PostgreSQL core models (Project, UserAccount, OsiFile)
│   │   ├── middleware.py      # Token auth parsing and user synchronization
│   │   └── tasks.py           # Celery tasks wrappers
│   ├── modules/               # Engineering design modules
│   │   ├── base_plate/
│   │   ├── shear_connection/  # Fin plate, cleat angle, seated angle, etc.
│   │   ├── tension_member/
│   │   └── views.py           # Central dispatch API views for calculations/options
│   └── sections/              # Structural steel section helpers
└── config/                    # Main project settings, URLs, and Celery setup
```

### Core Separation
* **`apps/core`:** Holds standard web platform tables, tasks, and middlewares. It has no structural engineering dependencies.
* **`apps/modules`:** Acts as the host for individual steel design modules. Every module contains submodules with specific `adapter.py` files to bridge web API requests to the `osdag_core` mathematical libraries.

---

## 2.2 Celery & Redis Integration

Celery handles calculation, CAD rendering, and report compilation tasks out-of-process.

### 1. Connection Configurations
In `backend/config/settings.py`, Celery links to Redis via URL environment variables:
```python
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_TASK_ROUTES = {
    'apps.core.tasks.run_design_calculation_task': {'queue': 'calculations'},
    'apps.core.tasks.run_cad_generation_task': {'queue': 'cad'},
    'apps.core.tasks.run_report_generation_task': {'queue': 'reports'},
}
```

### 2. Task Dispatching
Celery tasks are defined in `backend/apps/core/tasks.py`. They invoke the corresponding adapter methods inside the worker process:
```python
@shared_task(bind=True, name="run_design_calculation_task")
def run_design_calculation_task(self, module_name, submodule_slug, inputs, project_id=None, user_email=None):
    # Retrieve the appropriate module adapter
    adapter = get_module_adapter(module_name, submodule_slug)
    
    # Run calculations
    output, logs = adapter.generate_output(inputs)
    
    # Return result to Redis backend
    return {
        "success": True,
        "data": output,
        "logs": logs,
    }
```

### 3. Django Channels & WebSocket Event Broadcast
To support real-time status updates without polling overhead, the backend integrates **Django Channels** for WebSocket routing:
- **Protocol Router (`asgi.py`)**: Configured to wrap standard Django HTTP application with `ProtocolTypeRouter`, forwarding WebSocket connection requests (`ws/tasks/<task_id>/`) to channels consumers.
- **WebSocket Consumer (`consumers.py`)**: Implements `TaskStatusConsumer` which subscribes the user's connection to a Redis channel group `task_{task_id}`. On socket connection, it queries `AsyncResult` immediately to push results if the task is already finished, mitigating race conditions.
- **Signals Broadcast (`signals.py`)**: Subscribes to Celery's `task_postrun` signal. When any Celery task completes, this handler automatically fetches the channel layer and broadcasts the state and results to the respective `task_{task_id}` channel group, immediately pushing the update to the client.

---

## 2.3 The Adapter Pattern for Osdag Desktop Modules

Because the underlying core Osdag logic was designed for a desktop environment (using PyQt inputs and outputs), Osdag-Web utilizes an **Adapter Pattern** (`adapter.py` in each module directory) to normalize data flows.

A typical `adapter.py` implements the following key interfaces:

### 1. `get_required_keys() -> List[str]`
Defines the required inputs schema. This is used by validation utilities to check incoming payloads.

### 2. `validate_input(input_values: Dict[str, Any]) -> None`
Checks the existence and types of incoming values, raising `MissingKeyError` or `InvalidInputTypeError` on mismatch.

### 3. `create_from_input(input_values: Dict[str, Any]) -> SolverInstance`
Creates the native computational solver class (e.g., `FinPlateConnection`), links loggers, and populates properties.

### 4. `generate_output(input_values: Dict[str, Any]) -> Tuple[Dict, List]`
Executes calculations on the solver instance and extracts output arrays (including spacings, capacities, and logging steps) into a unified JSON-serializable dictionary format.

### 5. `create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str`
Creates the CAD geometry objects using `CommonDesignLogic` (from `osdag_core.cad`). When the requested section is `"Model"`, it merges shapes of components (Beams, Columns, Plates, Bolts, Welds) into a single TopoDS compound, writing a merged `.brep` and `.stl` file.

---

## 2.4 Database Schema & Models

### 1. `Project` Model
Maintains the relational state of project designs.
* `name` (`CharField`): Custom project name.
* `module` / `submodule` (`CharField`): Identifier for routing.
* `inputs_json` (`JSONField`): Stores input dock states and Additional Inputs modal overrides.
* `outputs_json` (`JSONField`): Stores calculated outputs dictionary.
* `osi_file_path` (`TextField`): Direct path link to the saved `.osi` asset.
* `user_email` (`CharField`): Identifies the project owner.

### 2. `OsiFile` Model
Stores files uploaded or generated via input docks.
* `file` (`FileField`): Reference utilizing custom `osi_file_storage`.
* `owner_email` (`CharField`): Project owner email.
* `original_name` (`CharField`): Filename during download.
* `size_bytes` (`BigIntegerField`) & `content_type` (`CharField`).

### 3. `UserAccount` Model
Extensions for Firebase identity mapping.
* `user` (`ForeignKey`): Django built-in `User` link.
* `username` (`TextField`): Unique Firebase UID.
* `email` (`TextField`): Unique user email.
* `allInputValueFiles` (`ArrayField`): Tracked input file references.

---

## 2.5 Asset Storage Lifecycle (CAD Models & Reports)

When a design calculation is completed, users can generate:
1. **CAD Geometries:** Formatted as `.brep`, `.stl`, and optionally `.step` or `.iges` formats.
2. **Design Reports:** Formatted as compiled PDF documents.

### Storage Directory Structure
In the backend root directory, the system utilizes the following storage hierarchy:
* `file_storage/cad_models/`: Stores generated 3D component files. Filenames are formatted using the user session cookie or unique identifier (e.g. `{session_id}_Model.brep`).
* `media/`: Default location for user uploads, report assets, and generated PDF documents.

In production deployments, these folders are mounted as Docker host volumes (`media_volume` and `osifiles_volume`) to ensure data persists across container restarts.

---

## 2.6 Backend Architecture Assessment & Scopes of Improvement

### 1. Storage Accumulation & Memory Leaks (Resolved)
* **The Problem:** Previously, every design calculation, CAD generation, or PDF report build generated physical files written to disk. The system lacked a cleanup mechanism to purge these files after they were downloaded or after their session expired.
* **The Risk:** Over time, the host server experienced disk space exhaustion due to the accumulation of unused temporary `.brep`, `.stl`, and `.pdf` files.
* **Resolution:**
  - Configured in-memory PDF processing (`BytesIO`) to delete build folders immediately after streaming responses.
  - Setup on-demand in-memory CAD export streams, deleting the physical files from disk before returning.
  - Implemented a Celery periodic task (`clean_temporary_files`) that runs daily via Celery Beat, purging any leftover temporary CAD/report files older than 24 hours.

### 2. Redundant Debug Statements and Dead Code (Resolved)
* **The Problem:** Several module adapters contained useless stdout redirection blocks (which redirected stdout to `os.devnull` and immediately reverted it before executing code) and duplicate `validate_input_new` methods.
* **Resolution:** Removed the redundant stdout interception lines and duplicate/unused `validate_input_new` methods from all module adapters to keep logic clean and maintainable.

### 3. Multi-Node Distributed Worker Challenges (Resolved via Shared Volume)
* **The Problem:** In a containerized environment, separate containers (like the Django web backend and Celery workers) have isolated filesystems. Files generated by the Celery worker container are not visible to the Django backend container.
* **Resolution:** Defined and mounted a shared Docker volume `file_storage_volume` in `docker-compose.prod.yml` across `backend`, `celery_worker_cad`, `celery_worker_reports`, and `celery_beat` services. This ensures file visibility on a single baremetal host without needing external cloud storage (AWS S3) or self-hosted object stores (MinIO).

### 4. Database Engine Differences (Accepted - Postgres Only)
* **The Problem:** The `UserAccount` model uses PostgreSQL-specific `ArrayField` for `allInputValueFiles`, restricting local SQLite execution for unit tests or lightweight dev configurations.
* **Status:** This is an accepted design choice as Osdag-Web runs exclusively on PostgreSQL in both development and production. No SQLite compatibility is required.

