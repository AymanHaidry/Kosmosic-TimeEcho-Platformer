/* =====================================================
   TIME ECHO PLATFORMER — sw.js
   Service Worker: caches game assets for offline play
   and enables PWA install prompt.
   ===================================================== */

const CACHE_NAME   = 'time-echo-v1';
const STATIC_CACHE = 'time-echo-static-v1';

// Core files to cache on install
const PRECACHE = [
  '/launchpad',
  '/style.css',
  '/config.js',
  '/supabase-client.js',
  '/auth.js',
  '/entities.js',
  '/levels.js',
  '/renderer.js',
  '/sounds.js',
  '/game.js',
  '/ui.js',
  '/manifest.json',
];

// ── Install: precache all core game assets ────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE).catch((err) => {
        console.warn('[SW] Precache failed (some files may not exist yet):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for game assets, network-first for API ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin API calls (Supabase)
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('fonts.googleapis.com')) return;
  if (url.hostname.includes('fonts.gstatic.com')) return;

  // For game files: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Only cache successful same-origin responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/launchpad');
        }
      });
    })
  );
});

// ── Message: force update ──────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
