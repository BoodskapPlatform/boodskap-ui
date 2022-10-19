#!/bin/bash

npm install

node build.js

VERSION=$(cat package.json | /usr/bin/jq -r '.version')

docker build -t boodskapiot/ui:${VERSION} . -f Dockerfile

