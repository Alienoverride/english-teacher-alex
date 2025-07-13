// ===== SERVICE WORKER MÍNIMO - ZERO RISCO 404 =====

const CACHE_NAME = 'teacher-alex-v3-minimal';
const urlsToCache = [
  './',
  './index.html',
  './login.html'
]; // SÓ O ESSENCIAL!

// ===== INSTALAR =====
self.addEventListener('install', event => {
  console.log('🔧 SW Mínimo instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando apenas essenciais...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Cache mínimo OK!');
        self.skipWaiting(); // Força ativação imediata
      })
  );
});

// ===== ATIVAR =====
self.addEventListener('activate', event => {
  console.log('✅ SW Mínimo ativo');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Assume controle imediato
    })
  );
});

// ===== FETCH SIMPLIFICADO =====
self.addEventListener('fetch', event => {
  // Só intercepta requests para o próprio site
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se deu certo, guarda no cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Se falhou, tenta do cache
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('./index.html');
            });
        })
    );
  }
});

console.log('🎓 SW Mínimo Teacher Alex carregado - Zero risco 404!');
