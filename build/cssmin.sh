#!/bin/bash
#
# Downloads and runs Google closure stylesheets compiler.
# Guide: https://google.github.io/styleguide/shell.xml
# Link: https://github.com/google/closure-stylesheets
# Source: https://github.com/Datamart/Workspace/blob/master/build/cssmin.sh

readonly CWD=$(cd $(dirname $0); pwd)
readonly LIB="${CWD}/lib"

# TODO(user): Replace to project related path.
readonly CSS_COMPILED="${CWD}/../www/bundle.css"
readonly CSS_SOURCES="${CWD}/../src/styles"

readonly CSS_COMPILER_URL="https://github.com/google/closure-stylesheets/releases/download/1.0/closure-stylesheets.jar"
readonly CSS_COMPILER_JAR="${LIB}/closure-stylesheets.jar"

readonly WGET="$(which wget)"
readonly CURL="$(which curl)"
readonly JAVA="$(which java)"
# Hot fix for clean installation of OS X El Capitan.
readonly JAVA_OSX="/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/bin/java"


#
# Downloads closure stylesheets compiler.
#
function download() {
  if [[ ! -f "${CSS_COMPILER_JAR}" ]]; then
    echo "Downloading closure stylesheets compiler:"
    if [[ -n "$CURL" ]]; then
      $CURL -L "${CSS_COMPILER_URL}" > "${CSS_COMPILER_JAR}"
    else
      $WGET "${CSS_COMPILER_URL}" -O "${CSS_COMPILER_JAR}"
    fi
    echo "Done"
  fi
}

#
# Runs closure stylesheets compiler.
#
function run() {
  echo "Running closure stylesheets compiler:"
  local JAVA_BIN="${JAVA}"
  if [[ -f "${JAVA_OSX}" ]]; then
    JAVA_BIN="${JAVA_OSX}"
  fi

  if [[ -d "${CSS_SOURCES}" ]]; then
    rm -rf "${CSS_COMPILED}"
    touch "${CSS_COMPILED}" && chmod 0666 "${CSS_COMPILED}"

    find "${CSS_SOURCES}" -name "*.css" -print \
      | sed 's/.*/ &/' \
      | xargs "${JAVA_BIN}" -jar "${CSS_COMPILER_JAR}" \
          --allow-unrecognized-properties \
          --allow-unrecognized-functions \
          --output-file "${CSS_COMPILED}"
  fi
  echo "Done"
}

#
# The main function.
#
function main() {
  download
  run
}

main "$@"
