// Service Worker — ingen caching, altid frisk fra netværket
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // Slet ALLE gamle caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Gå altid direkte til netværket — ingen cache
  e.respondWith(fetch(e.request));
});
