/* =========================
   LuminaPlay — Script Pro
========================= */

/* ----------------------
   Mock Data
---------------------- */
const MOCK_MOVIES = [
  // (mantive seus dados exatamente iguais)
  // 👉 pode deixar como está
];

/* Persistência */
localStorage.setItem('lumina_allMovies', JSON.stringify(MOCK_MOVIES));

/* ----------------------
   DOM Cache
---------------------- */
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

/* ----------------------
   INIT
---------------------- */
document.addEventListener('DOMContentLoaded', init);

function init() {
  const featured = MOCK_MOVIES[0];

  renderHero(featured);
  renderAllRows();

  setupUI();
}

/* ----------------------
   Render
---------------------- */
function renderHero(movie) {
  DOM.hero.style.backgroundImage = `url('${movie.backdrop}')`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;

  DOM.heroWatch.onclick = () => openPlayer(movie.trailer);
  DOM.heroMore.onclick = () => openDetails(movie);
}

function renderAllRows() {
  renderRow('populares', MOCK_MOVIES.slice(0, 8));
  renderRow('emalta', rotateArray(MOCK_MOVIES, 3).slice(0, 8));
  renderRow('lancamentos', MOCK_MOVIES.filter(m => m.year >= 2023));
  renderRow('recomendados', rotateArray(MOCK_MOVIES, 6).slice(0, 8));
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
  el.dataset.id = movie.id;

  el.innerHTML = `
    <img src="${movie.poster}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <div class="card-play">
      <button class="btn btn-info small-play">▶</button>
    </div>
    <div class="card-title">${escapeHtml(movie.title)}</div>
  `;

  el.addEventListener('click', (e) => {
    if (e.target.closest('.small-play')) {
      openPlayer(movie.trailer);
      return;
    }
    openDetails(movie);
  });

  return el;
}

/* ----------------------
   Player
---------------------- */
function openPlayer(url) {
  DOM.playerFrame.src = `${url}?autoplay=1`;
  DOM.playerOverlay.classList.add('active');
  DOM.playerOverlay.setAttribute('aria-hidden', 'false');
}

function closePlayer() {
  DOM.playerOverlay.classList.remove('active');
  DOM.playerOverlay.setAttribute('aria-hidden', 'true');
  DOM.playerFrame.src = '';
}

/* ----------------------
   Navegação
---------------------- */
function openDetails(movie) {
  localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
  window.location.href = 'filme.html';
}

/* ----------------------
   UI Setup
---------------------- */
function setupUI() {
  setupScrollHeader();
  setupPlayerControls();
  setupSearch();
  setupTheme();
  setupRows();
}

/* Header scroll */
function setupScrollHeader() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    DOM.header.classList.toggle('scrolled', y > 30);
    DOM.header.style.background =
      y > 50
        ? 'rgba(0,0,0,0.9)'
        : 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)';
  });
}

/* Player controls */
function setupPlayerControls() {
  DOM.playerClose?.addEventListener('click', closePlayer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlayer();
  });

  DOM.playerOverlay?.addEventListener('click', (e) => {
    if (e.target === DOM.playerOverlay) closePlayer();
  });
}

/* Search */
function setupSearch() {
  let timeout;

  DOM.searchInput?.addEventListener('input', (e) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      const q = e.target.value.toLowerCase().trim();

      if (!q) return renderAllRows();

      const results = MOCK_MOVIES.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q)
      );

      renderRow('populares', results.slice(0, 8));
      renderRow('emalta', results.slice(8, 16));
    }, 200); // debounce
  });
}

/* Theme */
function setupTheme() {
  const saved = localStorage.getItem('lumina_theme');

  if (saved === 'light') document.body.classList.add('light-theme');

  DOM.themeBtn?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');

    localStorage.setItem('lumina_theme', isLight ? 'light' : 'dark');
  });
}

/* Row scroll */
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

/* ----------------------
   Utils
---------------------- */
function rotateArray(arr, n = 1) {
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]
  );
}
