/* =========================
   LuminaPlay — CONFIGURAÇÃO API
========================= */
const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original"; 

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
    playerOverlay: document.getElementById('playerOverlay'),
    playerFrame: document.getElementById('playerFrame'),
    playerClose: document.getElementById('playerClose'),
    searchInput: document.getElementById('searchInput')
};

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Correção na verificação da Home: mais robusto para evitar erros em subpáginas
    const path = window.location.pathname;
    const isHomePage = path.endsWith("index.html") || path.endsWith("/") || path === "" || !path.includes(".html");

    if (isHomePage && DOM.rows.populares) {
        setupHomePage();
    }
    
    setupGlobalEvents();
}

async function setupHomePage() {
    // 1. Mostrar Skeletons (Animação de carregamento)
    Object.keys(DOM.rows).forEach(key => showSkeleton(key));

    // 2. Buscar Dados da API
    const [populares, emAlta, lancamentos] = await Promise.all([
        getMovies("/movie/popular"),
        getMovies("/trending/all/week"), // Trending ALL para pegar séries e filmes em alta
        getMovies("/movie/now_playing")
    ]);

    // 3. Renderizar Hero (Destaque principal)
    if (populares.length > 0) renderHero(populares[Math.floor(Math.random() * 5)]); // Pega um dos 5 primeiros aleatoriamente

    // 4. Renderizar Fileiras
    renderRow("populares", populares);
    renderRow("emalta", emAlta);
    renderRow("lancamentos", lancamentos);

    // 5. Configurar eventos
    setupArrows();
    setupSearch();
}

/* =========================
   LÓGICA DE NAVEGAÇÃO E FAVORITOS
========================= */
function goToDetails(movie) {
    // Salva o objeto completo para a página filme.html ler
    localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
    window.location.href = 'filme.html';
}

function saveToList(movie) {
    if (!movie) return;
    let list = JSON.parse(localStorage.getItem("luminaLista") || "[]");
    
    if (!list.find(m => m.id === movie.id)) {
        list.push(movie);
        localStorage.setItem("luminaLista", JSON.stringify(list));
        alert(`✅ "${movie.title || movie.name}" adicionado à sua lista!`);
    } else {
        alert("ℹ️ Este item já está na sua lista.");
    }
}

/* =========================
   RENDERIZAÇÃO
========================= */
function renderRow(type, movies) {
    const container = DOM.rows[type];
    if (!container || !movies) return;
    container.innerHTML = ""; 

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">`;
        
        card.onclick = () => goToDetails(movie);
        container.appendChild(card);
    });
}

function renderHero(movie) {
    if (!DOM.hero || !movie) return;
    
    const bg = movie.backdrop_path ? `${IMG}${movie.backdrop_path}` : `${IMG}${movie.poster_path}`;
    DOM.hero.style.backgroundImage = `url(${bg})`;
    
    if (DOM.heroTitle) DOM.heroTitle.textContent = movie.title || movie.name;
    
    if (DOM.heroOverview) {
        const text = movie.overview || "Sinopse indisponível no momento.";
        DOM.heroOverview.textContent = text.length > 200 ? text.substring(0, 200) + "..." : text;
    }
    
    // Configura botões do Hero
    if (DOM.heroWatch) DOM.heroWatch.onclick = () => goToDetails(movie);
    if (DOM.heroFav) DOM.heroFav.onclick = (e) => {
        e.stopPropagation();
        saveToList(movie);
    };
}

/* =========================
   FUNÇÕES AUXILIARES E EVENTOS
========================= */
async function getMovies(endpoint) {
    const urlSep = endpoint.includes('?') ? '&' : '?';
    try {
        const res = await fetch(`${BASE_URL}${endpoint}${urlSep}api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        return data.results || [];
    } catch (e) { 
        console.error("Erro na API Lumina:", e);
        return []; 
    }
}

function setupGlobalEvents() {
    if (DOM.playerClose) {
        DOM.playerClose.onclick = () => {
            DOM.playerOverlay.classList.remove("active");
            DOM.playerFrame.src = "";
        };
    }
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

function setupArrows() {
    document.querySelectorAll('.handle').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const list = btn.parentElement.querySelector('.movie-list');
            const direction = btn.classList.contains('left') ? -500 : 500;
            list.scrollBy({ left: direction, behavior: 'smooth' });
        };
    });
}

function setupSearch() {
    if (!DOM.searchInput) return;
    DOM.searchInput.addEventListener("input", debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) return;
        
        const results = await getMovies(`/search/multi?query=${encodeURIComponent(query)}`);
        renderRow("populares", results);
        
        const sectionTitle = DOM.rows.populares.parentElement.querySelector('h3');
        if (sectionTitle) sectionTitle.textContent = `Resultados para: "${query}"`;
    }, 600));
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
