import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

declare const __APP_BUILD_TIME__: string;
const CURRENT_VERSION = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'dev';

// Check server version on application boot to detect deployment changes
const checkVersionAndEvictStaleCache = async () => {
  if (CURRENT_VERSION === 'dev') return;
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.version && data.version !== CURRENT_VERSION) {
        console.warn(`[Version Check] New version detected! Server: ${data.version}, Local: ${CURRENT_VERSION}. Purging caches...`);
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          for (const key of cacheKeys) {
            await caches.delete(key);
          }
        }
        window.location.reload();
        return;
      }
    }
  } catch (err) {
    console.log('[Version Check] Network check skipped or offline:', err);
  }
};

// Render React Application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA functionality & robust update management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Execute version check first
    await checkVersionAndEvictStaleCache();

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Immediate update check on load
        registration.update().catch((err) => console.log('[PWA] Initial update check:', err));

        // Detect if worker is already waiting
        if (registration.waiting) {
          console.log('[PWA] Waiting service worker detected on load.');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New update installed. Sending SKIP_WAITING signal...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
              }
            });
          }
        });

        // Visibility check when returning to app foreground (mobile tab switch)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch((err) => console.log('[PWA] Visibility update check error:', err));
            checkVersionAndEvictStaleCache();
          }
        });

        // Periodic update check every 5 minutes
        setInterval(() => {
          registration.update().catch((err) => console.log('[PWA] Periodic update check error:', err));
          checkVersionAndEvictStaleCache();
        }, 5 * 60 * 1000);
      })
      .catch((err) => {
        console.log('[PWA] ServiceWorker registration error:', err);
      });
  });

  // Automatically refresh page when controller changes (after skipWaiting)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Service worker controller changed. Reloading app...');
      window.location.reload();
    }
  });
}
