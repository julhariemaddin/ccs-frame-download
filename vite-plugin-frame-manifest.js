import fs from 'node:fs';
import path from 'node:path';

/**
 * vite-plugin-frame-manifest.js
 * ------------------------------------------------------------------
 * Scans `public/` and treats every subfolder as a category, every
 * image file inside it as a frame. Writes the result to
 * `public/frames-manifest.json`, which the app fetches at runtime.
 *
 * Add a folder -> new category. Add/delete an image -> frame list
 * updates. No JS to edit, no rebuild required in dev (the dev server
 * watches public/ and regenerates on change).
 *
 * Optional per-folder `meta.json` lets you override the auto-derived
 * labels without touching code:
 *   { "label": "Events", "frames": { "frame-1": "Foundation Day" } }
 * ------------------------------------------------------------------
 */

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const MANIFEST_NAME = 'frames-manifest.json';

function titleCase(name) {
  return name
    .replace(/\.[^./]+$/, '') // strip extension
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function readMeta(folderPath) {
  const metaPath = path.join(folderPath, 'meta.json');
  if (!fs.existsSync(metaPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch (err) {
    console.warn(`[frame-manifest] Couldn't parse ${metaPath}: ${err.message}`);
    return {};
  }
}

function scanPublicDir(publicDir) {
  const manifest = {};
  if (!publicDir || !fs.existsSync(publicDir)) return manifest;

  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folder = entry.name;
    const folderPath = path.join(publicDir, folder);
    const files = fs.readdirSync(folderPath, { withFileTypes: true }).filter((f) => f.isFile());

    const meta = readMeta(folderPath);
    const frameLabels = meta.frames || {};

    const frames = files
      .filter((f) => IMAGE_EXT.test(f.name))
      .map((f) => {
        const id = f.name.replace(/\.[^./]+$/, '');
        return { id, file: f.name, label: frameLabels[id] || titleCase(f.name) };
      })
      .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));

    const hasList = files.some((f) => f.name.toLowerCase() === 'list.txt');

    manifest[folder] = {
      label: meta.label || titleCase(folder),
      folder,
      hasList,
      frames,
    };
  }
  return manifest;
}

export default function frameManifestPlugin() {
  let publicDir;
  let outputPath;

  function generate() {
    const manifest = scanPublicDir(publicDir);
    // Don't fire the watcher off writing this very file.
    const next = JSON.stringify(manifest, null, 2);
    const prev = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf-8') : null;
    if (next !== prev) fs.writeFileSync(outputPath, next);
    return manifest;
  }

  return {
    name: 'frame-manifest',
    configResolved(config) {
      publicDir = config.publicDir;
      outputPath = path.join(publicDir, MANIFEST_NAME);
    },
    buildStart() {
      generate();
    },
    configureServer(server) {
      generate(); // also keep a copy on disk, so `vite preview` after a build matches

      const base = server.config.base && server.config.base !== '/' ? server.config.base : '/';
      const routePath = (base.endsWith('/') ? base : `${base}/`) + MANIFEST_NAME;

      // Serve fresh, in dev, straight from a middleware instead of relying on
      // the static public-dir server noticing a file that was just written to
      // disk — that path was flaky (could return the SPA's index.html instead
      // of the JSON depending on request timing), so this always answers with
      // real, current data no matter what.
      server.middlewares.use(routePath, (_req, res) => {
        const manifest = scanPublicDir(publicDir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(manifest));
      });

      let timer = null;
      const debouncedRegenerate = (filename) => {
        if (filename && path.basename(filename) === MANIFEST_NAME) return; // avoid self-trigger
        clearTimeout(timer);
        timer = setTimeout(() => {
          generate();
          server.ws.send({ type: 'full-reload' });
        }, 150);
      };

      let watcher;
      try {
        watcher = fs.watch(publicDir, { recursive: true }, (_event, filename) =>
          debouncedRegenerate(filename)
        );
      } catch {
        // `recursive` isn't supported on some Linux setups — fall back to
        // watching just the top level (new/deleted files still work, new
        // *folders* need a dev-server restart in that fallback case).
        watcher = fs.watch(publicDir, (_event, filename) => debouncedRegenerate(filename));
      }
      server.httpServer?.once('close', () => watcher.close());
    },
  };
}
