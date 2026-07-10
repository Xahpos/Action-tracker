const CACHE_NAME = 'action-tracker-v2';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const isNav = e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/Action-tracker/');
  // For the app shell: bypass the HTTP cache so a new deploy shows up immediately.
  const req = isNav ? new Request(e.request, { cache: 'no-cache' }) : e.request;
  e.respondWith(
    fetch(req).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
