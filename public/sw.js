// Service Worker — Xero Reconciliation Assistant
// Strategy: cache-first for app shell, network-only for Xero API calls

const CACHE_NAME = 'xero-recon-v1.5';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// ── Install: pre-cache the app shell ─────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: serve shell from cache, pass API calls through ─────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for Xero API and auth endpoints
  if (url.hostname.endsWith('xero.com')) return;

  // Cache-first for same-origin shell assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback: return the cached index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});

// ── Handle SW update messages from the page ───────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
