# Osdag-Web Installation Guide — Windows

This guide covers three ways to run **Osdag-Web** on Windows:

- **[Option A — Docker Compose](#option-a-docker-compose-full-stack)** — spins up the full stack (Postgres, Redis, Django, Celery, React, plus InfluxDB/Grafana) in containers with a single command.
- **[Option B — Manual Setup via WSL 2 (No Docker)](#option-b-manual-setup-via-wsl-2-no-docker)** — run services manually inside the Windows Subsystem for Linux (WSL 2) using Conda, pip, and Node.js.
- **[Option C — Native Windows (No WSL, No Docker)](#option-c-native-windows-setup-no-wsl-no-docker)** — run everything directly on Windows; requires a Windows Redis (Memurai) and the Celery `solo` pool.

> **Which one should I use?** For local development on a laptop, **Option C is the most resource-efficient**: it reuses the native PostgreSQL/Memurai services and uses roughly **0.7–0.8 GB of RAM**. Docker adds a WSL 2 VM plus eight containers and typically needs several GB. Choose Docker only if you need the full observability stack or an environment identical to production.

---

## Architecture Overview

| Service | Role |
|---|---|
| **Vite + React (frontend)** | UI, initiates design tasks, polls async task status |
| **Django (backend)** | REST API, input validation, task dispatch |
| **Celery worker** | Background processing (CAD, PDF, design calculations) |
| **Redis** | Message broker + Celery result backend |
| **PostgreSQL** | Persistent database |

---

## Option A: Docker Compose (Full Stack)

> This path needs no manual Postgres, Redis, Conda, or Python setup, but it runs a WSL 2 VM and eight containers. See the note above before choosing it.

### A.1 — System Requirements

- **Windows 10/11 (64-bit)**: Home, Pro, Enterprise, or Education.
- **WSL 2 (Windows Subsystem for Linux)** installed and enabled (highly recommended by Docker).
- **Docker Desktop for Windows** 4.x+
- At least **8 GB RAM** (16 GB recommended) and **25 GB free disk** (backend image is large).

### A.2 — Install WSL 2 and Docker Desktop

1. **Install WSL 2**:
   Open PowerShell or Windows Command Prompt as Administrator and run:
   ```powershell
   wsl --install
   ```
   Restart your computer when prompted.

2. **Download and Install Docker Desktop**:
   - Download the installer from the official website: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
   - Run the installer (`Docker Desktop Installer.exe`).
   - Ensure the option **"Use WSL 2 instead of Hyper-V (recommended)"** is checked during installation.
   - After installation, start Docker Desktop and accept the service agreement.

3. **Verify the installation**:
   Open Command Prompt (`cmd`) or PowerShell and verify:
   ```cmd
   docker --version
   docker compose version
   ```

### A.3 — Install Git for Windows

1. Download Git from [git-scm.com/download/win](https://git-scm.com/download/win) and run the installer.
2. During setup, keep the default options. Ensure **"Checkout Windows-style, commit Unix-style line endings"** is selected (crucial for Docker script compatibility).
3. Verify:
   ```cmd
   git --version
   ```

### A.4 — Clone the Repository

Open Command Prompt or Git Bash and run:
```cmd
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

### A.5 — Create the `.env` File

The repository ships a template, `.env.example`, in the project root. Copy it and fill in the values (one-time setup):

```powershell
copy .env.example .env
notepad .env
```

Replace every `change-me` value. If you create the file in Notepad instead, choose "All Files (*.*)" in the Save dialog so it does not save as `.env.txt`.

Docker Compose refuses to start unless these variables are set (they are marked `change-me` in the template):

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret key; use a long random string |
| `DATABASE_PASSWORD` | PostgreSQL password for the `osdagdeveloper` role |
| `INFLUXDB_TOKEN` | InfluxDB admin API token (also used by the backend, the metrics collector and the Grafana datasource) |
| `INFLUXDB_ADMIN_PASSWORD` | InfluxDB admin UI password |
| `GRAFANA_ADMIN_PASSWORD` | Grafana `admin` password |

The remaining values in `.env.example` have working defaults for Docker. `.env` is git-ignored; never commit it.

The Vite dev server reads a separate `frontend/.env`; `frontend/.env.example` is its template (`VITE_BASE_URL`).

### A.5.1 — Add Firebase Service Account Key JSON

This application uses Firebase for user authentication. You must add the Firebase service account private key JSON file in the backend configuration before running Docker Compose:

1. Obtain your service account key JSON file from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
2. Save this file as `firebase-service-account.json` and place it in the `backend/` directory of the repository:
   ```
   backend/firebase-service-account.json
   ```

### A.6 — Build and Start All Services

Run the following command in the project root directory:
```cmd
docker compose up --build
```

This single command:
1. Builds the backend image (Ubuntu 22.04 + Miniconda + Python 3.11 + pip packages)
2. Builds the frontend image (Node 20 Alpine)
3. Starts Postgres 14, Redis 7, Django backend, Celery worker, and Vite dev server
4. Runs `python manage.py migrate` on first start

> **First build** can take **20–40 minutes** depending on your internet connection and CPU, due to the large backend dependencies (TeX Live, VTK, etc.). Subsequent starts will be very fast.

### A.7 — Access the Application

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (Django API) | http://localhost:8000 |

### A.8 — Section Catalog (Nothing to Do)

The steel-section catalog is read from the SQLite file bundled with `osdag_core`, so there is nothing to load into Postgres. The backend container runs the database migrations itself on start-up.

### A.9 — Useful Docker Commands

```cmd
# Follow logs for all services
docker compose logs -f

# Follow logs for specific services
docker compose logs -f backend celery_worker

# Stop containers (keeps volumes/data)
docker compose stop

# Start again
docker compose up -d

# Full reset — deletes all volumes and data
docker compose down -v

# Rebuild only specific services
docker compose build backend celery_worker frontend

# Open a shell in the backend container
docker compose exec backend bash
```

### A.10 — Verify Celery Is Working

```cmd
docker compose exec backend bash -c "source /opt/miniconda/etc/profile.d/conda.sh && conda activate myenv && python -c \"from apps.core.tasks import healthcheck_task; print(healthcheck_task.delay().id)\""

# Check the celery_worker container logs to verify the task was processed:
docker compose logs --tail=50 celery_worker
```

### A.11 — Production Deployment

Production is not started by hand from a checkout. Merges to `25april` build images tagged with the commit SHA and a GitHub Actions workflow deploys that SHA with `docker-compose.prod.yml` on the production server. It runs migrations once, waits for healthchecks and runs a smoke test. See [Chapter 11.8](../chapter_11_conda_and_docker_setup.md#118-continuous-deployment--rollback) for the pipeline, rollback and the one-time setup.

On the production server, set `SECRET_KEY`, `DATABASE_PASSWORD` and `REDIS_PASSWORD` (all required) and `ALLOWED_HOSTS` in the environment or a `.env` file (copied from `.env.example`) in the deploy directory (`/opt/osdag-web`).

---

## Option B: Manual Setup via WSL 2 (No Docker)

This option runs the application inside a Linux environment (Ubuntu on WSL 2), which matches production most closely. To avoid WSL entirely, see [Option C](#option-c-native-windows-setup-no-wsl-no-docker).

### B.1 — Set Up WSL 2 and Ubuntu

1. Open PowerShell or Windows Command Prompt as Administrator and run:
   ```powershell
   wsl --install -d Ubuntu-22.04
   ```
2. Once the installation completes, restart your computer.
3. Upon restart, a terminal window will open asking you to configure a Unix username and password for your Ubuntu installation. Follow the prompts to complete set up.

### B.2 — Clone and Run Under Linux Manual Steps

Once your Ubuntu instance is running:
1. Open the **Ubuntu** terminal application.
2. Follow the exact step-by-step setup guide for Linux in [installation_docs_linux.md](installation_docs_linux.md).
3. Ensure you install all dependencies inside the WSL/Ubuntu terminal (such as Miniconda, TeX Live, wkhtmltopdf, Postgres, and Redis).
4. Since WSL 2 automatically forwards ports to your Windows localhost, you will be able to access the React frontend and Django backend at `http://localhost:5173` and `http://localhost:8000` directly from your Windows web browsers!

---

## Option C: Native Windows Setup (No WSL, No Docker)

Runs everything directly on Windows with Conda, pip, and Node.js. A few things behave differently from Linux — read **C.0** first.

> **Automated setup:** `setup_windows.ps1` in the repository root performs C.1–C.7 (winget installs, MiKTeX auto-install, Conda env, the conda-forge `pyside6` replacement, PostgreSQL role/database, `.env`, migrations, frontend). Run `powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1` from the repo root; it is safe to re-run and prints a per-step timing summary. It has not been tested on every Windows version; if a command is not found after an install, close and reopen PowerShell and re-run.

### C.0 — What Differs on Native Windows

| Feature | Linux | Native Windows |
|---|---|---|
| **Redis** | `apt`/`pacman` package | No official build. Use **Memurai Developer** (free, Redis-compatible) or the community **tporadowski/redis** port. Redis is required: it is the Celery broker/result backend **and** the Django Channels (WebSocket) layer. |
| **Celery worker** | prefork pool | Prefork is unsupported on Windows and crashes. Start the worker with `--pool=solo` (one task at a time). |
| **PDF reports** | TeX Live | Install **MiKTeX**; `pdflatex` must be on `PATH` **and** missing-package auto-install must be enabled (see C.1). |
| **Qt bindings** | pip `PySide6` works | pip `PySide6` 6.12 conflicts with the conda `qtbase` pulled in by VTK: importing `QtCore` fails with `DLL load failed`. Install `pyside6` from conda-forge instead (see C.3). |
| **Report storage** | `/app/file_storage` | `backend\file_storage` — reports generated locally are written there (the process runs from `backend\`). |
| **Shell scripts** (`osdagweb.sh`, `setup_*.sh`) | `bash` | Do not run natively; use the commands below in PowerShell/cmd. |

### C.1 — Install Prerequisites

Open **PowerShell** and install with `winget` (or download the installers manually):

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id PostgreSQL.PostgreSQL.16 -e
winget install --id Anaconda.Miniconda3 -e
winget install --id MiKTeX.MiKTeX -e
winget install --id Memurai.MemuraiDeveloper -e
```

Notes:
- During the PostgreSQL install, set the `postgres` superuser password and remember it (default port `5432`).
- In MiKTeX setup, set **"Install missing packages on-the-fly"** to **Yes**. You can enforce it after installation with:
  ```powershell
  initexmf --set-config-value=[MPM]AutoInstall=1
  ```
  Without this, `pdflatex -interaction=nonstopmode` aborts with `File 'kvoptions.sty' not found` / `ltxcmds.sty not found` and no PDF is produced.
- Memurai installs as a Windows service and starts automatically on port `6379`.
- If `winget` has no Memurai package, download it from [memurai.com](https://www.memurai.com/get-memurai), or use the [tporadowski/redis releases](https://github.com/tporadowski/redis/releases) `.msi`.

**Close and reopen your terminal** so the new `PATH` entries are picked up, then verify:

```powershell
git --version
node --version
psql --version
pdflatex --version
memurai-cli ping      # or: redis-cli ping   -> PONG
```

If `psql` or `pdflatex` is not found, add these to your `PATH` (adjust version/location):
- `C:\Program Files\PostgreSQL\16\bin`
- MiKTeX's `miktex\bin\x64` folder (e.g. `%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64`)

### C.2 — Create the Conda Environment

Open **Anaconda Prompt** (or run `conda init powershell` once and reopen PowerShell):

```powershell
conda create -n osdag-web python=3.11 -y
conda activate osdag-web
conda install -c conda-forge pythonocc-core cairo -y
```

> `pythonocc-core` and `cairo` must come from conda-forge; they do not build reliably via pip on Windows.

### C.3 — Clone and Install Python Dependencies

```powershell
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
pip install --upgrade pip pyopenssl
pip install -r requirements.txt
```

If a package fails to build, install the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) ("Desktop development with C++") and retry.

> **PySide6 / Qt DLL conflict (important):** `requirements.txt` allows the latest pip `PySide6` (6.12), but the conda `qtbase` pulled in by VTK is 6.11. Importing it then fails with `ImportError: DLL load failed while importing QtCore: The specified procedure could not be found`, and the backend cannot start. Replace the pip build with the conda-forge one:
>
> ```powershell
> python -m pip uninstall -y PySide6 PySide6-Addons PySide6-Essentials shiboken6
> conda install -c conda-forge pyside6 -y
> python -c "from PySide6 import QtCore, QtWidgets; print('PySide6 OK', QtCore.qVersion())"
> ```
>
> Repeat this whenever you reinstall `requirements.txt`.

### C.4 — Create the Database

```powershell
psql -U postgres -h localhost
```

At the `psql` prompt:

```sql
CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;
\q
```

### C.5 — Configure Environment

Create `.env` in the project root (Notepad: save as **All Files**, not `.env.txt`), or in PowerShell:

```powershell
Set-Content -Path .env -Value @"
DATABASE_NAME=postgres_Intg_osdag
DATABASE_USER=osdagdeveloper
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=dev-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
USE_REDIS_CACHE=false
"@
```

> These are development-only values. Do not reuse them in production.

Place your Firebase service account key at `backend\firebase-service-account.json` (see [A.5.1](#a51--add-firebase-service-account-key-json)).

### C.6 — Migrate the Database

```powershell
cd backend
python manage.py migrate
cd ..
```

The steel-section catalog is read from the SQLite file bundled with `osdag_core`, so there is no catalog to load into PostgreSQL.

### C.7 — Install and Configure the Frontend

```powershell
cd frontend
npm install
Set-Content -Path .env -Value "VITE_BASE_URL=http://127.0.0.1:8000/"
cd ..
```

### C.8 — Start All Services

From the repository root, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\start_windows.ps1
```

The script builds the frontend when needed (first run or after source changes) and opens Django, the Celery worker, and the frontend in separate windows. Open **http://localhost:5173**; close each window to stop that process. PostgreSQL and Memurai must also be running.

Default mode is tuned for low memory (roughly 0.7–0.8 GB total):

| Service | How it runs |
|---|---|
| Django | `runserver` (ASGI/Daphne), `--noreload`, one process |
| Celery | `--pool=solo --concurrency=1`, one task at a time |
| Frontend | pre-built `dist/` served by `vite preview` (~90 MB, proxies `/api` and `/ws`) |

Flags:

```powershell
# Force a frontend rebuild (automatic when sources are newer than dist/)
powershell -ExecutionPolicy Bypass -File .\start_windows.ps1 -Build

# Vite dev server with hot module replacement (much lighter on rebuilds, ~1.2 GB RAM)
powershell -ExecutionPolicy Bypass -File .\start_windows.ps1 -Dev
```

> With `--pool=solo` the worker runs one task at a time, so a long CAD or report job blocks other tasks until it finishes. This is acceptable for development.

Use the **Docker** option only if you need the full observability stack; it runs a WSL 2 VM plus eight containers and needs several GB of RAM.

### C.9 — Native Windows Troubleshooting

| Error | Likely Cause | Solution |
|---|---|---|
| `ValueError: not enough values to unpack` / `PermissionError` on Celery start | Prefork pool on Windows | Add `--pool=solo` to the Celery command |
| `Error 10061 connecting to localhost:6379` | Redis/Memurai not running | Start the **Memurai** service (`services.msc`) or run `redis-server` |
| `LaTeX (pdflatex) not found` | MiKTeX not on `PATH` | Add MiKTeX's `bin\x64` folder to `PATH` and reopen the terminal |
| PDF generation hangs | MiKTeX waiting to install a package | In MiKTeX Console → Settings, set "Install missing packages" to **Always**, or run `initexmf --set-config-value=[MPM]AutoInstall=1` |
| `LaTeX Error: File 'kvoptions.sty' / 'ltxcmds.sty' not found` then `no output PDF file produced` | Auto-install disabled; `-interaction=nonstopmode` cannot answer the prompt | Run `initexmf --set-config-value=[MPM]AutoInstall=1` and retry Save PDF |
| `ImportError: DLL load failed while importing QtCore` | pip `PySide6` 6.12 against conda `qtbase` 6.11 | Follow the PySide6 block in C.3 |
| Save PDF returns 404 `LaTeX file not found` | The report was generated elsewhere (e.g. Docker), so its `.tex` is not under `backend\file_storage` | Regenerate the report locally, then Save PDF |
| `psql` is not recognized | PostgreSQL `bin` not on `PATH` | Add `C:\Program Files\PostgreSQL\16\bin` to `PATH` |
| `ImportError: DLL load failed` (cairo / OCC) | Mixed pip/conda installs | Reinstall with `conda install -c conda-forge cairo pythonocc-core -y` |
| `password authentication failed for user "osdagdeveloper"` | Role not created or wrong password | Re-run the SQL in C.4 |
| WebSocket status never updates | Redis unreachable by Channels | Confirm `redis-cli ping` returns `PONG` and `REDIS_URL` is correct |

### C.10 — PDF Reports ("Save PDF")

Report generation and PDF compilation run **in the Django process**, not in Celery.

- The LaTeX source and report images are written to `backend\file_storage\design_report\<report_id>\`.
- **Save PDF** re-reads that `.tex`, filters the selected sections, runs `pdflatex` twice in a temporary directory, and streams the PDF back to the browser.
- Requirements: `pdflatex` on `PATH` **and** MiKTeX auto-install enabled (see C.1). The first save for each module may take longer while MiKTeX downloads missing packages.
- Each compile has a 60 s timeout. If a first-time download exceeds it, retry once the packages are cached.
- Reports generated while running Docker live under the repository-root `file_storage` and reference `/app/...` paths, so they return "LaTeX file not found" locally. Open the project and regenerate the report once on Windows, then Save PDF.

---

## Troubleshooting & Common Errors

| Error | Likely Cause | Solution |
|---|---|---|
| `\r: command not found` during docker run | Windows CRLF line endings in Docker | Configure Git line endings (`git config --global core.autocrlf input`) and re-clone the repository |
| Docker build takes very long | Docker has low resource limits | Open Docker Desktop → Settings → Resources and increase CPU cores and Memory allocation |
| `npm: command not found` | Node.js not installed | Install Node.js via NVM inside WSL and restart your terminal |

---

## Summary: Key Steps

### Docker Path (Full Stack)

| Step | Task |
|---|---|
| A.1 | Confirm system requirements |
| A.2 | Install WSL 2 + Docker Desktop for Windows |
| A.3 | Install Git for Windows |
| A.4 | Clone repository |
| A.5 | Create `.env` file |
| A.6 | `docker compose up --build` |
| A.7 | Open http://localhost:5173 |
| A.8 | Section catalog (nothing to do) |

### Manual WSL 2 Path

| Step | Task |
|---|---|
| B.1 | Install WSL 2 and Ubuntu 22.04 (`wsl --install -d Ubuntu-22.04`) |
| B.2 | Follow the manual setup steps in [installation_docs_linux.md](installation_docs_linux.md) inside WSL |

### Native Windows Path

| Step | Task |
|---|---|
| C.0 | Read the native Windows differences (Redis, Celery pool, MiKTeX, PySide6) |
| C.1 | Install Git, Node, PostgreSQL, Miniconda, MiKTeX, Memurai; enable MiKTeX auto-install |
| C.2 | Create conda env, install `pythonocc-core` + `cairo` |
| C.3 | Clone repo, install requirements, replace pip `PySide6` with conda `pyside6` |
| C.4 | Create database role + database |
| C.5 | Write `.env`, add Firebase key |
| C.6 | `migrate` |
| C.7 | `npm install`, write `frontend\.env` |
| C.8 | `.\start_windows.ps1` — lean stack (Django, Celery solo, static frontend) |
