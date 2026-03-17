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

  rows: {
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

  showSkeleton("row-populares");
  showSkeleton("row-emalta");
  showSkeleton("row-lancamentos");

  const populares = await getMovies("/movie/popular");
  const emAlta = await getMovies("/trending/movie/week");
  const lancamentos = await getMovies("/movie/now_playing");

  renderHero(populares[0]);

  renderRow("populares", populares);
  renderRow("emalta", emAlta);
  renderRow("lancamentos", lancamentos);

  setupPlayer();
  setupArrows(); // 🔥 IMPORTANTE
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
    backdrop: movie.backdrop_path ? IMG + movie.backdrop_path : ""
  }));
}

async function getTrailer(id){
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
function renderHero(movie){
  DOM.hero.style.backgroundImage = `url('${movie.backdrop}')`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;

  DOM.heroWatch.onclick = async () => {
    openPlayer(await getTrailer(movie.id));
  };
}

/* =========================
   ROW
========================= */
function renderRow(key, movies){
  const container = DOM.rows[key];
  if(!container) return;

  container.innerHTML = "";

  movies.forEach(movie => {
    container.appendChild(createCard(movie));
  });
}

/* =========================
   CARD
========================= */
function createCard(movie){
  const el = document.createElement("div");
  el.className = "card";

  el.innerHTML = `
    <img src="${movie.poster}">
    <div class="card-title">${movie.title}</div>
  `;

  el.onclick = async () => {
    animateClick(el);
    openPlayer(await getTrailer(movie.id));
  };

  return el;
}

/* =========================
   PLAYER
========================= */
function openPlayer(url){
  DOM.playerFrame.src = url + "?autoplay=1";
  DOM.playerOverlay.classList.add("active");
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
}

/* =========================
   ANIMAÇÃO CLICK
========================= */
function animateClick(el){
  el.style.transform = "scale(0.9)";
  setTimeout(() => {
    el.style.transform = "";
  }, 150);
}

/* =========================
   SKELETON
========================= */
function showSkeleton(id){
  const row = document.getElementById(id);
  if(!row) return;

  row.innerHTML = "";

  for(let i=0;i<8;i++){
    const div = document.createElement("div");
    div.className = "skeleton";
    row.appendChild(div);
  }
}

/* =========================
   🔥 SETAS FUNCIONANDO
========================= */
function setupArrows(){

  document.querySelectorAll('.row').forEach(row => {

    const left = row.querySelector('.left');
    const right = row.querySelector('.right');
    const container = row.querySelector('.row-cards');

    if(!container) return;

    left?.addEventListener('click', () => {
      container.scrollBy({
        left: -container.clientWidth * 0.8,
        behavior: 'smooth'
      });
    });

    right?.addEventListener('click', () => {
      container.scrollBy({
        left: container.clientWidth * 0.8,
        behavior: 'smooth'
      });
    });

  });

}
