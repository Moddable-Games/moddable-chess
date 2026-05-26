#!/bin/bash
# Sync variants.json from moddable-rules (source of truth).
# Transforms the moddable-rules format into this repo's simpler format.
# Usage: ./sync-variants.sh

set -euo pipefail

SOURCE="../moddable-rules/dist/moddable-chess/variants.json"

if [ ! -f "$SOURCE" ]; then
  echo "Error: $SOURCE not found. Run build-variants-json.sh in moddable-rules first."
  exit 1
fi

jq 'sort_by(.order) | [.[] | {name: .title, board: .board, desc: .special}]' "$SOURCE" > data/variants.json

COUNT=$(jq length data/variants.json)
echo "Synced $COUNT variants from moddable-rules → data/variants.json"
