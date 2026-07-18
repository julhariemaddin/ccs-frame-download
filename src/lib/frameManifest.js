/**
 * frameManifest.js
 * ------------------------------------------------------------------
 * Fetches /frames-manifest.json (generated at dev/build time by
 * vite-plugin-frame-manifest.js from whatever's actually in public/)
 * and reshapes it into the same { [key]: { label, folder, listFile,
 * frames } } shape the app used to hand-maintain in
 * src/config/categories.js.
 * ------------------------------------------------------------------
 */
const BASE = import.meta.env.BASE_URL;

export async function loadFileCategories() {
  try {
    const res = await fetch(`${BASE}frames-manifest.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();
    if (!contentType.includes('json') && raw.trim().startsWith('<')) {
      throw new Error(
        'got an HTML page back instead of JSON — the dev server may need a restart after this update'
      );
    }
    const manifest = JSON.parse(raw);

    const categories = {};
    for (const [key, cfg] of Object.entries(manifest)) {
      categories[key] = {
        label: cfg.label,
        folder: cfg.folder,
        listFile: cfg.hasList ? `${cfg.folder}/list.txt` : null,
        frames: cfg.frames,
      };
    }
    return categories;
  } catch (err) {
    console.warn(
      `Could not load frames-manifest.json (${err.message}). Folder-based categories won't show up until the dev server / build regenerates it.`
    );
    return {};
  }
}
