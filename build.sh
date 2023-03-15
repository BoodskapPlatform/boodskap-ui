#!/bin/bash
# Build the build.js file 
node build.js
# Parse current version number
JSON_FILE="package.json"
# Get the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH_NAME" == "development" ]; then
  myEnv="dev"
elif [ "$BRANCH_NAME" == "test" ]; then
  myEnv="test"
else
  myEnv="v5.0"
fi

echo "$myEnv.............myEnv"
#version=2.1.1
version=$(cat $HOME/build/v5-boodskap-ui/$myEnv/version.txt)
echo "version no...................$version"
# Split version number into major, minor, and patch components
IFS='.' read -r -a version_components <<< "$version"
major=${version_components[0]}
minor=${version_components[1]}
patch=${version_components[2]}

# Determine which component to increment (default to patch)
component=${1:-patch}

if [ "$minor" -ge 10 ] && [ "$patch" -ge 30 ]; then
  major=$((major+1))
  minor=0
  patch=0
elif [ "$patch" -ge 30 ]; then
  minor=$((minor+1))
  patch=0
else
  patch=$((patch+1))
fi

# Update version number in version.txt
echo "$major.$minor.$patch" > $HOME/build/v5-boodskap-ui/$myEnv/version.txt
jq ".version = \"$major.$minor.$patch\"" "$JSON_FILE" > tmp.json
mv tmp.json "$JSON_FILE"
lversion="$major.$minor.$patch"
# Print new version number
docker build -t boodskapiot/ui-$myEnv:$lversion . -f Dockerfile

