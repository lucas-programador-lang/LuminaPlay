const CACHE_NAME = 'lumina-play-v1';

// Arquivos que serão armazenados no cache imediatamente (App Shell)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './filme.html',
    './series.html',
    './minha-lista.html',
    './style.css',
    './logo.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Instalação: Salva os arquivos essenciais
self.addEventListener('install', (event) => {
    // Força o SW a se tornar ativo imediatamente
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Lumina Cache: App Shell armazenado.');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação: Limpa caches antigos e assume o controle das abas abertas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepta as requisições
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Estratégia Cache First para Imagens do TMDB (Cache Dinâmico)
    if (url.hostname === 'image.tmdb.org') {
        event.respondWith(cacheFirst(event.request));
    } else {
        // Estratégia Stale-While-Revalidate para arquivos locais
        // (Mostra o cache rápido, mas atualiza por baixo dos panos)
        event.respondWith(
            caches.match(event.request).then((response) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {}); // Falha silenciosa se estiver offline

                return response || fetchPromise;
            })
        );
    }
});

// Função Auxiliar: Cache First, Network Second (com Fallback)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        // Só armazena no cache se a resposta for válida
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Se der erro de rede e não tiver cache, você poderia retornar uma imagem de placeholder aqui
        console.error('Lumina Play: Erro ao buscar imagem offline.');
        return cachedResponse; 
    }
}
