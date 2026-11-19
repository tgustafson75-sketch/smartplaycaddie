// Download CTAs: the date-switched trial line and the mobile sticky download bar.
// Loaded with `defer`. The trial text in the HTML is the pre-2027 line, so a visitor without
// JavaScript sees a true offer until Dec 31; this script swaps it on and after Jan 1 2027.
(function (root) {
  var APP_STORE = 'https://apps.apple.com/us/app/id6772344465';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.smartplaycaddie.app';
  var SWITCH = '2027-01-01'; // first day of the 14-day trial, Pacific time

  // YYYY-MM-DD of `date` in America/Los_Angeles (en-CA formats as ISO dates).
  function pacificDay(date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function trialText(date) {
    return pacificDay(date || new Date()) < SWITCH
      ? 'Free for 2 months — offer ends Dec 31.'
      : 'Try it free for 14 days.';
  }

  // 'ios' | 'android' | 'both'. iPadOS reports a Mac user agent, so touch points break the tie.
  function platformOf(ua, touchPoints) {
    ua = String(ua || '');
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'both';
  }

  function badge(store, small) {
    var a = document.createElement('a');
    a.className = 'badge' + (small ? ' badge-sm' : '');
    a.href = store === 'ios' ? APP_STORE : PLAY;
    a.innerHTML = store === 'ios'
      ? '<small>Download on the</small><span>App Store</span>'
      : '<small>Get it on</small><span>Google Play</span>';
    return a;
  }

  function run(doc, win) {
    var text = trialText(new Date());
    doc.querySelectorAll('[data-trial]').forEach(function (el) { el.textContent = text; });

    var p = platformOf(win.navigator.userAgent, win.navigator.maxTouchPoints || 0);
    var bar = doc.createElement('div');
    bar.className = 'dlbar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Download SmartPlay Caddie');
    if (p !== 'android') bar.appendChild(badge('ios', true));
    if (p !== 'ios') bar.appendChild(badge('android', true));
    doc.body.appendChild(bar);
    doc.body.classList.add('has-dlbar');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { trialText: trialText, platformOf: platformOf, pacificDay: pacificDay };
  } else {
    try { run(root.document, root); } catch (e) { /* CTAs are progressive; the page still works */ }
  }
})(this);
