const CACHE_NAME = 'twobirds-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/logo.png',
  '/favicon.png'
];

// Install event: cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event: Cache-First strategy with network fallback & dynamic caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension or external analytics
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Handle SPA navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put('/index.html', networkResponse);
              });
            }
          }).catch(() => {
            // Ignore network error if offline
          });
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
    return;
  }

  // Cache-first strategy for static assets, scripts, styles, images
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update cache asynchronously in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Silent catch for offline fetch
        });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache dynamically
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('i.pravatar.cc') && !event.request.url.includes('images.unsplash.com')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Return fallback if available
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
