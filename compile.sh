#!/usr/bin/env bash

# Make temporary directory for compiled output
TEMP_DIR=$(mktemp -d)

# Compile source
harp compile src/ $TEMP_DIR

# Copy compiled output to root directory
cp -a $TEMP_DIR/. .

# Remove temp directory
rm -rf $TEMP_DIR

# Minify JS
#
# --preamble
# Adds copyright information to the top of the minified file
#
# --screw-ie8
# Doesn't optimize for IE8 (and down) compatibility
uglifyjs ./js/index.js --output ./js/index.js --preamble "© 2018 ObjectLabs Corporation" --screw-ie8
