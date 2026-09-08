# Osdag-Web Application

Osdag-Web is the web-based version of Osdag, providing professional-grade design, 3D CAD modeling, and report generation for structural steel connections and members. 

Under the hood, Osdag-Web uses an asynchronous architecture powered by **Django**, **Celery**, and **Redis** to offload heavy calculations and CAD/PDF rendering to background workers, ensuring high availability and responsive UI interactions under concurrent user load.

---


## Core Features & Project Workspace

Osdag-Web provides a full-featured engineering workspace in the web browser, containing several key capabilities:

* **Persistent Project Dashboard**: Authenticated users can create, save, list, load, and manage structural design projects, persisting their configurations in a cloud PostgreSQL database.
* **Interactive 3D CAD Viewer**: Real-time rendering of structural steel details using Three.js / React Three Fiber. Features camera actions (axis-aligned view snaps, pan, zoom, auto-rotation) and contextual dimension tooltips when hovering over components.
* **CAD File Export**: Save full 3D assembly models of calculated connections in high-fidelity formats like **STEP**, **BREP**, **STL**, **IGES**, and **IFC** for use in professional CAD/BIM tools.
* **Automated Design Reports**: Compile complete design calculation sheets with Limit States verification summaries, structural drawings, and parameters into PDF reports, or export raw inputs/outputs to CSV format.
* **Design Preferences Configuration**: Fine-tune detailed safety factors, mechanical limit states, spacing rules, weld sizes, and bolt property constraints.
* **OSI File Exchange Format Support**: Full compatibility with the Osdag Input (`.osi`) plain-text configuration format to exchange design states between Osdag Web and Osdag Desktop environments.
* **Guest vs. Authenticated Sessions**: Non-registered users can test modules on-the-fly with file-based imports, while logged-in users get complete database persistence and auto-save.

---

## Available Design Modules

Osdag-Web supports design calculations and CAD visualization for multiple categories of structural connections and members:

* **Shear Connections**:
  * **Fin Plate Connection**
  * **End Plate Connection**
  * **Cleat Angle Connection**
  * **Seated Angle Connection**
* **Moment Connections**:
  * **Beam-to-Column Connections**:
    * **End Plate Connection**
  * **Beam Splices (Beam-to-Beam)**:
    * **End Plate Splice**
    * **Cover Plate Splice (Bolted)**
    * **Cover Plate Splice (Welded)**
  * **Column Splices (Column-to-Column)**:
    * **End Plate Splice**
    * **Cover Plate Splice (Bolted)**
    * **Cover Plate Splice (Welded)**
* **Simple Connections**:
  * **Lap Joint (Bolted)**
  * **Lap Joint (Welded)**
  * **Butt Joint (Bolted)**
  * **Butt Joint (Welded)**
* **Tension Members**:
  * **Tension Member (Bolted to End Gusset)**
  * **Tension Member (Welded to End Gusset)**
* **Compression Members**:
  * **Axially Loaded Column**
  * **Struts (Bolted to End Gusset)**
  * **Struts (Welded to End Gusset)**
* **Flexural Members**:
  * **Simply Supported Beams**
  * **Cantilever Beams**
  * **Purlins**
* **Base Plate**:
  * **Base Plate Connection**

---

## Developer Documentation

For a comprehensive guide to the codebase topology, API adapters, frontend state management, 3D CAD visualization pipeline, and containerization setup, refer to the [Osdag-Web Code & Architecture Documentation Index](documentation/INDEX.md).

Recommended to use linux for the dev setup. because why not:)

---

## How to Run Osdag-Web

You can run the Osdag-Web application either using **Docker Compose** (recommended, as it automatically sets up Redis and databases) or **Native Local Development**.

### Firebase Configuration (Prerequisite)

Before running the application via either Docker or Native setups, you must add the Firebase service account credentials JSON file for authentication:
Ask abhijithsogal@gmail.com to add your email to users in the project. 

1. Obtain your service account key JSON file from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
2. Save this file as `firebase-service-account.json` and place it inside the `backend/` directory of this repository:
   ```
   backend/firebase-service-account.json
   ```

### Option A: Using Docker Compose (Recommended)

To run the entire stack (Postgres, Redis, Django, Celery Worker, React frontend) in containers:

1. Build and run all services:
   ```bash
   docker compose up --build
   ```
2. Navigate to `http://localhost:5173/` in your browser.

> [!TIP]
> **Docker Development & Auto-Reloading:**
> * **Frontend Changes**: You **do not** need to rebuild or restart anything. The `./frontend` directory is volume-mounted, and Vite's Hot Module Replacement (HMR) automatically reflects changes in your browser instantly.
> * **Backend / Python Changes**: You **do not** need to run `--build` since the code is volume-mounted directly. To load your python changes, you just need to quickly restart the container processes:
>   ```bash
>   docker compose restart backend celery_worker
>   ```
> * **When to build**: You only need to run `--build` when modifying Dockerfiles, adding dependencies (in `requirements.txt` / `package.json`), or changing build configurations.

---

### Option B: Native Local Development (No Docker)

> [!WARNING]
> **`python manage.py runserver` cannot be used for load testing.**
> It is single-process, single-threaded, and does not support WebSockets (Django Channels).
> Under concurrent load it will queue all requests behind each other, producing completely misleading results.
> Use **gunicorn + uvicorn** (shown below) for any real testing.

#### Prerequisites
1. **Redis**: Ensure a Redis server is installed and running:
   ```bash
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   ```
2. **Postgres**: Make sure Postgres is running and the database is configured according to the [Installation Instructions](documentation/installation.md).

#### Step-by-Step Setup

1. **Start the Celery Worker**:
   Open a new terminal session, navigate to the `backend` folder, activate the conda environment, and start the Celery worker:
   ```bash
   cd backend
   conda activate osdag-web
   celery -A config worker -Q calculations,cad,reports,celery --loglevel=info --concurrency=4
   ```

2. **Start the Django Backend (ASGI — required for load testing)**:
   Use **gunicorn with uvicorn workers** — this is the same server the Docker setup uses and the only one that correctly handles concurrent requests and WebSocket connections.
   ```bash
   cd backend
   conda activate osdag-web
   # Run migrations first (only needed once or after model changes)
   python manage.py migrate

   # Start gunicorn with uvicorn ASGI workers
   gunicorn config.asgi:application \
     --bind 0.0.0.0:8000 \
     --workers 2 \
     --worker-class uvicorn.workers.UvicornWorker \
     --timeout 120 \
     --log-level info
   ```

   > [!NOTE]
   > Increase `--workers` to match your CPU core count for heavier tests.
   > A common rule of thumb is `2 × CPU cores + 1`.
   > Each worker is a separate OS process that handles requests concurrently.

   > [!TIP]
   > **For quick day-to-day development only** (single user, no WebSocket, no concurrency),
   > you may still use `python manage.py runserver 8000`. Never use it for performance testing.

3. **Start the Vite Frontend**:
   Open a new terminal session, navigate to the `frontend` folder, and start the React dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**:
   Navigate to `http://localhost:5173/` in your browser.



---

### Option C: Using the Launcher Script (Linux / macOS)

If you are on Linux or macOS, you can launch all three services (Celery worker, Django backend, and Vite frontend) automatically using the provided `osdagweb.sh` script:

1. Ensure the script is executable:
   ```bash
   chmod +x osdagweb.sh
   ```
2. Run the script:
   ```bash
   ./osdagweb.sh
   ```
   This will start all background processes and output their logs into the `logs/` directory. Press `Ctrl-C` at any time to shut down all processes cleanly.

---

## Load Testing & Diagnostics

Osdag-Web ships with a full observability stack (InfluxDB v2 time-series database & Grafana live dashboards) for stress-testing and monitoring concurrently running design calculations.

For details on configuration, telemetry schemas, and running load tests, refer to [Chapter 12: Load Test Monitoring & Observability](documentation/chapter_12_load_testing_observability.md).

