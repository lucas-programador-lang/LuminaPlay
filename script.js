/* =========================
   LuminaPlay — Script FINAL PRO
========================= */

const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

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
    continuar: document.getElementById('row-continuar'),
    populares: document.getElementById('row-populares'),
    emalta: document.getElementById('row-emalta'),
    lancamentos: document.getElementById('row-lancamentos'),
    recomendados: document.getElementById('row-recomendados')
  },

  playerOverlay: document.getElementById('playerOverlay'),
  playerFrame: document.getElementById('playerFrame'),
  playerClose: document.getElementById('playerClose'),

  searchInput: document.getElementById('searchInput')
};

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', init);

async function init(){

  // Skeleton Loading
  Object.values(DOM.rows).forEach(r => showSkeleton(r.id));

  // Fetch Movies
  const populares = await getMovies("/movie/popular");
  const emAlta = await getMovies("/trending/movie/week");
  const lancamentos = await getMovies("/movie/now_playing");
  const recomendados = await getMovies("/movie/top_rated");

  // Hero
  renderHero(populares[0]);

  // Render Rows
  renderRow("populares", populares);
  renderRow("emalta", emAlta);
  renderRow("lancamentos", lancamentos);
  renderRow("recomendados", recomendados);

  // Render Continue Watching
  renderContinueWatching();

  setupPlayer();
  setupArrows();
  setupSearch();
  setupFavorites();
}

/* =========================
   API
========================= */
async function getMovies(endpoint){
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`);
  const data = await res.json();

  return data.results.map(movie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster: movie.poster_path ? IMG + movie.poster_path : "",
    backdrop: movie.backdrop_path ? IMG + movie.backdrop_path : "",
    trailer: null
  }));
}

async function getTrailer(id){
  const res = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
  const data = await res.json();
  const t = data.results.find(v => v.type === "Trailer");
  return t ? `https://www.youtube.com/embed/${t.key}` : "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

/* =========================
   HERO
========================= */
function renderHero(movie){
  DOM.hero.style.backgroundImage = `url('${movie.backdrop}')`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;
  DOM.heroWatch.onclick = async () => openPlayer(await getTrailer(movie.id), movie);
  updateHeroFav(movie);
}

/* =========================
   FAVORITOS / MINHA LISTA
========================= */
function getFavorites(){
  return JSON.parse(localStorage.getItem("lumina_favorites") || "[]");
}

function saveFavorites(list){
  localStorage.setItem("lumina_favorites", JSON.stringify(list));
}

function isFavorite(id){
  return getFavorites().some(m => m.id === id);
}

function toggleFavorite(movie){
  let favs = getFavorites();
  if(isFavorite(movie.id)){
    favs = favs.filter(m => m.id !== movie.id);
  } else {
    favs.push(movie);
  }
  saveFavorites(favs);
}

function updateHeroFav(movie){
  if(!DOM.heroFav) return;
  const update = () => {
    DOM.heroFav.innerHTML = isFavorite(movie.id)
      ? `<i class="fa-solid fa-check"></i> Na Lista`
      : `<i class="fa-solid fa-plus"></i> Minha Lista`;
  };
  update();
  DOM.heroFav.onclick = () => {
    toggleFavorite(movie);
    update();
  };
}

/* =========================
   CONTINUAR ASSISTINDO
========================= */
function saveContinueWatching(movie){
  let list = JSON.parse(localStorage.getItem("lumina_continue") || "[]");
  list = list.filter(m => m.id !== movie.id);
  list.unshift(movie);
  list = list.slice(0,10);
  localStorage.setItem("lumina_continue", JSON.stringify(list));
}

function renderContinueWatching(){
  const data = JSON.parse(localStorage.getItem("lumina_continue") || "[]");
  if(!data.length) return;
  renderRow("continuar", data);
}

/* =========================
   ROW & CARD
========================= */
function renderRow(key, movies){
  const container = DOM.rows[key];
  if(!container) return;
  container.innerHTML = "";
  movies.forEach(movie => container.appendChild(createCard(movie)));
}

function createCard(movie){
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `<img src="${movie.poster}"><div class="card-title">${movie.title}</div>`;
  el.onclick = async () => {
    animateClick(el);
    openPlayer(await getTrailer(movie.id), movie);
  };
  return el;
}

/* =========================
   PLAYER
========================= */
function openPlayer(url, movie){
  DOM.playerFrame.src = url + "?autoplay=1";
  DOM.playerOverlay.classList.add("active");
  if(movie) saveContinueWatching(movie);
}

function setupPlayer(){
  DOM.playerClose.onclick = () => {
    DOM.playerOverlay.classList.remove("active");
    DOM.playerFrame.src = "";
  };
  DOM.playerOverlay.onclick = (e) => {
    if(e.target === DOM.playerOverlay){
      DOM.playerOverlay.classList.remove("active");
      DOM.playerFrame.src = "";
    }
  };
  document.addEventListener('keydown', e => {
    if(e.key === "Escape"){
      DOM.playerOverlay.classList.remove("active");
      DOM.playerFrame.src = "";
    }
  });
}

/* =========================
   ANIMAÇÃO CLICK
========================= */
function animateClick(el){
  el.style.transform = "scale(0.9)";
  setTimeout(()=>{ el.style.transform = ""; }, 150);
}

/* =========================
   SKELETON LOADING
========================= */
function showSkeleton(id){
  const row = DOM.rows[id];
  if(!row) return;
  row.innerHTML = "";
  for(let i=0;i<8;i++){
    const div = document.createElement("div");
    div.className = "skeleton";
    row.appendChild(div);
  }
}

/* =========================
   SETAS FUNCIONANDO
========================= */
function setupArrows(){
  document.querySelectorAll('.row').forEach(row => {
    const left = row.querySelector('.left');
    const right = row.querySelector('.right');
    const container = row.querySelector('.row-cards');
    if(!container) return;
    left?.addEventListener('click', () => container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' }));
    right?.addEventListener('click', () => container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' }));
  });
}

/* =========================
   SEARCH
========================= */
function setupSearch(){
  DOM.searchInput?.addEventListener('input', async e => {
    const q = e.target.value.trim();
    if(!q) return init();
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`);
    const data = await res.json();
    renderRow("populares", data.results.map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: m.poster_path ? IMG + m.poster_path : "",
      backdrop: m.backdrop_path ? IMG + m.backdrop_path : ""
    })));
  });
}
