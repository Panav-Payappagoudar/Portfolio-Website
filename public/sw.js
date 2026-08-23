const CACHE_NAME = 'panav-portfolio-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Force the new SW to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') return;
  
  // Don't cache API calls or analytics
  if (event.request.url.includes('/api/') || event.request.url.includes('.netlify')) return;

  // For HTML navigation requests — use network-first strategy
  // This ensures users always get the latest content after deploys
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((fetchResponse) => {
          // Cache the fresh response for offline use
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        })
        .catch(() => {
          // Offline — fall back to cached HTML
          return caches.match(event.request).then(r => r || caches.match('/index.html'));
        })
    );
    return;
  }

  // For all other assets — use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((fetchResponse) => {
        if (event.request.url.startsWith('http') && fetchResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
          });
        }
        return fetchResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  // Immediately take control of all clients
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
