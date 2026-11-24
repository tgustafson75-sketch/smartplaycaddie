// Accessible tabs. Without JavaScript every panel shows (nothing is hidden in the HTML).
document.querySelectorAll('[data-tabs]').forEach(function (box) {
  var tabs = Array.prototype.slice.call(box.querySelectorAll('[role=tab]'));
  function show(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { e.preventDefault(); show(tabs[(i + n + tabs.length) % tabs.length], true); }
    });
  });
  box.classList.add('tabs-on');
  show(tabs[0]);
});
