import {useEffect, useState} from "react";
import StarRating from "./StarRating";

const tempMovieData = [{
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
}, {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
}, {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
},];

const tempWatchedData = [{
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
}, {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
},];

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "a5c6ca33";

export default function App() {
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectedMovie(movieid) {
        setSelectedId(selectedId => selectedId === movieid ? null : movieid);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(newMovieObj) {
        setWatched([...watched, newMovieObj]);
        setSelectedId(null);
    }

    function handleDeleteMovie(movieID) {
        setWatched(watched => watched.filter(watchedmovie => movieID !== watchedmovie.imdbId));
    }


    useEffect(function () {

        const controller = new AbortController();

        async function fetchMovieData() {
            try {
                //Set Loading State and Error State
                setIsLoading(true);
                setError("");

                //Fetch Data from the API
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
                const data = await res.json();

                //Throw Errors
                if (!res.ok) throw new Error("Something went wrong fetching the movies");
                if (data.Response === "False") throw new Error("Movie not found");

                //Assign Data to the Movies
                setMovies(data.Search);

                console.log(data);
                //Set Loading State
                setIsLoading(false);
                setError("");
            } catch (err) {
                console.log(err);
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if (!query.length || query.length < 3) {
            setMovies([]);
            setError("");
            return
        }

        handleCloseMovie();
        fetchMovieData();

        return function () {
            controller.abort();
        }
    }, [query])


    return (<>
        <NavBar>
            <Logo/>
            <Search query={query} setQuery={setQuery}/>
            <QueryResults movies={movies}/>
        </NavBar>

        <Main>

            <Box>
                {!isLoading && !error && < MovieList movies={movies} onSelectedMovie={handleSelectedMovie}/>}
                {isLoading && <Loader/>}
                {error ? <ErrorMessage message={error}/> : null}
            </Box>

            <Box>
                {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}
                                            onAddWatchedMovie={handleAddWatched} watched={watched}/> : <>
                    <WatchedSummary watched={watched}/>
                    <WatchedMovieList watched={watched} onDeleteMovie={handleDeleteMovie}/>
                </>}
            </Box>

        </Main>
    </>);
}

function MovieDetails({selectedId, onCloseMovie, onAddWatchedMovie, watched}) {

    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [userRating, setUserRating] = useState("");

    const isWatched = watched.map(movie => movie.imdbId).includes(selectedId);
    const watchedUserRating = watched.find(movie => movie.imdbId === selectedId)?.userRating;

    console.log(isWatched);

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
        imdbID: imdbId
    } = movie;

    function handleAddMovie() {

        const newMovieObj = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            userRating: userRating
        }
        onAddWatchedMovie(newMovieObj)
    }

    console.log(title, year);


    useEffect(function () {
        function callback(e) {
            if (e.code === "Escape") onCloseMovie();
            console.log("CLOSING");
        }

        document.addEventListener("keydown", callback)
        return function () {
            document.removeEventListener("keydown", callback);
        }
    }, [onCloseMovie])

    useEffect(function () {
        if (!title) return
        document.title = `Movie | ${title}`
        return function () {
            document.title = "usePopcorn"
        }
    }, [title])

    useEffect(function () {
        async function getMovieDetails() {
            try {
                setError("");
                //Set Loading State
                setIsLoading(true);

                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
                const data = await res.json();
                setMovie(data);

                //Throw Errors Manually
                if (!res.ok) throw new Error("Something went wrong fetching the data");

                //Set Loading State
                setIsLoading(false);

            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false)
            }
        }

        getMovieDetails();
    }, [selectedId])

    return (<div className={"details"}>
        {isLoading ? <Loader/> : error ? <ErrorMessage/> : <>
            <header>
                <button className={"btn-back"} onClick={onCloseMovie}>&larr;</button>
                <img src={poster} alt={`poster of ${title}`}/>

                <div className={"details-overview"}>
                    <h2>{title}</h2>
                    <p>{released} &bull; {runtime}</p>
                    <p>{genre}</p>
                    <p>
                        <span>⭐</span>
                        {imdbRating} IMdb rating
                    </p>
                </div>
            </header>

            <section>
                <div className={"rating"}>

                    {!isWatched ? <>
                        <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>

                        {userRating > 0 && <button className={"btn-add"} onClick={handleAddMovie}>+ Add to list</button>

                        } </> : <p>You rated this movie {watchedUserRating}⭐</p>}

                </div>
                <p>
                    <em>{plot}</em>
                </p>
                <p>Starring {actors}</p>
                <p>Directed by {director}</p>
            </section>
        </>}
    </div>)
}

function Loader() {
    return (<p className={"loader"}>Loading</p>)
}

function ErrorMessage({message}) {
    return (<p className={"error"}>{message}🤬</p>)
}

function NavBar({children}) {

    return (<nav className="nav-bar">
        {children}
    </nav>)
}

function QueryResults({movies}) {
    return (<p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>)
}

function Logo() {
    return (<div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>)
}

function Search({setQuery, query}) {

    return (<input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
    />)
}

function Main({children}) {
    return (<main className="main">
        {children}
    </main>)
}

function Box({children}) {
    const [isOpen, setIsOpen] = useState(true);
    return (<div className="box">
        <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
    </div>)
}

function WatchedMovieList({watched, onDeleteMovie}) {
    return (<ul className="list">
        {watched.map((movie) => <WatchedMovie movie={movie} key={movie.imdbID} onDeleteMovie={onDeleteMovie}/>)}
    </ul>)
}

function WatchedMovie({movie, onDeleteMovie}) {
    return (<li>
        <img src={movie.poster} alt={`${movie.title} poster`}/>
        <h3>{movie.title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>
            <button className={"btn-delete"} onClick={() => onDeleteMovie(movie.imdbId)}>X</button>
        </div>
    </li>)
}

function WatchedSummary({watched}) {

    const avgImdbRating = Math.round(average(watched.map((movie) => movie.imdbRating)));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (<div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating.toFixed(2)}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime.toFixed(2)} min</span>
            </p>
        </div>
    </div>)
}


function MovieList({movies, onSelectedMovie}) {

    return (<ul className="list list-movies">
        {movies?.map((movie) => <Movie movie={movie} onSelectedMovie={onSelectedMovie} key={movie.imdbID}/>)}
    </ul>)
}

function Movie({movie, onSelectedMovie}) {
    return (<li onClick={() => onSelectedMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>)
}


