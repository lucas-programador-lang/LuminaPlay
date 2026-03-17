/* =========================
   LuminaPlay — Script PRO (API REAL)
========================= */

/* =========================
   CONFIG API (TMDB)
========================= */
const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"; // 🔴 coloque sua chave aqui
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

/* =========================
   DOM Cache
========================= */
const DOM = {
  hero: document.getElementById('hero'),
  heroTitle: document.getElementById('heroTitle'),
  heroOverview: document.getElementById('heroOverview'),
  heroWatch: document.getElementById('heroWatch'),
  heroMore: document.getElementById('heroMore'),

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

  // salvar tudo
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
    title: movie.title || movie.name,
    overview: movie.overview,
    poster: movie.poster_path ? IMG + movie.poster_path : "https://via.placeholder.com/300x450",
    backdrop: movie.backdrop_path ? IMG + movie.backdrop_path : "",
    rating: movie.vote_average,
    year: movie.release_date ? movie.release_date.split("-")[0] : "—",
    duration: "—",
    trailer: null,
    genres: []
  }));
}

async function getTrailer(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await res.json();

  const trailer = data.results.find(v => v.type === "Trailer");

  return trailer
    ? `https://www.youtube.com/embed/${trailer.key}`
    : "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

/* =========================
   Render
========================= */
function renderHero(movie) {
  DOM.hero.style.backgroundImage = `url('${movie.backdrop}')`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;

  DOM.heroWatch.onclick = async () => {
    const trailer = await getTrailer(movie.id);
    openPlayer(trailer);
  };

  DOM.heroMore.onclick = () => openDetails(movie);
}

function renderRow(key, movies) {
  const container = DOM.rows[key];
  if (!container) return;

  const fragment = document.createDocumentFragment();

  movies.forEach(movie => {
    const card = createCard(movie);
    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

function createCard(movie) {
  const el = document.createElement('div');
  el.className = 'card';

  el.innerHTML = `
    <img src="${movie.poster}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <div class="card-play">
      <button class="btn btn-info small-play">▶</button>
    </div>
    <div class="card-title">${escapeHtml(movie.title)}</div>
  `;

  el.addEventListener('click', async (e) => {
    if (e.target.closest('.small-play')) {
      const trailer = await getTrailer(movie.id);
      openPlayer(trailer);
      return;
    }
    openDetails(movie);
  });

  return el;
}

/* =========================
   Player
========================= */
function openPlayer(url) {
  DOM.playerFrame.src = `${url}?autoplay=1`;
  DOM.playerOverlay.classList.add('active');
}

function closePlayer() {
  DOM.playerOverlay.classList.remove('active');
  DOM.playerFrame.src = '';
}

/* =========================
   Navegação
========================= */
function openDetails(movie) {
  localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
  window.location.href = 'filme.html';
}

/* =========================
   UI Setup
========================= */
function setupUI() {
  setupScrollHeader();
  setupPlayerControls();
  setupSearch();
  setupTheme();
  setupRows();
}

function setupScrollHeader() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    DOM.header.classList.toggle('scrolled', y > 30);
  });
}

function setupPlayerControls() {
  DOM.playerClose?.addEventListener('click', closePlayer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlayer();
  });

  DOM.playerOverlay?.addEventListener('click', (e) => {
    if (e.target === DOM.playerOverlay) closePlayer();
  });
}

/* =========================
   SEARCH REAL 🔥
========================= */
function setupSearch() {
  let timeout;

  DOM.searchInput?.addEventListener('input', (e) => {
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const q = e.target.value.trim();

      if (!q) return init();

      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`);
      const data = await res.json();

      const results = data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster: movie.poster_path ? IMG + movie.poster_path : "",
        backdrop: movie.backdrop_path ? IMG + movie.backdrop_path : "",
        rating: movie.vote_average,
        year: movie.release_date?.split("-")[0],
        duration: "—",
        genres: []
      }));

      renderRow("populares", results);
      renderRow("emalta", []);
    }, 300);
  });
}

/* =========================
   Theme
========================= */
function setupTheme() {
  const saved = localStorage.getItem('lumina_theme');

  if (saved === 'light') document.body.classList.add('light-theme');

  DOM.themeBtn?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('lumina_theme', isLight ? 'light' : 'dark');
  });
}

/* =========================
   Row scroll
========================= */
function setupRows() {
  document.querySelectorAll('.row').forEach(row => {
    const left = row.querySelector('.left');
    const right = row.querySelector('.right');
    const cards = row.querySelector('.row-cards');

    left?.addEventListener('click', () => scroll(cards, -1));
    right?.addEventListener('click', () => scroll(cards, 1));
  });
}

function scroll(container, dir) {
  container.scrollBy({
    left: container.clientWidth * 0.7 * dir,
    behavior: 'smooth'
  });
}

/* =========================
   Utils
========================= */
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]
  );
}
