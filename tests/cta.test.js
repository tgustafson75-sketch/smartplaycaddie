// node --test tests/*.test.js  — date switch and platform pick for js/cta.js
const test = require('node:test');
const assert = require('node:assert');
const { trialText, platformOf } = require('../js/cta.js');

test('Dec 31 2026 (Pacific) shows the 2-month offer', () => {
  assert.strictEqual(trialText(new Date('2026-12-31T12:00:00-08:00')), 'Free for 2 months — offer ends Dec 31.');
  // 11:59 pm Pacific on Dec 31 is already Jan 1 in UTC: still the 2-month offer
  assert.strictEqual(trialText(new Date('2026-12-31T23:59:00-08:00')), 'Free for 2 months — offer ends Dec 31.');
});

test('Jan 1 2027 (Pacific) shows the 14-day trial', () => {
  assert.strictEqual(trialText(new Date('2027-01-01T00:00:00-08:00')), 'Try it free for 14 days.');
  assert.strictEqual(trialText(new Date('2027-01-01T12:00:00-08:00')), 'Try it free for 14 days.');
});

test('UTC-boundary: the switch follows Pacific midnight, not UTC midnight', () => {
  // 05:00 and 07:59 UTC on Jan 1 are still Dec 31 in Los Angeles
  assert.strictEqual(trialText(new Date('2027-01-01T05:00:00Z')), 'Free for 2 months — offer ends Dec 31.');
  assert.strictEqual(trialText(new Date('2027-01-01T07:59:59Z')), 'Free for 2 months — offer ends Dec 31.');
  // 08:00 UTC is 00:00 PST on Jan 1
  assert.strictEqual(trialText(new Date('2027-01-01T08:00:00Z')), 'Try it free for 14 days.');
});

test('platform pick for the sticky bar', () => {
  assert.strictEqual(platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5), 'ios');
  assert.strictEqual(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5), 'ios'); // iPadOS
  assert.strictEqual(platformOf('Mozilla/5.0 (Linux; Android 15; Pixel 9)', 5), 'android');
  assert.strictEqual(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0), 'both');
  assert.strictEqual(platformOf('', 0), 'both');
});
