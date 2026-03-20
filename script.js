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
    // Melhorado: Verifica se é a página inicial independente do caminho do arquivo
    const isHomePage = window.location.pathname.endsWith("index.html") || 
                       window.location.pathname.endsWith("/") || 
                       window.location.pathname === "";

    if (isHomePage) {
        setupHomePage();
    }
    
    setupGlobalEvents();
}

async function setupHomePage() {
    // 1. Mostrar Skeletons
    Object.keys(DOM.rows).forEach(key => showSkeleton(key));

    // 2. Buscar Dados
    const populares = await getMovies("/movie/popular");
    const emAlta = await getMovies("/trending/movie/week");
    const lancamentos = await getMovies("/movie/now_playing");

    // 3. Renderizar
    if (populares.length > 0) renderHero(populares[0]);

    renderRow("populares", populares);
    renderRow("emalta", emAlta);
    renderRow("lancamentos", lancamentos);

    // 4. Configurar eventos da Home
    setupArrows();
    setupSearch();
}

/* =========================
   LÓGICA DE NAVEGAÇÃO E FAVORITOS
========================= */
function goToDetails(movie) {
    localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
    window.location.href = 'filme.html';
}

function saveToList(movie) {
    if (!movie) return;
    // Padronizado para "luminaLista" como no seu arquivo minha-lista.html
    let list = JSON.parse(localStorage.getItem("luminaLista") || "[]");
    
    if (!list.find(m => m.id === movie.id)) {
        list.push(movie);
        alert(`"${movie.title || movie.name}" adicionado à sua lista!`);
    } else {
        alert("Este item já está na sua lista.");
    }
    localStorage.setItem("luminaLista", JSON.stringify(list));
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
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">`;
        
        card.onclick = () => goToDetails(movie);
        container.appendChild(card);
    });
}

function renderHero(movie) {
    if (!DOM.hero || !movie) return;
    
    DOM.hero.style.backgroundImage = `url(${IMG}${movie.backdrop_path})`;
    if (DOM.heroTitle) DOM.heroTitle.textContent = movie.title || movie.name;
    
    if (DOM.heroOverview) {
        const text = movie.overview || "Sinopse indisponível.";
        DOM.heroOverview.textContent = text.length > 180 ? text.substring(0, 180) + "..." : text;
    }
    
    // Configura botões do Hero
    if (DOM.heroWatch) DOM.heroWatch.onclick = () => goToDetails(movie);
    if (DOM.heroFav) DOM.heroFav.onclick = () => saveToList(movie);
}

/* =========================
   FUNÇÕES AUXILIARES
========================= */
async function getMovies(endpoint) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        return data.results || [];
    } catch (e) { 
        console.error("Erro na API:", e);
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
            const direction = btn.classList.contains('left') ? -450 : 450;
            list.scrollBy({ left: direction, behavior: 'smooth' });
        };
    });
}

function setupSearch() {
    if (!DOM.searchInput) return;
    DOM.searchInput.addEventListener("input", debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 3) return;
        const results = await getMovies(`/search/movie?query=${encodeURIComponent(query)}`);
        renderRow("populares", results);
        
        const sectionTitle = DOM.rows.populares.parentElement.querySelector('h3');
        if (sectionTitle) sectionTitle.textContent = `Resultados para: ${query}`;
    }, 500));
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
