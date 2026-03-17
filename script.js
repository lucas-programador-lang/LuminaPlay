/* =========================
   LuminaPlay — SCRIPT FINAL CORRIGIDO COMPLETO
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

  Object.keys(DOM.rows).forEach(key => showSkeleton(key));

  const populares = await getMovies("/movie/popular");
  const emAlta = await getMovies("/trending/movie/week");
  const lancamentos = await getMovies("/movie/now_playing");
  const recomendados = await getMovies("/movie/top_rated");

  if(populares.length){
    renderHero(populares[0]);
  }

  renderRow("populares", populares);
  renderRow("emalta", emAlta);
  renderRow("lancamentos", lancamentos);
  renderRow("recomendados", recomendados);

  renderContinueWatching();

  setupPlayer();
  setupArrows();
  setupSearch();
}

/* =========================
   API
========================= */
async function getMovies(endpoint){
  try{
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`);
    const data = await res.json();
    return data.results || [];
  }catch(e){
    console.error("Erro API:", e);
    return [];
  }
}

/* =========================
   HERO
========================= */
function renderHero(movie){
  DOM.hero.style.backgroundImage = `url(${IMG}${movie.backdrop_path})`;
  DOM.heroTitle.textContent = movie.title;
  DOM.heroOverview.textContent = movie.overview;

  DOM.heroWatch.onclick = () => openPlayer(movie);
  DOM.heroFav.onclick = () => saveToList(movie);
}

/* =========================
   ROW
========================= */
function renderRow(type, movies){
  const container = DOM.rows[type];
  if(!container) return;

  container.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG}${movie.poster_path}" alt="${movie.title}">
    `;

    card.onclick = () => openPlayer(movie);

    container.appendChild(card);
  });
}

/* =========================
   SKELETON
========================= */
function showSkeleton(type){
  const container = DOM.rows[type];
  if(!container) return;

  container.innerHTML = "";

  for(let i=0;i<6;i++){
    const sk = document.createElement("div");
    sk.className = "skeleton";
    container.appendChild(sk);
  }
}

/* =========================
   PLAYER
========================= */
function setupPlayer(){
  DOM.playerClose.onclick = closePlayer;
}

function openPlayer(movie){
  DOM.playerOverlay.classList.add("active");

  // exemplo simples (trailer fake)
  DOM.playerFrame.src = `https://www.youtube.com/embed/dQw4w9WgXcQ`;
}

function closePlayer(){
  DOM.playerOverlay.classList.remove("active");
  DOM.playerFrame.src = "";
}

/* =========================
   SCROLL SETAS
========================= */
function setupArrows(){
  document.querySelectorAll(".row").forEach(row => {
    const container = row.querySelector(".row-cards");
    const left = row.querySelector(".left");
    const right = row.querySelector(".right");

    if(left){
      left.onclick = () => container.scrollBy({left:-300,behavior:"smooth"});
    }

    if(right){
      right.onclick = () => container.scrollBy({left:300,behavior:"smooth"});
    }
  });
}

/* =========================
   BUSCA
========================= */
function setupSearch(){
  DOM.searchInput.addEventListener("input", async (e)=>{
    const query = e.target.value;

    if(query.length < 3) return;

    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();

    renderRow("populares", data.results || []);
  });
}

/* =========================
   MINHA LISTA
========================= */
function saveToList(movie){
  let list = JSON.parse(localStorage.getItem("minhaLista")) || [];

  if(!list.find(m => m.id === movie.id)){
    list.push(movie);
  }

  localStorage.setItem("minhaLista", JSON.stringify(list));
}

/* =========================
   CONTINUAR ASSISTINDO
========================= */
function renderContinueWatching(){
  // simples placeholder (pode melhorar depois)
}
