import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA functionality & update management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Check if a worker is already waiting
        if (registration.waiting) {
          console.log('[PWA] Waiting worker found on load.');
          window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version installed and ready for update.');
                window.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
              }
            });
          }
        });

        // Periodically check for updates every 30 minutes
        setInterval(() => {
          registration.update().catch((err) => console.log('[PWA] SW update check error:', err));
        }, 30 * 60 * 1000);
      })
      .catch((err) => {
        console.log('[PWA] ServiceWorker registration failed:', err);
      });
  });

  // Automatically refresh page when controller changes (after skipWaiting)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Controller changed, reloading page...');
      window.location.reload();
    }
  });
}
