#!/usr/bin/env bash
# One-shot Osdag-Web setup for Arch Linux (native, no Docker). Idempotent: safe to re-run.
# Usage: bash setup_arch.sh        (asks for the sudo password once)
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONDA_DIR="$HOME/miniconda3"
ENV_NAME="osdag-web"
DB_NAME="postgres_Intg_osdag"
DB_USER="osdagdeveloper"
DB_PASS="password"

SCRIPT_START=$SECONDS
STEP_START=$SECONDS
STEP_NAME=""
TIMINGS=()

fmt() { printf '%dm%02ds' $(( $1 / 60 )) $(( $1 % 60 )); }

end_step() {
  if [ -n "$STEP_NAME" ]; then
    TIMINGS+=("$(fmt $(( SECONDS - STEP_START )))  $STEP_NAME")
    printf '\033[1;32m    done in %s\033[0m\n' "$(fmt $(( SECONDS - STEP_START )))"
  fi
}

step() {
  end_step
  STEP_NAME="$*"
  STEP_START=$SECONDS
  printf '\n\033[1;34m==> [%s elapsed] %s\033[0m\n' "$(fmt $(( SECONDS - SCRIPT_START )))" "$*"
}

summary() {
  end_step; STEP_NAME=""
  printf '\n\033[1;34m==> Timing summary\033[0m\n'
  printf '  %s\n' "${TIMINGS[@]}"
  printf '  %s  TOTAL\n' "$(fmt $(( SECONDS - SCRIPT_START )))"
}
trap summary EXIT

step "Caching sudo credentials"
sudo -v
( while true; do sudo -n true; sleep 50; kill -0 "$$" 2>/dev/null || exit; done ) &

step "1-2/17 System packages, TeX Live, PostgreSQL, Redis, Node"
sudo pacman -Syu --needed --noconfirm \
  base-devel cmake curl wget git \
  postgresql postgresql-libs redis openssl mesa glu \
  nodejs npm \
  texlive-basic texlive-latex texlive-latexrecommended texlive-latexextra \
  texlive-fontsrecommended texlive-fontutils

step "wkhtmltopdf (AUR, optional)"
# Not used by Osdag (reports use pdflatex). Its AUR dependency openssl-1.1 compiles from source
# and is slow, so it is opt-in:  WITH_WKHTMLTOPDF=1 bash setup_arch.sh
if [ "${WITH_WKHTMLTOPDF:-0}" = "1" ] && ! command -v wkhtmltopdf >/dev/null; then
  yay -S --needed --noconfirm --mflags --nocheck wkhtmltopdf-static || \
    echo "WARNING: wkhtmltopdf install failed; install it manually from the AUR."
else
  echo "Skipped."
fi

step "3/17 Miniconda"
if [ ! -x "$CONDA_DIR/bin/conda" ]; then
  wget -q https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O "$HOME/miniconda.sh"
  bash "$HOME/miniconda.sh" -b -p "$CONDA_DIR"
fi
"$CONDA_DIR/bin/conda" tos accept --override-channels \
  --channel https://repo.anaconda.com/pkgs/main --channel https://repo.anaconda.com/pkgs/r >/dev/null 2>&1 || true
"$CONDA_DIR/bin/conda" init bash >/dev/null 2>&1 || true
# shellcheck disable=SC1091
source "$CONDA_DIR/etc/profile.d/conda.sh"

step "4/17 Conda environment"
conda env list | awk '{print $1}' | grep -qx "$ENV_NAME" || conda create -n "$ENV_NAME" python=3.11 -y
conda activate "$ENV_NAME"

step "5/17 Conda-forge packages"
conda install -c conda-forge pythonocc-core cairo -y

step "7/17 Python dependencies"
cd "$PROJECT_DIR"
pip install --upgrade pip pyopenssl
pip install -r requirements.txt

step "8/17 PostgreSQL"
if [ ! -s /var/lib/postgres/data/PG_VERSION ]; then
  sudo -u postgres initdb --locale=en_US.UTF-8 -D /var/lib/postgres/data
fi
sudo systemctl enable --now postgresql
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE $DB_USER PASSWORD '$DB_PASS' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE \"$DB_NAME\" WITH OWNER $DB_USER;"

step "9/17 Redis"
sudo systemctl enable --now redis
redis-cli ping

step "10/17 Environment file"
if [ ! -f .env ]; then
  cat > .env <<EOF
DATABASE_NAME=$DB_NAME
DATABASE_USER=$DB_USER
DATABASE_PASSWORD=$DB_PASS
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
else
  echo ".env already exists, leaving it untouched."
fi
[ -f backend/firebase-service-account.json ] || \
  echo "NOTE: backend/firebase-service-account.json is missing (get it from Firebase Console); auth endpoints will fail without it."

step "11/17 Django migrations"
( cd backend && python manage.py migrate )

step "13-15/17 Frontend"
( cd frontend && npm install )
echo "VITE_BASE_URL=http://127.0.0.1:8000/" > frontend/.env

step "Done"
cat <<EOF
Start the app in three terminals (conda activate $ENV_NAME for the first two):
  cd $PROJECT_DIR/backend && python manage.py runserver 8000
  cd $PROJECT_DIR/backend && celery -A config worker -Q calculations,reports,celery --loglevel=info
  cd $PROJECT_DIR/frontend && npm run dev
Then open http://localhost:5173
EOF
