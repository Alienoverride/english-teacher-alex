// ===== SERVICE WORKER CORRIGIDO - TEACHER ALEX PWA =====

const CACHE_NAME = 'teacher-alex-academy-v2';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './listening-hub.html',
  './graded-readers-hub.html',
  './pure-reading-hub.html',
  './base.css',
  './layout.css',
  './theme-patriot.css',
  './icon-192.png',
  './icon-512.png'
];

// ===== INSTALAR E CACHEAR ARQUIVOS =====
self.addEventListener('install', event => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Tentando cachear arquivos...');
        // Cachear arquivos individualmente para evitar erro 404
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.log(`❌ Erro ao cachear ${url}:`, error);
              return null; // Continua mesmo se um arquivo falhar
            });
          })
        );
      })
      .then(() => {
        console.log('✅ Cache configurado com sucesso');
      })
  );
});

// ===== ATIVAR E LIMPAR CACHES ANTIGOS =====
self.addEventListener('activate', event => {
  console.log('✅ Service Worker ativo');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ===== SERVIR ARQUIVOS (NETWORK FIRST PARA ATUALIZAÇÕES) =====
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se conseguiu da rede, usa e atualiza cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Se falhou na rede, tenta do cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('📦 Servindo do cache:', event.request.url);
              return response;
            }
            // Se não tem no cache e é documento, redireciona para index
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

console.log('🎓 Teacher Alex PWA Service Worker v2 carregado!');