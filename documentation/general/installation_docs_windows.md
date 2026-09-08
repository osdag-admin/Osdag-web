# Osdag-Web Installation Guide — Windows

This guide covers two ways to run **Osdag-Web** on Windows:

- **[Option A — Docker Compose (Recommended)](#option-a-docker-compose-recommended)** — spins up all services (Postgres, Redis, Django, Celery, React) in containers with a single command.
- **[Option B — Manual Setup via WSL 2 (No Docker)](#option-b-manual-setup-via-wsl-2-no-docker)** — run services manually inside the Windows Subsystem for Linux (WSL 2) using Conda, pip, and Node.js.

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

## Option A: Docker Compose (Recommended)

> This is the fastest path. All services are managed by Docker; you do **not** need to install Postgres, Redis, Conda, or Python compilers manually.

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

Create a `.env` file in the project root folder. 

In **PowerShell**, you can run:
```powershell
Set-Content -Path .env -Value @"
DEBUG=True
SECRET_KEY=dev-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=postgres_Intg_osdag
DATABASE_USER=osdagdeveloper
DATABASE_PASSWORD=password
DATABASE_HOST=db
DATABASE_PORT=5432

REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
USE_REDIS_CACHE=false

VITE_API_URL=http://localhost:8000
"@
```
Or, open **Notepad**, copy the values above, and save it as `.env` (make sure to choose "All Files (*.*)" in the Save dialog so it does not save as `.env.txt`).

---

> [!WARNING]
> **Line Endings Gotcha on Windows**: Windows uses CRLF line endings (`\r\n`), but scripts run inside the Linux containers must use LF (`\n`). If you encounter errors like `\r: command not found` when starting containers, run the following command to configure git and re-clone the repository:
> ```cmd
> git config --global core.autocrlf input
> ```

---

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

### A.8 — Populate the Database (First Time Only)

Once the services are up and running, open a new terminal window and run:
```cmd
docker compose exec backend bash -c "source /opt/miniconda/etc/profile.d/conda.sh && conda activate myenv && python populate_database.py"
```

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

For production, use the production compose file:
```cmd
# Create a production .env with strong secrets
copy .env .env.prod
# Edit .env.prod: set strong SECRET_KEY, DATABASE_PASSWORD, DEBUG=False, ALLOWED_HOSTS

docker compose -f docker-compose.prod.yml up -d --build
```

---

## Option B: Manual Setup via WSL 2 (No Docker)

Because Osdag-Web relies heavily on Linux-specific dependencies (such as the Cairo libraries, system packages, and Celery prefork behavior), running a native development environment directly on Windows without virtualization is not supported.

The only supported way to perform a manual, native-like setup on Windows is by installing **Ubuntu in WSL 2** and running the application inside that Linux environment.

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

## Troubleshooting & Common Errors

| Error | Likely Cause | Solution |
|---|---|---|
| `\r: command not found` during docker run | Windows CRLF line endings in Docker | Configure Git line endings (`git config --global core.autocrlf input`) and re-clone the repository |
| Docker build takes very long | Docker has low resource limits | Open Docker Desktop → Settings → Resources and increase CPU cores and Memory allocation |
| `npm: command not found` | Node.js not installed | Install Node.js via NVM inside WSL and restart your terminal |

---

## Summary: Key Steps

### Docker Path (Recommended)

| Step | Task |
|---|---|
| A.1 | Confirm system requirements |
| A.2 | Install WSL 2 + Docker Desktop for Windows |
| A.3 | Install Git for Windows |
| A.4 | Clone repository |
| A.5 | Create `.env` file |
| A.6 | `docker compose up --build` |
| A.7 | Open http://localhost:5173 |
| A.8 | Populate DB (first time only) |

### Manual WSL 2 Path

| Step | Task |
|---|---|
| B.1 | Install WSL 2 and Ubuntu 22.04 (`wsl --install -d Ubuntu-22.04`) |
| B.2 | Follow the manual setup steps in [installation_docs_linux.md](installation_docs_linux.md) inside WSL |
