#!/bin/bash
# Download all Wikimedia chess SVGs from MANIFEST.json
# Run this script when not rate-limited (wait 30+ mins after last bulk attempt)
# Downloads ~3 files/second with 0.3s delay between each

MANIFEST="assets/pieces/sets/wikimedia/MANIFEST.json"
DIR="assets/pieces/sets/wikimedia"

if [ ! -f "$MANIFEST" ]; then
  echo "Error: $MANIFEST not found"
  exit 1
fi

# Map filenames to subdirectories based on content
get_subdir() {
  local name="$1"
  case "$name" in
    *Xogos*) echo "artistic/xogos-da-meiga" ;;
    *Maurizio*Fantasy*) echo "artistic/monge-fantasy" ;;
    *Maurizio*Spatial*) echo "artistic/monge-spatial" ;;
    Kiwen_Suwi*) echo "artistic/kiwen-suwi" ;;
    Dobutsu*) echo "dobutsu" ;;
    Draughts*) echo "draughts" ;;
    *XIANGQI*|Xiangqi*) echo "xiangqi" ;;
    *Shogi*) echo "shogi" ;;
    *CHESS_KNIGHT-*|*CHESS_EQUI*|*CHESS_TURNED*|*CHESS_KNIGHT_ROT*|NEUTRAL*|BLACK_CHESS*|WHITE_CHESS*) echo "noto" ;;
    *Khun*|*Met_*|*Khon*|*Ruea*|*Ma_*|*Bia*) echo "makruk" ;;
    BLancer*|WLancer*) echo "fairy" ;;
    *_26.svg) echo "diagram-26px" ;;
    Chess_[A-Z][a-z][a-z]45*|Chess_[A-Z][a-z][a-z]26*) echo "fairy" ;;
    Chess_v[dl][dtl]45*) echo "fairy" ;;
    Chess_[efg][bdglry][dglrt]45*) echo "special" ;;
    Chess_[GUZWFSKACDHM][dl][dtl]45*) echo "fairy" ;;
    Blue_*|Green_*|Red_*|Yellow_*) echo "colored" ;;
    Chess_[bknpqr][bgry][gt]45*) echo "colored" ;;
    Chess_N[bgry]t45*) echo "colored" ;;
    Chess_[bknpqr][bgry]g45*) echo "colored" ;;
    Chess_[fhm][dl][dl]45*) echo "rotated" ;;
    Chess_N[dl][dl]45*) echo "rotated" ;;
    Chess_[BNfhm][dl]t45*) echo "rotated" ;;
    Chess_g[bdrgy][dg]45*) echo "rotated" ;;
    Chess_[bknpqr][dl][dglrt]45*) echo "standard" ;;
    Chess_[bknpqr][dl]t45*) echo "standard" ;;
    Chess_[dl]45*|Chess_oo*|Chess_ox*|Chess_HL*|Chess_--*|Chess_zz*|Chess_Pieces*) echo "standard" ;;
    *alfil*|*ferz*|*camel*|*giraffe*|*dabbaba*|*wazir*) echo "fairy" ;;
    *) echo "misc" ;;
  esac
}

# Count
total=$(python3 -c "import json; print(len(json.load(open('$MANIFEST'))))")
echo "Downloading $total files..."

ok=0
fail=0
skip=0
i=0

python3 -c "
import json
manifest = json.load(open('$MANIFEST'))
for name, url in sorted(manifest.items()):
    print(f'{name}\t{url}')
" | while IFS=$'\t' read -r name url; do
  i=$((i + 1))
  
  # Determine subdirectory
  subdir=$(get_subdir "$name")
  destdir="$DIR/$subdir"
  mkdir -p "$destdir"
  destfile="$destdir/$(echo "$name" | sed 's/ /_/g')"
  
  # Skip if already valid
  if [ -f "$destfile" ] && grep -q "^<\?xml\|^<svg" "$destfile" 2>/dev/null; then
    skip=$((skip + 1))
    continue
  fi
  
  # Download
  curl -sL --retry 2 --retry-delay 5 --connect-timeout 30 --max-time 60 -o "$destfile" "$url" 2>/dev/null
  
  if [ -f "$destfile" ] && grep -q "^<\?xml\|^<svg" "$destfile" 2>/dev/null && ! grep -q "<!DOCTYPE html" "$destfile" 2>/dev/null; then
    ok=$((ok + 1))
  else
    rm -f "$destfile"
    fail=$((fail + 1))
  fi
  
  # Progress
  if [ $((i % 50)) -eq 0 ]; then
    echo "  [$i/$total] ok=$ok fail=$fail skip=$skip"
  fi
  
  # Rate limit: 0.5s between requests
  sleep 0.5
done

echo ""
echo "=== COMPLETE ==="
echo "Downloaded: $ok"
echo "Failed: $fail"
echo "Skipped (already valid): $skip"
