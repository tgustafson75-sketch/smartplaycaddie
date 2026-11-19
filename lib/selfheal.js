// SmartPlay Self-Heal Standard v1 (smartplay-gate docs/SELF-HEAL-STANDARD.md), server half.
// Same pattern as smartplayapps.com (lib/selfheal.js there): a plain Sentry envelope POST, no SDK.
// Goes to Sentry when SENTRY_DSN is set in Vercel; until then the Vercel function log is the record,
// and /api/health says so. No personal data: no IP, email, query string or page text.

const APP = 'smartplaycaddie-site';
// `||` not `??`: Vercel's env vars are present-but-empty outside a deployment.
const BUILD = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'local';
const ENV = process.env.VERCEL_ENV || 'local';

function parseDsn(dsn) {
  const m = String(dsn || '').trim().match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
  return m ? { key: m[1], host: m[2], project: m[3] } : null;
}

function scrub(text) {
  return String(text || '')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[number]')
    .slice(0, 500);
}

/** Send one report. Never throws. Returns where it went: 'sentry' or 'log'. */
async function report(kind, message, path) {
  const text = `${kind}: ${scrub(message)}`;
  const dsn = parseDsn(process.env.SENTRY_DSN);
  if (dsn) {
    try {
      const eventId = require('crypto').randomUUID().replace(/-/g, '');
      const event = {
        event_id: eventId,
        timestamp: Date.now() / 1000,
        level: kind === 'user_report' ? 'warning' : 'error',
        platform: 'javascript',
        release: `${APP}@${BUILD}`,
        environment: ENV,
        message: { formatted: text },
        fingerprint: [kind, scrub(message).slice(0, 80)],
        tags: { app: APP, version: BUILD, build: BUILD, platform: 'web', kind, page: path || 'unknown' },
      };
      const envelope = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n${JSON.stringify({ type: 'event' })}\n${JSON.stringify(event)}`;
      const res = await fetch(`https://${dsn.host}/api/${dsn.project}/envelope/?sentry_key=${dsn.key}&sentry_version=7`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-sentry-envelope' },
        body: envelope,
      });
      if (res.ok) return 'sentry';
    } catch { /* fall through to the log */ }
  }
  console.error(`[self-heal ${APP}@${BUILD}] ${text} (${path || 'unknown'})`);
  return 'log';
}

/** v1 startup health check: config the site's server half needs. Names, never values. */
function healthProblems(env) {
  const need = { SENTRY_DSN: 'error reporting; reports go to the Vercel log until it is set' };
  return Object.keys(need).filter((k) => !env[k]).map((k) => `${k} missing (${need[k]})`);
}

// Per-instance limit: 5 reports per IP per minute. No shared store on this site; the Sentry key
// rate limit is the global backstop.
function makeLimiter(maxPerIp, windowMs = 60_000) {
  const seen = new Map();
  return function limited(req, now) {
    for (const [k, v] of seen) if (now - v.start > windowMs) seen.delete(k);
    const h = req.headers || {};
    const ip = h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const e = seen.get(ip) || { start: now, count: 0 };
    seen.set(ip, e);
    return ++e.count > maxPerIp;
  };
}

function readBody(req, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

module.exports = { APP, BUILD, report, healthProblems, scrub, parseDsn, makeLimiter, readBody };
