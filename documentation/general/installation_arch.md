# Osdag-Web Installation Guide — Arch Linux (Native / No Docker)

This guide covers native local development of **Osdag-Web** on Arch Linux, running all services directly on your machine using Conda, pip, and Node.js.

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

## System Requirements

- Arch Linux (up to date)
- At least **8 GB RAM**, **20 GB free disk**
- `sudo` privileges

---

## Step 1 — Install System Build Tools

```bash
sudo pacman -Syu
sudo pacman -S --needed \
  base-devel cmake curl wget git \
  postgresql-libs openssl mesa glu \
  wkhtmltopdf
```

> `postgresql-libs` provides `libpq-dev` equivalent headers needed to build `psycopg2`.

---

## Step 2 — Install TeX Live (required for PDF/LaTeX report generation)

```bash
sudo pacman -S texlive-basic texlive-latex texlive-latexrecommended \
  texlive-latexextra texlive-fontsrecommended texlive-fontutils
```

> Arch splits TeX Live into individual packages. The above covers everything Osdag needs. If a report fails with a missing `.sty` file later, install `texlive-most` for the full suite (~4 GB).

Verify:
```bash
pdflatex --version
kpsewhich lmodern.sty  # should return a path
```

---

## Step 3 — Install Miniconda

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh
bash ~/miniconda.sh -b -p ~/miniconda3
~/miniconda3/bin/conda init bash
source ~/.bashrc
```

Verify:
```bash
conda --version
```

---

## Step 4 — Create and Activate a Conda Environment

```bash
conda create -n osdag-web python=3.11 -y
conda activate osdag-web
```

> Keep this environment activated for all subsequent steps and every time you run the application.

---

## Step 5 — Install Conda-Forge Dependencies

These packages cannot be installed via pip reliably and must come from conda-forge:

```bash
conda install -c conda-forge pythonocc-core cairo -y
```

> `pythonocc-core` is used for 3D CAD generation. `cairo` is used for 2D graphic exports. Both are binary packages that fail to compile via pip on most systems.

---

## Step 6 — Clone the Repository

```bash
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

---

## Step 7 — Install Python Dependencies

```bash
pip install --upgrade pip pyopenssl
pip install -r requirements.txt
```

> If any package fails to build, ensure `base-devel`, `postgresql-libs`, and `openssl` are installed (Step 1).

---

## Step 8 — Install and Configure PostgreSQL

### Install

```bash
sudo pacman -S postgresql
```

### Initialize the database cluster (Arch-specific — required before first use)

```bash
sudo -u postgres initdb --locale=en_US.UTF-8 -D /var/lib/postgres/data
```

### Start and enable the service

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create the Osdag role and database

```bash
sudo -u postgres psql
```

At the `psql` prompt, run:

```sql
CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;
\q
```

Verify the connection:
```bash
psql -U osdagdeveloper -d postgres_Intg_osdag -h localhost -c "\l"
```

---

## Step 9 — Install Redis

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

---

## Step 10 — Configure Django Settings

The backend reads settings from environment variables. For local development, export them in your shell or create a `.env` file at the project root:

```bash
cat > .env << 'EOF'
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
EOF
```

### Firebase Admin Credentials

The app uses Firebase for user authentication. You must provide a service account key:

1. Go to Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Save the downloaded file as `firebase-service-account.json`
3. Place it inside the `backend/` directory:
   ```
   Osdag-web/backend/firebase-service-account.json
   ```

> If this file is missing, the backend will print a warning on startup and authenticated endpoints will fail token validation.

---

## Step 11 — Run Django Migrations

```bash
cd backend
python manage.py migrate
cd ..
```

---

## Step 12 — Populate the Structural Database (First Time Only)

```bash
python populate_database.py
```

> This script reads the SQL dump from `osdag_core/data/ResourceFiles/Database/postgres_Intg_osdag.sql` and populates the section tables. It takes a few minutes on first run.

---

## Step 13 — Install Node.js (for the Frontend)

Arch ships a recent Node.js version. Install it directly:

```bash
sudo pacman -S nodejs npm
node --version   # should show v20.x or higher
npm --version
```

> If you need a specific Node version, use `nvm`:
> ```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
> source ~/.bashrc
> nvm install 22
> nvm use 22
> ```

---

## Step 14 — Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Step 15 — Configure Frontend Environment

```bash
echo "VITE_BASE_URL=http://127.0.0.1:8000/" > frontend/.env
```

Verify:
```bash
cat frontend/.env
# Should show: VITE_BASE_URL=http://127.0.0.1:8000/
```

---

## Step 16 — Start All Services

You need **three separate terminal sessions**, all with the conda environment activated (`conda activate osdag-web`).

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

> Celery must be running for design calculations, CAD generation, and PDF report creation to work.

**Terminal 3 — Vite Frontend Dev Server:**

```bash
cd Osdag-web/frontend
npm run dev
```

---

## Step 17 — Access the Application

Navigate to **http://localhost:5173** in your browser.

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (Django API) | http://localhost:8000 |

---

## Tip: Launcher Script for Arch (using `konsole` or `kitty`)

Instead of opening three terminals manually, create a launcher script. Arch commonly uses `konsole` (KDE) or `kitty` — adjust to your terminal emulator:

### Using `kitty`:

```bash
nano ~/run-osdag.sh
```

```bash
#!/bin/bash

PROJECT_DIR="$HOME/Osdag-web"   # <--- CHANGE THIS to your actual path
CONDA_ENV="osdag-web"

ACTIVATE="source $(conda info --base)/etc/profile.d/conda.sh && conda activate $CONDA_ENV"

kitty --title "Django Backend" bash -c "$ACTIVATE && cd $PROJECT_DIR/backend && python manage.py runserver 8000; bash" &
kitty --title "Celery Worker"  bash -c "$ACTIVATE && cd $PROJECT_DIR/backend && celery -A config worker -Q calculations,cad,reports,celery --loglevel=info; bash" &
kitty --title "Vite Frontend"  bash -c "cd $PROJECT_DIR/frontend && npm run dev; bash" &
```

```bash
chmod +x ~/run-osdag.sh
~/run-osdag.sh
```

### Using `konsole` (KDE):

```bash
konsole --new-tab -e bash -c "$ACTIVATE && cd $PROJECT_DIR/backend && python manage.py runserver 8000; bash" &
konsole --new-tab -e bash -c "$ACTIVATE && cd $PROJECT_DIR/backend && celery -A config worker -Q calculations,cad,reports,celery --loglevel=info; bash" &
konsole --new-tab -e bash -c "cd $PROJECT_DIR/frontend && npm run dev; bash" &
```

---

## Troubleshooting — Arch-Specific

| Error | Likely Cause | Solution |
|---|---|---|
| `initdb: command not found` | PostgreSQL not initialized | Run `sudo -u postgres initdb -D /var/lib/postgres/data` |
| `psql: error: connection refused` | PostgreSQL not running | Run `sudo systemctl start postgresql` |
| `FATAL: role osdagdeveloper does not exist` | Role not created yet | Run the `CREATE ROLE` SQL in Step 8 |
| `kpsewhich lmodern.sty` returns nothing | lmodern TeX package missing | Run `sudo pacman -S texlive-fontsrecommended` |
| `pdflatex: command not found` | TeX Live not installed | Run Step 2 |
| `ModuleNotFoundError: No module named '...'` | Wrong conda env or missing package | Run `conda activate osdag-web` then `pip install -r requirements.txt` |
| `redis-cli ping` returns `Connection refused` | Redis not running | Run `sudo systemctl start redis` |
| `cairo` import error | Cairo installed via pip instead of conda | Run `conda install -c conda-forge cairo -y` |
| `pythonocc` import error | OCC not installed | Run `conda install -c conda-forge pythonocc-core -y` |
| `Permission denied` on `populate_database.py` | Wrong PostgreSQL auth | Check `pg_hba.conf` at `/var/lib/postgres/data/pg_hba.conf` — set auth to `md5` for local connections |
| Frontend shows blank page / API errors | Wrong `VITE_BASE_URL` | Check `frontend/.env` has `VITE_BASE_URL=http://127.0.0.1:8000/` |
| `npm: command not found` | Node.js not installed | Run `sudo pacman -S nodejs npm` |

### PostgreSQL `pg_hba.conf` fix (if password auth fails)

Edit `/var/lib/postgres/data/pg_hba.conf` and change:
```
local   all   all   peer
```
to:
```
local   all   all   md5
```

Then restart:
```bash
sudo systemctl restart postgresql
```

---

## Summary: Key Steps

| Step | Task |
|---|---|
| 1 | Install system build tools (`base-devel`, `cmake`, `wkhtmltopdf`) |
| 2 | Install TeX Live packages |
| 3 | Install Miniconda |
| 4 | Create conda env (Python 3.11) |
| 5 | Install conda-forge deps (`pythonocc-core`, `cairo`) |
| 6 | Clone repository |
| 7 | Install Python deps (`pip install -r requirements.txt`) |
| 8 | Install + initialize PostgreSQL, create role + database |
| 9 | Install + start Redis |
| 10 | Configure Django environment variables + Firebase key |
| 11 | Run `python manage.py migrate` |
| 12 | Run `python populate_database.py` |
| 13 | Install Node.js |
| 14 | Install frontend deps (`npm install`) |
| 15 | Configure `frontend/.env` |
| 16 | Start Django, Celery, and Vite (3 terminals) |
| 17 | Open http://localhost:5173 |