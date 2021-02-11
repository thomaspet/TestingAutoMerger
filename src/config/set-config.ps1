$folderPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$theme = $args[0]
$environment = $args[1]

$ErrorActionPreference = "Stop" # stop script on first error

if (($theme) -and ($environment)) {
    # Create dist folder if it doesn't exist
    if (!(Test-Path "$folderPath\dist" -PathType Container)) {
        New-Item -ItemType Directory -Force -Path "$folderPath\dist"
    }

    # Remove any content from the dist folder
    Get-ChildItem "$folderPath\dist" -Recurse | Remove-Item -Recurse

    # Copy environment file to dist/env.json
    Copy-Item "$folderPath\environments\${environment}.json" -Destination "$folderPath\dist\env.json"

    # Copy theme files to dist
    Copy-Item -Path "$folderPath\themes\$theme" -Destination "$folderPath\dist\theme" -Recurse -Container
} else {
    Write-Error 'Theme and/or env arguments are missing' -ErrorAction Stop
}
