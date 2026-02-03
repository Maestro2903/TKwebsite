#!/usr/bin/env bash
# Copy Dirtyline 36Daysoftype 2022 from your Mac into the project.
# Run from repo root: ./scripts/copy-dirtyline-font.sh

set -e
DEST="public/assets/fonts"
FINAL_NAME="Dirtyline36Daysoftype2022"

# Find font in common Mac locations (installed via Font Book or manual)
for dir in "$HOME/Library/Fonts" "/Library/Fonts" "/System/Library/Fonts"; do
  if [[ -d "$dir" ]]; then
    found=$(find "$dir" -maxdepth 2 \( -iname "*Dirtyline*" -o -iname "*36*Daysoftype*" \) 2>/dev/null | head -1)
    if [[ -n "$found" && -f "$found" ]]; then
      ext="${found##*.}"
      cp "$found" "$DEST/${FINAL_NAME}.${ext}"
      echo "Copied: $found -> $DEST/${FINAL_NAME}.${ext}"
      exit 0
    fi
  fi
done

echo "Font not found on this system."
echo "Download it (free) from https://dirtylinestudio.com/product/dirtyline-36daysoftype-2022/"
echo "Then copy the .ttf or .otf file to $DEST/ and rename to ${FINAL_NAME}.ttf or ${FINAL_NAME}.otf"
exit 1
