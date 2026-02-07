import React from "react";
import { Link, useParams } from "react-router";

const API_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const fetchMovieDetail = async (movieId) => {
  if (!API_TOKEN) {
    throw new Error(
      "Missing TMDB token. Set VITE_TMDB_BEARER_TOKEN in your environment.",
    );
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
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

  return response.json();
};
const MovieDetail = () => {
  const [movieDetail, setMovieDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const { movieId } = useParams();

  React.useEffect(() => {
    const getMovieDetail = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await fetchMovieDetail(movieId);
        setMovieDetail(data);
      } catch (error) {
        console.error("Error fetching movie detail:", error);
        setErrorMessage(error.message || "Failed to load movie detail.");
        setMovieDetail(null);
      } finally {
        setLoading(false);
      }
    };

    getMovieDetail();
  }, [movieId]);

  if (loading) {
    return (
      <div className="page">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page">
        <p className="loading">{errorMessage}</p>
      </div>
    );
  }

  if (!movieDetail) {
    return (
      <div className="page">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
  const formatCurrency = (value) =>
    typeof value === "number" && value > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value)
      : "-";
  const formatRuntime = (value) =>
    typeof value === "number" && value > 0
      ? `${Math.floor(value / 60)}h ${value % 60}m`
      : "-";
  const formatList = (items, key = "name") =>
    Array.isArray(items) && items.length > 0
      ? items
          .map((item) => (key ? item[key] : item))
          .filter(Boolean)
          .join(", ")
      : "-";
  const formatLanguages = (items) =>
    Array.isArray(items) && items.length > 0
      ? items
          .map(
            (lang) =>
              `${lang.english_name || lang.name || "-"} (${lang.iso_639_1 || "-"})`,
          )
          .join(", ")
      : "-";

  return (
    <div className="detail-page">
      <section className="hero">
        <img
          src={
            movieDetail.backdrop_path
              ? `${BACKDROP_BASE_URL}${movieDetail.backdrop_path}`
              : "https://placehold.co/1200x500?text=No+Backdrop"
          }
          alt={movieDetail.title}
          className="hero-backdrop"
        />
        <div className="hero-content">
          <Link className="back-link" to="/">
            Back to list
          </Link>
          <p className="eyebrow">Movie Detail</p>
          <h1>{movieDetail.title}</h1>
          <p className="tagline">
            {movieDetail.tagline || "No tagline available."}
          </p>
          <div className="badge-row">
            <span className="badge">{movieDetail.status || "-"}</span>
            <span className="badge">
              {movieDetail.original_language || "-"}
            </span>
            <span className="badge">{formatRuntime(movieDetail.runtime)}</span>
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <div className="poster-card">
          <img
            src={
              movieDetail.poster_path
                ? `${IMAGE_BASE_URL}${movieDetail.poster_path}`
                : "https://placehold.co/500x750?text=No+Poster"
            }
            alt={movieDetail.title}
          />
          <div className="poster-actions">
            {movieDetail.homepage && (
              <a
                className="button"
                href={movieDetail.homepage}
                target="_blank"
                rel="noreferrer"
              >
                Visit Homepage
              </a>
            )}
            {movieDetail.imdb_id && (
              <a
                className="button ghost"
                href={`https://www.imdb.com/title/${movieDetail.imdb_id}`}
                target="_blank"
                rel="noreferrer"
              >
                Open IMDb
              </a>
            )}
          </div>
        </div>

        <div className="detail-content">
          <div className="panel">
            <h2>Overview</h2>
            <p>{movieDetail.overview || "No overview available."}</p>
          </div>

          <div className="panel grid">
            <div>
              <h3>Core Info</h3>
              <dl>
                <div>
                  <dt>Title</dt>
                  <dd>{movieDetail.title || "-"}</dd>
                </div>
                <div>
                  <dt>Original Title</dt>
                  <dd>{movieDetail.original_title || "-"}</dd>
                </div>
                <div>
                  <dt>Release Date</dt>
                  <dd>{movieDetail.release_date || "-"}</dd>
                </div>
                <div>
                  <dt>Adult</dt>
                  <dd>{movieDetail.adult ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Video</dt>
                  <dd>{movieDetail.video ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{movieDetail.status || "-"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3>Numbers</h3>
              <dl>
                <div>
                  <dt>Rating</dt>
                  <dd>{movieDetail.vote_average || "-"}</dd>
                </div>
                <div>
                  <dt>Votes</dt>
                  <dd>{movieDetail.vote_count || "-"}</dd>
                </div>
                <div>
                  <dt>Popularity</dt>
                  <dd>{movieDetail.popularity || "-"}</dd>
                </div>
                <div>
                  <dt>Budget</dt>
                  <dd>{formatCurrency(movieDetail.budget)}</dd>
                </div>
                <div>
                  <dt>Revenue</dt>
                  <dd>{formatCurrency(movieDetail.revenue)}</dd>
                </div>
                <div>
                  <dt>Runtime</dt>
                  <dd>{formatRuntime(movieDetail.runtime)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="panel grid">
            <div>
              <h3>Genres</h3>
              <p>{formatList(movieDetail.genres)}</p>
            </div>
            <div>
              <h3>Spoken Languages</h3>
              <p>{formatLanguages(movieDetail.spoken_languages)}</p>
            </div>
            <div>
              <h3>Origin Countries</h3>
              <p>{formatList(movieDetail.origin_country, null)}</p>
            </div>
          </div>

          <div className="panel">
            <h2>Production</h2>
            <div className="production-list">
              {Array.isArray(movieDetail.production_companies) &&
              movieDetail.production_companies.length > 0 ? (
                movieDetail.production_companies.map((company) => (
                  <div key={company.id} className="company">
                    {company.logo_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${company.logo_path}`}
                        alt={company.name}
                      />
                    ) : (
                      <div className="company-fallback">{company.name}</div>
                    )}
                    <div>
                      <p className="company-name">{company.name}</p>
                      <p className="company-meta">
                        {company.origin_country || "-"}
                      </p>
                      <p className="company-meta">
                        Logo Path: {company.logo_path || "-"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No production company data.</p>
              )}
            </div>

            <div className="country-list">
              <h3>Production Countries</h3>
              {Array.isArray(movieDetail.production_countries) &&
              movieDetail.production_countries.length > 0 ? (
                <ul>
                  {movieDetail.production_countries.map((country) => (
                    <li key={country.iso_3166_1}>
                      {country.name} ({country.iso_3166_1})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>-</p>
              )}
            </div>
          </div>

          <div className="panel">
            <h2>Collection</h2>
            {movieDetail.belongs_to_collection ? (
              <div className="collection">
                <img
                  src={
                    movieDetail.belongs_to_collection.poster_path
                      ? `${IMAGE_BASE_URL}${movieDetail.belongs_to_collection.poster_path}`
                      : "https://placehold.co/240x360?text=No+Poster"
                  }
                  alt={movieDetail.belongs_to_collection.name}
                />
                <div>
                  <p className="collection-name">
                    {movieDetail.belongs_to_collection.name}
                  </p>
                  <p className="collection-meta">
                    Collection ID: {movieDetail.belongs_to_collection.id}
                  </p>
                  <p className="collection-meta">
                    Poster Path:{" "}
                    {movieDetail.belongs_to_collection.poster_path || "-"}
                  </p>
                  <p className="collection-meta">
                    Backdrop Path:{" "}
                    {movieDetail.belongs_to_collection.backdrop_path || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <p>No collection data.</p>
            )}
          </div>

          <div className="panel">
            <h2>Identifiers</h2>
            <dl>
              <div>
                <dt>Movie ID</dt>
                <dd>{movieDetail.id || "-"}</dd>
              </div>
              <div>
                <dt>IMDb ID</dt>
                <dd>{movieDetail.imdb_id || "-"}</dd>
              </div>
              <div>
                <dt>Homepage</dt>
                <dd>{movieDetail.homepage || "-"}</dd>
              </div>
              <div>
                <dt>Poster Path</dt>
                <dd>{movieDetail.poster_path || "-"}</dd>
              </div>
              <div>
                <dt>Backdrop Path</dt>
                <dd>{movieDetail.backdrop_path || "-"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

// {
//   "adult": false,
//   "backdrop_path": "/m8JTwHFwX7I7JY5fPe4SjqejWag.jpg",
//   "belongs_to_collection": {
//     "id": 422834,
//     "name": "Ant-Man Collection",
//     "poster_path": "/9llE4J9sVv8qsvfVGkpugiPTxUV.jpg",
//     "backdrop_path": "/2KjtWUBiksmN8LsUouaZnxocu5N.jpg"
//   },
//   "budget": 200000000,
//   "genres": [
//     {
//       "id": 28,
//       "name": "Action"
//     },
//     {
//       "id": 12,
//       "name": "Adventure"
//     },
//     {
//       "id": 878,
//       "name": "Science Fiction"
//     }
//   ],
//   "homepage": "https://www.marvel.com/movies/ant-man-and-the-wasp-quantumania",
//   "id": 640146,
//   "imdb_id": "tt10954600",
//   "origin_country": [
//     "US"
//   ],
//   "original_language": "en",
//   "original_title": "Ant-Man and the Wasp: Quantumania",
//   "overview": "Super-Hero partners Scott Lang and Hope van Dyne, along with with Hope's parents Janet van Dyne and Hank Pym, and Scott's daughter Cassie Lang, find themselves exploring the Quantum Realm, interacting with strange new creatures and embarking on an adventure that will push them beyond the limits of what they thought possible.",
//   "popularity": 7.3318,
//   "poster_path": "/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg",
//   "production_companies": [
//     {
//       "id": 420,
//       "logo_path": "/hUzeosd33nzE5MCNsZxCGEKTXaQ.png",
//       "name": "Marvel Studios",
//       "origin_country": "US"
//     },
//     {
//       "id": 176762,
//       "logo_path": null,
//       "name": "Kevin Feige Productions",
//       "origin_country": "US"
//     }
//   ],
//   "production_countries": [
//     {
//       "iso_3166_1": "US",
//       "name": "United States of America"
//     }
//   ],
//   "release_date": "2023-02-15",
//   "revenue": 476071180,
//   "runtime": 125,
//   "spoken_languages": [
//     {
//       "english_name": "English",
//       "iso_639_1": "en",
//       "name": "English"
//     }
//   ],
//   "status": "Released",
//   "tagline": "Witness the beginning of a new dynasty.",
//   "title": "Ant-Man and the Wasp: Quantumania",
//   "video": false,
//   "vote_average": 6.241,
//   "vote_count": 5630
// }

export default MovieDetail;
