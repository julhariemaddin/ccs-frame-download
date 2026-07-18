/**
 * liveLayouts.js
 * ------------------------------------------------------------------
 * Talks to /api/layout (see api/layout.js). This is now the single
 * source of truth for frame positions, shared by every visitor and
 * updated instantly when the admin publishes — no redeploy needed.
 * ------------------------------------------------------------------
 */

const cache = new Map();

export async function loadLiveLayouts(category) {
  if (!category) return {};
  if (cache.has(category)) return cache.get(category);
  try {
    const res = await fetch(`/api/layout?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(category, data);
    return data;
  } catch (err) {
    console.warn(`Could not load live layout for "${category}" (${err.message}). Using auto-detected positions instead.`);
    return {};
  }
}

export function getLiveFrameLayout(liveLayouts, frameId) {
  return liveLayouts?.[frameId] || null;
}

// Admin-only: pushes a category's full layout map live. Requires the
// admin token (see api/layout.js) — pass the same password used to log
// into /admin unless a stronger ADMIN_PUBLISH_TOKEN was set on Vercel.
export async function publishLiveLayouts(category, layoutsByFrameId, adminToken) {
  const res = await fetch(`/api/layout?category=${encodeURIComponent(category)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
    },
    body: JSON.stringify(layoutsByFrameId),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Publish failed (HTTP ${res.status})`);
  }
  cache.set(category, layoutsByFrameId); // keep this tab's cache fresh
  return data;
}
