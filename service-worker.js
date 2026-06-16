// ============================================
// ريال ودولار - Service Worker v5 (Smart Cache)
// استراتيجية: Cache First للملفات الثابتة + Network First للأسعار
// ============================================

const CACHE_NAME = 'riyal-dollar-v5';
const STATIC_VERSION = 'v5.1';

// الملفات الثابتة التي تُخزن في الكاش
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/images/favicon-32.png',
  '/images/favicon-16.png',
  '/images/icon-180.png',
  '/images/icon-152.png',
  '/images/icon-120.png',
  '/images/icon-76.png'
];

// أنماط URL التي تُعتبر "ملفات أسعار" - لا تُخزن أبداً
const PRICE_PATTERNS = [
  /prices_data\.json/i,
  /api\/prices/i,
  /rates\.json/i,
  /exchange.*rate/i
];

// أنماط API خارجية - لا تُخزن
const API_PATTERNS = [
  /open\.er-api\.com/i,
  /api\.gold-api\.com/i,
  /exchangerate-api\.com/i
];

// ============================================
// INSTALL - تثبيت Service Worker
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v5...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Static assets cached successfully');
      // تفعيل فوري بدون انتظار
      return self.skipWaiting();
    }).catch(err => {
      console.error('[SW] Failed to cache static assets:', err);
    })
  );
});

// ============================================
// ACTIVATE - تفعيل Service Worker
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v5...');

  event.waitUntil(
    // مسح الكاشات القديمة
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Old caches cleaned');
      // السيطرة على جميع التبويبات فوراً
      return self.clients.claim();
    }).then(() => {
      console.log('[SW] v5 activated and controlling all clients');
    })
  );
});

// ============================================
// HELPERS - دوال مساعدة
// ============================================

/**
 * التحقق مما إذا كان URL يتعلق بملفات الأسعار
 */
function isPriceRequest(url) {
  const urlString = url.toString();
  return PRICE_PATTERNS.some(pattern => pattern.test(urlString));
}

/**
 * التحقق مما إذا كان URL يتعلق بـ API خارجية
 */
function isExternalAPI(url) {
  const urlString = url.toString();
  return API_PATTERNS.some(pattern => pattern.test(urlString));
}

/**
 * التحقق مما إذا كان URL يتعلق بملفات ثابتة
 */
function isStaticAsset(url) {
  const pathname = url.pathname;
  return STATIC_ASSETS.includes(pathname) || 
         pathname.endsWith('.css') || 
         pathname.endsWith('.js') || 
         pathname.endsWith('.png') || 
         pathname.endsWith('.jpg') || 
         pathname.endsWith('.svg') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.json') && !isPriceRequest(url);
}

// ============================================
// FETCH - معالجة الطلبات
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // تجاهل طلبات غير GET
  if (event.request.method !== 'GET') {
    return;
  }

  // تجاهل طلبات Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // ============================================
  // الحالة 1: ملفات الأسعار - دائماً من الشبكة (بدون كاش)
  // ============================================
  if (isPriceRequest(url)) {
    console.log('[SW] Price request detected:', url.pathname);

    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }).then(response => {
        console.log('[SW] Fresh prices fetched from network');
        return response;
      }).catch(err => {
        console.error('[SW] Failed to fetch prices:', err);
        // إذا فشلت الشبكة، نُرجع خطأ واضح
        return new Response(JSON.stringify({
          error: 'Network failed',
          timestamp: new Date().toISOString()
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // ============================================
  // الحالة 2: API خارجية - من الشبكة مع fallback
  // ============================================
  if (isExternalAPI(url)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('[SW] External API failed, no cache available');
        return new Response('{}', { status: 503 });
      })
    );
    return;
  }

  // ============================================
  // الحالة 3: الملفات الثابتة - Cache First
  // ============================================
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // إذا وجدنا في الكاش، نُرجعه
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', url.pathname);

          // في الخلفية، نُحدث الكاش
          fetch(event.request).then(freshResponse => {
            if (freshResponse.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, freshResponse.clone());
                console.log('[SW] Cache updated in background:', url.pathname);
              });
            }
          }).catch(() => {}); // تجاهل أخطاء التحديث الخلفي

          return cachedResponse;
        }

        // إذا لم يوجد في الكاش، نجلب من الشبكة
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      }).catch(err => {
        console.error('[SW] Cache error:', err);
        return fetch(event.request);
      })
    );
    return;
  }

  // ============================================
  // الحالة 4: أي طلب آخر - Network First
  // ============================================
  event.respondWith(
    fetch(event.request).then(response => {
      // نخزن في الكاش إذا كان ناجحاً
      if (response.ok && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => {
      // fallback للكاش إذا فشلت الشبكة
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // صفحة offline عامة
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// ============================================
// MESSAGE HANDLER - استقبال رسائل من الصفحة
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      return Promise.all(names.map(name => caches.delete(name)));
    }).then(() => {
      event.ports[0].postMessage('Cache cleared');
    });
  }

  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: STATIC_VERSION,
      cacheName: CACHE_NAME
    });
  }
});

// ============================================
// BACKGROUND SYNC - مزامنة في الخلفية
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rates') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_RATES' });
        });
      })
    );
  }
});

// ============================================
// PERIODIC SYNC - مزامنة دورية
// ============================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-rates') {
    console.log('[SW] Periodic sync triggered');
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'PERIODIC_UPDATE' });
        });
      })
    );
  }
});

// ============================================
// PUSH NOTIFICATIONS - إشعارات الدفع
// ============================================
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'ريال ودولار';
  const options = {
    body: data.body || 'تحديث جديد متاح!',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    tag: data.tag || 'default',
    requireInteraction: false,
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('[SW] Service Worker v5 loaded successfully');

