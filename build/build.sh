#!/bin/bash
#
# Runs closure linter, closure compiler and closure stylesheets.
# Link: https://github.com/google/closure-linter
# Link: https://github.com/google/closure-compiler
# Link: https://github.com/google/closure-stylesheets

./jslint.sh && ./jsmin.sh && ./cssmin.sh && ./makeapp.sh
