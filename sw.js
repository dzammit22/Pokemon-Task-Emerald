// Offline service worker (no webmanifest needed)
const VERSION = 'etp-v4';
const ASSETS = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith((async ()=>{
    const cached = await caches.match(req);
    if(cached) return cached;

    try{
      const res = await fetch(req);
      const url = new URL(req.url);
      if(url.origin === self.location.origin){
        const c = await caches.open(VERSION);
        c.put(req, res.clone());
      }
      return res;
    }catch(err){
      if(req.mode === 'navigate') return caches.match('./index.html');
      if(cached) return cached;
      throw err;
    }
  })());
});

