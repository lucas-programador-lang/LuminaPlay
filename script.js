/* =========================
   LuminaPlay — Script PRO FINAL
========================= */

const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

/* =========================
   FAVORITOS (Minha Lista)
========================= */
function getFavorites() {
  return JSON.parse(localStorage.getItem("lumina_favorites") || "[]");
}

function saveFavorites(list) {
  localStorage.setItem("lumina_favorites", JSON.stringify(list));
}

function isFavorite(id) {
  return getFavorites().some(m => m.id === id);
}

function toggleFavorite(movie) {
  let favs = getFavorites();

  if (isFavorite(movie.id)) {
    favs = favs.filter(m => m.id !== movie.id);
  } else {
    favs.push(movie);
  }

  saveFavorites(favs);
}

/* =========================
   DOM
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
    lancamentos: document.getElementById('row-lancamentos'),
    recomendados: document.getElementById('row-recomendados')
  },

  playerOverlay: document.getElementById('playerOverlay'),
  playerFrame: document.getElementById('playerFrame'),
  playerClose: document.getElementById('playerClose'),

  searchInput: document.getElementById('searchInput'),
  themeBtn: document.getElementById('themeBtn'),
  header: document.getElementById('siteHeader')
};

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', init);

async function init() {

  const populares = await getMovies("/movie/popular");
  const emAlta = await getMovies("/trending/movie/week");
  const lancamentos = await getMovies("/movie/now_playing");
  const recomendados = await getMovies("/movie/top_rated");

  localStorage.setItem('lumina_allMovies', JSON.stringify([
    ...populares, ...emAlta, ...lancamentos, ...recomendados
  ]));

  renderHero(populares[0]);

  renderRow("populares", populares);
  renderRow("emalta", emAlta);
  renderRow("lancamentos", lancamentos);
  renderRow("recomendados", recomendados);

  setupUI();
}

/* =========================
   API
========================= */
async function getMovies(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`);
  const data = await res.json();

  return data.results.map(movie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster: movie.poster_path ? IMG + movie.poster_path : "",
    backdrop: movie.backdrop_path ? IMG + movie.backdrop_path : "",
    rating: movie.vote_average,
    year: movie.release_date?.split("-")[0],
    trailer: null
  }));
}

async function getTrailer(id) {
  const res = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
  const data = await res.json();
  const t = data.results.find(v => v.type === "Trailer");

  return t
    ? `https://www.youtube.com/embed/${t.key}`
    : "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

/* =========================
   HERO
========================= */
function renderHero(movie) {
  DOM.hero.style.backgroundImage = `url('${movie.backdrop}')`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;

  DOM.heroWatch.onclick = async () => {
    openPlayer(await getTrailer(movie.id));
  };

  updateHeroFav(movie);
}

function updateHeroFav(movie) {
  if (!DOM.heroFav) return;

  const update = () => {
    if (isFavorite(movie.id)) {
      DOM.heroFav.innerHTML = `<i class="fa-solid fa-check"></i> Na Lista`;
    } else {
      DOM.heroFav.innerHTML = `<i class="fa-solid fa-plus"></i> Minha Lista`;
    }
  };

  update();

  DOM.heroFav.onclick = () => {
    toggleFavorite(movie);
    update();
  };
}

/* =========================
   CARDS
========================= */
function renderRow(key, movies) {
  const container = DOM.rows[key];
  if (!container) return;

  container.innerHTML = "";

  movies.forEach(movie => {
    container.appendChild(createCard(movie));
  });
}

function createCard(movie) {
  const el = document.createElement("div");
  el.className = "card";

  const favIcon = isFavorite(movie.id)
    ? `<i class="fa-solid fa-check"></i>`
    : `<i class="fa-solid fa-plus"></i>`;

  el.innerHTML = `
    <img src="${movie.poster}">
    
    <div class="card-play">
      <button class="small-play">▶</button>
      <button class="fav-btn">${favIcon}</button>
    </div>

    <div class="card-title">${movie.title}</div>
  `;

  el.querySelector(".small-play").onclick = async (e) => {
    e.stopPropagation();
    openPlayer(await getTrailer(movie.id));
  };

  el.querySelector(".fav-btn").onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
    renderRow("populares", JSON.parse(localStorage.getItem('lumina_allMovies')));
  };

  el.onclick = () => openDetails(movie);

  return el;
}

/* =========================
   PLAYER
========================= */
function openPlayer(url) {
  DOM.playerFrame.src = url + "?autoplay=1";
  DOM.playerOverlay.classList.add("active");
}

function closePlayer() {
  DOM.playerOverlay.classList.remove("active");
  DOM.playerFrame.src = "";
}

/* =========================
   NAV
========================= */
function openDetails(movie) {
  localStorage.setItem("lumina_selectedMovie", JSON.stringify(movie));
  location.href = "filme.html";
}

/* =========================
   UI
========================= */
function setupUI() {
  DOM.playerClose.onclick = closePlayer;

  DOM.playerOverlay.onclick = (e) => {
    if (e.target === DOM.playerOverlay) closePlayer();
  };
}

/* =========================
   SEARCH
========================= */
DOM.searchInput?.addEventListener("input", async (e) => {
  const q = e.target.value;

  if (!q) return init();

  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`);
  const data = await res.json();

  renderRow("populares", data.results.map(m => ({
    id: m.id,
    title: m.title,
    poster: IMG + m.poster_path,
    backdrop: IMG + m.backdrop_path
  })));
});
