#!/bin/bash

VERSION=$(cat package.json | /usr/bin/jq -r '.version')

docker push boodskapiot/ui-test:${VERSION} 

echo "Docker pushed successfully boodskapiot/ui-test:${VERSION}"