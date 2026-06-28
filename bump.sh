#!/bin/bash
# Bump version and propagate to all CSS/JS query strings
# Usage: ./bump.sh [major|minor|patch]  (default: patch)

set -e

VERSION_FILE="version.txt"
CURRENT=$(cat "$VERSION_FILE" | tr -d '[:space:]')

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "${1:-patch}" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Usage: $0 [major|minor|patch]"; exit 1 ;;
esac

NEW="${MAJOR}.${MINOR}.${PATCH}"
echo "$NEW" > "$VERSION_FILE"

# Update all ?v= query strings and version displays in HTML files
find . -name "*.html" -not -path "./.git/*" | while read -r file; do
  sed -i '' "s/\?v=[0-9][0-9.]*/?v=${NEW}/g" "$file"
  sed -i '' "s/· v[0-9][0-9.]*/· v${NEW}/g" "$file"
  sed -i '' "s/>v[0-9][0-9.]*</>v${NEW}</g" "$file"
done

# Update package.json version
if [ -f "package.json" ]; then
  sed -i '' "s/\"version\": \"[0-9][0-9.]*\"/\"version\": \"${NEW}\"/" package.json
fi

echo "Bumped: ${CURRENT} → ${NEW}"
echo "Updated all ?v= query strings, footer versions, and package.json."
