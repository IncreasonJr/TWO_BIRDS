const CACHE_NAME = 'twobirds-pwa-v1.3.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/logo.png'
];

// Install event: pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event triggered (v1.3.0)');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static core assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Message listener for SKIP_WAITING signal
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    console.log('[Service Worker] Received SKIP_WAITING command. Activating new worker immediately.');
    self.skipWaiting();
  }
});

// Activate event: purge old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered (v1.3.0)');
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
      return self.clients.claim();
    })
  );
});

// Fetch event: Network-First for HTML/SPA Navigation, Cache-First for hashed assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-First strategy for SPA navigation and index.html
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
          console.log('[Service Worker] Network request failed. Serving cached index.html fallback.');
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Cache-First strategy for static bundle assets (js, css, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidate for cached assets
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache dynamically
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && !event.request.url.includes('images.unsplash.com'))) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
