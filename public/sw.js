// Service Worker for Vesuviano Forni - Optimized v2.1
const CACHE_NAME = 'vesuviano-v2.1';
const STATIC_CACHE = 'vesuviano-static-v2.1';
const DYNAMIC_CACHE = 'vesuviano-dynamic-v2.1';
const IMAGE_CACHE = 'vesuviano-images-v2.1';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/src/assets/mattoni-refrattari-hero.jpg',
  '/src/assets/vesuviano-logo-bianco.png'
];

// External resources
const EXTERNAL_FONTS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap'
];

// Install event - aggressive caching of critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing optimized service worker v2.1');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS).catch((error) => {
          console.warn('[SW] Some critical assets failed to cache:', error);
          // Continue anyway - don't fail the entire installation
        });
      }),
      
      // Cache external fonts separately
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[SW] Caching external fonts');
        return Promise.allSettled(
          EXTERNAL_FONTS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                cache.put(url, response);
              }
            }).catch(() => {
              console.warn('[SW] Failed to cache font:', url);
            })
          )
        );
      })
    ])
    .then(() => {
      console.log('[SW] Installation complete, taking control');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  // Handle different types of requests
  if (request.destination === 'image') {
    // Images: Cache first, network fallback
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (
    request.url.includes('/api/') || 
    request.url.includes('supabase.co') ||
    request.url.includes('mapbox')
  ) {
    // API calls: Network first, cache fallback
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    STATIC_ASSETS.some(asset => request.url.includes(asset))
  ) {
    // Static assets: Cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Everything else: Stale while revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline - resource not available', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    console.log('[SW] Network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - no cached version available', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch fresh content in background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Network failed, but we might have cache
      return null;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      console.log('[SW] Serving from cache, updating in background:', request.url);
      return cachedResponse;
    }
    
    // No cache, wait for network
    console.log('[SW] No cache, waiting for network:', request.url);
    return await fetchPromise || new Response('Offline', { status: 503 });
  } catch (error) {
    console.error('[SW] Stale while revalidate failed:', error);
    return new Response('Service worker error', { status: 500 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'consultation-form') {
    event.waitUntil(syncConsultationForms());
  }
});

async function syncConsultationForms() {
  // Handle offline form submissions
  try {
    const forms = await getStoredForms();
    for (const form of forms) {
      await submitForm(form);
    }
    await clearStoredForms();
  } catch (error) {
    console.error('[SW] Failed to sync forms:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nuovi aggiornamenti disponibili',
    icon: '/lovable-uploads/vesuviano-logo-bianco.png',
    badge: '/lovable-uploads/vesuviano-logo-bianco.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Vesuviano Forni', options)
  );
});