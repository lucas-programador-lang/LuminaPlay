const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

const POPULAR_URL =
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`

const TREND_URL =
`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`

const SEARCH_URL =
`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

const popularContainer = document.getElementById("popularMovies")
const trendingContainer = document.getElementById("trendingMovies")
const searchContainer = document.getElementById("searchResults")

const searchInput = document.getElementById("search")

const modal = document.getElementById("movieModal")
const trailer = document.getElementById("movieTrailer")
const closeModal = document.querySelector(".close")

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
`https://www.youtube.com/embed/${video.key}`

trailer.src = youtubeURL

modal.style.display = "flex"

}else{

alert("Trailer não disponível")

}

}catch(error){

console.error("Erro trailer", error)

}

}

// fechar modal

closeModal.onclick = () => {

modal.style.display = "none"
trailer.src = ""

}

window.onclick = (event) => {

if(event.target == modal){

modal.style.display = "none"
trailer.src = ""

}

}

// busca

searchInput.addEventListener("keyup", e => {

const searchTerm = e.target.value.trim()

if(searchTerm.length > 2){

getMovies(SEARCH_URL + searchTerm, searchContainer)

}

})

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

// página favoritos

function loadFavorites(){

const favorites = JSON.parse(localStorage.getItem("favorites")) || []

showMovies(favorites, searchContainer)

}

// slider automático banner

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

document.querySelector(".banner").style.backgroundImage =
`url(${banners[bannerIndex]})`

}

setInterval(changeBanner,5000)

// carregar inicial

getMovies(POPULAR_URL, popularContainer)
getMovies(TREND_URL, trendingContainer)
