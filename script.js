const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

const POPULAR_URL =
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`

const TREND_URL =
`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`

const SEARCH_URL =
`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=`


// ELEMENTOS corrigi>: const searchSection = document.getElementById("searchSection")

if(searchInput){

let searchTimeout

searchInput.addEventListener("keyup", e => {

const searchTerm = e.target.value.trim()

clearTimeout(searchTimeout)

searchTimeout = setTimeout(() => {

if(searchTerm.length > 2){

if(searchSection){
searchSection.style.display = "block"
}

getMovies(SEARCH_URL + encodeURIComponent(searchTerm), searchContainer)

}else{

if(searchContainer){
searchContainer.innerHTML = ""
}

if(searchSection){
searchSection.style.display = "none"
}

}

},400)

})

} 

const popularContainer = document.getElementById("popularMovies")
const trendingContainer = document.getElementById("trendingMovies")
const searchContainer = document.getElementById("searchResults")
const searchInput = document.getElementById("search")

let previewTimeout = null
let activePreview = null



// ==========================
// CARREGAR FILMES
// ==========================

async function getMovies(url, container){

if(!container) return

try{

const res = await fetch(url)

if(!res.ok){
throw new Error("Erro API")
}

const data = await res.json()

showMovies(data.results, container)

}catch(error){

console.error("Erro ao carregar filmes:", error)

container.innerHTML = "<p>Erro ao carregar filmes.</p>"

}

}



// ==========================
// MOSTRAR FILMES
// ==========================

function showMovies(movies, container){

if(!container) return

container.innerHTML = ""

movies.slice(0,10).forEach((movie,index) => {

const {title, poster_path, vote_average, id} = movie

if(!poster_path) return

const movieEl = document.createElement("div")

movieEl.classList.add("movie")

movieEl.innerHTML = `

<div class="rank">${index+1}</div>

<img src="${IMG_PATH + poster_path}" alt="${title}">

<p>${title}</p>

<span class="rating">⭐ ${vote_average.toFixed(1)}</span>

<button class="fav">❤️</button>

<div class="trailer-preview"></div>

`


// abrir página do filme

movieEl.querySelector("img").addEventListener("click", () => {
openDetails(movie)
})


// ==========================
// PREVIEW TRAILER NETFLIX
// ==========================

movieEl.addEventListener("mouseenter", () => {

previewTimeout = setTimeout(() => {

loadTrailerPreview(id, movieEl)

},700)

})


movieEl.addEventListener("mouseleave", () => {

clearTimeout(previewTimeout)

const preview = movieEl.querySelector(".trailer-preview")

if(preview){
preview.innerHTML = ""
}

activePreview = null

})


// ==========================
// FAVORITOS
// ==========================

const favBtn = movieEl.querySelector(".fav")

if(favBtn){

favBtn.addEventListener("click", (e) => {

e.stopPropagation()

addFavorite(movie)

})

}

container.appendChild(movieEl)

})

}



// ==========================
// TRAILER PREVIEW
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

const preview = movieEl.querySelector(".trailer-preview")

if(preview){

preview.innerHTML = `

<iframe
src="https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&controls=0"
allow="autoplay"
frameborder="0">
</iframe>

`

}

}

}catch(error){

console.error("Erro preview trailer", error)

}

}



// ==========================
// ABRIR DETALHES
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

alert("Adicionado aos favoritos ❤️")

}else{

alert("Esse filme já está nos favoritos")

}

}



// ==========================
// CARREGAR FAVORITOS
// ==========================

function loadFavorites(){

if(!searchContainer) return

const favorites = JSON.parse(localStorage.getItem("favorites")) || []

if(favorites.length === 0){

searchContainer.innerHTML = "<p>Você ainda não adicionou filmes aos favoritos.</p>"

return

}

showMovies(favorites, searchContainer)

}



// ==========================
// BUSCA
// ==========================

if(searchInput){

let searchTimeout

searchInput.addEventListener("keyup", e => {

const searchTerm = e.target.value.trim()

clearTimeout(searchTimeout)

searchTimeout = setTimeout(() => {

if(searchTerm.length > 2){

getMovies(SEARCH_URL + encodeURIComponent(searchTerm), searchContainer)

}else{

if(searchContainer){
searchContainer.innerHTML = ""
}

}

},400)

})

}



// ==========================
// CARROSSEL
// ==========================

document.querySelectorAll(".carousel").forEach(carousel => {

const container = carousel.querySelector(".movies")
const left = carousel.querySelector(".arrow.left")
const right = carousel.querySelector(".arrow.right")

if(!container) return

if(right){

right.addEventListener("click", () => {

container.scrollBy({
left:400,
behavior:"smooth"
})

})

}

if(left){

left.addEventListener("click", () => {

container.scrollBy({
left:-400,
behavior:"smooth"
})

})

}

})



// ==========================
// BANNER CINEMA AUTOMÁTICO
// ==========================

const banners = [
"https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
"https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
"https://image.tmdb.org/t/p/original/6MKr3KgOLmzOP6MSuZERO41Lpkt.jpg"
]

let bannerIndex = 0

function changeBanner(){

bannerIndex++

if(bannerIndex >= banners.length){
bannerIndex = 0
}

const banner = document.querySelector(".banner")

if(banner){
banner.style.backgroundImage = `url(${banners[bannerIndex]})`
}

}

setInterval(changeBanner,5000)



// ==========================
// TEMA
// ==========================

function toggleTheme(){

document.body.classList.toggle("light")

localStorage.setItem(
"theme",
document.body.classList.contains("light") ? "light" : "dark"
)

}

if(localStorage.getItem("theme") === "light"){
document.body.classList.add("light")
}



// ==========================
// INICIAR
// ==========================

document.addEventListener("DOMContentLoaded", () => {

getMovies(POPULAR_URL, popularContainer)
getMovies(TREND_URL, trendingContainer)

})
