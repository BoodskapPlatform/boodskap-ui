#!/bin/bash

npm version patch 
git add --all
git commit -a -m "[skip ci] Version updated new version updated"
# git commit -m "${(cat package.json | /usr/bin/jq -r '.version')}"
git push common v5.0

