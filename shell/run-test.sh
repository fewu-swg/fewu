#!/bin/bash

### FUNCTION TEST UNIT ###
### ****ONLY LINUX**** ###
##########################
# Requirements:
# bash
# npm/pnpm
# jq

# Custom theme feature is still not available.

PKG_DIR="$(pwd)"
TEST_DIR="/tmp/io.fewu-swg.fewu/unittest"
THEME_DIR="_NO_THEME"

while getopts "t:p:" opt
do
    case $opt in
        t)
            THEME_DIR="$OPTARG"
            ;;
        p)
	    PKG_DIR="$(pwd)/$OPTARG"
            ;;
    esac
done

# ensure
if [ ! -d "$TEST_DIR" ]; then
    mkdir "$TEST_DIR" -p
fi

# find npm
NPM=npm
if which pnpm; then
    NPM=pnpm
fi

if ! which "$NPM"; then
    echo "Abort on Error: no npm found!"
    exit
fi

cd "$TEST_DIR"

pwd

rm -r "$TEST_DIR"/*

"$NPM" i "$PKG_DIR"
"$NPM" i fewu-cli

pnpm fewu init

if [ "$THEME_DIR" != "_NO_THEME" ];then
    "$NPM" i "$PKG_DIR/$THEME_DIR"
    THEME_NAME=$(cat "$PKG_DIR/$THEME_DIR/package.json" | jq .name | sed s/\"//g)
    echo "Custom theme: $THEME_NAME"
    sed -i s#@fewu-swg/fewu-theme-next#$THEME_NAME# "$TEST_DIR/config.yaml"
fi
"$NPM" i

pnpm fewu --server

xdg-open localhost:3000

cd $PKG_DIR
