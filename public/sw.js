const CACHE_NAME = 'twobirds-pwa-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/logo.png'
];

// Install event: pre-cache static core assets and skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event triggered (v2.0.0)');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static core assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => console.log('[Service Worker] Pre-cache error:', err))
  );
});

// Message listener for SKIP_WAITING signal
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    console.log('[Service Worker] Received SKIP_WAITING command. Activating worker immediately.');
    self.skipWaiting();
  }
});

// Activate event: purge ALL outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered (v2.0.0)');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients immediately');
      return self.clients.claim();
    })
  );
});

// Fetch event: Strict Network-First Strategy for all requests (HTML navigation & static assets)
// Falls back to cache ONLY when offline or network fails.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude version.json from SW cache (always fetch fresh)
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // Network-First strategy for HTML Navigation requests
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[Service Worker] Navigation network request failed. Serving cached /index.html');
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Network-First strategy with Cache Fallback for static assets (JS, CSS, images, fonts)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || url.hostname.includes('images.unsplash.com'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        console.log('[Service Worker] Network asset fetch failed. Serving from cache:', event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
