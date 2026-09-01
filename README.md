# smartplaycaddie.com

The SmartPlay Caddie marketing site. Six static pages, no build step.
Vercel project: `smartplaycaddie-site`. Push to `main` deploys.

## Paths that must not change

`/terms` and `/privacy` are linked by Apple App Review and are indexed in
Search Console. `cleanUrls` serves `terms.html` at `/terms`, so those
filenames are load-bearing, not cosmetic.

## Legal copy

Not written here. `terms.html` and `privacy.html` inline the
`docs/legal-site/{terms,privacy}-embed.html` fragments from the app repo
verbatim, so the site and the app cannot drift apart.

## /sw.js

A self-unregistering service worker with no fetch handler, so it intercepts
nothing. GoDaddy's site builder left a worker registered at this path with
scope `/`; it survived the DNS move to Vercel and kept serving the old page
on devices that had visited before. This removes it, clears its caches, and
reloads any stale tab. Served `no-cache` so it always reaches a browser
holding the old one. Every page also carries an inline unregister.

## /s/:id

Rewritten to `api.smartplaycaddie.com/s/:id`, where `api/swing-share.ts`
serves shared swing reports. Lets a shared link wear the bare brand domain
in a text message with no DNS change. Flipping `SHARE_HOST` in that file
makes newly minted links use it too.
