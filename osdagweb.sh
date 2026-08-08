#!/usr/bin/env bash
# ============================================================
# osdagweb.sh — Start all Osdag-Web services
#
# Usage:  ./osdagweb.sh            (from the repo root)
#         bash osdagweb.sh
#
# What it does:
#   1. Starts the Celery worker   (conda: osdag-web)
#   2. Starts the Django backend  (conda: osdag-web)
#   3. Starts the Vite frontend
#
# Each service runs in its own background process.
# Press Ctrl-C (or kill the script) to stop everything.
# ============================================================

set -euo pipefail

# ---------- resolve the repo root (where this script lives) ----------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
CONDA_ENV="osdag-web"

# ---------- colour helpers ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log() { echo -e "${CYAN}[osdagweb]${RESET} $*"; }
ok() { echo -e "${GREEN}[osdagweb]${RESET} $*"; }
warn() { echo -e "${YELLOW}[osdagweb]${RESET} $*"; }
err() { echo -e "${RED}[osdagweb]${RESET} $*" >&2; }

# ---------- locate conda ----------
CONDA_SH=""
for candidate in \
  "$HOME/miniconda3/etc/profile.d/conda.sh" \
  "$HOME/anaconda3/etc/profile.d/conda.sh" \
  "/opt/conda/etc/profile.d/conda.sh" \
  "/opt/miniconda3/etc/profile.d/conda.sh" \
  "/usr/local/anaconda3/etc/profile.d/conda.sh"; do
  if [[ -f "$candidate" ]]; then
    CONDA_SH="$candidate"
    break
  fi
done

if [[ -z "$CONDA_SH" ]]; then
  err "Could not find conda.sh. Set CONDA_SH manually in this script."
  exit 1
fi

log "Using conda init script: $CONDA_SH"

# ---------- helper: run a command inside the conda env ----------
# Usage: run_in_conda <label> <working_dir> <cmd…>
run_in_conda() {
  local label="$1"
  shift
  local workdir="$1"
  shift
  local logfile="$REPO_ROOT/logs/osdagweb_${label}.log"
  mkdir -p "$REPO_ROOT/logs"

  log "Starting ${BOLD}${label}${RESET} → log: logs/osdagweb_${label}.log" >&2

  bash -c "
        source '$CONDA_SH' 2>/dev/null || true
        conda activate '$CONDA_ENV' 2>/dev/null || conda activate '$HOME/.conda/envs/$CONDA_ENV' 2>/dev/null || true
        if [[ -f '$REPO_ROOT/.env' ]]; then
            set -a
            source '$REPO_ROOT/.env'
            set +a
        fi
        cd '$workdir'
        exec $*
    " >>"$logfile" 2>&1 &

  echo $! # return PID
}

# ---------- track child PIDs for clean shutdown ----------
PIDS=()

cleanup() {
  echo ""
  warn "Shutting down all services…"
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null && ok "Stopped PID $pid"
    fi
  done
  ok "All services stopped."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ============================================================
# 1. Celery worker
# ============================================================
CELERY_PID=$(run_in_conda "celery" "$BACKEND_DIR" \
  "celery -A config worker -Q calculations,cad,reports,celery --loglevel=info")
PIDS+=("$CELERY_PID")
ok "Celery worker started (PID $CELERY_PID)"

sleep 1 # let celery init before Django

# ============================================================
# 2. Django backend
# ============================================================
DJANGO_PID=$(run_in_conda "django" "$BACKEND_DIR" \
  "python manage.py runserver 8000")
PIDS+=("$DJANGO_PID")
ok "Django backend started (PID $DJANGO_PID)"

sleep 1

# ============================================================
# 3. Vite frontend (no conda needed)
# ============================================================
FRONTEND_LOG="$REPO_ROOT/logs/osdagweb_frontend.log"
mkdir -p "$REPO_ROOT/logs"
log "Starting ${BOLD}frontend${RESET} → log: logs/osdagweb_frontend.log"
bash -c "cd '$FRONTEND_DIR' && exec npm run dev" \
  >>"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
PIDS+=("$FRONTEND_PID")
ok "Vite frontend started (PID $FRONTEND_PID)"

# ============================================================
echo ""
echo -e "${GREEN}${BOLD}All services are running!${RESET}"
echo -e "  • Django  → ${CYAN}http://localhost:8000${RESET}"
echo -e "  • Vite    → ${CYAN}http://localhost:5173${RESET}"
echo -e "  • Logs    → ${CYAN}$REPO_ROOT/logs/${RESET}"
echo ""
echo -e "${YELLOW}Press Ctrl-C to stop everything.${RESET}"
echo ""

# Wait for all background jobs
wait
