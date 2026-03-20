/* ============================================================
   LUMINA PLAY - SERVICE WORKER & PLAYER DINÂMICO
============================================================ */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Usando caminho absoluto para o Service Worker
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('🚀 Lumina Play: PWA Ativo!'))
            .catch(err => console.error('❌ Falha no Service Worker:', err));
    });
}

const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/original"; 

const DOM = {
    hero: document.getElementById('hero'),
    heroTitle: document.getElementById('heroTitle'),
    heroOverview: document.getElementById('heroOverview'),
    heroWatch: document.getElementById('heroWatch'),
    rows: {
        populares: document.getElementById('row-populares'),
        emalta: document.getElementById('row-emalta'),
        lancamentos: document.getElementById('row-lancamentos'),
        top: document.getElementById('row-top') // Adicionado para página de séries
    },
    searchInput: document.getElementById('searchInput')
};

let originalMovies = [];

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Lógica de Roteamento Aprimorada
    if (path === "/" || path.endsWith("index.html") || path === "") {
        setupHomePage();
    } else if (path.includes("filme.html")) {
        setupPlayerPage();
    } else if (path.includes("series.html")) {
        // Se houver lógica específica para a página de séries, chame aqui
        // setupSeriesPage(); 
    }
    
    setupGlobalEvents();
});

/* ============================================================
   LÓGICA DO PLAYER (filme.html)
============================================================ */
function setupPlayerPage() {
    const item = JSON.parse(localStorage.getItem('lumina_selectedMovie'));
    
    if (!item) {
        window.location.href = '/';
        return;
    }

    const titleEl = document.getElementById('movieTitle');
    const descEl = document.getElementById('movieOverview');
    const bgEl = document.getElementById('movieBg');

    if (titleEl) titleEl.textContent = item.title || item.name;
    if (descEl) descEl.textContent = item.overview || "Sinopse indisponível.";
    if (bgEl) {
        const bgImg = item.backdrop_path ? `${IMG_PATH}${item.backdrop_path}` : `${IMG_PATH}${item.poster_path}`;
        bgEl.style.backgroundImage = `linear-gradient(to top, #040714, transparent), url(${bgImg})`;
    }

    const playerContainer = document.getElementById('playerContainer');
    if (playerContainer) {
        // Identifica se é Filme ou Série para montar a URL do Player
        const isTV = (item.first_air_date || item.media_type === 'tv');
        const type = isTV ? 'tv' : 'movie';
        
        // URL Dinâmica usando o ID do TMDB
        // Nota: Muitos players de terceiros aceitam o ID do TMDB diretamente
        playerContainer.innerHTML = `
            <iframe 
                src="https://embed.warezcdn.com/${type}/${item.id}" 
                frameborder="0" 
                scrolling="no" 
                allowfullscreen
                style="width: 100%; height: 100%; border-radius: 12px; background: #000;">
            </iframe>
        `;
    }
}

/* ============================================================
   NAVEGAÇÃO E AUXILIARES
============================================================ */
function goToDetails(item) {
    // Garante que o tipo de mídia seja salvo
    if (!item.media_type) {
        item.media_type = (item.title || item.release_date) ? 'movie' : 'tv';
    }
    localStorage.setItem('lumina_selectedMovie', JSON.stringify(item));
    window.location.href = '/filme.html';
}

async function getMovies(endpoint) {
    try {
        const urlSep = endpoint.includes('?') ? '&' : '?';
        const res = await fetch(`${BASE_URL}${endpoint}${urlSep}api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        return data.results || [];
    } catch (e) { 
        return []; 
    }
}

function renderRow(type, items) {
    const container = DOM.rows[type];
    if (!container || !items) return;
    container.innerHTML = ""; 

    items.forEach(item => {
        if (!item.poster_path) return;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="Poster" loading="lazy">`;
        card.onclick = () => goToDetails(item);
        container.appendChild(card);
    });
}

// ... manter funções de setupSearch, setupArrows e debounce como no original ...
