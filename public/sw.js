/* Inner Wake — versioned, offline-first service worker.
 * Strategy:
 *   - navigation: network-first with a precached app-shell fallback (any route)
 *   - hashed /assets/*: cache-first (Vite content-hashed → safe forever)
 *   - images / fonts / icons / media: stale-while-revalidate
 *   - Google Fonts (cross-origin): stale-while-revalidate
 *
 * Bump SW_VERSION to invalidate all caches on the next visit.
 */

const SW_VERSION = 'iw-v3';
const PRECACHE = `${SW_VERSION}-precache`;
const RUNTIME = `${SW_VERSION}-runtime`;

// The app shell. `/` is the SPA entry for every route, including /center.
const SHELL_URL = '/index.html';

const PRECACHE_URLS = [
  '/',
  SHELL_URL,
  '/manifest.json',
  '/inner-wake-logo.svg',
  '/apple-touch-icon.png',
  '/logo-192.png',
  '/logo-512.png',
  '/logo-512-maskable.png',
  '/apple-splash-1290x2796.jpg',
  '/og-image.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Cache individually so one 404 can't fail the whole install.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(SW_VERSION)).map((k) => caches.delete(k)),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined);
      }
      await self.clients.claim();
    })(),
  );
});

function isHashedAsset(url) {
  return url.pathname.startsWith('/assets/');
}

function isNavigationRequest(req) {
  return (
    req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))
  );
}

async function shellFallback() {
  return (
    (await caches.match(SHELL_URL)) ||
    (await caches.match('/', { ignoreSearch: true })) ||
    new Response(
      '<!doctype html><meta charset="utf-8"><title>Offline</title><body style="background:#07070A;color:#EDEAE4;font:16px/1.6 system-ui;display:grid;place-items:center;height:100vh;margin:0"><p>You are offline. Reopen when you reconnect.</p></body>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // iOS Safari fetches media with Range requests and cannot use a cached
  // full 200 response — never intercept media or ranged requests.
  if (req.headers.has('range')) return;
  if (/\.(mp4|m4v|mov|webm|mp3|m4a|ogg|wav)$/i.test(new URL(req.url).pathname)) return;

  const url = new URL(req.url);


  // Google Fonts — stale-while-revalidate so type survives offline.
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
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
    return;
  }

  // Only handle same-origin from here.
  if (url.origin !== self.location.origin) return;

  // Never cache OAuth / auth callback paths.
  if (url.pathname.startsWith('/~oauth') || url.pathname.startsWith('/auth')) return;

  // Network-first for HTML / navigation, app-shell fallback for ANY route
  // (so /center and every deep link open cold with no connection).
  if (isNavigationRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          const fresh = preloaded || (await fetch(req));
          const cache = await caches.open(PRECACHE);
          cache.put(SHELL_URL, fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          return shellFallback();
        }
      })(),
    );
    return;
  }

  // Cache-first for hashed assets (content-hashed by Vite, safe forever).
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

  // Stale-while-revalidate for images, fonts, manifest, icons (never media).
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

// Allow the page to ask a waiting SW to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
