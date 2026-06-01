/* Inner Wake — versioned service worker.
 * Strategy:
 *   - network-first for HTML/navigation (so deploys are picked up instantly)
 *   - cache-first for hashed /assets/* (Vite content-hashed → safe forever)
 *   - stale-while-revalidate for fonts and images
 *   - precache the brand shell so an installed app renders offline
 *
 * Bump SW_VERSION to invalidate all caches on the next visit.
 */

const SW_VERSION = 'iw-v1';
const PRECACHE = `${SW_VERSION}-precache`;
const RUNTIME = `${SW_VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/inner-wake-logo.svg',
  '/apple-touch-icon.png',
  '/logo-192.png',
  '/logo-512.png',
  '/og-image.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(SW_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isHashedAsset(url) {
  return url.pathname.startsWith('/assets/');
}

function isNavigationRequest(req) {
  return req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Never cache OAuth / auth callback paths
  if (url.pathname.startsWith('/~oauth') || url.pathname.startsWith('/auth')) return;

  // Network-first for HTML / navigation
  if (isNavigationRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(RUNTIME);
          cache.put('/', fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          const cached = await caches.match('/', { ignoreSearch: true });
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })(),
    );
    return;
  }

  // Cache-first for hashed assets (content-hashed by Vite, safe to cache forever)
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, clone)).catch(() => undefined);
          }
          return res;
        });
      }),
    );
    return;
  }

  // Stale-while-revalidate for images, fonts, manifest, icons
  if (/\.(png|jpg|jpeg|svg|webp|gif|woff2?|ttf|otf|ico|json)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networked = fetch(req)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(RUNTIME).then((c) => c.put(req, clone)).catch(() => undefined);
            }
            return res;
          })
          .catch(() => cached);
        return cached || networked;
      }),
    );
  }
});

// Allow page to ask the new SW to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
