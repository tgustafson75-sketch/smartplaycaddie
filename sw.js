self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    for (const k of await caches.keys()) { await caches.delete(k); }
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({ type: 'window' })) {
      c.navigate(c.url);
    }
  })());
});
