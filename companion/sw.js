const CACHE = 'companion-v5';
const ASSETS = ['.', 'index.html', 'manifest.webmanifest', 'icon-512.png', 'icon-512-maskable.png',
  'girl-stage1.png', 'girl-stage2.png', 'girl-stage3.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Daily nudge for installed PWAs (Android Chrome grants this to engaged apps).
self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-nudge'){
    e.waitUntil(self.registration.showNotification('🌞 My Companion', {
      body: 'Your daily plan is waiting — tap to check in.',
      icon: 'icon-512.png',
      tag: 'daily-nudge'
    }));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('.'));
});

// Network-first so updates arrive, cache fallback so it works offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
