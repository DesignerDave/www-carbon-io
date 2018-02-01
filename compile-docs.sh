#!/usr/bin/env bash

# Make temporary directory for compiled output
TEMP_DIR=$(mktemp -d)

# Compile source
harp compile src/ $TEMP_DIR

# Copy compiled output to root directory
cp -a $TEMP_DIR/. .

# Remove temp directory
rm -rf $TEMP_DIR
