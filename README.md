# JRMSU CCS — Frame Generator (React)

A React/Vite rebuild of the single-file HTML frame generator: pick a
frame, type a name and program, upload a photo, drag it into place,
download a 1254×1254 PNG.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## What changed from the original HTML version

**The photo clip was wrong — this was the bug you flagged.**
The frame's cutout isn't a rectangle, it's an octagon (the corners are
cut at 45°). The old code found the *bounding box* of the transparent
pixels and clipped the photo to that box with `ctx.rect()`. A bounding
box around an octagon is bigger than the octagon itself, so the photo
was drawn as a square and covered part of the frame's cut corners.

Measured on the two frames you uploaded, the rectangle is **10.0%**
(frame 1) and **7.8%** (frame 2) larger in area than the real hole —
that's the sliver of photo bleeding onto the artwork.

The fix, in `src/lib/frameGeometry.js`:
1. Read every pixel of the frame PNG once and build an exact mask
   (opaque white wherever alpha ≈ 0, transparent elsewhere) — this is
   `buildFrameGeometry()`.
2. Draw the photo transformed as before, then clip it with
   `ctx.globalCompositeOperation = 'destination-in'` against that
   mask instead of a rectangle. This keeps only the pixels that are
   actually inside the octagon, corner-cuts included.
3. The bounding box is still computed (from the same scan) — it's
   used only to size/center the photo by default, never to clip it.

**`list.txt` parsing was already correct, just re-verified.**
`src/lib/parseList.js` treats every non-empty line as its own program
entry (`FULL NAME - CODE`), and only skips a first line that is
literally the bare word `PROGRAM`/`EVENT`/`EVENTS` with no separator.
Handles `\r\n`, `\n`, and a missing trailing newline (your uploaded
file has all three quirks).

**Nameplate box.** The white plate for the printed name/program isn't
transparent — it's solid opaque white — so it's detected separately
by scanning the bottom quarter of the canvas for the largest solid
white opaque block. Name/program text is now auto-centered inside
whichever plate the selected frame actually has, instead of a fixed
guess.

**Visual design.** Rebuilt away from the generic "purple gradient
button on a white card" look. Palette and type are pulled from the
frame artwork itself instead of an invented brand:

| Token | Hex | Used for |
|---|---|---|
| `--plum-950/900/800` | `#1f1029` / `#2a1533` / `#3a1e42` | sidebar background |
| `--brass-500/300` | `#c99a45` / `#e2c184` | accents, active states |
| `--parchment` / `--paper` | `#f2ead9` / `#faf6ec` | header text / preview canvas backdrop |

Type: **Fraunces** (serif, plaque/certificate feel) for headings and
the printed name, **JetBrains Mono** for labels and the printed
program — a nod to the Java snippets baked into the frame art itself
— and **Inter** for body/UI text. The step markers (`01 / 02 / 03 /
04`) reuse that same mono line-number treatment on purpose, since
they mirror the code editor look already in the frame PNGs.

## Adding more frames — no code required

Categories and frames are now derived straight from `public/`, no JS
to edit:

- **A folder in `public/` = a category.** Add `public/events/`, it
  shows up as an "Events" tab. Delete the folder, the tab disappears.
- **An image inside that folder = a frame.** Drop a PNG/JPG/WEBP into
  the folder and it appears as a selectable frame. Delete it, it's
  gone. Geometry (hole shape + nameplate box) is still detected from
  the pixels automatically — nothing to configure per-frame.
- **An optional `list.txt`** in the folder still works exactly as
  before (program/event dropdown options).
- **An optional `meta.json`** in the folder lets you override the
  auto-generated labels, since a raw filename like `frame-1.png`
  otherwise just becomes "Frame 1":
  ```json
  {
    "label": "Program",
    "frames": { "frame-1": "Plum & Brass", "frame-2": "Ink & Azure" }
  }
  ```

This is powered by `vite-plugin-frame-manifest.js`, a small Vite
plugin that scans `public/` at dev-server start / build start (and
on every file change in dev) and writes `public/frames-manifest.json`.
The app fetches that manifest at runtime (`src/lib/frameManifest.js`)
instead of importing a hand-maintained list. In dev, adding/removing a
folder or image triggers an automatic full page reload; in prod,
the manifest is baked in fresh on every `npm run build`.

The admin dashboard's localStorage-based custom categories/frames
(added by a CCS officer at runtime, no filesystem access needed) still
work exactly as before and are merged on top of the folder-derived
ones — see `src/lib/mergedCategories.js`.

## Structure

```
vite-plugin-frame-manifest.js   # scans public/ -> frames-manifest.json
src/
  lib/frameGeometry.js    # pixel-exact hole mask + nameplate detection
  lib/parseList.js        # list.txt -> [{ full, code }]
  lib/frameManifest.js    # fetches frames-manifest.json at runtime
  lib/mergedCategories.js # folder categories + admin (localStorage) categories
  components/Sidebar.jsx  # controls
  components/Stage.jsx    # 3-layer canvas preview + drag
  App.jsx / App.css       # layout, state, download
  tokens.css              # design tokens
public/program/
  frame-1.png, frame-2.png, list.txt, meta.json (optional label overrides)
```
