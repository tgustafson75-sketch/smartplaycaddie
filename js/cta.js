// Download CTAs: the date-switched trial line, the mobile sticky download bar, store-tap
// counting, and the /get smart link (phone → its store, computer → QR page).
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

  // Where /get sends a visitor: a store URL for a phone, null for a computer (stay on the QR page).
  function getTarget(platform) {
    if (platform === 'ios') return APP_STORE;
    if (platform === 'android') return PLAY;
    return null;
  }

  // Which store a link goes to, or null if it isn't a download link.
  function storeOfHref(href) {
    href = String(href || '');
    if (href.indexOf('apps.apple.com') !== -1) return 'app_store';
    if (href.indexOf('play.google.com') !== -1) return 'google_play';
    if (/^(https:\/\/smartplaycaddie\.com)?\/get(\?|$)/.test(href)) return 'smart_link';
    return null;
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

  function track(win, name, data) {
    try { if (typeof win.va === 'function') win.va('event', { name: name, data: data }); } catch (e) {}
  }

  function run(doc, win) {
    var text = trialText(new Date());
    doc.querySelectorAll('[data-trial]').forEach(function (el) { el.textContent = text; });

    var p = platformOf(win.navigator.userAgent, win.navigator.maxTouchPoints || 0);

    // Count every tap on a download link, with the page and the block it was in.
    doc.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var store = storeOfHref(a.getAttribute('href'));
      if (!store) return;
      var block = a.closest('[data-place]');
      track(win, 'Store Tap', {
        store: store,
        page: win.location.pathname || '/',
        place: block ? block.getAttribute('data-place') : (a.closest('.dlbar') ? 'sticky-bar' : 'other')
      });
    }, true);

    // /get: send phones straight to their store after the pageview is recorded.
    if (doc.body.hasAttribute('data-get')) {
      var target = getTarget(p);
      if (target) {
        var params = new URLSearchParams(win.location.search);
        track(win, 'Get Redirect', { store: p === 'ios' ? 'app_store' : 'google_play', src: params.get('utm_source') || 'direct' });
        var msg = doc.querySelector('[data-get-msg]');
        if (msg) msg.textContent = 'Opening ' + (p === 'ios' ? 'the App Store' : 'Google Play') + '…';
        win.setTimeout(function () { win.location.replace(target); }, 700);
      }
      return; // no sticky bar on the /get page
    }

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
    module.exports = { trialText: trialText, platformOf: platformOf, pacificDay: pacificDay, getTarget: getTarget, storeOfHref: storeOfHref };
  } else {
    try { run(root.document, root); } catch (e) { /* CTAs are progressive; the page still works */ }
  }
})(this);
