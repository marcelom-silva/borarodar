// Service Worker — BoraRodar
// Cache-first para paginas, network-first para API calls
var CACHE_NAME = 'borarodar-v2';
var STATIC_URLS = [
  '/',
  '/planejar',
  '/explorar',
  '/ajuda',
  '/offline',
];

// Instala e faz cache das paginas principais
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_URLS).catch(function(err) {
        console.warn('[SW] Erro ao cachear:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Limpa caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch:
// - APIs externas (Gemini, Groq, OSM, OWM): network-only
// - Assets estaticos (_next/static): cache-first
// - Paginas: stale-while-revalidate
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Ignora requests que nao sao GET
  if (event.request.method !== 'GET') return;

  // APIs externas: sempre rede
  if (url.includes('generativelanguage.googleapis.com') ||
      url.includes('groq.com') ||
      url.includes('nominatim.openstreetmap.org') ||
      url.includes('openweathermap.org') ||
      url.includes('osrm.project-osrm.org') ||
      url.includes('supabase.co')) {
    return; // passa direto para a rede
  }

  // Assets estaticos do Next.js: cache-first
  if (url.includes('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          if (cached) return cached;
          return fetch(event.request).then(function(response) {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Paginas HTML: stale-while-revalidate
  if (event.request.headers.get('accept')&&event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fetchPromise = fetch(event.request).then(function(response) {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(function() {
            // Offline: retorna pagina cacheada ou pagina offline
            return cached || caches.match('/offline') || new Response(
              '<html><body style="font-family:system-ui;background:#0F0F13;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">'
              + '<div><h1 style="color:#39FF14;font-size:2rem">🚗 BoraRodar</h1>'
              + '<p style="color:#9CA3AF">Voce esta offline. Conecte-se para continuar planejando.</p></div></body></html>',
              {headers:{'Content-Type':'text/html'}}
            );
          });
          return cached || fetchPromise;
        });
      })
    );
  }
});

// Recebe mensagem para salvar roteiro offline
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SAVE_ITINERARY') {
    var itinerary = event.data.payload;
    caches.open(CACHE_NAME).then(function(cache) {
      var response = new Response(JSON.stringify(itinerary), {
        headers: {'Content-Type': 'application/json'}
      });
      cache.put('/offline/itinerary', response);
    });
  }
});
