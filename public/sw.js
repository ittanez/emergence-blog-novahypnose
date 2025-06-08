/**
 * Service Worker for Emergence Blog
 * Intelligent caching strategy for maximum performance
 */

const CACHE_NAME = 'emergence-blog-v1';
const STATIC_CACHE = 'static-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/assets/index.css',
  '/assets/index.js',
  '/placeholder.svg',
  '/favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('✅ Static resources cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v1')) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Strategy 1: Cache First for static assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Strategy 2: Stale While Revalidate for images
  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, 30 * 24 * 60 * 60)); // 30 days
    return;
  }
  
  // Strategy 3: Network First for API calls
  if (isAPI(url)) {
    event.respondWith(networkFirst(request, API_CACHE, 5 * 60)); // 5 minutes
    return;
  }
  
  // Strategy 4: Stale While Revalidate for pages
  if (isHTMLPage(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME, 24 * 60 * 60)); // 24 hours
    return;
  }
  
  // Default: Network first
  event.respondWith(fetch(request));
});

/**
 * Cache First Strategy - for static assets that rarely change
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('📦 Serving from cache:', request.url);
    return cached;
  }
  
  console.log('🌐 Fetching and caching:', request.url);
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

/**
 * Network First Strategy - for dynamic content
 */
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('🌐 Network first:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.append('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy - best of both worlds
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.append('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    return response;
  });
  
  // If we have cached version, check if it's still fresh
  if (cached) {
    const cacheTimestamp = cached.headers.get('sw-cache-timestamp');
    const age = Date.now() - (cacheTimestamp ? parseInt(cacheTimestamp) : 0);
    
    if (age < maxAge * 1000) {
      console.log('📦 Serving fresh cache:', request.url);
      return cached;
    }
  }
  
  // Return cache immediately if available, update in background
  if (cached) {
    console.log('📦 Serving stale cache, updating:', request.url);
    return cached;
  }
  
  // No cache, wait for network
  console.log('🌐 No cache, waiting for network:', request.url);
  return fetchPromise;
}

/**
 * Helper functions to identify request types
 */
function isStaticAsset(url) {
  return url.pathname.includes('/assets/') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.ico');
}

function isImage(url) {
  return url.hostname.includes('supabase.co') ||
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname);
}

function isAPI(url) {
  return url.pathname.includes('/functions/') || 
         url.hostname.includes('supabase.co');
}

function isHTMLPage(url) {
  return url.pathname === '/' || 
         url.pathname.includes('/article/') ||
         url.pathname.includes('/category/') ||
         !url.pathname.includes('.');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    // Handle offline actions here
  }
});

console.log('🚀 Service Worker loaded successfully');