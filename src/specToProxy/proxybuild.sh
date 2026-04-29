#!/usr/bin/env bash
#set -vx
set -euo pipefail

echo "Start: $(pwd)"

JSON=./resources/proxytobuild.json
TEMPLATE_DIR=./templates
TARGET_BASE=../../src/gateway

[ -f "$JSON" ] || { echo "Missing $JSON"; exit 1; }

# Iterate over each JSON object
jq -c '.' "$JSON" | while read -r item; do
  proxyn=$(echo "$item" | jq -r '.proxyname')
  templaten=$(echo "$item" | jq -r '.templatename')

  echo "ProxyName: $proxyn | TemplateName: $templaten"

  [ -n "$proxyn" ] && [ -n "$templaten" ] || continue

  target="$TARGET_BASE/$proxyn"

  # create proxy dir
  mkdir -p "$target"

  # copy template
  cp -R "$TEMPLATE_DIR/$templaten/." "$target/"

  # rename xml
  if [ -f "$target/apiproxy/$templaten.xml" ]; then
    mv "$target/apiproxy/$templaten.xml" \
       "$target/apiproxy/$proxyn.xml"
  fi
done
