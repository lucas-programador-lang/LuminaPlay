/* ============================================================
   LUMINA PLAY - SERVICE WORKER & PLAYER DINÂMICO
============================================================ */

// 1. Registro do Service Worker (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('🚀 Lumina Play: PWA Ativo!'))
            .catch(err => console.error('❌ Falha no Service Worker:', err));
    });
}

/* ============================================================
   CONFIGURAÇÃO API
============================================================ */
const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/original"; 

const DOM = {
    hero: document.getElementById('hero'),
    heroTitle: document.getElementById('heroTitle'),
    heroOverview: document.getElementById('heroOverview'),
    heroWatch: document.getElementById('heroWatch'),
    heroFav: document.getElementById('heroFav'),
    rows: {
        populares: document.getElementById('row-populares'),
        emalta: document.getElementById('row-emalta'),
        lancamentos: document.getElementById('row-lancamentos')
    },
    searchInput: document.getElementById('searchInput')
};

let originalMovies = [];

/* ============================================================
   INICIALIZAÇÃO POR PÁGINA
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isHomePage = path.endsWith("index.html") || path.endsWith("/") || path === "" || !path.includes(".html");

    if (isHomePage) {
        setupHomePage();
    } else if (path.includes("filme.html")) {
        setupPlayerPage();
    }
    
    setupGlobalEvents();
});

/* ============================================================
   LÓGICA DA HOME
============================================================ */
async function setupHomePage() {
    if (!DOM.rows.populares) return;

    Object.keys(DOM.rows).forEach(key => showSkeleton(key));

    const [populares, emAlta, lancamentos] = await Promise.all([
        getMovies("/movie/popular"),
        getMovies("/trending/all/week"),
        getMovies("/movie/now_playing")
    ]);

    originalMovies = populares;

    if (populares.length > 0) renderHero(populares[Math.floor(Math.random() * 5)]);

    renderRow("populares", populares);
    renderRow("emalta", emAlta);
    renderRow("lancamentos", lancamentos);

    setupArrows();
    setupSearch();
}

/* ============================================================
   LÓGICA DO PLAYER (filme.html)
============================================================ */
function setupPlayerPage() {
    const movie = JSON.parse(localStorage.getItem('lumina_selectedMovie'));
    
    if (!movie) {
        window.location.href = 'index.html';
        return;
    }

    // Preencher detalhes visuais
    const titleEl = document.getElementById('movieTitle');
    const descEl = document.getElementById('movieOverview');
    const bgEl = document.getElementById('movieBg');

    if (titleEl) titleEl.textContent = movie.title || movie.name;
    if (descEl) descEl.textContent = movie.overview || "Sinopse indisponível.";
    if (bgEl) bgEl.style.backgroundImage = `linear-gradient(to top, #040714, transparent), url(${IMG_PATH}${movie.backdrop_path})`;

    // Inserir o Iframe do RedeCanais
    const playerContainer = document.getElementById('playerContainer');
    if (playerContainer) {
        // O ID 'JSTCARTFCL' é o exemplo fixo. 
        // Em um sistema real, você mapearia o movie.id para o ID do vídeo deles.
        const videoID = "JSTCARTFCL"; 

        playerContainer.innerHTML = `
            <iframe 
                name="Player" 
                src="https://redecanais.ooo/player3/server.php?server=RCFServer2&subfolder=ondemand&vid=${videoID}" 
                frameborder="0" 
                scrolling="no" 
                allow="encrypted-media" 
                allowFullScreen
                style="width: 100%; height: 100%; border-radius: 12px;">
            </iframe>
        `;
    }
}

/* ============================================================
   NAVEGAÇÃO E RENDERS
============================================================ */
function goToDetails(movie) {
    localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
    window.location.href = 'filme.html';
}

function renderRow(type, movies) {
    const container = DOM.rows[type];
    if (!container || !movies) return;
    container.innerHTML = ""; 

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Poster" loading="lazy">`;
        card.onclick = () => goToDetails(movie);
        container.appendChild(card);
    });
}

function renderHero(movie) {
    if (!DOM.hero || !movie) return;
    const bg = movie.backdrop_path ? `${IMG_PATH}${movie.backdrop_path}` : `${IMG_PATH}${movie.poster_path}`;
    DOM.hero.style.backgroundImage = `linear-gradient(to top, #040714 10%, transparent 50%), url(${bg})`;
    if (DOM.heroTitle) DOM.heroTitle.textContent = movie.title || movie.name;
    if (DOM.heroOverview) {
        const text = movie.overview || "Sinopse indisponível no momento.";
        DOM.heroOverview.textContent = text.length > 200 ? text.substring(0, 200) + "..." : text;
    }
    if (DOM.heroWatch) DOM.heroWatch.onclick = () => goToDetails(movie);
}

/* ============================================================
   API E AUXILIARES
============================================================ */
async function getMovies(endpoint) {
    const urlSep = endpoint.includes('?') ? '&' : '?';
    try {
        const res = await fetch(`${BASE_URL}${endpoint}${urlSep}api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        return data.results || [];
    } catch (e) { return []; }
}

function showSkeleton(type) {
    const container = DOM.rows[type];
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 8; i++) {
        const sk = document.createElement("div");
        sk.className = "skeleton";
        container.appendChild(sk);
    }
}

function setupSearch() {
    if (!DOM.searchInput) return;
    const sectionTitle = DOM.rows.populares.parentElement.querySelector('h3');

    DOM.searchInput.addEventListener("input", debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length === 0) {
            renderRow("populares", originalMovies);
            if (sectionTitle) sectionTitle.innerHTML = `<i class="fa-solid fa-fire-flame-curved" style="color:#00e5ff;"></i> Populares`;
            return;
        }
        if (query.length < 2) return;
        const results = await getMovies(`/search/multi?query=${encodeURIComponent(query)}`);
        renderRow("populares", results);
        if (sectionTitle) sectionTitle.textContent = `Resultados para: "${query}"`;
    }, 600));
}

function setupArrows() {
    document.querySelectorAll('.handle').forEach(btn => {
        btn.onclick = (e) => {
            const list = btn.parentElement.querySelector('.movie-list');
            const direction = btn.classList.contains('left') ? -600 : 600;
            list.scrollBy({ left: direction, behavior: 'smooth' });
        };
    });
}

function setupGlobalEvents() {
    const closeBtn = document.getElementById('playerClose');
    if (closeBtn) {
        closeBtn.onclick = () => {
            const overlay = document.getElementById('playerOverlay');
            if (overlay) overlay.classList.remove("active");
            const frame = document.getElementById('playerFrame');
            if (frame) frame.src = "";
        };
    }
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
