/* ============================================
   SERVICE WORKER - ريال ودولار v2.1 (FIXED)
   Enhanced with Debug Console Logging
   (مُعدَّل للإنتاج مع دعم الإشعارات)
   ============================================ */

const CACHE_NAME = 'riyal-dollar-v2-1';
const STATIC_CACHE = 'riyal-dollar-static-v2-1';
const DYNAMIC_CACHE = 'riyal-dollar-dynamic-v2-1';
const IMAGE_CACHE = 'riyal-dollar-images-v2-1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/alerts.html',
    '/comparison.html',
    '/terms.html',
    '/privacy-policy.html',   
    '/css/styles.css',
    '/js/app.js',
    '/js/history-system.js',
    '/js/app-v2-patch.js',
    '/manifest.json'
];

const OFFLINE_PAGE = '/offline.html';

// ============================================
// ⭐ NEW: API hosts that must NEVER be cached
// ============================================
const NEVER_CACHE_HOSTS = [
    'oanda-proxy-green.vercel.app',
    'gold-api.com',
    'api.exchangerate-api.com',
    'open.er-api.com',
    'api.frankfurter.app'
];

// ============================================
// DEBUG LOGGING (غيّر إلى false قبل الرفع للمتجر)
// ============================================
const DEBUG = true;   // 🔧 اجعلها false عند النشر النهائي

function log(...args) {
    if (DEBUG) console.log('[SW v2.1]', ...args);
}
function warn(...args) {
    if (DEBUG) console.warn('[SW v2.1]', ...args);
}
function error(...args) {
    if (DEBUG) console.error('[SW v2.1]', ...args);
}

// ============================================
// INSTALL
// ============================================
self.addEventListener('install', event => {
    log('Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                log('Install complete');
                return self.skipWaiting();
            })
            .catch(err => error('Install failed', err))
    );
});

// ============================================
// ACTIVATE
// ============================================
self.addEventListener('activate', event => {
    log('Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(cacheName)) {
                        log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            log('Activation complete');
            return self.clients.claim();
        }).catch(err => error('Activation failed', err))
    );
});

// ============================================
// FETCH
// ============================================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        // ⭐ NEW: Handle POST requests (like OANDA pricing)
        if (request.method === 'POST' && NEVER_CACHE_HOSTS.some(h => url.hostname.includes(h))) {
            event.respondWith(
                fetch(request).catch(err => {
                    warn('POST API failed:', url.hostname, err.message);
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Network error - API unavailable',
                        timestamp: new Date().toISOString()
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
            );
        }
        return;
    }

    if (!url.protocol.startsWith('http')) return;

    // ⭐ NEW: Bypass cache for API hosts (GET requests)
    if (NEVER_CACHE_HOSTS.some(h => url.hostname.includes(h))) {
        event.respondWith(
            fetch(request).catch(err => {
                warn('API fetch failed:', url.hostname, err.message);
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Network error'
                }), { status: 503, headers: { 'Content-Type': 'application/json' }});
            })
        );
        return;
    }

    // prices_data.json → Network First (no cache storage)
    if (url.pathname.includes('prices_data.json')) {
        event.respondWith(
            fetch(request, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            }).catch(err => {
                warn('Offline prices_data.json fallback');
                return new Response(JSON.stringify({
                    error: 'Offline - cached fallback not used'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Navigation
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // CSS / JS
    if (url.pathname.match(/\.(css|js)$/)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // Images
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // API (local /api/ endpoints)
    if (url.pathname.includes('/api/')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Default
    event.respondWith(networkWithCacheFallback(request));
});

// ============================================
// STRATEGIES
// ============================================
async function handleNavigation(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (err) {
        warn('Navigation failed, using cache', err);
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        const offline = await cache.match(OFFLINE_PAGE);
        if (offline) return offline;

        return new Response(
            '<h1>Offline</h1><p>Check your internet connection</p>',
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
        })
        .catch(err => {
            warn('SWR fetch failed', err);
            return cached;
        });

    return cached || fetchPromise;
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
    } catch (err) {
        error('CacheFirst failed', err);
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#444"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
        throw err;
    }
}

async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
    } catch (err) {
        warn('NetworkFirst fallback', err);
        const cached = await cache.match(request);
        if (cached) return cached;
        throw err;
    }
}

async function networkWithCacheFallback(request) {
    try {
        const res = await fetch(request);
        if (res.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, res.clone());
        }
        return res;
    } catch (err) {
        error('Network failed, using cache', err);
        const cache = await caches.open(DYNAMIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        throw err;
    }
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', event => {
    log('Sync event:', event.tag);
    if (event.tag === 'sync-rates') event.waitUntil(syncRates());
    if (event.tag === 'sync-alerts') event.waitUntil(syncAlerts());
});

async function syncRates() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_RATES', timestamp: Date.now() });
    });
    log('Rates synced');
}

async function syncAlerts() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'CHECK_ALERTS', timestamp: Date.now() });
    });
    log('Alerts synced');
}

// ============================================
// PERIODIC SYNC
// ============================================
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-rates') {
        event.waitUntil(updateRatesPeriodic());
    }
});

async function updateRatesPeriodic() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const rates = await fetch('https://open.er-api.com/v6/latest/USD');
        if (rates.ok) cache.put('/api/rates-global', rates.clone());
        const local = await fetch('/api/prices_data.json?_=' + Date.now());
        if (local.ok) cache.put('/api/prices_data.json', local.clone());

        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'RATES_UPDATED', timestamp: Date.now() });
        });
        log('Periodic update complete');
    } catch (err) {
        warn('Periodic sync failed', err);
    }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data.json();
    } catch (err) {
        warn('Push parse failed', err);
        data = {
            title: 'ريال ودولار',
            body: 'تحديث جديد متاح!',
            icon: '/images/icon-192.png',
            badge: '/images/badge-72.png'
        };
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        actions: data.actions || [
            { action: 'open', title: 'فتح' },
            { action: 'dismiss', title: 'تجاهل' }
        ],
        vibrate: data.vibrate || [200, 100, 200],
        requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'ريال ودولار',
            options
        )
    );
});

// ✅ NEW: معالج النقر على الإشعار
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.hostname) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        log('Skip waiting triggered');
        self.skipWaiting();
    }
    if (event.data?.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then(cache => {
                log('Caching URLs manually');
                return cache.addAll(event.data.urls);
            })
        );
    }
    if (event.data?.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(names => {
                log('Clearing all caches');
                return Promise.all(names.map(name => caches.delete(name)));
            })
        );
    }
});

log('Service Worker v2.1 loaded – FIXED (API bypass enabled)');
