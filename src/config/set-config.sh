#!/bin/sh

set -e # stop script on first error

[[ -z "$1" ]] && { echo "First argument (theme) is missing" ; exit 1; }
[[ -z "$2" ]] && { echo "Second argument (env) is missing" ; exit 1; }

folderPath=$(dirname $0)
theme=$1
environment=$2

# Remove dist if exists
if [ -d "${folderPath}/dist" ]; then rm -r ${folderPath}/dist; fi

# Create empty dist folder
mkdir -p ${folderPath}/dist

# Copy environment file to dist/env.json
cp ${folderPath}/environments/${environment}.json ${folderPath}/dist/env.json

# Copy theme files to dist
cp -r ${folderPath}/themes/${theme}/. ${folderPath}/dist/theme
