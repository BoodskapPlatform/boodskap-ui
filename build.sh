#!/bin/bash

BVER=`jq .version package.json`
BVER=`sed -e 's/^"//' -e 's/"$//' <<<"$BVER"`

echo "################ BUILDING ###################"
echo "############### VER: $BVER ##################"
echo "#############################################"

docker build -t boodskapiot/ui:$BVER . -f Dockerfile

echo "*** docker push boodskapiot/ui:$BVER ***"
