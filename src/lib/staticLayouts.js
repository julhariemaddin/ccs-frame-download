/**
 * staticLayouts.js
 * ------------------------------------------------------------------
 * The actual, shared-by-everyone source of truth for per-frame text
 * positions. Unlike adminStore.js (which only writes to the current
 * browser's localStorage), this reads a static JSON file that ships
 * inside /public/<folder>/layout.json — the same bytes every visitor's
 * browser fetches from the server, so nobody sees a stale/untuned
 * position just because they're on a different device.
 *
 * Workflow:
 *   1. Admin tunes positions in the dashboard (drafts to localStorage,
 *      same as before — instant, no redeploy needed to preview).
 *   2. Admin clicks "Export layout.json" for the category.
 *   3. That file is committed into public/<folder>/layout.json and the
 *      site is redeployed. From then on ALL visitors load that file.
 *
 * Precedence used by App.jsx: layout.json (server, shared) > localStorage
 * draft (this browser only) > live auto-detection (last resort).
 * ------------------------------------------------------------------
 */

const BASE = import.meta.env.BASE_URL;
const cache = new Map();

export async function loadStaticLayouts(folder) {
  if (cache.has(folder)) return cache.get(folder);
  try {
    const res = await fetch(`${BASE}${folder}/layout.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(folder, data);
    return data;
  } catch {
    // No layout.json yet for this category — fine, callers fall back.
    cache.set(folder, {});
    return {};
  }
}

export function getStaticFrameLayout(staticLayouts, frameId) {
  return staticLayouts?.[frameId] || null;
}
