$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$startScript = Join-Path $PSScriptRoot "start-publishing-companion.ps1"
$powerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

$process = Start-Process -FilePath $powerShell -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $startScript
) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru

Write-Host "Publishing companion started in the background with process ID $($process.Id)."
