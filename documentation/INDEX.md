# Osdag-Web Code & Architecture Documentation Index

Welcome to the comprehensive Osdag-Web developer documentation. This index serves as the entry point for understanding the system architecture, state management, 3D rendering pipeline, and deployment configurations.

---

## Documentation Chapters

### 1. [Chapter 1: Architecture Overview & System Topology](./chapter_1_architecture_overview.md)
* **1.1 The Asynchronous Calculation Design Pattern:** Separation of lightweight HTTP requests from heavy structural engineering calculations.
* **1.2 The Osdag Input (.osi) File Exchange Format:** Plain-text format structure, and desktop-to-web / web-to-desktop exchange mechanisms.
* **1.3 System Component Topology:** The role of the React Frontend, Django Backend, PostgreSQL Database, Redis Message Broker, and Celery Worker Pool.
* **1.4 Request Lifecycle Walkthrough:** Detailed path of a design request from client clicks to Celery execution and real-time WebSocket status pushes.

### 2. [Chapter 2: Backend Architecture & Configuration](./chapter_2_backend_architecture.md)
* **2.1 Django Application Structure (`apps/core` vs `apps/modules`):** Core database models and settings vs individual design module logic.
* **2.2 Celery & Redis Integration:** Configuration details (`CELERY_BROKER_URL`, queues: `calculations`, `cad`, `reports`, `celery`), concurrency tuning, task scheduling, and signal handling (`exec` wrappers).
* **2.3 The Adapter Pattern for Osdag Desktop Modules:** How backend adapters bridge Django web requests to the underlying Osdag desktop computational engine.
* **2.4 DB Schema & Models:** Detail `Project`, `Design`, `UserAccount`, and `OsiFile` fields and constraints.
* **2.5 Asset Storage Lifecycle (CAD Models & Reports):** Filesystem storage structure of generated component geometries (BREP, STL) and PDF reports.


### 3. [Chapter 3: Authentication & Security System](./chapter_3_authentication_system.md)
* **3.1 Firebase Auth Integration:** Google/Github/Email identity provider setup, token validation, and the `FirebaseAuthentication` middleware in Django.
* **3.2 User Account Management & Email Verification:** Flow of registration, email verification checks (`IsEmailVerified` permissions), and conditional access blocks.
* **3.3 Guest Mode vs. Authenticated Mode:** Behavior differences in saving projects, generating and downloading `.osi` files, and session persistence.
* **3.4 Security Assessment & Scopes of Improvement:** Performance overhead of JWT verification, verification bypasses, token cache invalidation on immediate verification, and account deletion orphaned data.
* **3.5 OAuth & Email/Password Provider Merging & Conflict Resolution:** Firebase client-side provider linking vs. email-in-use rejection rules, and backend UID-based syncing.

### 4. [Chapter 4: Project Lifecycle & CRUD Operations](./chapter_4_project_lifecycle_crud.md)
* **4.1 Project Model & Data Structs:** Structure of `inputs_json` (merged dock + pref states) and `outputs_json`.
* **4.2 CRUD REST Endpoints:** Detailed request/response specs for listing, creating, loading, updating, and deleting projects.
* **4.3 Find by Name APIs:** Details of `ProjectByNameAPI` for unique project identity search.

### 5. [Chapter 5: OSI File Specification & Exchange System](./chapter_5_osi_file_specification.md)
* **5.1 The OSI Format Anatomy:** Syntax and layout of Osdag Input (`.osi`) files (flat dotted vs. nested JSON).
* **5.2 Exporting OSI Files (`SaveOsiFromInputs`):** Base64 inline downloads for Guest users vs. DB-stored `OsiFile` records for authenticated users.
* **5.3 Importing OSI Files (`OpenOsiUpload` & `OpenOsiById`):** Upload parsing, ID-based fetching, and backend routing resolvers (`ModuleRoutes`).
* **5.4 Key Translation & Frontend Prefill Normalizer:** Translating dotted PascalCase parameters into web snake_case states.
* **5.5 Project-to-OSI Exporter Converter:** Flattening and mapping web preference overrides with `Pref.` prefixes for desktop compatibility.
* **5.6 Stateless Backend-Assisted Import & Frontend Configs:** In-memory upload parsing without database modification, key translation, and form hydration.


### 6. [Chapter 6: Dynamic UI Form Engine](./chapter_6_dynamic_ui_form_engine.md)
* **6.1 Dynamic Option Loading (`/options/` endpoints):** Fetching section designations and materials based on the active module/submodule.
* **6.2 Custom Dropdowns & Section Merging:** How custom user sections are merged dynamically into options data via `merge_user_sections_into_options`.
* **6.3 Interdependent Fields & Conditional Logic:** Visibility, validations, and field-dependent defaults.
* **6.4 Contextual Dropdown Images:** Displaying descriptive SVG diagrams/images based on active selection (e.g., Column Section type changing the orientation schematic).
* **6.5 The Input Dock Form Engine vs. Output Dock Display:** Handling read-only output parameters, failure checks, and styling rules.
* **6.6 `EngineeringModule` Orchestration Controller:** The core shared frontend shell component managing module rendering, docks, validation states, API submission loops, and 3D CAD canvas integration.
* **6.7 Module Input & Output Configurations (`*Config.js`, `*OutputConfig.js`):** Declarative schemas defining field metadata, units, validation criteria, and grouped structures for each connection type.
* **6.8 Shared Display Configurations (`sectionDisplayConfig.js` & `outputImageMap.js`):** Mapping specific structural section details and linking calculated dimensions to dynamic visual schematic overlays.

### 7. [Chapter 7: Additional Inputs & Design Preferences](./chapter_7_additional_inputs_design_preferences.md)
* **7.1 The Additional Inputs Modal State Machine:** Tracking active tabs, drafts (`designPrefInputs`), and final overrides (`designPrefOverrides`).
* **7.2 Tab-by-Tab Configuration Spec:** Details of fields in **Bolt**, **Weld**, **Detailing**, **Material**, and **Member** tabs.
* **7.3 Bidirectional Material Sync & Reseed Logic:** Passive sync triggers (`useDesignPrefSync`), debouncing, backend rules (`sync_merge.py`), and clearing overrides on dock driver change.
* **7.4 Resetting to Defaults:** Server-resolved defaults via the `/defaults/` endpoint.
* **7.5 Global Preferences Schema Mapping (`designPrefModuleConfig.js`):** Central mapper specifying available tabs, tab indexes, default pref generation callbacks, and fallback rules for each module.

### 8. [Chapter 8: Frontend State Management Architecture](./chapter_8_frontend_state_management.md)
* **8.1 Global Application Context:** Structure of global catalog selection tree state and caching.
* **8.2 ModuleState & ModuleReducer Deep Dive:** Consolidated states, the Module Context API, design outputs invalidation loop, and strict reseed pattern.
* **8.3 Hooks Architecture:** Business logic isolation and analysis of hooks (`useEngineeringModule`, `useModuleForm`, `useDesignSubmission`, `useDependentData`, `useDesignPrefSync`).
* **8.4 Observations & Areas of Improvement:** Review of global state cache mutations, legacy reducer duplication, dependent data queries network spams, and OSI prefill timing race hazards.

### 9. [Chapter 9: 3D CAD Scene Visualization System](./chapter_9_3d_cad_visualization.md)
* **9.1 Three.js & React Three Fiber (R3F) Integration:** Viewport canvas, lighting rig, camera action dispatcher, OrbitControls, and ViewCube.
* **9.2 SceneManager Architecture:** Base64 STL loading and text OBJ parsing, and geometry unmount memory disposal.
* **9.3 Part Customization & Mapping:** Styling color configuration, depth priority render orders, and active-view filters.
* **9.4 Module-Specific CAD Option Specifications:** Mapping tables for config-declared cadOptions selection lists for all modules.
* **9.5 SmartPart & Performance Optimization:** Edge geometry memoization, raycast state separation, and material optimization to maintain 60 FPS.
* **9.6 3D Component Hover & Tooltips:** Semantic part name aliasing, coordinate translation, and key variations fallback loops.
* **9.7 Observations & Areas of Improvement:** Analysis of WebGL context loss recovery and pointer event race hazards.
* **9.8 CAD Model Exporting & Multiple Formats:** Supported export formats (BREP, STL, STEP, IGS, IFC), client-side cache vs. on-demand backend export routes, and helper functions in `cadExport.js`.

### 10. [Chapter 10: Modules Catalog & Status Directory](./chapter_10_modules_catalog_status.md)
* **10.1 Active Modules Directory:** Operational catalog details, routes, and adapter mappings.
* **10.2 Under-Development & Hidden Modules Directory:** Analysis of disabled tabs, missing routes, and hidden backend-only adapters.
* **10.3 Backend Adapter & Auto-Discovery Registry:** Auto-discovery logic (`module_finder.py`), adapter interfaces, and legacy fallback registries.
* **10.4 Observations & Areas of Improvement:** Hardcoded UI status flags and route configuration mismatches.

### 11. [Chapter 11: Local Conda Environment & Docker Containerization Setup](./chapter_11_conda_and_docker_setup.md)
* **11.1 Conda Environment Configuration:** pythonocc-core packaging rules, local environment creation, and multi-service process wrapping (`osdagweb.sh`).
* **11.2 Docker Containerization Architecture:** Backend miniconda setups with OpenGL/texlive layers and frontend multi-stage Nginx production builds.
* **11.3 Development Orchestration (`docker-compose.yml`):** Dev container layout, hot-reloading configurations, and database migrations and seeding.
* **11.4 Production Orchestration (`docker-compose.prod.yml`):** Nginx reverse proxy routing, shared static volumes, and specialized Celery worker queue divisions.
* **11.5 Observations & Areas of Improvement:** Analysis of hardcoded user ID mappings and static database port issues.

### 12. [Chapter 12: Load Testing & Performance Benchmarking](./chapter_12_load_testing.md)
* **12.1 Introduction & Goals of Osdag Load Testing:** Performance goals of structural engineering simulations and 3D CAD model generation.
* **12.2 Test Environment & Topology:** ASGI Daphne gateway, Redis broker, Celery worker calculations pool, and DB instances mapping under load.
* **12.3 Locust Load Testing Framework Integration:** Asynchronous concurrency modeling via gevent greenlets, user parameters, and think times.
* **12.4 Locust HTTP Polling Test Suite (`locustfile.py`):** In-depth code walkthrough of HTTP polling client flow and custom event emissions.
* **12.5 Locust WebSocket Test Suite (`locustfile_ws.py`):** Walkthrough of ASGI persistent WebSocket client connection loops, timeouts, and handlers.
* **12.6 Automated Test Orchestrator (`run_automated_tests.py`):** Headless multi-tier user loops orchestration, subprocess runner structure, and execution safety timeouts.
* **12.7 Multi-Tier Results Compiler:** Extraction of templates JSON variables and compiled output dashboard layout.
* **12.8 Analysis of Load Test Results:** Saturation checks, CPU load, socket drops, and failures metrics across 10, 50, 100, and 200 VUs.
* **12.9 Architectural Recommendations & Performance Tuning Guide:** Optimizing file descriptor limits, Daphne ASGI workers, Redis databases isolation, and PgBouncer connection pooling.

### 13. [Chapter 13: System Telemetry & Metrics Collection](./chapter_13_metrics_telemetry.md)
* **13.1 Telemetry Infrastructure Overview:** Non-blocking sidecar collector architecture, InfluxDB time-series storage, and Grafana UI dashboard overlays.
* **13.2 System Metrics Schema (`osdag_system`):** CPU per-core utilization, aggregate host CPU loads, RAM memory metrics, and swap allocations.
* **13.3 Celery Task Queue Metrics Schema (`osdag_tasks`):** Tracking queue depths per channel name via Redis queues polling loops.
* **13.4 Redis In-Memory Store Telemetry Schema (`osdag_redis`):** Monitoring connected clients, Pub/Sub channels scaling factor, used memory, and processing throughputs.
* **13.5 Process Thread Telemetry Schema (`osdag_threads`):** Grouping process roles by regex naming rules and scanning active thread state allocations.
* **13.6 In-Depth Analysis of the Sidecar Script (`metrics_collector.py`):** Walkthrough of the python-psutil instrumented collector runner code.
* **13.7 Django Application Telemetry Integration:** Logging HTTP request durations in middleware and ASGI WebSocket connections state changes.
* **13.8 Telemetry Stack Deployment & Configuration:** Automatic provisioning of Grafana dashboards and InfluxDB datasources in Docker Compose.
* **13.9 Time-Series Data Querying and Offline Exporting:** InfluxDB Flux querying syntax examples and exporting datasets to offline CSV spreadsheets.
* **13.10 Advanced Scaling Strategies & HA Recommendations:** Separating message broker Redis from state channels Redis, Prometheus integrations, and load balancing Daphne.

### Appendix: [Fixed & Resolved Issues Directory](./issues.md)
* Tracking directory containing the statuses and fixes for architectural, storage, and security issues resolved in Chapters 1 to 3.


