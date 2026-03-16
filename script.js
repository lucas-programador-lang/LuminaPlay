const API_KEY = "d552c7ad4779e6d50cb6de2ac397c6dd"

const IMG_PATH = "https://image.tmdb.org/t/p/w500"

const POPULAR_URL =
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`

const TREND_URL =
`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`

const SEARCH_URL =
`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

// containers

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

movies.forEach(movie => {

const {title, poster_path, vote_average, id} = movie

if(!poster_path) return

const movieEl = document.createElement("div")

movieEl.classList.add("movie")

movieEl.innerHTML = `

<img src="${IMG_PATH + poster_path}" alt="${title}">

<p>${title}</p>

<span class="rating">${vote_average}</span>

<button class="fav">❤️</button>

`

// cor da avaliação

const rating = movieEl.querySelector(".rating")

if(vote_average >= 7){
rating.style.color = "lime"
}
else if(vote_average >= 5){
rating.style.color = "orange"
}
else{
rating.style.color = "red"
}

// trailer

movieEl.querySelector("img").addEventListener("click", () => {

openTrailer(id)

})

// favoritos

movieEl.querySelector(".fav").addEventListener("click", () => {

addFavorite(title)

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

console.error("Erro ao abrir trailer", error)

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

if(!favorites.includes(movie)){

favorites.push(movie)

localStorage.setItem("favorites", JSON.stringify(favorites))

alert("Adicionado aos favoritos")

}else{

alert("Já está nos favoritos")

}

}

// carregar inicial

getMovies(POPULAR_URL, popularContainer)
getMovies(TREND_URL, trendingContainer)
