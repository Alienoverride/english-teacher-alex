// ===== SERVICE WORKER - TEACHER ALEX PWA =====

const CACHE_NAME = 'teacher-alex-academy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html', 
  '/listening-hub.html',
  '/graded-readers-hub.html',
  '/pure-reading-hub.html',
  '/base.css',
  '/layout.css',
  '/theme-patriot.css',
  '/icon-192.png',
  '/icon-512.png'
];

// ===== INSTALAR E CACHEAR ARQUIVOS =====
self.addEventListener('install', event => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Arquivos cacheados com sucesso');
        return cache.addAll(urlsToCache);
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

// ===== SERVIR ARQUIVOS (CACHE FIRST) =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível, senão busca na rede
        if (response) {
          console.log('📦 Servindo do cache:', event.request.url);
          return response;
        }
        
        console.log('🌐 Buscando na rede:', event.request.url);
        return fetch(event.request).then(response => {
          // Cachear novas respostas
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback para páginas offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// ===== MENSAGENS DO APP =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===== SYNC EM BACKGROUND (para futuro) =====
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Sync em background executado');
    // Aqui pode sincronizar progresso quando voltar online
  }
});

console.log('🎓 Teacher Alex PWA Service Worker carregado!');