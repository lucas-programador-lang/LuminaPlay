const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

const POPULAR_URL =
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`

const TREND_URL =
`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`

const SEARCH_URL =
`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

// elementos

const popularContainer = document.getElementById("popularMovies")
const trendingContainer = document.getElementById("trendingMovies")
const searchContainer = document.getElementById("searchResults")

const searchInput = document.getElementById("search")

const modal = document.getElementById("movieModal")
const trailer = document.getElementById("movieTrailer")
const closeModal = document.querySelector(".close")

let previewTimeout = null

// carregar filmes

async function getMovies(url, container){

try{

const res = await fetch(url)
const data = await res.json()

showMovies(data.results, container)

}catch(error){

console.error("Erro ao carregar filmes", error)

}

}

// mostrar filmes

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

<span class="rating">⭐ ${vote_average}</span>

<button class="fav">❤️</button>

`

// abrir trailer

movieEl.querySelector("img").addEventListener("click", () => {
openTrailer(id)
})

// preview ao passar mouse

movieEl.addEventListener("mouseenter", () => {

previewTimeout = setTimeout(() => {
openTrailer(id)
}, 2000)

})

movieEl.addEventListener("mouseleave", () => {

clearTimeout(previewTimeout)

if(modal){
modal.style.display = "none"
trailer.src = ""
}

})

// favoritos

movieEl.querySelector(".fav").addEventListener("click", () => {
addFavorite(movie)
})

container.appendChild(movieEl)

})

}

// abrir trailer

async function openTrailer(movieId){

try{

const res = await fetch(
`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
)

const data = await res.json()

const video = data.results.find(v => v.type === "Trailer")

if(video){

const youtubeURL =
`https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1`

trailer.src = youtubeURL

if(modal){
modal.style.display = "flex"
}

}

}catch(error){

console.error("Erro trailer", error)

}

}

// fechar modal

if(closeModal){

closeModal.onclick = () => {

modal.style.display = "none"
trailer.src = ""

}

}

window.onclick = (event) => {

if(event.target == modal){

modal.style.display = "none"
trailer.src = ""

}

}

// busca

if(searchInput){

searchInput.addEventListener("keyup", e => {

const searchTerm = e.target.value.trim()

if(searchTerm.length > 2){

getMovies(SEARCH_URL + searchTerm, searchContainer)

}

})

}

// favoritos

function addFavorite(movie){

let favorites = JSON.parse(localStorage.getItem("favorites")) || []

if(!favorites.find(f => f.id === movie.id)){

favorites.push(movie)

localStorage.setItem("favorites", JSON.stringify(favorites))

alert("Adicionado aos favoritos")

}else{

alert("Já está nos favoritos")

}

}

// carregar favoritos

function loadFavorites(){

const favorites = JSON.parse(localStorage.getItem("favorites")) || []

showMovies(favorites, searchContainer)

}

// banner automático

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

// carrossel

document.querySelectorAll(".carousel").forEach(carousel => {

const movies = carousel.querySelector(".movies")
const left = carousel.querySelector(".arrow.left")
const right = carousel.querySelector(".arrow.right")

if(left){
left.addEventListener("click", () => {
movies.scrollLeft -= 400
})
}

if(right){
right.addEventListener("click", () => {
movies.scrollLeft += 400
})
}

})

// modo escuro / claro

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

// carregar inicial

document.addEventListener("DOMContentLoaded", () => {

getMovies(POPULAR_URL, popularContainer)
getMovies(TREND_URL, trendingContainer)

})
