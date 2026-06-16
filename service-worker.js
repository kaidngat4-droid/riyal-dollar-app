// ريال ودولار - Service Worker v4 (Force Update)
const CACHE_NAME = 'riyal-dollar-v4-' + Date.now();

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // لا تخزن أي شيء - كل شيء من الشبكة
    event.respondWith(fetch(event.request));
});
