$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'extension/manifest.json') -Raw | ConvertFrom-Json
$releaseRoot = Join-Path $projectRoot 'output/installable'
$packageRoot = Join-Path $releaseRoot "HangarExportJson-$($manifest.version)"
New-Item -ItemType Directory -Force -Path $packageRoot | Out-Null
# Keep an explicit allowlist: never ship local profiles, exports or dependencies.
foreach ($name in @('manifest.json', 'core.js', 'content.js')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "extension/$name") -Destination $packageRoot
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'LICENSE') -Destination $packageRoot
$archive = "$packageRoot.zip"
$packageFiles = @('manifest.json', 'core.js', 'content.js', 'LICENSE') | ForEach-Object { Join-Path $packageRoot $_ }
Compress-Archive -LiteralPath $packageFiles -DestinationPath $archive -Force
Get-FileHash -LiteralPath $archive -Algorithm SHA256 | ForEach-Object {
    "$($_.Hash.ToLowerInvariant())  $(Split-Path $archive -Leaf)" | Set-Content -LiteralPath "$archive.sha256" -Encoding ascii
}
Write-Output $archive
