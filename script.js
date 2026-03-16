const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

const POPULAR_URL =
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`

const TREND_URL =
`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`

const SEARCH_URL =
`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

const VIDEO_URL =
`https://api.themoviedb.org/3/movie/`

const popularContainer = document.getElementById("popularMovies")
const trendingContainer = document.getElementById("trendingMovies")
const searchContainer = document.getElementById("searchResults")

const searchInput = document.getElementById("search")

const modal = document.getElementById("movieModal")
const trailer = document.getElementById("movieTrailer")
const closeModal = document.querySelector(".close")

// carregar filmes

async function getMovies(url, container){

const res = await fetch(url)
const data = await res.json()

showMovies(data.results, container)

}

function showMovies(movies, container){

container.innerHTML = ""

movies.forEach(movie => {

const {title, poster_path, vote_average, id} = movie

const movieEl = document.createElement("div")

movieEl.classList.add("movie")

movieEl.innerHTML = `

<img src="${IMG_PATH + poster_path}">

<p>${title}</p>

<span>⭐ ${vote_average}</span>

<button onclick="addFavorite('${title}')">❤️</button>

`

movieEl.querySelector("img").addEventListener("click", () => {

openTrailer(id)

})

container.appendChild(movieEl)

})

}

// abrir trailer

async function openTrailer(movieId){

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

}

}

// fechar modal

closeModal.onclick = () => {

modal.style.display = "none"
trailer.src = ""

}

// busca

searchInput.addEventListener("keyup", e => {

const searchTerm = e.target.value

if(searchTerm.length > 2){

getMovies(SEARCH_URL + searchTerm, searchContainer)

}

})

// favoritos

function addFavorite(movie){

let favorites = JSON.parse(localStorage.getItem("favorites")) || []

favorites.push(movie)

localStorage.setItem("favorites", JSON.stringify(favorites))

alert("Adicionado aos favoritos")

}

// carregar inicial

getMovies(POPULAR_URL, popularContainer)

getMovies(TREND_URL, trendingContainer)
