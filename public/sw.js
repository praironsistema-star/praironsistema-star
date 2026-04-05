// PRAIRON Service Worker — Cache offline basico
const CACHE_NAME = 'prairon-v1';
const OFFLINE_URL = '/offline';

// Archivos a cachear para uso offline
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET de navegacion (no API)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/') || event.request.url.includes(':3001')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar en cache si es exitoso
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request).then(cached => {
          return cached || new Response('Sin conexion', { status: 503 });
        });
      })
  );
});
