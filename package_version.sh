#!/bin/bash

npm version patch -m "Bump version to %s [skip ci]" --force 
git add --all
git commit -m Version updated new version updated
# git commit -m "${(cat package.json | /usr/bin/jq -r '.version')}"
git push common v5.0

