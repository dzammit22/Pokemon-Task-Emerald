const CACHE = 'emerald-task-party-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))) );
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  // Only cache GET
  if(req.method!=='GET'){ return; }
  e.respondWith(
    caches.match(req).then(cached=>{
      return cached || fetch(req).then(res=>{
        // Cache same-origin navigations and static files
        const url = new URL(req.url);
        if(url.origin===location.origin){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(req, clone));
        }
        return res;
      }).catch(()=> cached || caches.match('./index.html'));
    })
  );
});
