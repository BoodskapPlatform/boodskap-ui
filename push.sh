#!/bin/bash

VERSION=$(cat package.json | /usr/bin/jq -r '.version')
# Get the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH_NAME" == "development" ]; then
  myEnv="dev"
elif [ "$BRANCH_NAME" == "test" ]; then
  myEnv="test"
else
  myEnv="v5.0"
fi
docker push boodskapiot/ui-$myEnv:${VERSION} 
echo "Docker pushed successfully boodskapiot/ui-$myEnv:${VERSION}"