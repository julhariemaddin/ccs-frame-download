/**
 * api/layout.js
 * ------------------------------------------------------------------
 * The ONE place frame positions actually live now. Runs as a Vercel
 * serverless function (this file is auto-deployed as an API route —
 * no extra config needed on Vercel).
 *
 * GET  /api/layout?category=program
 *   -> returns the saved layout JSON for that category, the same
 *      response for every visitor, every device, always current.
 *
 * POST /api/layout?category=program   (header: x-admin-token)
 *   -> the admin dashboard's "Publish" button calls this. It writes
 *      the new layout to Vercel Blob storage. From that instant,
 *      every GET (i.e. every visitor loading the app) sees the update.
 *      No redeploy. No file copying. No localStorage involved.
 * ------------------------------------------------------------------
 * ONE-TIME SETUP (you only do this once, ever):
 *   1. In your Vercel project dashboard -> Storage tab -> Create a
 *      "Blob" store -> Connect it to this project. Vercel auto-adds
 *      the BLOB_READ_WRITE_TOKEN env var and redeploys.
 *   2. (Recommended) In Project Settings -> Environment Variables, add
 *      ADMIN_PUBLISH_TOKEN with a private value of your choosing, so
 *      random people can't overwrite your layouts. If you skip this,
 *      it falls back to the same admin password used to log into
 *      /admin, which still works but is weaker.
 * That's it — after that one redeploy, everything below "just works."
 * ------------------------------------------------------------------
 */

import { put, list } from '@vercel/blob';

const FALLBACK_TOKEN = 'CCSOFFICER'; // used only if ADMIN_PUBLISH_TOKEN isn't set in Vercel

export default async function handler(req, res) {
  const category = String(req.query.category || '').trim();
  if (!/^[a-z0-9-]+$/i.test(category)) {
    res.status(400).json({ error: 'Missing or invalid ?category=' });
    return;
  }
  const pathname = `layouts/${category}.json`;

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: pathname, limit: 1 });
      const match = blobs.find((b) => b.pathname === pathname);
      if (!match) {
        res.status(200).json({});
        return;
      }
      const upstream = await fetch(match.url, { cache: 'no-store' });
      const data = await upstream.json();
      res.status(200).json(data);
    } catch (err) {
      // No store connected yet, or nothing published yet — behave as
      // "no overrides" rather than erroring the whole app out.
      res.status(200).json({});
    }
    return;
  }

  if (req.method === 'POST') {
    const expected = process.env.ADMIN_PUBLISH_TOKEN || FALLBACK_TOKEN;
    const given = req.headers['x-admin-token'];
    if (given !== expected) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({ error: 'Body must be JSON' });
        return;
      }
    }
    try {
      await put(pathname, JSON.stringify(body, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: `Publish failed: ${err.message}. Did you connect a Blob store to this project in Vercel -> Storage?` });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}
