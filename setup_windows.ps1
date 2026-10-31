# One-shot Osdag-Web setup for native Windows (no WSL, no Docker). Safe to re-run.
# NOTE: written without access to a Windows machine; untested.
# Usage (PowerShell, from the repo root):
#   powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvName    = 'osdag-web'
$DbName     = 'postgres_Intg_osdag'
$DbUser     = 'osdagdeveloper'
$DbPass     = 'password'
$PgSuperPass = 'postgres'   # superuser password set when this script installs PostgreSQL

$Total   = [Diagnostics.Stopwatch]::StartNew()
$Timings = New-Object System.Collections.Generic.List[string]
$StepName = $null
$StepSw   = $null

function Fmt($ts) { '{0}m{1:00}s' -f [int][math]::Floor($ts.TotalMinutes), $ts.Seconds }

function End-Step {
    if ($script:StepName) {
        $t = Fmt $script:StepSw.Elapsed
        $script:Timings.Add("$t  $($script:StepName)")
        Write-Host "    done in $t" -ForegroundColor Green
    }
}

function Step($name) {
    End-Step
    $script:StepName = $name
    $script:StepSw = [Diagnostics.Stopwatch]::StartNew()
    Write-Host "`n==> [$(Fmt $Total.Elapsed) elapsed] $name" -ForegroundColor Blue
}

function Summary {
    End-Step; $script:StepName = $null
    Write-Host "`n==> Timing summary" -ForegroundColor Blue
    $Timings | ForEach-Object { Write-Host "  $_" }
    Write-Host "  $(Fmt $Total.Elapsed)  TOTAL"
}

function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Have($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

function Check($what) {
    if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)" }
}

function Winget-Install($id, $extra = @()) {
    winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements @extra
    # 0x8A150061 / -1978335189 = already installed, which is fine
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) { throw "winget install $id failed ($LASTEXITCODE)" }
}

try {
    Step 'Prerequisite check (winget)'
    if (-not (Have winget)) {
        throw 'winget not found. Install "App Installer" from the Microsoft Store, then re-run.'
    }

    Step 'Install Git, Node.js, Miniconda, MiKTeX'
    if (-not (Have git))   { Winget-Install 'Git.Git' }
    if (-not (Have node))  { Winget-Install 'OpenJS.NodeJS.LTS' }
    if (-not (Have conda) -and -not (Test-Path "$env:USERPROFILE\miniconda3\Scripts\conda.exe") -and
        -not (Test-Path "$env:LOCALAPPDATA\miniconda3\Scripts\conda.exe")) { Winget-Install 'Anaconda.Miniconda3' }
    if (-not (Have pdflatex)) { Winget-Install 'MiKTeX.MiKTeX' }
    Refresh-Path

    # Make pdflatex install missing packages instead of prompting: with
    # -interaction=nonstopmode a prompt becomes a fatal "file not found" error.
    $Initexmf = Get-Command initexmf -ErrorAction SilentlyContinue
    if ($Initexmf) {
        & $Initexmf.Source '--set-config-value=[MPM]AutoInstall=1' 2>$null | Out-Null
    }

    Step 'Install PostgreSQL 16'
    if (-not (Have psql) -and -not (Test-Path 'C:\Program Files\PostgreSQL\16\bin\psql.exe')) {
        Winget-Install 'PostgreSQL.PostgreSQL.16' @('--override', "--mode unattended --superpassword $PgSuperPass")
    }
    $PgBin = 'C:\Program Files\PostgreSQL\16\bin'
    if (Test-Path $PgBin) { $env:Path += ";$PgBin" }
    Refresh-Path; if (Test-Path $PgBin) { $env:Path += ";$PgBin" }

    Step 'Install Redis-compatible server (Memurai Developer)'
    if (-not (Have memurai-cli) -and -not (Have redis-cli)) {
        try { Winget-Install 'Memurai.MemuraiDeveloper' }
        catch { Write-Warning 'Memurai install via winget failed. Install it from https://www.memurai.com/get-memurai and re-run.' }
    }
    Refresh-Path
    if (Test-Path $PgBin) { $env:Path += ";$PgBin" }
    Get-Service -Name 'Memurai' -ErrorAction SilentlyContinue | Where-Object Status -ne 'Running' | Start-Service
    $RedisCli = if (Have memurai-cli) { 'memurai-cli' } elseif (Have redis-cli) { 'redis-cli' } else { $null }
    if ($RedisCli) { & $RedisCli ping } else { Write-Warning 'No redis-cli/memurai-cli found; verify Redis manually (port 6379).' }

    Step 'Locate conda'
    $Conda = (Get-Command conda -ErrorAction SilentlyContinue).Source
    if (-not $Conda) {
        foreach ($p in "$env:USERPROFILE\miniconda3\Scripts\conda.exe", "$env:LOCALAPPDATA\miniconda3\Scripts\conda.exe",
                       "$env:ProgramData\miniconda3\Scripts\conda.exe") {
            if (Test-Path $p) { $Conda = $p; break }
        }
    }
    if (-not $Conda) { throw 'conda not found after install. Reopen PowerShell and re-run.' }
    Write-Host "Using $Conda"
    & $Conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main `
        --channel https://repo.anaconda.com/pkgs/r 2>$null | Out-Null

    Step 'Conda environment'
    $envs = & $Conda env list
    if (-not ($envs | Select-String -Pattern "^\s*$EnvName\s")) {
        & $Conda create -n $EnvName python=3.11 -y; Check 'conda create'
    }

    Step 'Conda-forge packages (pythonocc-core, cairo)'
    & $Conda install -n $EnvName -c conda-forge pythonocc-core cairo -y; Check 'conda install'

    Step 'Python dependencies'
    Set-Location $ProjectDir
    & $Conda run -n $EnvName --no-capture-output python -m pip install --upgrade pip pyopenssl; Check 'pip upgrade'
    & $Conda run -n $EnvName --no-capture-output python -m pip install -r requirements.txt; Check 'pip install'

    # pip's PySide6 (6.12) conflicts with the conda qtbase that VTK pulls in (6.11):
    # importing QtCore fails with "DLL load failed". Use the conda-forge build instead.
    Step 'Replace pip PySide6 with conda-forge pyside6'
    & $Conda run -n $EnvName --no-capture-output python -m pip uninstall -y PySide6 PySide6-Addons PySide6-Essentials shiboken6 2>$null | Out-Null
    & $Conda install -n $EnvName -c conda-forge pyside6 -y; Check 'conda install pyside6'

    Step 'PostgreSQL role and database'
    $env:PGPASSWORD = $PgSuperPass
    $roleExists = & psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DbUser'"
    if ($LASTEXITCODE -ne 0) {
        throw "Could not connect as 'postgres'. If PostgreSQL was installed earlier with a different superuser password, set `$PgSuperPass at the top of this script."
    }
    if (-not $roleExists) {
        & psql -U postgres -h localhost -c "CREATE ROLE $DbUser PASSWORD '$DbPass' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;"; Check 'create role'
    }
    $dbExists = & psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'"
    if (-not $dbExists) {
        & psql -U postgres -h localhost -c "CREATE DATABASE `"$DbName`" WITH OWNER $DbUser;"; Check 'create database'
    }

    Step 'Environment files'
    $envFile = Join-Path $ProjectDir '.env'
    if (-not (Test-Path $envFile)) {
        @"
DATABASE_NAME=$DbName
DATABASE_USER=$DbUser
DATABASE_PASSWORD=$DbPass
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=dev-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
USE_REDIS_CACHE=false
"@ | Set-Content -Path $envFile -Encoding ascii
    } else { Write-Host '.env already exists, leaving it untouched.' }
    if (-not (Test-Path (Join-Path $ProjectDir 'backend\firebase-service-account.json'))) {
        Write-Warning 'backend\firebase-service-account.json is missing (get it from Firebase Console); auth endpoints will fail without it.'
    }

    Step 'Django migrations'
    Push-Location (Join-Path $ProjectDir 'backend')
    & $Conda run -n $EnvName --no-capture-output python manage.py migrate; Check 'migrate'
    Pop-Location

    Step 'Frontend'
    Push-Location (Join-Path $ProjectDir 'frontend')
    npm install; Check 'npm install'
    Set-Content -Path '.env' -Value 'VITE_BASE_URL=http://127.0.0.1:8000/' -Encoding ascii
    Pop-Location

    Step 'Done'
    Write-Host @"
Start all app services in separate windows:
  powershell -ExecutionPolicy Bypass -File .\start_windows.ps1
Then open http://localhost:5173
(PostgreSQL and Memurai must be running; Celery uses --pool=solo on Windows.)
"@
}
finally {
    Summary
}
