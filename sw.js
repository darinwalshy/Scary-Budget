// ==========================================
// 🛠️ UNIQUE IDENTIFIERS FOR THIS APP
// ==========================================
const APP_PREFIX = 'scary_budget_v1_91_';
const CACHE_NAME = APP_PREFIX + 'cache';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install event: Pre-cache core files using relative paths
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event: Clear old caches for THIS app only
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
            console.log(`[Service Worker] Cleared old app cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('./index.html');
        });
      })
    );
  }
});
