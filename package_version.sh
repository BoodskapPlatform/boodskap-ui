#!/bin/bash

npm version patch 
git add --all
git commit -m "new version updated"
# git commit -m "${(cat package.json | /usr/bin/jq -r '.version')}"
git push --push-option="ci.skip"

