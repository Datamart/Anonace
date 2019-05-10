#!/bin/bash
#
# Builds the application bundle.
# Guide: https://google.github.io/styleguide/shell.xml
# Link: https://developers.google.com/closure/compiler/

readonly CWD=$(cd $(dirname $0); pwd)
readonly LIB="${CWD}/lib"
readonly PYTHON="$(which python)"
readonly JAVA="$(which java)"
# Hot fix for clean installation of OS X El Capitan.
readonly JAVA_OSX="/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/bin/java"
readonly JS_COMPILER="${LIB}/compiler.jar"

readonly SRC_PATH="${CWD}/../src"
readonly APP_PATH="${CWD}/../www"

readonly APP_TEMPLATE="${SRC_PATH}/index.html"
readonly SERVICE_WORKER="${SRC_PATH}/sw.js"

readonly JS_COMPILED="${APP_PATH}/bundle.js"
readonly CSS_COMPILED="${APP_PATH}/bundle.css"
readonly APP_COMPILED="${APP_PATH}/index.html"
readonly JS_WORKER="${APP_PATH}/sw.js"

readonly BUILD_DATE=$(date +%Y-%m-%d)

function create_application_bundle() {
  BUNDLE_JS=$(<"${JS_COMPILED}")
  BUNDLE_CSS=$(<"${CSS_COMPILED}")
  TEMPLATE=$(<"${APP_TEMPLATE}")

  $PYTHON -c "import sys;print(sys.argv[1].replace('/* @BUNDLE_JS */', sys.argv[2]).replace('/* @BUNDLE_CSS */', sys.argv[3]))" \
      "${TEMPLATE}" "${BUNDLE_JS}" "${BUNDLE_CSS}" > "${APP_COMPILED}"

  cat "${APP_COMPILED}" | tr -s '\r\n[:blank:]' ' ' > "${APP_COMPILED}.back"
  mv "${APP_COMPILED}.back" "${APP_COMPILED}"
  sed -i .back s/"@BUILD_DATE"/"${BUILD_DATE}"/g "${APP_COMPILED}"

  [ -e "${JS_COMPILED}" ] && rm "${JS_COMPILED}"
  [ -e "${CSS_COMPILED}" ] && rm "${CSS_COMPILED}"
  [ -e "${APP_COMPILED}.back" ] && rm "${APP_COMPILED}.back"
}

function create_service_worker() {
  local CACHE_KEY="$(date +%Y%m%d-%H%M%S)"
  local JAVA_BIN="${JAVA}"

  if [[ -f "${JAVA_OSX}" ]]; then
    JAVA_BIN="${JAVA_OSX}"
  fi

  # "${JAVA_BIN}" -jar "${JS_COMPILER}" --help
  # --warning_level (-W) [QUIET | DEFAULT | VERBOSE]
  "${JAVA_BIN}" -jar "${JS_COMPILER}" \
          --compilation_level ADVANCED_OPTIMIZATIONS \
          --warning_level VERBOSE \
          --charset UTF-8 \
          --use_types_for_optimization \
          --externs "${CWD}/externs.js" \
          --rewrite_polyfills=false \
          --define="CACHE_KEY='${CACHE_KEY}'" \
          --js_output_file "${JS_WORKER}" "${SERVICE_WORKER}"
}

#
# The main function.
#
function main() {
  echo "Building the application bundle:"
  create_application_bundle
  create_service_worker
  echo "Done"
}

main "$@"
