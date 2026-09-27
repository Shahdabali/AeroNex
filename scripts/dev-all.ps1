<#
  Starts the whole local stack in separate windows:
    scraper worker  ->  scraper API (:8000)  ->  AeroNex server (:5000)  ->  frontend (:5173)

  Usage (from the repository root):   powershell -ExecutionPolicy Bypass -File scripts\dev-all.ps1
  Optional: -ScraperDir <path to the scraper's Backend folder>   -Token <shared secret>   -Db <sqlite file>
#>
param(
  [string]$ScraperDir = (Join-Path $PSScriptRoot '..\..\AeroNex\Backend'),
  [string]$Token = $env:SCRAPER_API_TOKEN,
  [string]$Db = ''
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$scraper = Resolve-Path $ScraperDir
if (-not $Token) {
  # A throw-away shared secret so the scraper API and the server agree without any manual step.
  $Token = [Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]]).Replace('/', '_').Replace('+', '-')
}

$dbEnv = if ($Db) { "`$env:AERONEX_DB='$Db'; " } else { '' }
$common = "`$env:SCRAPER_API_TOKEN='$Token'; $dbEnv"

function Start-Window($title, $dir, $command) {
  Start-Process powershell -WorkingDirectory $dir -ArgumentList '-NoExit', '-Command', "`$Host.UI.RawUI.WindowTitle='$title'; $command"
}

Start-Window 'AeroNex scraper worker' $scraper "$common python run_worker.py"
Start-Window 'AeroNex scraper API'    $scraper "$common python run_api.py 8000"
Start-Window 'AeroNex server'         (Join-Path $root 'server') "$common `$env:SCRAPER_API_URL='http://127.0.0.1:8000'; `$env:NODE_ENV='development'; npm run dev"
Start-Window 'AeroNex frontend'       $root "npm run dev"

Write-Host "Started 4 windows. Frontend: http://localhost:5173  Server: http://localhost:5000  Scraper API: http://127.0.0.1:8000"
Write-Host "The first scheduled cycle (24 searches) takes about a minute; until then the app says 'No data yet'."
