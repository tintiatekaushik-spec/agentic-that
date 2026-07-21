$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$extensionRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "extensions\publishing-companion"))
$artifactRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "artifacts"))
$stagingRoot = [System.IO.Path]::GetFullPath((Join-Path $artifactRoot "publishing-extension"))

if (-not $artifactRoot.StartsWith($projectRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Artifact directory must stay inside the project workspace."
}
if (-not $stagingRoot.StartsWith($artifactRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Extension staging directory must stay inside the artifact directory."
}

$manifest = Get-Content (Join-Path $extensionRoot "manifest.json") -Raw | ConvertFrom-Json
$zipPath = Join-Path $artifactRoot ("AgenticThat-Publishing-Extension-{0}.zip" -f $manifest.version)
New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
if (Test-Path -LiteralPath $stagingRoot) { Remove-Item -LiteralPath $stagingRoot -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null

Get-ChildItem -LiteralPath $extensionRoot -Force | Where-Object { $_.Name -notin @("README.md") } | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $stagingRoot -Recurse -Force
}
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item -LiteralPath $stagingRoot -Recurse -Force

Write-Host "Chrome Web Store package created: $zipPath" -ForegroundColor Green
