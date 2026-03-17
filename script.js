/* script.js — LuminaPlay
   - Mock dataset (>=12 filmes)
   - Render hero e carrosséis
   - Player overlay (iframe)
   - Responsividade e interações
*/

/* ----------------------
   Mock data
   ---------------------- */
const MOCK_MOVIES = [
  {
    id: 1, title: 'Noite de Lâmina', year: 2024, rating: 8.1, duration: '2h 10m',
    overview: 'Um thriller eletrizante sobre segredos, coragem e escolhas que mudam o destino.',
    poster: 'https://picsum.photos/seed/film1/300/450',
    backdrop: 'https://picsum.photos/seed/film1b/1200/700',
    trailer: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    genres: ['Ação','Thriller']
  },
  {
    id: 2, title: 'Caminho das Estrelas', year: 2022, rating: 7.9, duration: '1h 58m',
    overview: 'Uma odisséia emocional através do espaço e do coração humano.',
    poster: 'https://picsum.photos/seed/film2/300/450',
    backdrop: 'https://picsum.photos/seed/film2b/1200/700',
    trailer: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    genres: ['Ficção','Drama']
  },
  {
    id: 3, title: 'Sombra do Passado', year: 2021, rating: 7.2, duration: '1h 50m',
    overview: 'Mistério e memórias entrelaçadas em uma cidade que nunca esquece.',
    poster: 'https://picsum.photos/seed/film3/300/450',
    backdrop: 'https://picsum.photos/seed/film3b/1200/700',
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    genres: ['Mistério','Drama']
  },
  {
    id: 4, title: 'Refúgio Digital', year: 2025, rating: 8.6, duration: '2h 5m',
    overview: 'Hackers, ética e a linha tênue entre proteção e controle.',
    poster: 'https://picsum.photos/seed/film4/300/450',
    backdrop: 'https://picsum.photos/seed/film4b/1200/700',
    trailer: 'https://www.youtube.com/embed/5qap5aO4i9A',
    genres: ['Ação','Ficção']
  },
  {
    id: 5, title: 'Praia ao Entardecer', year: 2019, rating: 6.8, duration: '1h 42m',
    overview: 'Romance leve sobre encontros que mudam nossa visão do mundo.',
    poster: 'https://picsum.photos/seed/film5/300/450',
    backdrop: 'https://picsum.photos/seed/film5b/1200/700',
    trailer: 'https://www.youtube.com/embed/2Vv-BfVoq4g',
    genres: ['Romance','Drama']
  },
  {
    id: 6, title: 'Cidade Submersa', year: 2023, rating: 7.5, duration: '2h 0m',
    overview: 'Uma comunidade luta para sobreviver quando a cidade é tomada pelas águas.',
    poster: 'https://picsum.photos/seed/film6/300/450',
    backdrop: 'https://picsum.photos/seed/film6b/1200/700',
    trailer: 'https://www.youtube.com/embed/2vjPBrBU-TM',
    genres: ['Aventura','Ficção']
  },
  {
    id: 7, title: 'Jogada Final', year: 2020, rating: 7.8, duration: '1h 55m',
    overview: 'Em um mundo de apostas altas, apenas os mais espertos sobrevivem.',
    poster: 'https://picsum.photos/seed/film7/300/450',
    backdrop: 'https://picsum.photos/seed/film7b/1200/700',
    trailer: 'https://www.youtube.com/embed/60ItHLz5WEA',
    genres: ['Crime','Thriller']
  },
  {
    id: 8, title: 'A Luz Interior', year: 2018, rating: 8.0, duration: '1h 48m',
    overview: 'História inspiradora sobre superação e arte.',
    poster: 'https://picsum.photos/seed/film8/300/450',
    backdrop: 'https://picsum.photos/seed/film8b/1200/700',
    trailer: 'https://www.youtube.com/embed/04854XqcfCY',
    genres: ['Drama']
  },
  {
    id: 9, title: 'Operação Neblina', year: 2024, rating: 7.4, duration: '2h 12m',
    overview: 'Missão internacional com reviravoltas a cada capítulo.',
    poster: 'https://picsum.photos/seed/film9/300/450',
    backdrop: 'https://picsum.photos/seed/film9b/1200/700',
    trailer: 'https://www.youtube.com/embed/2XQe1Gz7tYE',
    genres: ['Ação','Crime']
  },
  {
    id: 10, title: 'Luz de Neon', year: 2017, rating: 6.5, duration: '1h 34m',
    overview: 'Noites longas e decisões curtas em uma cidade que nunca dorme.',
    poster: 'https://picsum.photos/seed/film10/300/450',
    backdrop: 'https://picsum.photos/seed/film10b/1200/700',
    trailer: 'https://www.youtube.com/embed/JGwWNGJdvx8',
    genres: ['Drama','Romance']
  },
  {
    id: 11, title: 'Fronteiras do Tempo', year: 2026, rating: 8.7, duration: '2h 20m',
    overview: 'Viagem no tempo, dilemas morais e consequências inesperadas.',
    poster: 'https://picsum.photos/seed/film11/300/450',
    backdrop: 'https://picsum.photos/seed/film11b/1200/700',
    trailer: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
    genres: ['Ficção','Aventura']
  },
  {
    id: 12, title: 'Pequenos Heróis', year: 2020, rating: 7.0, duration: '1h 30m',
    overview: 'Uma aventura familiar cheia de humor e coração.',
    poster: 'https://picsum.photos/seed/film12/300/450',
    backdrop: 'https://picsum.photos/seed/film12b/1200/700',
    trailer: 'https://www.youtube.com/embed/hLQl3WQQoQ0',
    genres: ['Família','Aventura']
  }
];

/* Persist all movies so film page can access them */
localStorage.setItem('lumina_allMovies', JSON.stringify(MOCK_MOVIES));

/* ----------------------
   Elements
   ---------------------- */
const hero = document.getElementById('hero');
const heroTitle = document.getElementById('heroTitle');
const heroOverview = document.getElementById('heroOverview');
const heroWatch = document.getElementById('heroWatch');
const heroMore = document.getElementById('heroMore');

const rows = {
  populares: document.getElementById('row-populares'),
  emalta: document.getElementById('row-emalta'),
  lancamentos: document.getElementById('row-lancamentos'),
  recomendados: document.getElementById('row-recomendados')
};

const playerOverlay = document.getElementById('playerOverlay');
const playerFrame = document.getElementById('playerFrame');
const playerClose = document.getElementById('playerClose');

const searchInput = document.getElementById('searchInput');
const themeBtn = document.getElementById('themeBtn');
const siteHeader = document.getElementById('siteHeader');

/* ----------------------
   Initialization
   ---------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // pick featured (first item of mock)
  const featured = MOCK_MOVIES[0];
  renderHero(featured);

  // populate rows with simple distribution
  renderRow('populares', MOCK_MOVIES.slice(0, 8));
  renderRow('emalta', rotateArray(MOCK_MOVIES, 3).slice(0, 8));
  renderRow('lancamentos', MOCK_MOVIES.filter(m => m.year >= 2023));
  renderRow('recomendados', rotateArray(MOCK_MOVIES, 6).slice(0, 8));

  // Wire up UI
  setupRowArrows();
  setupCardInteractions();
  setupPlayer();
  setupHeaderScroll();
  setupSearch();
  setupTheme();
});

/* ----------------------
   Render functions
   ---------------------- */
function renderHero(movie) {
  hero.style.backgroundImage = `url('${movie.backdrop}')`;
  heroTitle.textContent = movie.title;
  heroOverview.textContent = movie.overview;
  heroWatch.onclick = () => openPlayer(movie.trailer);
  heroMore.onclick = () => openDetails(movie);
}

function renderRow(key, movies) {
  const container = rows[key];
  if (!container) return;
  container.innerHTML = ''; // clear

  movies.forEach(movie => {
    const el = document.createElement('div');
    el.className = 'card';
    el.setAttribute('data-id', movie.id);
    el.innerHTML = `
      <img src="${movie.poster}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <div class="card-play">
        <button class="btn btn-info small-play" title="Assistir">▶</button>
      </div>
      <div class="card-title">${escapeHtml(movie.title)}</div>
    `;
    // click opens details
    el.addEventListener('click', (e) => {
      // avoid double action when pressing the small play button
      if (e.target.closest('.small-play')) {
        openPlayer(movie.trailer);
        return;
      }
      openDetails(movie);
    });
    container.appendChild(el);
  });
}

/* ----------------------
   Interactions
   ---------------------- */
function setupRowArrows() {
  // find all rows and wire left/right buttons
  document.querySelectorAll('.row').forEach(row => {
    const left = row.querySelector('.row-arrow.left');
    const right = row.querySelector('.row-arrow.right');
    const cards = row.querySelector('.row-cards');
    if (!cards) return;

    left && left.addEventListener('click', () => scrollRow(cards, -1));
    right && right.addEventListener('click', () => scrollRow(cards, 1));

    // allow keyboard horizontal scroll
    cards && cards.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') scrollRow(cards, 1);
      if (e.key === 'ArrowLeft') scrollRow(cards, -1);
    });
  });
}

function scrollRow(container, dir = 1) {
  const width = container.clientWidth * 0.7;
  container.scrollBy({ left: width * dir, behavior: 'smooth' });
}

function setupCardInteractions() {
  // Hover preview (small effect): we already have CSS hover.
  // Additional features could be added here (e.g., show quick info)
}

function openDetails(movie) {
  // Save to localStorage and navigate to film page (front-end only)
  localStorage.setItem('lumina_selectedMovie', JSON.stringify(movie));
  window.location.href = 'filme.html';
}

/* ----------------------
   Player overlay
   ---------------------- */
function setupPlayer() {
  // close button
  playerClose && playerClose.addEventListener('click', closePlayer);

  // close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlayer();
  });

  // click outside to close
  playerOverlay && playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) closePlayer();
  });
}

function openPlayer(url) {
  playerFrame.src = url || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
  playerOverlay.classList.add('active');
  playerOverlay.setAttribute('aria-hidden', 'false');
}

function closePlayer() {
  playerOverlay.classList.remove('active');
  playerOverlay.setAttribute('aria-hidden', 'true');
  playerFrame.src = '';
}

/* ----------------------
   Helpers & extras
   ---------------------- */
function rotateArray(arr, n = 1) {
  const copy = arr.slice();
  for (let i = 0; i < n; i++) copy.push(copy.shift());
  return copy;
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

/* Header background change on scroll */
function setupHeaderScroll() {
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    // subtle darkening:
    header.style.background = (y > 50) ? 'rgba(0,0,0,0.9)' : 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 100%)';
    lastScroll = y;
  });
}

/* Search (client-side mock filter) */
function setupSearch() {
  searchInput && searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      renderRow('populares', MOCK_MOVIES.slice(0, 8));
      renderRow('emalta', rotateArray(MOCK_MOVIES, 3).slice(0, 8));
      return;
    }
    const results = MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
    renderRow('populares', results.slice(0, 8));
    renderRow('emalta', results.slice(8, 16));
  });
}

/* Theme toggle (simple: light class toggles body) */
function setupTheme() {
  const stored = localStorage.getItem('lumina_theme');
  if (stored === 'light') document.body.classList.add('light-theme');

  themeBtn && themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('lumina_theme', isLight ? 'light' : 'dark');
  });
}

/* Accessibility: ensure playerClose is available on load */
document.addEventListener('DOMContentLoaded', () => {
  // Attach global handlers for any dynamically added elements if needed
});
