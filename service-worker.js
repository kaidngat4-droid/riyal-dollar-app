// ريال ودولار - Service Worker v1.0.0
const CACHE_NAME = 'riyal-dollar-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter(name => name !== CACHE_NAME).map(name => {
                    console.log('[SW] Deleting old cache:', name);
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip API calls
    if (event.request.url.includes('/api/') || event.request.url.includes('open.er-api.com') || event.request.url.includes('gold-api.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => cached);
            
            return cached || fetchPromise;
        })
    );
});

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'تحديث جديد من ريال ودولار',
        icon: '/images/icon-192.png',
        badge: '/images/icon-72.png',
        vibrate: [200, 100, 200],
        data: { url: '/' }
    };
    
    event.waitUntil(
        self.registration.showNotification('ريال ودولار', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
