const CACHE_NAME = 'lumina-play-v1';

// Arquivos que serão armazenados no cache imediatamente (App Shell)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './filme.html',
    './series.html',
    './minha-lista.html',
    './style.css',
    './script.js',
    './logo.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Instalação: Salva os arquivos essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Lumina Cache: Arquivos principais armazenados.');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação: Limpa caches antigos se você atualizar a versão (v1 -> v2)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Intercepta as requisições
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Estratégia especial para imagens da API (TMDB)
    // Elas são salvas no cache conforme o usuário navega
    if (url.hostname === 'image.tmdb.org') {
        event.respondWith(cacheFirst(event.request));
    } else {
        // Para os arquivos do próprio site: Tenta Cache, se não tiver, vai na Rede
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// Função Auxiliar: Cache First, Network Second
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone()); // Guarda a imagem nova no cache
        return networkResponse;
    } catch (error) {
        return cachedResponse;
    }
}
