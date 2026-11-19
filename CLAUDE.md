# ⚠️ THIS IS THE MARKETING SITE — the APP lives elsewhere

**Corrected 2026-09-03.** This file used to say this folder was "an empty stub with no code and no
commits". That was wrong and it cost something real: it reads as "nothing here, go away", so the
live privacy policy sat un-updated for a day while `docs/LAUNCH-STATUS.md` listed publishing it as a
Cowork dashboard task nobody could do. It was a `git push` from here the whole time.

`/Users/timothyg/smartplaycaddie` is the **live smartplaycaddie.com marketing site** — remote
`smartplaycaddie.git`, auto-deployed by Vercel on push to `main`. It holds `index.html`, `about`,
`download`, `faq`, **`privacy.html`** and **`terms.html`**. The privacy policy Google Play's Data
safety form points at is served from this repo, so a policy change is not done until it is pushed
from here.

The *local checkout* may look empty — the local `main` can sit with no commits while `origin/main`
carries the site. Run `git fetch origin && git checkout -B main origin/main` before concluding
anything is missing. (`site-vercel/` is an untracked staging duplicate; keep it in step or delete
it, or someone will republish a stale page from it.)

**The APP is a different repo.** Its code lives at:

## → `/Users/timothyg/smartplay`

If you are a Claude Code session and landed here, **switch to `/Users/timothyg/smartplay` for
anything about the app** — that repo (remote `smartplay.git`) has the full app, its own `CLAUDE.md`,
and the in-progress changes. But do NOT dismiss this folder: legal pages, store-facing copy and
anything served from smartplaycaddie.com are edited and published HERE.

### Other lookalike folders (NOT the active project)
- `/Users/timothyg/SmartPlay-Caddie-V3` — older V3 line, separate history
- `/Users/timothyg/smartplay-vnext` — scaffold, initial commit only
- `/Users/timothyg/smartplaycaddie_review.zip` — a review snapshot

**Active project = `/Users/timothyg/smartplay`.**

## Self-heal (SmartPlay standard, required)

Spec: smartplay-gate docs/SELF-HEAL-STANDARD.md.

Every time you work in this repo, before finishing:
1. Check this app has all four v1 pieces: error reporting tagged with app name, version and platform; a one-tap "Report a problem"; a startup health check that reports failures; a self-update path (web: reload on new deploy; Expo: EAS Update channel; Chrome extension: lab self-reload).
2. Build any missing piece as part of the current work, with a test.
3. Never put personal, health or page content in a report.
4. Fixes are never merged without Tim's approval; shipping and rollback may be automatic.

Done when all four pieces exist, are tested, and the app's line in SELF-HEAL-STANDARD.md "Where each app stands" is updated.

**This site (2026-11-19):** v1 4/4 in code. `js/selfheal.js` (client, every page except the legal
pages) → `api/report.js` / `api/health.js` → `lib/selfheal.js`. Report a problem is in the footer.
Self-update needs no code: Vercel serves HTML with max-age=0 and `sw.js` only unregisters itself.
`SENTRY_DSN` is not set yet, so reports land in the Vercel function log and /api/health says so.
Tests: `node --test tests/*.test.js`.
