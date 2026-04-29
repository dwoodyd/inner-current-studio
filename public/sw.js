// Inner Wake — Self-unregistering service worker.
// Previous versions cached HTML/JS aggressively, which caused stale chunk
// errors after each publish ("This Current needs a refresh"). To rescue every
// already-installed client, this SW now unregisters itself and clears all
// caches on activation. Push notifications are temporarily disabled here and
// will return in a future, network-only worker.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (e) {
      // ignore
    }
    try {
      await self.registration.unregister();
    } catch (e) {
      // ignore
    }
    const clientsArr = await self.clients.matchAll({ type: 'window' });
    clientsArr.forEach((client) => {
      try { client.navigate(client.url); } catch (e) { /* ignore */ }
    });
  })());
});

// Pass-through fetch — never serve from cache.
self.addEventListener('fetch', () => {});
