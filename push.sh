#!/bin/bash

VERSION=$(cat package.json | /usr/bin/jq -r '.version')
myEnv=$(node -e "console.log(require('./conf.js').devops.env1)")

docker push boodskapiot/ui-$myEnv:${VERSION} 

echo "Docker pushed successfully boodskapiot/ui-$myEnv:${VERSION}"

