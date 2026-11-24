const CACHE_NAME = 'ipbm2027-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon.png',
  './assets/logo_ipbm2027.png',
  './assets/home_visual.png',
  './assets/map_b2_vista.png',
  './assets/map_b1_grand.png',
  './assets/map_1f_walker.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Bypass GitHub Pages 10-min max-age=600 cache for instant updates, with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isDoc = event.request.mode === 'navigate' || event.request.url.endsWith('.html') || event.request.url.endsWith('/');
  event.respondWith(
    fetch(event.request, isDoc ? { cache: 'no-store' } : undefined)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
  );
});
