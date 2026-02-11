# Dirtyline 36Daysoftype 2022

This font is used for:

- **Events page hero:** “WHERE TALENT MEETS THE SPOTLIGHT”
- **Proshows page hero:** “THREE DAYS OF STARS”
- **Proshows day nav:** Day 1, Day 2, Day 3 buttons
- **Proshows day labels:** DAY 1, DAY 2, DAY 3 section headers
- **Proshows day numbers:** 01, 02, 03 (large watermark numbers)

All other text uses the default Interdisplay font.

---

## Copy the font into this project

### Option A: Run the script (if the font is installed on your Mac)

From the repo root:

```bash
chmod +x scripts/copy-dirtyline-font.sh
./scripts/copy-dirtyline-font.sh
```

The script looks in `~/Library/Fonts`, `/Library/Fonts`, and `/System/Library/Fonts` and copies the first matching file into this folder with the correct name.

### Option B: Manual copy

1. **Get the font**
   - If already installed: find it in **Font Book** or in `~/Library/Fonts` / `/Library/Fonts`.
   - If not: download (free) from [Dirtyline Studio](https://dirtylinestudio.com/product/dirtyline-36daysoftype-2022/) (they send a download link by email).

2. **Copy into this folder**
   - Put the file in: `zeitmedia-clone/public/assets/fonts/`

3. **Rename** (no spaces) to one of:
   - `Dirtyline36Daysoftype2022.woff2` (best for web)
   - `Dirtyline36Daysoftype2022.woff`
   - `Dirtyline36Daysoftype2022.ttf`
   - `Dirtyline36Daysoftype2022.otf`

The site will load the font from here. If the font is also installed on your system, the browser may use the system copy via `local()`.
