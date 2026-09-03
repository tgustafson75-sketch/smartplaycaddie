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
