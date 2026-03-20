const CACHE_NAME = 'lumina-play-v2'; // Mudei para v2 para forçar a atualização

// Arquivos essenciais - Removi os pontos iniciais para evitar erros de rota no Pages
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/filme.html',
    '/series.html',
    '/minha-lista.html',
    '/style.css',
    '/logo.png'
];

// Instalação: Salva os arquivos essenciais com tratamento de erro
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Lumina Cache: Tentando armazenar App Shell...');
            // Usamos map para tentar adicionar um por um, evitando que um erro em um arquivo trave tudo
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url))
            ).then(() => console.log('Lumina Cache: Processo de cache finalizado.'));
        })
    );
});

// Ativação: Limpa caches antigos
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

    // Se for imagem do TMDB, usa Cache First
    if (url.hostname === 'image.tmdb.org') {
        event.respondWith(cacheFirst(event.request));
    } else {
        // Para arquivos locais: Network First (Tenta a rede, se falhar usa o cache)
        // Isso evita o erro ERR_FAILED se o arquivo mudar de nome ou sumir
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
    }
});

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse; 
    }
}
