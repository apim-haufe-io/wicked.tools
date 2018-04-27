#!/bin/bash

set -e

. ./_repos.sh

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.22.3"
  exit 1
fi

# Expects the following variables to be exported:
# - DOCKER_PREFIX (haufelexware/wicked.)
# - DOCKER_REGISTRY_USER (docker hub user)
# - DOCKER_REGISTRY_PASSWORD
# - GITHUB_TOKEN (access token for the GitHub API)
if [ ! -f ./env-github.sh ]; then
  echo "ERROR: Expected file ./env-github.sh to be present."
source ./env-github.sh

if [ -d release_tmp ]; then
  echo "Cleaning up release_tmp..."
  rm -rf release_tmp
fi

mkdir -p release_tmp
pushd release_tmp
  git clone https://github.com/Haufe-Lexware/wicked.haufe.io.git

  pushd wicked.haufe.io
    echo "Checking Chart versions, has to match $1..."
    node ../../verify-chart-versions.js ./wicked $1
    echo "Packaging Helm Chart..."
    helm package wicked
  popd
popd

./verify-images.sh master

# imageBases from _repos.sh
for image in ${imageBases}; do
  echo ""
  echo "Creating Github release for wicked.${image}..."
  node create-github-release.js apim-haufe-io/wicked.${image} v$1
done

./release.sh $1

echo "Creating release for wicked.haufe.io repository..."
node create-github-release.js Haufe-Lexware/wicked.haufe.io v$1
echo "Uploading Helm Chart asset to release"
node upload-release-asset.js Haufe-Lexware/wicked.haufe.io v$1 release_tmp/wicked.haufe.io/wicked-$1.tgz

echo "Cleaning up..."
rm -rf release_tmp

echo ""
echo "SUCCESSFULLY FINISHED RELEASING v$1"
echo ""
