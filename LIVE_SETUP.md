# Making frame positions actually live on Vercel — one-time setup

You only have to do this once. After it's done, publishing a position from
the admin dashboard shows up for every visitor immediately — no redeploy.

## 1. Push this code and let Vercel deploy it
This zip includes:
- `api/layout.js` — a serverless function (Vercel deploys anything in `/api`
  automatically, no config needed).
- `@vercel/blob` added to `package.json` — the storage client.
- The frontend now calls `/api/layout` instead of localStorage/static files.

Push it to your repo (or redeploy however you normally do) so this code is live.

## 2. Connect a Blob store (2 minutes, no code)
1. Go to your project on vercel.com.
2. Open the **Storage** tab.
3. Click **Create Database** → choose **Blob**.
4. Click **Connect** to attach it to this project.

Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable and
triggers a redeploy. That's the only redeploy you'll ever need for this.

## 3. (Recommended) Set a real publish password
By default, publishing uses the same password as your `/admin` login
(`CCSOFFICER`). To use a separate, stronger secret:
1. Project Settings → Environment Variables.
2. Add `ADMIN_PUBLISH_TOKEN` = (something private, e.g. a long random string).
3. Redeploy.

If you skip this, publishing still works — it just uses the admin password.

## 4. Use it
- Go to `/admin`, log in, pick a frame, drag the name/program into place.
- Click **Publish live for "program"**.
- Done. Open the site in an incognito window (or ask someone else to check)
  — they'll see the new position immediately.

**"Save draft"** vs **"Publish live"**:
- *Save draft* only writes to your browser's local storage — useful while
  you're still experimenting, has zero effect on what other people see.
- *Publish live* is the real save — it writes to the server everyone reads
  from.
