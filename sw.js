const CACHE = 'aarhus-grocery-v22';
const SHELL = ['./', 'index.html', 'styles.css?v=22', 'app.js?v=22', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()),
));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(clients => clients.forEach(client => client.postMessage({ type: 'APP_UPDATED', cache: CACHE }))),
));

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

function cacheKeyFor(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/data/current_offers.json') || url.pathname.endsWith('/data/atlanta_offers.json')) {
    return new Request(`${url.origin}${url.pathname}`);
  }
  return request;
}

async function networkFirst(request) {
  const cacheKey = cacheKeyFor(request);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./');
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(networkFirst(event.request));
});
