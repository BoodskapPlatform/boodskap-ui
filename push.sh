#!/bin/bash

VERSION=$(cat package.json | /usr/bin/jq -r '.version')

docker push boodskapiot/ui:${VERSION} 

echo "Docker pushed successfully boodskapiot/ui:${VERSION}"
git add .
git commit -m "version update"
git push --no-verify
