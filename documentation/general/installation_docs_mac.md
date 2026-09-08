# Osdag-Web Installation Guide — macOS

This guide covers two ways to run **Osdag-Web** on macOS:

- **[Option A — Docker Compose (Recommended)](#option-a-docker-compose-recommended)** — spins up all services (Postgres, Redis, Django, Celery, React) in containers with a single command.
- **[Option B — Native Local Development (No Docker)](#option-b-native-local-development-no-docker)** — run services directly on your Mac using Conda, pip, and Node.js.

> **Apple Silicon (M1/M2/M3) note:** All steps below work on both Intel (`x86_64`) and Apple Silicon (`arm64`) Macs. Where there are differences, they are called out explicitly.

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

- macOS 12 Monterey or later (macOS 13 Ventura / 14 Sonoma recommended)
- **Docker Desktop for Mac** 4.x+
- At least **8 GB RAM** (16 GB recommended for Apple Silicon)
- At least **30 GB free disk** (backend image is large due to VTK, TeX Live, etc.)

### A.2 — Install Docker Desktop

1. Download **Docker Desktop for Mac** from the official site:
   - **Apple Silicon (M1/M2/M3):** https://docs.docker.com/desktop/install/mac-install/ → *Mac with Apple chip*
   - **Intel Mac:** https://docs.docker.com/desktop/install/mac-install/ → *Mac with Intel chip*

2. Open the downloaded `.dmg` and drag Docker to Applications.

3. Launch Docker Desktop from Applications and wait for the whale icon in the menu bar to stop animating (Docker is ready).

4. Verify from Terminal:

```bash
docker --version
docker compose version
```

> **Resource allocation:** In Docker Desktop → Settings → Resources, allocate at least **6 CPU cores** and **8 GB Memory** for the Osdag-Web stack to run smoothly.

### A.3 — Install Git

macOS ships with a Git stub that prompts to install Xcode Command Line Tools. Accept the prompt, or install directly:

```bash
xcode-select --install
```

Verify:

```bash
git --version
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

> **First build** can take **20–40 minutes** on macOS (especially on Apple Silicon via Rosetta emulation of the `linux/amd64` image layers). Subsequent builds use Docker's layer cache and are much faster.

> **Apple Silicon note:** The backend `Dockerfile` is based on `ubuntu:22.04` (`linux/amd64`). Docker Desktop handles the emulation transparently via Rosetta 2. If you see `WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)`, this is expected and does not prevent the services from working.

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
> - Use a strong random `SECRET_KEY`:
>   ```bash
>   python3 -c "import secrets; print(secrets.token_hex(50))"
>   ```
> - Set `ALLOWED_HOSTS` to your actual domain, not `*`.
> - Set a strong `DATABASE_PASSWORD`.

---

## Option B: Native Local Development (No Docker)

Use this if you prefer to run services directly on your Mac or cannot use Docker.

### B.1 — System Requirements

- macOS 12 Monterey or later
- At least **8 GB RAM**, **20 GB free disk**
- Admin privileges (for Homebrew installs)

### B.2 — Install Homebrew

Homebrew is the package manager for macOS. If you don't have it:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the post-install instructions to add Homebrew to your PATH (especially important on Apple Silicon):

```bash
# Apple Silicon — add to ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel Mac — Homebrew is already in /usr/local/bin, usually no extra step
```

Verify:

```bash
brew --version
```

### B.3 — Install Xcode Command Line Tools (Build Tools)

```bash
xcode-select --install
```

If already installed, this will show: `xcode-select: error: command line tools are already installed`.

### B.4 — Install System Dependencies via Homebrew

```bash
brew install git cmake wget curl openssl libpq
```

### B.5 — Install wkhtmltopdf (required for PDF reports)

```bash
brew install wkhtmltopdf
```

### B.6 — Install TeX Live (required for LaTeX report generation)

```bash
brew install --cask mactex-no-gui
```

> `mactex-no-gui` installs the full MacTeX distribution (~4 GB) without the GUI apps. After installation, add TeX to your PATH:

```bash
# Add to ~/.zprofile (or ~/.bash_profile for bash)
echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

Verify:

```bash
pdflatex --version
```

### B.7 — Install Miniconda

**Option 1 — Via Homebrew (recommended):**

```bash
brew install --cask miniconda
```

Initialize conda for your shell:

```bash
conda init zsh      # for zsh (default on macOS Catalina+)
# or
conda init bash     # for bash
source ~/.zprofile
```

**Option 2 — Manual download:**

```bash
# Apple Silicon (M1/M2/M3)
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
bash Miniconda3-latest-MacOSX-arm64.sh

# Intel Mac
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh
bash Miniconda3-latest-MacOSX-x86_64.sh
```

Follow the prompts and say **yes** to initialize conda. Restart your terminal.

Verify:

```bash
conda --version
```

### B.8 — Create and Activate a Conda Environment

The application uses **Python 3.11** (matching the Dockerfile):

```bash
conda create -n osdag-web python=3.11 -y
conda activate osdag-web
```

> **Apple Silicon note:** If you encounter architecture issues with certain packages, create a Rosetta-compatible environment:
> ```bash
> CONDA_SUBDIR=osx-64 conda create -n osdag-web python=3.11 -y
> conda activate osdag-web
> conda config --env --set subdir osx-64
> ```

> **Important:** Keep this environment activated for all subsequent steps and every time you run the application.

### B.9 — Install Conda-Forge Dependencies (Important for CAD/Graphics)

Certain heavy binary packages like `pythonocc-core` (used for 3D CAD modeling and generation) and `cairo` (used for 2D graphic exports) are not in `requirements.txt` because they cannot be compiled/installed reliably via pip. They must be installed through conda-forge:

```bash
conda install -c conda-forge pythonocc-core cairo -y
```

### B.10 — Clone the Repository

```bash
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

### B.11 — Install Python Dependencies

```bash
pip install --upgrade pip pyopenssl
pip install -r requirements.txt
```

> If `psycopg2-binary` fails to build, try:
> ```bash
> brew install libpq
> pip install psycopg2-binary
> ```

> If `cryptography` or `cffi` fails on Apple Silicon, use the Rosetta environment trick in Step B.9.

### B.12 — Install PostgreSQL

```bash
brew install postgresql@14
brew services start postgresql@14
```

Add the PostgreSQL binaries to your PATH:

```bash
# Apple Silicon
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zprofile

# Intel Mac
echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zprofile

source ~/.zprofile
```

Verify:

```bash
psql --version
pg_isready
```

### B.13 — Create PostgreSQL Role and Database

```bash
psql postgres
```

At the `psql` prompt, run:

```sql
CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;
\q
```

> **Note:** On macOS with Homebrew Postgres, the default superuser is your macOS username (not `postgres`). Connect with `psql postgres` rather than `sudo -u postgres psql`.

### B.14 — Install Redis

```bash
brew install redis
brew services start redis
```

Verify:

```bash
redis-cli ping
# Expected output: PONG
```

### B.15 — Configure Django Settings

The backend reads settings from environment variables. The default values already match the Postgres role created in Step B.13. For local development, export them or create a `.env` at the project root:

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

#### Firebase Admin Credentials Setup

Because the project uses Firebase for user authentication, you must configure the backend to use your Firebase service account key:
1. Obtain the service account key JSON file from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
2. Save this file as `firebase-service-account.json` and place it inside the `backend/` directory (i.e., `Osdag-web/backend/firebase-service-account.json`).
3. If this file is missing, the backend will print a warning on startup and authenticated endpoints will fail token validation.

### B.16 — Run Django Migrations

```bash
cd backend
python manage.py migrate
cd ..
```

### B.17 — Populate the Structural Database (First Time Only)

```bash
python populate_database.py
```

> This script reads `osdag_core/data/ResourceFiles/Database/postgres_Intg_osdag.sql` and populates the section tables.

### B.18 — Install Node.js (for the Frontend)

Use NVM (Node Version Manager) to install the correct Node.js version. The frontend requires **Node 20**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zprofile   # or ~/.bash_profile for bash
nvm install 20
nvm use 20
node --version   # Should show v20.x.x
```

### B.19 — Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### B.20 — Configure Frontend Environment

```bash
# frontend/.env already exists; verify it points to your backend
cat frontend/.env
# Should show: VITE_BASE_URL=http://127.0.0.1:8000/
```

### B.21 — Start All Services

You need **three separate terminal windows/tabs**, all with the conda environment activated.

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

### B.22 — Access the Application

Navigate to **http://localhost:5173** in your browser.

The frontend (port 5173) talks to the Django API (port 8000). Celery picks up tasks from Redis (port 6379).

---

### 💡 Tip: Create a `run-osdag.sh` Launcher Script

Instead of opening three Terminal windows manually every time, you can create a single shell script that starts all services at once using `osascript` to open new Terminal tabs automatically.

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

# Open Django backend in a new Terminal tab
osascript -e "tell application \"Terminal\"
  do script \"$ACTIVATE && cd $PROJECT_DIR/backend && python manage.py runserver 8000\"
end tell"

# Open Celery worker in a new Terminal tab
osascript -e "tell application \"Terminal\"
  do script \"$ACTIVATE && cd $PROJECT_DIR/backend && celery -A config worker -Q calculations,cad,reports,celery --loglevel=info\"
end tell"

# Open Vite frontend in a new Terminal tab
osascript -e "tell application \"Terminal\"
  do script \"cd $PROJECT_DIR/frontend && npm run dev\"
end tell"
```

Make it executable and run it:

```bash
chmod +x ~/run-osdag.sh
~/run-osdag.sh
```

> **Note:** This uses macOS's built-in `osascript` to control Terminal.app and open new windows for each service. If you use **iTerm2**, replace the `osascript` blocks with iTerm2's AppleScript API or simply run each command in a split pane manually.

---

## Troubleshooting & Common Errors

| Error | Likely Cause | Solution |
|---|---|---|
| `psycopg2.OperationalError: FATAL: password authentication failed` | Wrong DB credentials | Verify `DATABASE_USER`/`DATABASE_PASSWORD` match what you created in PostgreSQL |
| `psycopg2.OperationalError: could not connect to server` | PostgreSQL not running | Run `brew services start postgresql@14` |
| `django.db.utils.OperationalError: database "postgres_Intg_osdag" does not exist` | DB not created | Run the `CREATE DATABASE` SQL in Step B.13 |
| `ModuleNotFoundError: No module named '...'` | Missing Python package | Run `pip install -r requirements.txt` in the active conda env |
| `ConnectionRefusedError: [Errno 111] Connection refused` (Redis) | Redis not running | Run `brew services start redis` or `redis-cli ping` to check |
| `celery.exceptions.NotRegistered` | Celery worker not running | Start the Celery worker in Terminal 2 (Step B.21) |
| Frontend shows blank page / API errors | Wrong `VITE_BASE_URL` | Check `frontend/.env` has `VITE_BASE_URL=http://127.0.0.1:8000/` |
| `npm: command not found` | Node.js not installed | Install via NVM (Step B.18) |
| `brew: command not found` | Homebrew not installed | Install Homebrew (Step B.2) |
| Docker build takes very long | Large dependencies (VTK, TeX Live, etc.) | Expected on first build; subsequent builds use Docker cache |
| `WARNING: The requested image's platform ... does not match` | Apple Silicon running x86_64 image | Expected warning; Docker uses Rosetta 2 — services work normally |
| `pip install` fails on Apple Silicon | Native ARM binary not available | Use `CONDA_SUBDIR=osx-64` environment (see Step B.9 note) |
| `populate_database.py` fails | Wrong DB connection | Verify Postgres is running and credentials match Step B.13 |
| `pdflatex: command not found` | TeX not in PATH | Add `/Library/TeX/texbin` to PATH (see Step B.6) |
| `psql: command not found` | PostgreSQL bin not in PATH | Add PostgreSQL bin to PATH (see Step B.12) |
| Docker Desktop says "not enough memory" | Docker resource limit too low | Increase Memory in Docker Desktop → Settings → Resources |

---

## Summary: Key Steps

### Docker Path (Recommended)

| Step | Task |
|---|---|
| A.1 | Confirm system requirements |
| A.2 | Install Docker Desktop for Mac |
| A.3 | Install Git (Xcode CLI tools) |
| A.4 | Clone repository |
| A.5 | Create `.env` file |
| A.6 | `docker compose up --build` |
| A.7 | Open http://localhost:5173 |
| A.8 | Populate DB (first time only) |

### Native Path

| Step | Task |
|---|---|
| B.1 | Confirm system requirements |
| B.2 | Install Homebrew |
| B.3 | Install Xcode Command Line Tools |
| B.4 | Install system deps via Homebrew |
| B.5 | Install wkhtmltopdf |
| B.6 | Install MacTeX |
| B.7 | Install Miniconda |
| B.8 | Create conda env (Python 3.11) |
| B.9 | Install Conda-Forge deps (`pythonocc-core`, `cairo`) |
| B.10 | Clone repository |
| B.11 | Install Python deps (`pip install -r requirements.txt`) |
| B.12 | Install PostgreSQL 14 via Homebrew |
| B.13 | Create Postgres role + database |
| B.14 | Install Redis via Homebrew |
| B.15 | Configure Django environment variables |
| B.16 | Run `python manage.py migrate` |
| B.17 | Run `python populate_database.py` |
| B.18 | Install Node.js 20 via NVM |
| B.19 | Install frontend deps (`npm install`) |
| B.20 | Configure frontend `.env` |
| B.21 | Start Django, Celery, and Vite (3 terminals) |
| B.22 | Open http://localhost:5173 |
