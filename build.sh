#!/bin/bash

npm install

node build.js

docker build -t boodskapiot/ui:5.0.0-alpha . -f Dockerfile
