/* ============================================
   SERVICE WORKER - ريال ودولار v2.0
   Enhanced with Offline Support & Background Sync
   ============================================ */

const CACHE_NAME = 'riyal-dollar-v2';
const STATIC_CACHE = 'riyal-dollar-static-v2';
const DYNAMIC_CACHE = 'riyal-dollar-dynamic-v2';
const IMAGE_CACHE = 'riyal-dollar-images-v2';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/alerts.html',
    '/comparison.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/history-system.js',
    '/js/app-v2-patch.js',
    '/manifest.json',
    '/api/prices_data.json'
];

const OFFLINE_PAGE = '/offline.html';

// Install - Cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing v2.0...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[SW] Cache failed:', err))
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating v2.0...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(cacheName)) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // Strategy for HTML pages
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Strategy for CSS/JS
    if (url.pathname.match(/\.(css|js)$/)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // Strategy for images
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Strategy for API calls
    if (url.pathname.includes('/api/')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Default: network with cache fallback
    event.respondWith(networkWithCacheFallback(request));
});

// Navigation handler - Show offline page when offline
async function handleNavigation(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (err) {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page
        const offlineResponse = await cache.match(OFFLINE_PAGE);
        if (offlineResponse) {
            return offlineResponse;
        }

        // Last resort
        return new Response(
            '<h1>غير متصل</h1><p>الرجاء التحقق من الاتصال بالإنترنت</p>',
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

// Stale-While-Revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Cache First: For images
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (err) {
        // Return placeholder for images
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#334155" width="100" height="100"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
        throw err;
    }
}

// Network First: For API calls
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (err) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw err;
    }
}

// Network with Cache Fallback
async function networkWithCacheFallback(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (err) {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw err;
    }
}

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener('sync', event => {
    if (event.tag === 'sync-rates') {
        console.log('[SW] Background sync: sync-rates');
        event.waitUntil(syncRates());
    }

    if (event.tag === 'sync-alerts') {
        console.log('[SW] Background sync: sync-alerts');
        event.waitUntil(syncAlerts());
    }
});

async function syncRates() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_RATES',
            timestamp: Date.now()
        });
    });
}

async function syncAlerts() {
    // Check alerts in background
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'CHECK_ALERTS',
            timestamp: Date.now()
        });
    });
}

// ============================================
// PERIODIC SYNC
// ============================================

self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-rates') {
        console.log('[SW] Periodic sync: update-rates');
        event.waitUntil(updateRatesPeriodic());
    }
});

async function updateRatesPeriodic() {
    try {
        // Update rates cache
        const cache = await caches.open(DYNAMIC_CACHE);

        // Fetch global rates
        const ratesResponse = await fetch('https://open.er-api.com/v6/latest/USD');
        if (ratesResponse.ok) {
            cache.put('/api/rates-global', ratesResponse.clone());
        }

        // Fetch local rates
        const localResponse = await fetch('/api/prices_data.json?_=' + Date.now());
        if (localResponse.ok) {
            cache.put('/api/prices_data.json', localResponse.clone());
        }

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'RATES_UPDATED',
                timestamp: Date.now()
            });
        });

    } catch (err) {
        console.warn('[SW] Periodic update failed:', err);
    }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'ريال ودولار',
            body: 'تحديث جديد متاح!',
            icon: '/images/icon-192.png',
            badge: '/images/badge-72.png'
        };
    }

    const options = {
        body: data.body || 'تحديث جديد',
        icon: data.icon || '/images/icon-192.png',
        badge: data.badge || '/images/badge-72.png',
        tag: data.tag || 'general',
        requireInteraction: data.requireInteraction || false,
        vibrate: data.vibrate || [200, 100, 200],
        data: data.data || {},
        actions: data.actions || [
            { action: 'open', title: 'فتح التطبيق' },
            { action: 'dismiss', title: 'تجاهل' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'ريال ودولار', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Focus existing client
            for (const client of clientList) {
                if (client.url.includes('riyal-dollar') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// ============================================
// MESSAGE HANDLING (from main thread)
// ============================================

self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[SW] Service Worker v2.0 loaded');
