// ريال ودولار - Service Worker v3
const CACHE_NAME = 'riyal-dollar-v3';
const BASE = '/riyal-dollar-app';

const ASSETS = [
    BASE + '/offline.html',
    BASE + '/',
    BASE + '/index.html',
    BASE + '/css/styles.css',
    BASE + '/js/app.js',
    BASE + '/manifest.json',
    BASE + '/images/icon-192.png',
    BASE + '/images/icon-512.png'
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting();
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((names) => {
        return Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    }));
    self.clients.claim();
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});

// ============ PERIODIC SYNC ============
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-rates') {
        event.waitUntil(updateExchangeRates());
    }
});

async function updateExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(
            BASE + '/api/rates',
            new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
        console.log('✅ Periodic sync: Rates updated');
    } catch (err) {
        console.log('❌ Periodic sync failed:', err);
    }
}

// ============ BACKGROUND SYNC ============
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-rates') {
        event.waitUntil(updateExchangeRates());
    }
});

// ============ PUSH NOTIFICATIONS ============
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'تحديث جديد من ريال ودولار',
        icon: BASE + '/images/icon-192.png',
        badge: BASE + '/images/icon-72.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || BASE + '/' }
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'ريال ودولار', options)
    );
});

// ============ NOTIFICATION CLICK ============
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || BASE + '/')
    );
});
