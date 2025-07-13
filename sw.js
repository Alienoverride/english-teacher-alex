// ===== SERVICE WORKER GITHUB PAGES OPTIMIZADO =====

const CACHE_NAME = 'teacher-alex-v4-github';

// ✅ URLs RELATIVOS - Compatível com GitHub Pages
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './manifest.json'
];

// ===== INSTALAR =====
self.addEventListener('install', event => {
  console.log('🔧 SW GitHub Pages instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando arquivos essenciais...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Cache GitHub Pages OK!');
        self.skipWaiting(); // Força ativação imediata
      })
      .catch(error => {
        console.error('❌ Erro no cache:', error);
      })
  );
});

// ===== ATIVAR =====
self.addEventListener('activate', event => {
  console.log('✅ SW GitHub Pages ativo');
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
    }).then(() => {
      return self.clients.claim(); // Assume controle imediato
    })
  );
});

// ===== FETCH MELHORADO =====
self.addEventListener('fetch', event => {
  // Só intercepta requests para o próprio site
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se deu certo e é um arquivo válido
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone))
              .catch(err => console.log('Cache put falhou:', err));
          }
          return response;
        })
        .catch(() => {
          // Se falhou, tenta do cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                console.log('📦 Servindo do cache:', event.request.url);
                return response;
              }
              // Fallback para index.html
              return caches.match('./index.html');
            });
        })
    );
  }
});

// ===== DEBUG INFO =====
console.log('🎓 SW Teacher Alex GitHub Pages carregado!');
console.log('🌍 Origin:', self.location.origin);
console.log('📂 Scope:', self.registration?.scope || 'N/A');
