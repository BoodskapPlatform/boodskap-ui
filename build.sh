#!/bin/bash
# Build the build.js file 
node build.js
# Parse current version number
JSON_FILE="package.json"
version=$(cat $HOME/build/v5-boodskap-ui/dev/version.txt)
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
echo "$major.$minor.$patch" > $HOME/build/v5-boodskap-ui/dev/version.txt
jq ".version = \"$major.$minor.$patch\"" "$JSON_FILE" > tmp.json
mv tmp.json "$JSON_FILE"
lversion="$major.$minor.$patch"
# Print new version number
docker build -t boodskapiot/ui-dev:$lversion . -f Dockerfile

