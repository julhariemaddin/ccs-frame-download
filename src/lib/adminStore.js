/**
 * adminStore.js
 * ------------------------------------------------------------------
 * This app has no backend — it's a static Vite/React bundle. So the
 * "admin" system persists everything in the browser's localStorage
 * (per-device, per-browser). That's enough to let a CCS officer
 * customize the tool on the machine(s) it's deployed on (e.g. the lab
 * PCs used during enrollment/photo days) without needing a server.
 *
 * If you later add a real backend, swap the functions below for API
 * calls — everything that reads from here (App.jsx, Stage.jsx) only
 * cares about the shape of the data, not where it comes from.
 * ------------------------------------------------------------------
 */

const STORE_KEY = 'jrmsu_ccs_admin_store_v1';
const SESSION_KEY = 'jrmsu_ccs_admin_session_v1';

// Fixed admin credentials for the CCS Officer account.
// NOTE: this is client-side only (no server to guard), so it deters
// casual users but is not real security. Don't reuse this password
// anywhere sensitive.
const ADMIN_USERNAME = 'CCSOFFICER';
const ADMIN_PASSWORD = 'CCSOFFICER';

export const DEFAULT_LAYOUT = {
  nameColor: '#241430',
  nameFont: 'display', // 'display' | 'mono' | 'sans'
  nameSize: 42,
  nameOffsetX: 0,
  nameOffsetY: 0,
  programColor: '#5c4a63',
  programFont: 'mono',
  programSize: 22,
  programOffsetX: 0,
  programOffsetY: 36,
};

export const FONT_STACKS = {
  display: { stack: "'Fraunces', Georgia, serif", weight: 700 },
  mono: { stack: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace", weight: 600 },
  sans: { stack: "'Inter', system-ui, -apple-system, sans-serif", weight: 600 },
};

function emptyStore() {
  return { categories: {}, frameLayouts: {} };
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return {
      categories: parsed.categories || {},
      frameLayouts: parsed.frameLayouts || {},
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getStore() {
  return readStore();
}

// ---------- auth ----------
export function login(username, password) {
  const ok = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (ok) sessionStorage.setItem(SESSION_KEY, '1');
  return ok;
}
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
export function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

// ---------- categories ----------
export function addCategory(id, label) {
  const key = id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (!key) throw new Error('Category needs a valid name.');
  const store = readStore();
  if (store.categories[key]) throw new Error('A category with that name already exists.');
  store.categories[key] = { label: label.trim() || key, frames: [] };
  writeStore(store);
  return store;
}

export function deleteCategory(id) {
  const store = readStore();
  delete store.categories[id];
  Object.keys(store.frameLayouts).forEach((k) => {
    if (k.startsWith(`${id}:`)) delete store.frameLayouts[k];
  });
  writeStore(store);
  return store;
}

// ---------- frames (static files) ----------
// Frame files added via the dashboard are stored as data URLs, since
// there's no server to write them into /public. `isCustom: true`
// flags them so the renderer knows to use `file` directly as a src
// instead of resolving it against /<folder>/<file>.
export function addFrame(categoryId, { id, label, dataUrl }) {
  const store = readStore();
  if (!store.categories[categoryId]) throw new Error('Unknown category.');
  const frameId = id || `custom-${Date.now()}`;
  store.categories[categoryId].frames.push({
    id: frameId,
    label: label || frameId,
    file: dataUrl,
    isCustom: true,
  });
  writeStore(store);
  return store;
}

export function deleteFrame(categoryId, frameId) {
  const store = readStore();
  if (store.categories[categoryId]) {
    store.categories[categoryId].frames = store.categories[categoryId].frames.filter(
      (f) => f.id !== frameId
    );
  }
  delete store.frameLayouts[`${categoryId}:${frameId}`];
  writeStore(store);
  return store;
}

// ---------- per-frame text layout (position / color / font) ----------
export function setFrameLayout(categoryId, frameId, layout) {
  const store = readStore();
  store.frameLayouts[`${categoryId}:${frameId}`] = { ...DEFAULT_LAYOUT, ...layout };
  writeStore(store);
  return store;
}

export function getFrameLayout(categoryId, frameId) {
  const store = readStore();
  return store.frameLayouts[`${categoryId}:${frameId}`] || { ...DEFAULT_LAYOUT };
}

export function resetAllAdminData() {
  writeStore(emptyStore());
}

// ---------- academic year ----------
// "now is 2026" -> "A.Y. 2026-2027"; rolls forward automatically.
export function currentAcademicYear() {
  const y = new Date().getFullYear();
  return `A.Y. ${y}-${y + 1}`;
}
