const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

let currentPage = 1
let loading = false


// ==========================
// ELEMENTOS
// ==========================

const popularContainer = document.getElementById("popularMovies")
const trendingContainer = document.getElementById("trendingMovies")
const searchContainer = document.getElementById("searchResults")
const searchInput = document.getElementById("search")
const searchSection = document.getElementById("searchSection")

let previewTimeout = null
let activePreview = null



// ==========================
// BUSCAR FILMES COM PAGINAÇÃO
// ==========================

async function getMovies(page = 1){

if(loading) return

loading = true

try{

const res = await fetch(
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
)

const data = await res.json()

appendMovies(data.results)

}catch(e){
console.log(e)
}

loading = false

}



// ==========================
// ADICIONAR FILMES (NÃO APAGA)
// ==========================

function appendMovies(movies){

movies.forEach((movie,index) => {

const {title, poster_path, vote_average, id} = movie
if(!poster_path) return

const movieEl = document.createElement("div")
movieEl.classList.add("movie")

movieEl.innerHTML = `

<img src="${IMG_PATH + poster_path}" alt="${title}">

<div class="movie-info">
  <h4>${title}</h4>
  <span class="rating">⭐ ${vote_average.toFixed(1)}</span>

  <div class="movie-buttons">
    <button class="btn-play">▶</button>
    <button class="btn-fav">❤️</button>
    <button class="btn-info">i</button>
  </div>
</div>

<div class="trailer-preview"></div>

`

// ações
movieEl.querySelector("img").onclick = () => openDetails(movie)
movieEl.querySelector(".btn-play").onclick = (e)=>{e.stopPropagation();openDetails(movie)}
movieEl.querySelector(".btn-info").onclick = (e)=>{e.stopPropagation();openDetails(movie)}
movieEl.querySelector(".btn-fav").onclick = (e)=>{e.stopPropagation();addFavorite(movie)}

// trailer hover
movieEl.addEventListener("mouseenter", () => {
previewTimeout = setTimeout(()=>loadTrailerPreview(id, movieEl),600)
})

movieEl.addEventListener("mouseleave", () => {
clearTimeout(previewTimeout)
movieEl.querySelector(".trailer-preview").innerHTML = ""
})

popularContainer.appendChild(movieEl)

})

}



// ==========================
// SCROLL INFINITO
// ==========================

window.addEventListener("scroll", () => {

if(
window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
){

currentPage++
getMovies(currentPage)

}

})



// ==========================
// TRAILER
// ==========================

async function loadTrailerPreview(movieId, movieEl){

if(activePreview === movieId) return
activePreview = movieId

try{

const res = await fetch(
`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
)

const data = await res.json()
const video = data.results.find(v => v.type === "Trailer")

if(video){

movieEl.querySelector(".trailer-preview").innerHTML = `
<iframe
src="https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&controls=0"
allow="autoplay">
</iframe>
`

}

}catch(e){
console.log(e)
}

}



// ==========================
// DETALHES
// ==========================

function openDetails(movie){
localStorage.setItem("selectedMovie", JSON.stringify(movie))
window.location.href = "filme.html"
}



// ==========================
// FAVORITOS
// ==========================

function addFavorite(movie){

let favorites = JSON.parse(localStorage.getItem("favorites")) || []

if(!favorites.find(f => f.id === movie.id)){
favorites.push(movie)
localStorage.setItem("favorites", JSON.stringify(favorites))
alert("Adicionado ❤️")
}else{
alert("Já está na lista")
}

}



// ==========================
// TEMA
// ==========================

function toggleTheme(){
document.body.classList.toggle("light")
localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark")
}

if(localStorage.getItem("theme") === "light"){
document.body.classList.add("light")
}



// ==========================
// START
// ==========================

document.addEventListener("DOMContentLoaded", () => {
getMovies()
})
