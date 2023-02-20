#!/bin/bash

VERSION=$(cat package.json | /usr/bin/jq -r '.version')

docker push boodskapiot/ui-dev:${VERSION} 

echo "Docker pushed successfully boodskapiot/ui-dev:${VERSION}"