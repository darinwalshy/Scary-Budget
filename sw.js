// ==========================================
// 🛠️ UNIQUE IDENTIFIERS FOR THIS APP
// ==========================================
const BASE_PREFIX = 'scary_budget_v1'; 
const APP_PREFIX = `${BASE_PREFIX}1_93_`; // Bumped version to force cache updates
const CACHE_NAME = APP_PREFIX + 'cache';

// Double-check: Match your exact GitHub repo casing/spelling
const REPO_NAME = '/Scary-Budget';      

const ASSETS = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  `${REPO_NAME}/manifest.json`
];

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event: Fixes the historical version cleanup leak
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // FIX: Look for any historical scary budget cache, purging everything except current
          if (key.startsWith(BASE_PREFIX) && key !== CACHE_NAME) {
            console.log(`[Service Worker] Cleared old app cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first with absolute scoping
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Only intercept GET requests belonging specifically to this app's GitHub directory
  if (event.request.method === 'GET' && requestUrl.includes(self.location.origin) && requestUrl.includes(REPO_NAME)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          // Fall back to specific namespaced index if individual asset is missing offline
          return response || caches.match(`${REPO_NAME}/index.html`);
        });
      })
    );
  }
});
