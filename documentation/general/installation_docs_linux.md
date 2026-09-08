# Osdag-Web Installation Guide — Ubuntu / Linux

This guide covers two ways to run **Osdag-Web** on Ubuntu/Linux:

- **[Option A — Docker Compose (Recommended)](#option-a-docker-compose-recommended)** — spins up all services (Postgres, Redis, Django, Celery, React) in containers with a single command.
- **[Option B — Native Local Development (No Docker)](#option-b-native-local-development-no-docker)** — run services directly on your machine using Conda, pip, and Node.js.

---

## Architecture Overview

| Service | Role |
|---|---|
| **Vite + React (frontend)** | UI, initiates design tasks, listens to real-time WebSocket status updates |
| **Django (backend)** | REST API, input validation, task dispatch |
| **Celery worker** | Background processing (CAD, PDF, design calculations) |
| **Redis** | Message broker + Celery result backend |
| **PostgreSQL** | Persistent database |

---

## Option A: Docker Compose (Recommended)

> This is the fastest path. All services are managed by Docker; you do **not** need to install Postgres, Redis, or Conda manually.

### A.1 — System Requirements

- **Ubuntu 20.04 LTS / 22.04 LTS** (or any modern Linux distro)
- **Docker Engine 24.x+** and **Docker Compose v2**
- At least **8 GB RAM** and **20 GB free disk** (backend image is large)

### A.2 — Install Docker Engine

Choose the installation instructions for your distribution:

#### Ubuntu / Debian

```bash
# Remove old Docker versions if present
sudo apt remove -y docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### Arch Linux

```bash
# Install Docker and Docker Compose
sudo pacman -Syu docker docker-compose

# Start and enable the Docker service
sudo systemctl start docker.service
sudo systemctl enable docker.service
```

#### Post-Installation Steps (All Distributions)

Verify the installation:

```bash
docker --version
docker compose version
```

Add your user to the `docker` group so you can run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
# Log out and log back in (or run 'newgrp docker') for this to take effect
```

### A.3 — Install Git

Choose the installation instructions for your distribution:

#### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y git
```

#### Arch Linux

```bash
sudo pacman -S git
```


### A.4 — Clone the Repository

```bash
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

### A.5 — Create the `.env` File

Create a `.env` file in the project root (one-time setup):

```bash
cat > .env << 'EOF'
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
EOF
```

### A.5.1 — Add Firebase Service Account Key JSON

This application uses Firebase for user authentication. You must add the Firebase service account private key JSON file in the backend configuration before running Docker Compose:

1. Obtain your service account key JSON file from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
2. Save this file as `firebase-service-account.json` and place it in the `backend/` directory of the repository:
   ```bash
   # Path relative to project root:
   backend/firebase-service-account.json
   ```

> **Note:** The `.env` file at the root is for Docker Compose services (backend, Celery, frontend). A separate `.env` inside `frontend/` controls the Vite dev server (`VITE_BASE_URL`).

### A.6 — Build and Start All Services

```bash
docker compose up --build
```

This single command:
1. Builds the backend image (Ubuntu 22.04 + Miniconda + Python 3.11 + pip packages)
2. Builds the frontend image (Node 20 Alpine)
3. Starts Postgres 14, Redis 7, Django backend, Celery worker, and Vite dev server
4. Runs `python manage.py migrate` on first start

> **First build** can take **15–30 minutes** due to the large backend dependency layer (TeX Live, VTK, etc.). Subsequent builds use Docker's layer cache and are much faster.

### A.7 — Access the Application

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (Django API) | http://localhost:8000 |

### A.8 — Populate the Database (First Time Only)

After the services are running, populate the structural section database:

```bash
docker compose exec backend bash -c "source /opt/miniconda/etc/profile.d/conda.sh && conda activate myenv && python populate_database.py"
```

### A.9 — Useful Docker Commands

```bash
# Follow logs for all services
docker compose logs -f

# Follow logs for specific services
docker compose logs -f backend celery_worker

# Check container status
docker compose ps

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

```bash
docker compose exec backend bash -c \
  "source /opt/miniconda/etc/profile.d/conda.sh && \
   conda activate myenv && \
   python -c \"from apps.core.tasks import healthcheck_task; print(healthcheck_task.delay().id)\""

# Then check the worker picked it up
docker compose logs --tail=50 celery_worker
```

### A.11 — Production Deployment

For production, use the production compose file which enables `DEBUG=False`, `collectstatic`, persistent named volumes, and the Nginx frontend:

```bash
# Create a production .env with strong secrets
cp .env .env.prod
# Edit .env.prod: set strong SECRET_KEY, DATABASE_PASSWORD, DEBUG=False, ALLOWED_HOSTS

docker compose -f docker-compose.prod.yml up -d --build
```

> **Security notes:**
> - Never commit secrets or production `.env` files to Git.
> - Use a strong random `SECRET_KEY` in production (e.g. `python -c "import secrets; print(secrets.token_hex(50))"`)
> - Set `ALLOWED_HOSTS` to your actual domain, not `*`.
> - Set a strong `DATABASE_PASSWORD`.

---

## Option B: Native Local Development (No Docker)

Use this if you prefer to run services directly on your machine or cannot use Docker.

### B.1 — System Requirements

- Ubuntu 20.04 LTS / 22.04 LTS or Arch Linux
- At least **8 GB RAM**, **20 GB free disk**
- sudo / admin privileges

### B.2 — Install System Build Tools

Choose the installation instructions for your distribution:

#### Ubuntu / Debian
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential cmake curl wget git \
  libpq-dev libssl-dev libgl1-mesa-glx libglu1-mesa \
  software-properties-common
```

#### Arch Linux
```bash
sudo pacman -Syu
sudo pacman -S --needed base-devel cmake curl wget git postgresql-libs openssl mesa glu
```

### B.3 — Install wkhtmltopdf (required for PDF reports)

#### Ubuntu / Debian
```bash
sudo apt install -y wkhtmltopdf
```

#### Arch Linux
```bash
sudo pacman -S wkhtmltopdf
```

### B.4 — Install TeX Live (required for LaTeX report generation)

#### Ubuntu / Debian
```bash
sudo apt install -y texlive-full
```

#### Arch Linux
```bash
sudo pacman -S texlive-basic texlive-latexextra texlive-fontsrecommended
# Or the full suite:
# sudo pacman -S texlive
```

> `texlive-full` (or `texlive` on Arch Linux) is large (~4 GB). If disk space is a concern, use `texlive-latex-extra` on Ubuntu or install only necessary texlive packages on Arch.

### B.5 — Install Miniconda

```bash
# Download Miniconda installer (Python 3.x)
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh

# Run the installer (non-interactive)
bash ~/miniconda.sh -b -p ~/miniconda3

# Initialize conda for bash
~/miniconda3/bin/conda init bash

# Reload shell
source ~/.bashrc
```

Verify:

```bash
conda --version
```

### B.6 — Create and Activate a Conda Environment

The application uses **Python 3.11** (matching the Dockerfile):

```bash
conda create -n osdag-web python=3.11 -y
conda activate osdag-web
```

> **Important:** Keep this environment activated for all subsequent steps and every time you run the application.

### B.7 — Install Conda-Forge Dependencies (Important for CAD/Graphics)

Certain heavy binary packages like `pythonocc-core` (used for 3D CAD modeling and generation) and `cairo` (used for 2D graphic exports) are not in `requirements.txt` because they cannot be compiled/installed reliably via pip. They must be installed through conda-forge:

```bash
conda install -c conda-forge pythonocc-core cairo -y
```

### B.8 — Clone the Repository

```bash
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

### B.9 — Install Python Dependencies

```bash
pip install --upgrade pip pyopenssl
pip install -r requirements.txt
```

> If any package fails to build, ensure `build-essential`, `libpq-dev`, and `libssl-dev` are installed (Step B.2).

### B.10 — Install PostgreSQL

#### Ubuntu / Debian
```bash
# Add official PostgreSQL repository (for Postgres 14+)
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-14 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Arch Linux
```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### B.11 — Create PostgreSQL Role and Database

```bash
sudo -u postgres psql
```

At the `psql` prompt, run:

```sql
CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;
\q
```

### B.12 — Install Redis

#### Ubuntu / Debian
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Arch Linux
```bash
sudo pacman -S redis
sudo systemctl start redis
sudo systemctl enable redis
```

Verify:

```bash
redis-cli ping
# Expected output: PONG
```

### B.13 — Configure Django Settings

The backend reads settings from environment variables (defined in `backend/config/settings.py`). For local development, you can export them or create a `.env` file at the project root.

The default values already match the Postgres role created in Step B.11:

```
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
```

If you changed the Postgres password, update `DATABASE_PASSWORD` accordingly.

#### Firebase Admin Credentials Setup

Because the project uses Firebase for user authentication, you must configure the backend to use your Firebase service account key:
1. Obtain the service account key JSON file from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
2. Save this file as `firebase-service-account.json` and place it inside the `backend/` directory (i.e., `Osdag-web/backend/firebase-service-account.json`).
3. If this file is missing, the backend will print a warning on startup and authenticated endpoints will fail token validation.

### B.14 — Run Django Migrations

```bash
cd backend
python manage.py migrate
cd ..
```

### B.15 — Populate the Structural Database (First Time Only)

```bash
python populate_database.py
```

> This script reads `osdag_core/data/ResourceFiles/Database/postgres_Intg_osdag.sql` and populates the section tables.

### B.16 — Install Node.js and NPM (for the Frontend)

Use NVM (Node Version Manager) to install the correct Node.js version. The frontend requires **Node 20**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node --version   # Should show v20.x.x
```

### B.17 — Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### B.18 — Configure Frontend Environment

The frontend reads `VITE_BASE_URL` from `frontend/.env`:

```bash
# frontend/.env already exists; verify it points to your backend
cat frontend/.env
# Should show: VITE_BASE_URL=http://127.0.0.1:8000/
```

### B.19 — Start All Services

You need **three separate terminal sessions**, all with the conda environment activated.

**Terminal 1 — Django Backend:**

```bash
conda activate osdag-web
cd Osdag-web/backend
python manage.py runserver 8000
```

**Terminal 2 — Celery Worker:**

```bash
conda activate osdag-web
cd Osdag-web/backend
celery -A config worker -Q calculations,cad,reports,celery --loglevel=info
```

> Celery must be running for design calculations, CAD generation, and PDF report creation to work. Without it, requests will hang indefinitely.

**Terminal 3 — Vite Frontend Dev Server:**

```bash
cd Osdag-web/frontend
npm run dev
```

### B.20 — Access the Application

Navigate to **http://localhost:5173** in your browser.

The frontend (port 5173) talks to the Django API (port 8000). Celery picks up tasks from Redis (port 6379).

---

### 💡 Tip: Create a `run-osdag.sh` Launcher Script

Instead of opening three terminals manually every time, you can create a single shell script that starts all services at once in separate terminal tabs/windows using `gnome-terminal` (default on Ubuntu).

Create the file anywhere you like, e.g. your home directory:

```bash
nano ~/run-osdag.sh
```

Paste the following — **replace `/path/to/Osdag-web` with the actual path to your cloned project folder**:

```bash
#!/bin/bash

# -----------------------------------------------
# run-osdag.sh — Start all Osdag-Web services
# Update PROJECT_DIR to your actual project path
# -----------------------------------------------

PROJECT_DIR="/path/to/Osdag-web"   # <--- CHANGE THIS
CONDA_ENV="osdag-web"

ACTIVATE="source \$(conda info --base)/etc/profile.d/conda.sh && conda activate $CONDA_ENV"

gnome-terminal \
  --tab --title="Django Backend" -- bash -c \
    "$ACTIVATE && cd $PROJECT_DIR/backend && python manage.py runserver 8000; exec bash" \
  --tab --title="Celery Worker" -- bash -c \
    "$ACTIVATE && cd $PROJECT_DIR/backend && celery -A config worker -Q calculations,cad,reports,celery --loglevel=info; exec bash" \
  --tab --title="Vite Frontend" -- bash -c \
    "cd $PROJECT_DIR/frontend && npm run dev; exec bash"
```

Make it executable and run it:

```bash
chmod +x ~/run-osdag.sh
~/run-osdag.sh
```

> **Note:** This uses `gnome-terminal`, which is the default terminal on Ubuntu with GNOME. If you use a different terminal (e.g. `xterm`, `konsole`, `xfce4-terminal`), replace `gnome-terminal --tab` with the equivalent flag for your terminal emulator.

---

## Troubleshooting & Common Errors

| Error | Likely Cause | Solution |
|---|---|---|
| `psycopg2.OperationalError: FATAL: password authentication failed` | Wrong DB credentials | Verify `DATABASE_USER`/`DATABASE_PASSWORD` match what you created in PostgreSQL |
| `psycopg2.OperationalError: could not connect to server` | PostgreSQL not running | Run `sudo systemctl start postgresql` |
| `django.db.utils.OperationalError: database "postgres_Intg_osdag" does not exist` | DB not created | Run the `CREATE DATABASE` SQL in Step B.11 |
| `ModuleNotFoundError: No module named '...'` | Missing Python package | Run `pip install -r requirements.txt` in the active conda env |
| `ERROR: Could not build wheels for ...` | Missing build tools | Run Step B.2 to install `build-essential`, `cmake`, `libpq-dev` |
| `ConnectionRefusedError: [Errno 111] Connection refused` (Redis) | Redis not running | Run `sudo systemctl start redis-server` or `redis-cli ping` to check |
| `celery.exceptions.NotRegistered` | Celery worker not running | Start the Celery worker in Terminal 2 (Step B.19) |
| Frontend shows blank page / API errors | Wrong `VITE_BASE_URL` | Check `frontend/.env` has `VITE_BASE_URL=http://127.0.0.1:8000/` |
| `npm: command not found` | Node.js not installed | Install via NVM (Step B.16) |
| `Permission denied` when running scripts | Missing executable permission | Run `chmod +x <script>` or prefix with `sudo` |
| Docker build takes very long | Large dependencies (VTK, TeX Live, etc.) | Expected on first build; subsequent builds use Docker cache |
| `docker compose: command not found` | Old Docker Compose v1 installed | Install Docker Compose v2 plugin (Step A.2); use `docker compose` not `docker-compose` |
| `LD_PRELOAD` errors in Docker container | libstdc++ path | Already set in Dockerfile: `ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` |
| `populate_database.py` fails | Wrong DB connection | Verify Postgres is running and credentials in Step B.11 match the script defaults |

---

## Summary: Key Steps

### Docker Path (Recommended)

| Step | Task |
|---|---|
| A.1 | Confirm system requirements |
| A.2 | Install Docker Engine + Compose v2 |
| A.3 | Install Git |
| A.4 | Clone repository |
| A.5 | Create `.env` file |
| A.6 | `docker compose up --build` |
| A.7 | Open http://localhost:5173 |
| A.8 | Populate DB (first time only) |

### Native Path

| Step | Task |
|---|---|
| B.1 | Confirm system requirements |
| B.2 | Install system build tools |
| B.3 | Install wkhtmltopdf |
| B.4 | Install TeX Live |
| B.5 | Install Miniconda |
| B.6 | Create conda env (Python 3.11) |
| B.7 | Install Conda-Forge deps (`pythonocc-core`, `cairo`) |
| B.8 | Clone repository |
| B.9 | Install Python deps (`pip install -r requirements.txt`) |
| B.10 | Install PostgreSQL 14 |
| B.11 | Create Postgres role + database |
| B.12 | Install Redis |
| B.13 | Configure Django environment variables |
| B.14 | Run `python manage.py migrate` |
| B.15 | Run `python populate_database.py` |
| B.16 | Install Node.js 20 via NVM |
| B.17 | Install frontend deps (`npm install`) |
| B.18 | Configure frontend `.env` |
| B.19 | Start Django, Celery, and Vite (3 terminals) |
| B.20 | Open http://localhost:5173 |