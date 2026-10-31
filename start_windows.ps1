# One-command launcher for Osdag-Web on native Windows (no Docker).
#
# Default (lean) mode:
#   - Django ASGI dev server, no autoreload        (1 process)
#   - Celery worker, solo pool, 1 task at a time
#   - pre-built frontend served by `vite preview`  (~170 MB vs ~1.2 GB for `vite dev`)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\start_windows.ps1
#   powershell -ExecutionPolicy Bypass -File .\start_windows.ps1 -Build   # force frontend rebuild
#   powershell -ExecutionPolicy Bypass -File .\start_windows.ps1 -Dev     # Vite dev server with hot reload
param(
    [switch]$Build,
    [switch]$Dev
)

$ErrorActionPreference = 'Stop'

$ProjectDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvName     = 'osdag-web'
$FrontendDir = Join-Path $ProjectDir 'frontend'

function Check($what) {
    if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)" }
}

# --- Locate conda (prefer conda.exe over the PowerShell shim) -----------------
$Conda = @(
    "$env:USERPROFILE\miniconda3\Scripts\conda.exe",
    "$env:LOCALAPPDATA\miniconda3\Scripts\conda.exe",
    "$env:ProgramData\miniconda3\Scripts\conda.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Conda) {
    $cmd = Get-Command conda.exe -ErrorAction SilentlyContinue
    if ($cmd) { $Conda = $cmd.Source }
}
if (-not $Conda) {
    throw 'conda was not found. Run setup_windows.ps1 first, then reopen PowerShell.'
}

$Environments = & $Conda env list
if ($LASTEXITCODE -ne 0) {
    throw "Could not list Conda environments using '$Conda'."
}
$EnvPattern = "^\s*$([regex]::Escape($EnvName))\s"
$EnvLine = $Environments | Where-Object { $_ -match $EnvPattern } | Select-Object -First 1
if (-not $EnvLine) {
    throw "The '$EnvName' Conda environment was not found. Run setup_windows.ps1 first."
}

# Call the environment's python.exe directly instead of `conda run`, which would
# leave two extra ~100 MB wrapper processes alive for the whole session.
$EnvPath = ($EnvLine -replace $EnvPattern, '').Trim()
$Python  = Join-Path $EnvPath 'python.exe'
if (-not (Test-Path $Python)) {
    throw "Could not find python.exe in '$EnvPath'. Recreate the env with setup_windows.ps1."
}

# --- Locate npm (use npm.cmd so PowerShell execution policy cannot block it) --
$Npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $Npm) {
    throw 'npm.cmd was not found. Install Node.js LTS and reopen PowerShell.'
}

# --- Frontend dependencies ----------------------------------------------------
if (-not (Test-Path (Join-Path $FrontendDir 'node_modules\vite'))) {
    Write-Host 'Frontend dependencies are missing; running npm install...' -ForegroundColor Yellow
    Push-Location $FrontendDir
    & $Npm install
    Check 'npm install'
    Pop-Location
}

# --- Build the frontend when it is missing or stale ---------------------------
$DistIndex = Join-Path $FrontendDir 'dist\index.html'
$NeedsBuild = $Build -or -not (Test-Path $DistIndex)

if (-not $NeedsBuild) {
    $DistTime = (Get-Item $DistIndex).LastWriteTime
    $Sources = @(
        (Join-Path $FrontendDir 'src'),
        (Join-Path $FrontendDir 'index.html'),
        (Join-Path $FrontendDir 'package.json'),
        (Join-Path $FrontendDir 'vite.config.js'),
        (Join-Path $FrontendDir '.env')
    ) | Where-Object { Test-Path $_ }

    $Newer = Get-ChildItem -Path $Sources -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $DistTime } | Select-Object -First 1
    if ($Newer) {
        Write-Host "Frontend sources changed since the last build ($($Newer.Name)); rebuilding." -ForegroundColor Yellow
        $NeedsBuild = $true
    }
}

if ($NeedsBuild) {
    Write-Host 'Building the frontend...' -ForegroundColor Cyan
    Push-Location $FrontendDir
    & $Npm run build
    Check 'npm run build'
    Pop-Location
}

# --- Warn about required background services --------------------------------
$Pg = Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like 'postgresql*' -and $_.Status -eq 'Running' } |
    Select-Object -First 1
if (-not $Pg) {
    Write-Warning 'No running PostgreSQL service found. Start it (services.msc) before using the app.'
}

$Redis = Get-Service -Name 'Memurai' -ErrorAction SilentlyContinue
if (-not $Redis -or $Redis.Status -ne 'Running') {
    Write-Warning 'Memurai (Redis) is not running. Celery and WebSockets will fail until it is started.'
}

if (-not (Test-Path (Join-Path $ProjectDir '.env'))) {
    Write-Warning '.env is missing. Copy .env.example to .env and fill in the values.'
}

# --- Launch the three services in separate windows ---------------------------
function Escape-PowerShellString([string]$Value) {
    return $Value.Replace("'", "''")
}

$PyLiteral     = Escape-PowerShellString $Python
$NpmLiteral    = Escape-PowerShellString $Npm
$EnvPathLiteral = Escape-PowerShellString $EnvPath

# Equivalent of `conda activate`: make the env's DLLs and scripts visible.
$ActivateCommand = @"
`$env:PATH = '$EnvPathLiteral\Library\bin;$EnvPathLiteral\Library\mingw-w64\bin;$EnvPathLiteral;$EnvPathLiteral\Scripts;' + `$env:PATH
"@

$FrontendCommand = if ($Dev) {
    "& '$NpmLiteral' run dev -- --port 5173 --strictPort"
} else {
    "& '$NpmLiteral' run preview -- --port 5173 --strictPort"
}
$FrontendTitle = if ($Dev) { 'Osdag-Web Frontend (dev/HMR)' } else { 'Osdag-Web Frontend (preview)' }

$Processes = @(
    @{
        Title     = 'Osdag-Web Django'
        Directory = Join-Path $ProjectDir 'backend'
        Command   = "$ActivateCommand`n& '$PyLiteral' manage.py runserver 127.0.0.1:8000 --noreload"
    },
    @{
        Title     = 'Osdag-Web Celery'
        Directory = Join-Path $ProjectDir 'backend'
        Command   = "$ActivateCommand`n& '$PyLiteral' -m celery -A config worker -Q calculations,cad,reports,celery --pool=solo --concurrency=1 --loglevel=info"
    },
    @{
        Title     = $FrontendTitle
        Directory = $FrontendDir
        Command   = $FrontendCommand
    }
)

$PowerShellExe = (Get-Process -Id $PID).Path
foreach ($process in $Processes) {
    $DirectoryLiteral = Escape-PowerShellString $process.Directory
    $TitleLiteral = Escape-PowerShellString $process.Title
    $ChildScript = @"
`$Host.UI.RawUI.WindowTitle = '$TitleLiteral'
Set-Location -LiteralPath '$DirectoryLiteral'
$($process.Command)
"@
    $EncodedScript = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($ChildScript))
    Start-Process -FilePath $PowerShellExe `
        -ArgumentList @('-NoExit', '-EncodedCommand', $EncodedScript) `
        -WorkingDirectory $process.Directory
}

Write-Host ''
Write-Host 'Started Django, Celery and the frontend in separate windows.' -ForegroundColor Green
Write-Host '  App      http://localhost:5173'
Write-Host '  Backend  http://127.0.0.1:8000  (health: /api/health/)'
Write-Host ''
Write-Host 'Close a window to stop that service. PostgreSQL and Memurai keep running.'
if ($Dev) {
    Write-Host 'Running the Vite dev server (~1.2 GB RAM); use the default mode for a lighter run.' -ForegroundColor Yellow
} else {
    Write-Host 'Frontend edits need a rebuild: .\start_windows.ps1 -Build  (or use -Dev for hot reload).'
}
