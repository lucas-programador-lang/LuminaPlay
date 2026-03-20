/* =========================
   LuminaPlay — CONFIGURAÇÃO API
========================= */
const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original"; 

/* =========================
   MAPEAMENTO DO DOM
========================= */
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
    // 1. Mostrar Skeletons (efeito de carregamento)
    Object.keys(DOM.rows).forEach(key => showSkeleton(key));

    // 2. Buscar Dados reais da API
    const populares = await getMovies("/movie/popular");
    const emAlta = await getMovies("/trending/movie/week");
    const lancamentos = await getMovies("/movie/now_playing");

    // 3. Renderizar o filme de destaque (Hero)
    if (populares.length > 0) {
        renderHero(populares[0]);
    }

    // 4. Preencher as fileiras com os filmes
    renderRow("populares", populares);
    renderRow("emalta", emAlta);
    renderRow("lancamentos", lancamentos);

    // 5. Ativar funções de interação
    setupPlayer();
    setupArrows();
    setupSearch();
}

/* =========================
   FUNÇÕES DE API
========================= */
async function getMovies(endpoint) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        return data.results || [];
    } catch (e) {
        console.error("Erro na busca da API:", e);
        return [];
    }
}

/* =========================
   RENDERIZAÇÃO DO HERO
========================= */
function renderHero(movie) {
    if (!DOM.hero || !movie) return;

    const backdrop = movie.backdrop_path ? `${IMG}${movie.backdrop_path}` : '';
    DOM.hero.style.backgroundImage = `url(${backdrop})`;

    if (DOM.heroTitle) DOM.heroTitle.textContent = movie.title;
    if (DOM.heroOverview) {
        const text = movie.overview || "Sinopse não disponível no momento.";
        DOM.heroOverview.textContent = text.length > 200 ? text.substring(0, 200) + "..." : text;
    }

    DOM.heroWatch.onclick = () => openPlayer(movie);
    DOM.heroFav.onclick = () => saveToList(movie);
}

/* =========================
   RENDERIZAÇÃO DAS FILEIRAS
========================= */
function renderRow(type, movies) {
    const container = DOM.rows[type];
    if (!container || !movies) return;

    container.innerHTML = ""; // Limpa os skeletons

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">`;
        
        card.onclick = () => openPlayer(movie);
        container.appendChild(card);
    });
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

/* =========================
   SISTEMA DE PLAYER
========================= */
function setupPlayer() {
    if (DOM.playerClose) {
        DOM.playerClose.onclick = closePlayer;
    }
    // Fecha o player se clicar fora da área do vídeo
    window.onclick = (event) => {
        if (event.target == DOM.playerOverlay) closePlayer();
    };
}

function openPlayer(movie) {
    if (!DOM.playerOverlay || !DOM.playerFrame) return;
    DOM.playerOverlay.classList.add("active");
    // Link de trailer padrão (pode ser substituído por busca de vídeos da API no futuro)
    DOM.playerFrame.src = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
}

function closePlayer() {
    DOM.playerOverlay.classList.remove("active");
    DOM.playerFrame.src = "";
}

/* =========================
   SETAS DO CARROSSEL
========================= */
function setupArrows() {
    document.querySelectorAll(".row").forEach(row => {
        const list = row.querySelector(".row-cards");
        const btnLeft = row.querySelector(".left");
        const btnRight = row.querySelector(".right");

        if (btnLeft && btnRight && list) {
            btnLeft.onclick = () => list.scrollBy({ left: -450, behavior: "smooth" });
            btnRight.onclick = () => list.scrollBy({ left: 450, behavior: "smooth" });
        }
    });
}

/* =========================
   BUSCA DINÂMICA
========================= */
function setupSearch() {
    if (!DOM.searchInput) return;

    DOM.searchInput.addEventListener("input", debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 3) return;

        try {
            const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            const results = data.results || [];
            
            renderRow("populares", results);
            const titleElement = DOM.rows.populares.closest('.row').querySelector('h3');
            if (titleElement) titleElement.textContent = `Resultados para: ${query}`;
        } catch (err) {
            console.error("Erro na busca:", err);
        }
    }, 500));
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

/* =========================
   MINHA LISTA (LocalStorage)
========================= */
function saveToList(movie) {
    if (!movie) return;
    let list = JSON.parse(localStorage.getItem("luminaLista") || "[]");
    if (!list.find(m => m.id === movie.id)) {
        list.push(movie);
        alert(`"${movie.title}" foi adicionado aos seus favoritos!`);
    } else {
        alert("Este filme já está na sua lista.");
    }
    localStorage.setItem("luminaLista", JSON.stringify(list));
}
