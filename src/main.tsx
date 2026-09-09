import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA functionality & robust update management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Force check for updates immediately on load
        registration.update().catch((err) => console.log('[PWA] Initial update check:', err));

        // Check if a worker is already waiting (installed in background)
        if (registration.waiting) {
          console.log('[PWA] Waiting service worker detected on load.');
          window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New update installed and waiting for activation.');
                window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
              }
            });
          }
        });

        // Force update check when user returns to app (visibilitychange on mobile)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch((err) => console.log('[PWA] Visibility update check:', err));
          }
        });

        // Periodically check for updates every 15 minutes
        setInterval(() => {
          registration.update().catch((err) => console.log('[PWA] Periodic update check:', err));
        }, 15 * 60 * 1000);
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
      console.log('[PWA] Service worker controller changed. Refreshing page...');
      window.location.reload();
    }
  });
}
