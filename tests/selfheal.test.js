// node --test tests/*.test.js  — Self-Heal v1 server half
const test = require('node:test');
const assert = require('node:assert');
const { Readable } = require('node:stream');

function call(handler, method, body) {
  return new Promise((resolve) => {
    const req = Readable.from(body ? [Buffer.from(body)] : []);
    req.method = method;
    req.headers = { 'x-real-ip': '203.0.113.' + Math.floor(Math.random() * 250) };
    const res = { setHeader() {}, end(b) { resolve({ status: this.statusCode, body: JSON.parse(b) }); } };
    handler(req, res);
  });
}

test('health names a missing SENTRY_DSN, never a value', async () => {
  delete process.env.SENTRY_DSN;
  const r = await call(require('../api/health.js'), 'GET');
  assert.strictEqual(r.body.ok, false);
  assert.match(r.body.problems[0], /^SENTRY_DSN missing/);
});

test('report accepts known kinds, scrubs email, drops query string', async () => {
  const { scrub } = require('../lib/selfheal.js');
  assert.strictEqual(scrub('mail me at a@b.com'), 'mail me at [email]');
  const r = await call(require('../api/report.js'), 'POST', JSON.stringify({ kind: 'user_report', message: 'x', path: '/faq?q=1' }));
  assert.deepStrictEqual(r, { status: 200, body: { ok: true, sentTo: 'log' } });
});

test('report rejects unknown kinds and non-POST', async () => {
  const rep = require('../api/report.js');
  assert.strictEqual((await call(rep, 'POST', JSON.stringify({ kind: 'nope' }))).status, 400);
  assert.strictEqual((await call(rep, 'GET')).status, 405);
});

test('one IP gets 5 reports a minute', () => {
  const { makeLimiter } = require('../lib/selfheal.js');
  const limited = makeLimiter(5);
  const req = { headers: { 'x-real-ip': '198.51.100.1' } };
  const results = Array.from({ length: 6 }, () => limited(req, 1000));
  assert.deepStrictEqual(results, [false, false, false, false, false, true]);
  assert.strictEqual(limited(req, 1000 + 61_000), false);
});
