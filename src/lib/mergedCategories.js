import { getStore } from './adminStore';
import { loadFileCategories } from './frameManifest';

/**
 * Combines the folder-derived categories (public/<folder>/ ->
 * frames-manifest.json, see vite-plugin-frame-manifest.js) with
 * whatever the admin dashboard has added/removed in localStorage.
 *
 * Async because reading the manifest is a fetch(). Call this at
 * render time (e.g. in a useEffect), not once at import time, so
 * both filesystem changes and admin edits show up without a rebuild.
 */
export async function getMergedCategories() {
  const fileCategories = await loadFileCategories();
  const store = getStore();
  const merged = {};

  for (const [key, cfg] of Object.entries(fileCategories)) {
    merged[key] = { ...cfg, frames: [...cfg.frames] };
  }

  for (const [key, cfg] of Object.entries(store.categories)) {
    if (merged[key]) {
      merged[key] = {
        ...merged[key],
        frames: [...merged[key].frames, ...cfg.frames],
      };
    } else {
      merged[key] = {
        label: cfg.label,
        folder: key,
        listFile: null, // custom categories have no bundled program list
        frames: cfg.frames,
      };
    }
  }

  return merged;
}
