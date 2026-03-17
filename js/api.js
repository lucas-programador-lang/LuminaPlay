// api.js

const API_KEY = 'your_tmdb_api_key'; // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Fetch movies by a specific query.
 * @param {string} query - The search query.
 * @returns {Promise<Object>} - A promise that resolves to the search results.
 */
const fetchMovies = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Error fetching movies: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error; // rethrow for further handling
    }
};

/**
 * Fetch series by a specific query.
 * @param {string} query - The search query.
 * @returns {Promise<Object>} - A promise that resolves to the search results.
 */
const fetchSeries = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Error fetching series: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error; // rethrow for further handling
    }
};

/**
 * Fetch anime by a specific query.
 * @param {string} query - The search query.
 * @returns {Promise<Object>} - A promise that resolves to the search results.
 */
const fetchAnime = async (query) => {
    try {
        // This is a placeholder endpoint; TMDB may not provide a direct anime search.
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Error fetching anime: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error; // rethrow for further handling
    }
};

export { fetchMovies, fetchSeries, fetchAnime };