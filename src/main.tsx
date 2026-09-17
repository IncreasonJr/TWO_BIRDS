import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './lib/seedData';

declare const __APP_BUILD_TIME__: string;
const CURRENT_VERSION = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'dev';

// Check server version on application boot to detect deployment changes
const checkVersionAndEvictStaleCache = async () => {
  // In development, skip version check entirely to avoid reload loops
  if (import.meta.env.DEV || CURRENT_VERSION === 'dev') return;

  // Session throttle: prevent rapid consecutive reloads (must be at least 15s apart)
  const lastReload = sessionStorage.getItem('last_version_reload');
  if (lastReload && Date.now() - Number(lastReload) < 15000) {
    console.warn('[Version Check] Throttling reload loop.');
    return;
  }

  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.version && data.version !== 'dev' && data.version !== CURRENT_VERSION) {
        console.warn(`[Version Check] New version detected! Server: ${data.version}, Local: ${CURRENT_VERSION}. Purging caches...`);
        sessionStorage.setItem('last_version_reload', String(Date.now()));

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

// In development mode, unregister any lingering service workers from previous runs
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((unregistered) => {
        if (unregistered) {
          console.log('[PWA] Unregistered lingering ServiceWorker in dev mode:', registration.scope);
        }
      });
    }
  });
}

// In production mode, register Service Worker for PWA functionality & update management
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
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
      const lastSwReload = sessionStorage.getItem('last_sw_reload');
      if (lastSwReload && Date.now() - Number(lastSwReload) < 15000) {
        console.warn('[PWA] Throttling controllerchange reload.');
        return;
      }
      refreshing = true;
      sessionStorage.setItem('last_sw_reload', String(Date.now()));
      console.log('[PWA] Service worker controller changed. Reloading app...');
      window.location.reload();
    }
  });
}
