import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const API_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const App = () => {
  const [originalMovies, setOriginalMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // FETCH UPCOMING MOVIES
  // =========================
  const fetchUpcomingMovies = async (pages = 5) => {
    setLoading(true);
    setErrorMessage("");
    try {
      if (!API_TOKEN) {
        throw new Error(
          "Missing TMDB token. Set VITE_TMDB_BEARER_TOKEN in your environment.",
        );
      }
      let allMovies = [];

      for (let page = 1; page <= pages; page++) {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`,
          {
            headers: {
              accept: "application/json",
              Authorization: API_TOKEN.startsWith("Bearer ")
                ? API_TOKEN
                : `Bearer ${API_TOKEN}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `TMDB request failed (${response.status}). Check your token and quota.`,
          );
        }

        const data = await response.json();
        allMovies = [...allMovies, ...data.results];
      }

      setOriginalMovies(allMovies);
      setDisplayedMovies(allMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage(error.message || "Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH SAAT PERTAMA KALI RENDER
  useEffect(() => {
    fetchUpcomingMovies(5);
  }, []);

  // =========================
  // SORT & SEARCH LOGIC
  // =========================
  useEffect(() => {
    let result = [...originalMovies];

    // SEARCH
    if (searchTerm) {
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // SORT
    switch (sortOption) {
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        result.sort(
          (a, b) => new Date(a.release_date) - new Date(b.release_date),
        );
        break;
      case "date-desc":
        result.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date),
        );
        break;
      default:
        break;
    }

    setDisplayedMovies(result);
  }, [originalMovies, sortOption, searchTerm]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Release Radar</p>
          <h1>Upcoming Movies</h1>
          <p className="subtitle">
            Browse upcoming releases, then drill into the full detail page.
          </p>
        </div>
        <div className="stat">
          <span className="stat-label">Results</span>
          <span className="stat-value">{displayedMovies.length}</span>
        </div>
      </header>

      {/* SORT */}
      <div className="controls">
        <div className="control">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">-- Sort --</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="date-asc">Release Date (Oldest)</option>
            <option value="date-desc">Release Date (Newest)</option>
          </select>
        </div>

        {/* SEARCH */}
        <div className="control">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search movie title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && <p className="loading">Loading movies...</p>}
      {errorMessage && <p className="loading">{errorMessage}</p>}

      {/* MOVIE LIST */}
      <ul className="movie-grid">
        {displayedMovies.map((movie) => (
          <Link to={`/detail/${movie.id}`} key={movie.id} className="card-link">
            <li className="card-movie">
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : "/no-image.png"
                }
                alt={movie.title}
                className="card-poster"
              />
              <div className="card-body">
                <h3>{movie.title}</h3>
                <p className="meta">{movie.release_date}</p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default App;
