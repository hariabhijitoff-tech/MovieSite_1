import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SpinnerIcon from './components/SpinnerIcon'
import RecentlyViewed from './components/RecentlyViewed'
import { useDebounce } from 'react-use'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY
const API_BASE_URL = "http://www.omdbapi.com/?apikey=" + API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}



function App() {

  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, seterrorMessage] = useState("")
  const [movieList, setmovieList] = useState([])
  const [loading, setloading] = useState(false)
  const [loading2, setloading2] = useState(false)
  const [debouncedTerm, setdebouncedTerm] = useState('')
  const [pageNo, setpageNo] = useState(1)
  const [totalResults, settotalResults] = useState(0)
  const [type, settype] = useState('')
  const [hasSearched, sethasSearched] = useState(false)
  const [selectedMovie, setselectedMovie] = useState(null)
  const [movieDetails, setmovieDetails] = useState(null)

  const [liked, setliked] = useState(false)
  const [saved, setsaved] = useState(false)
  const [shared, setshared] = useState(false)


  let totalPages = 0
  if (totalResults > 0) { totalPages = Math.ceil(totalResults / 10) }

  const cache = useRef({})

  useDebounce(() => setdebouncedTerm(searchTerm), 1000, [searchTerm]);

  useEffect(() => {
    setpageNo(1)
  }, [debouncedTerm])

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchMovies = async () => {

      if (!debouncedTerm) {
        setmovieList([])
        seterrorMessage("")
        sethasSearched(false)
        return
      }

      hasSearched || sethasSearched(true)
      const cacheKey = `${debouncedTerm}-${pageNo}-${type}`;
      if (cache.current[cacheKey]) {
        setmovieList(cache.current[cacheKey])
        return
      }

      // if (cache.current[debouncedTerm]) {
      //   setmovieList(cache.current[debouncedTerm])
      //   return
      // }


      setloading(true)
      seterrorMessage("")
      try {
        // const endpoint =
        //   `https://api.allorigins.win/raw?url=${encodeURIComponent(
        //     API_BASE_URL + "&s=" + debouncedTerm + "&page=" + pageNo
        //   )}`

        const endpoint = `/omdb/?apikey=${API_KEY}&s=${debouncedTerm}&page=${pageNo}&type=${type}`

        const response = await fetch(endpoint, { ...API_OPTIONS, signal })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.Response === "False") {
          if (pageNo === 1) {
            seterrorMessage(data.error || "")
            setmovieList([])
          }
          return
        }

        const newMovies = data.Search || []
        const total = parseInt(data.totalResults, 10) || 0
        settotalResults(total)

        setmovieList(newMovies || [])
        seterrorMessage("")
        cache.current[cacheKey] = newMovies
        console.log(data)
      }
      catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        if (pageNo > 1) {
          setpageNo(prev => prev - 1)
        }

        console.error("Error fetching movies:", error)
        seterrorMessage("Failed to fetch movies. Please try again later.")
      }

      finally {
        if (!signal.aborted) {
          setloading(false)

        }
      }

    }

    fetchMovies()

    return () => controller.abort()

  }, [debouncedTerm, pageNo, type])


const firstRender = useRef(true)

useEffect(() => {
  if (firstRender.current) {
    firstRender.current = false
    return
  }

  window.scrollTo({
    top: 340,
    behavior: 'smooth'
  })
}, [pageNo])



  useEffect(() => {
    const getDetails = async () => {
      if (!selectedMovie) return;

      const cacheKey = `${selectedMovie.imdbID}`;
      if (cache.current[cacheKey]) {
        setmovieDetails(cache.current[cacheKey])
        return
      }

      setloading2(true)
      seterrorMessage("")
      try {
        const endpoint = `/omdb/?apikey=${API_KEY}&i=${selectedMovie.imdbID}&plot=short`
        const response = await fetch(endpoint, API_OPTIONS)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.Response === "False") {
          seterrorMessage(data.error || "")
          return
        }

        setmovieDetails(data)
        cache.current[cacheKey] = data
        console.log(data)

      }
      catch (error) {
        console.error("Error fetching movie details:", error)
      }

      finally {
        setloading2(false)
      }
    }

    getDetails()

  }, [selectedMovie])

  const LOGO_MAP = {
  'Internet Movie Database': './src/assets/icons_logo/imdb.png',
  'Rotten Tomatoes': './src/assets/icons_logo/rt.png',
  'Metacritic': './src/assets/icons_logo/metacritic.svg'
};
  const BASE_MAP = {
  'Internet Movie Database': 'https://www.imdb.com/title/',
  'Rotten Tomatoes': 'https://www.rottentomatoes.com/',
  'Metacritic': 'https://www.metacritic.com/'
};



  return (
    <>
      <main className='max-h-[2500px] min-h-[1600px] w-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center'>
        <Navbar />
        <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <section className='all-movies w-[80%] mt-8 mb-12'>

          {loading ? (
            <p className='text-white'><SpinnerIcon /></p>
          ) : errorMessage ? <div className='text-white'>{errorMessage}</div> : movieList.length > 0 ? ( <>
          <div className="allmovies-header flex justify-between items-center">
            <h2 className='text-2xl text-white font-bold pb-2'>All {type === "" ? "resuts" : type === "series" ? `series` : `${type}s`}</h2>
            <div className="group relative">

              <button className='type-btn font-bold bg-slate-700 text-white px-4 py-2 rounded-2xl cursor-pointer focus:scale-95 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600'>Type</button>

              <div className='absolute z-10 opacity-100 group-hover:opacity-100 group-hover:visible group-hover:translate-y-1 transition-all ease-in focus-within:opacity-100 focus-within:visible focus-within:translate-y-1 text-center invisible translate-y-0 top-10 right-0 bg-slate-700 rounded-2xl shadow-lg mt-1 text-white font-light flex flex-col gap-2'>
                <div onClick={() => settype("")} className="type-movie cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100 rounded-t-2xl">All</div>
                <div onClick={() => settype("movie")} className="type-movie cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100">Movie</div>
                <div onClick={() => settype("series")} className="type-series cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100">Series</div>
                <div onClick={() => settype("game")} className="type-games cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100 rounded-b-2xl">Game</div>
              </div>
            </div>
          </div>
            <div className="wrapper">
              <p className="text-slate-300 mb-2">
                Showing {movieList.length} of {totalResults} results for "{debouncedTerm}"
              </p>
              <div className='movie-grid grid grid-cols-5 gap-6 p-4 relative'>
                {selectedMovie && (<><div id='full-card' className="w-220 h-130 fixed z-30 bg-slate-600/40 backdrop-blur-[6px] rounded-[20px] inset-0 m-auto p-6 border border-slate-500 flex flex-col items-center justify-center animate-popup transition-all ease-in">
                  <button className='cursor-pointer rounded-full bg-slate-400 px-2 text-md font-bold absolute right-2 top-2' onClick={() => setselectedMovie(null)}>X</button>
                  <div className="inner-card px-4 bg-slate-950 w-full h-full rounded-[14px] flex items-center overflow-hidden">
                    {loading2 ? (<div className='w-full h-full flex justify-center items-center'><SpinnerIcon /></div>) : movieDetails ? (
                      <div className="details w-full flex items-center gap-6 p-4 text-white">
                        <div className="poster-wrap bg-slate-500 rounded-[10px] flex items-center justify-center py-2 px-2 w-auto h-auto shrink-0">
                        <img src={movieDetails.Poster !== "N/A" ? movieDetails.Poster : "./src/assets/poster.png"} alt={movieDetails.Title} className='max-w-64 border-2 border-slate-500 rounded-[10px] drop-shadow-md drop-shadow-slate-600/40' />
                        </div>
                        <div className="right">
                        <div className="movie-infos h-[390px] flex flex-col justify-safe-center overflow-y-auto pr-2 mt-6">
                          <h2 className='text-3xl font-bold mb-2'>{movieDetails.Title} ({movieDetails.Year})</h2>
                          <p className='mb-2 flex gap-2'><span>{movieDetails.Type}</span><span>•</span>{movieDetails.Rated!=="N/A" && <><span>{movieDetails.Rated}</span><span>•</span></>}{(movieDetails.Type === "series" && movieDetails.totalSeasons !== "N/A") && (<><span>{movieDetails.totalSeasons} Seasons</span></>)}{(movieDetails.Type !== "series" && movieDetails.Runtime !== "N/A") && (<><span>{movieDetails.Runtime}</span></>)}</p>
                          <p className='mb-2'><span className='font-bold'>Genre:</span> {movieDetails.Genre}</p>
                          <p className='mb-2'><span className='font-bold'>Language:</span> {movieDetails.Language}</p>
                          <p className='mb-2'><span className='font-bold'>Director:</span> {movieDetails.Director}</p>
                          <p className='mb-2'><span className='font-bold'>Cast:</span> {movieDetails.Actors}</p>
                          <p className='mb-2'><span className='font-bold'>Writer:</span> {movieDetails.Writer}</p>
                          <p className='mb-2'><span className='font-bold'>Plot:</span> {movieDetails.Plot}</p>
                          <div className="ratings flex w-full justify-center items-center gap-8 mb-2">
                            {movieDetails.Ratings && movieDetails.Ratings.length > 0 && movieDetails.Ratings.map((rating, index)=>{ const logoUrl = LOGO_MAP[rating.Source]; const baseUrl = BASE_MAP[rating.Source];  return( <div className='flex items-center gap-2'><a href={rating.Source === "Internet Movie Database"? `${baseUrl}${movieDetails.imdbID}/`: rating.Source === "Rotten Tomatoes"?  `https://www.google.com/search?q=${encodeURIComponent(`site:rottentomatoes.com ${movieDetails.Title} ${movieDetails.Year}`)}` : `${baseUrl}/${movieDetails.Type === "movie"? 'movie' : 'tv'}/${movieDetails.Title.replaceAll(":","").replaceAll(" ","-").toLowerCase()}`} target='_blank' rel='noreferrer'><img className='w-6 shrink-0 object-contain' src={logoUrl} alt="logo"/></a> <span>{rating.Value}</span></div>)})}
                          </div>
                        </div>
                        <div className="buttons flex gap-8 mb-6 mt-2 justify-center">
                          <button onClick={()=>{setliked(!liked)}} className='bg-slate-500/20 py-2 px-3 rounded-full hover:bg-slate-400/20 cursor-pointer hover:scale-95 transition-all ease-in'><svg className={liked ? "w-4 fill-amber-500 animate-popup2 transition-all" : "w-4"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg></button>
                          <button onClick={()=>{setsaved(!saved)}} className='bg-slate-500/20 py-2 px-3 rounded-full hover:bg-slate-400/20 cursor-pointer hover:scale-95 transition-all ease-in'><svg className={saved ? "w-4 fill-amber-500 animate-popup2 transition-all" : "w-4"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"/></svg></button>
                          <button onClick={()=>{setshared(!shared)}} className='bg-slate-500/20 py-2 px-3 rounded-full hover:bg-slate-400/20 cursor-pointer hover:scale-95 transition-all ease-in'><svg className={shared ? "w-4 fill-amber-500 animate-popup2 transition-all" : "w-4"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"/></svg></button>
                          <button className='bg-amber-600 py-2 px-4 rounded-full hover:bg-amber-500 cursor-pointer hover:scale-95 transition-all ease-in'>M</button>
                        </div>
                        </div> 
                      </div>) : (<p className='text-white'>No details found.</p>)}
                  </div>
                  </div>
                  <div className="backdrop-wrap w-screen h-screen fixed inset-0 z-20 backdrop-blur-[6px] bg-slate-900/20"></div></>)}


                  {movieList.map((movie) => { const saveRecentlyViewed = (movie) => {
                        const key = "recently_viewed_movies";
                        const old = JSON.parse(localStorage.getItem(key)) || [];

                        // remove duplicates by imdbID
                        const filtered = old.filter((m) => m.imdbID !== movie.imdbID);

                        const updated = [movie, ...filtered].slice(0, 6); // keep max 10

                        localStorage.setItem(key, JSON.stringify(updated));
                      };
  
                    return(
                    <div key={movie.imdbID} onClick={() => {setselectedMovie(movie); saveRecentlyViewed(movie);}} className='movie-card w-64 h-fit min-h-[400px] bg-slate-700 rounded-4xl shadow-md p-4 flex flex-col transition-all ease-in hover:scale-105 hover:bg-slate-600 cursor-pointer'>
                      <img
                        src={movie.Poster !== "N/A" ? movie.Poster : "./src/assets/poster.png"}
                        alt={movie.Title}
                        className='movie-poster m-auto w-56 max-w-56 h-[2/3] rounded-2xl drop-shadow-2xl'
                      />
                      <div className="infos text-white text-md my-2 px-2 flex flex-col items-baseline gap-2">
                        <h3 className='movie-title text-xl font-bold'>{movie.Title}</h3>
                        <div className="data flex gap-4">
                          <p className='movie-year'>{movie.Year}</p>
                          <span>•</span>
                          <p className='movie-rating'>{movie.Type}</p>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
                <div className="page-no text-md text-center text-white mt-6 pb-4"> Page {pageNo} of {totalPages}</div>

                <div className="pages text-center flex justify-center gap-10">
                  <button disabled={pageNo === 1} onClick={() => { setpageNo(prev => prev - 1) }} className='prev-btn bg-slate-700 text-white px-3 py-3 rounded-2xl cursor-pointer hover:scale-90 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600 disabled:pointer-events-none disabled:bg-slate-500'>&lt;&lt; Prev</button>
                  <button disabled={pageNo === totalPages} onClick={() => { setpageNo(prev => prev + 1); }} className='next-btn bg-slate-700 text-white px-3 py-3 rounded-2xl cursor-pointer hover:scale-90 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600 disabled:pointer-events-none disabled:bg-slate-500'>Next &gt;&gt;</button>
                </div>
              </div> </>
              ) : !loading && hasSearched && movieList.length === 0 && !errorMessage && (
              <p className='text-red-400'>No movies found. Try a different search.</p>
          )}
            </section>
            <RecentlyViewed setselectedMovie={setselectedMovie}/>
      </main>
    </>
  )
}

export default App








{/* <h1 className='text-6xl font-bold mx-12'>{name?<>Hello, <span className='bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent'>{name} !</span></>: "Hello"}</h1> */ }
{/* <main className='h-screen w-screen flex flex-col justify-center items-start bg-gradient-to-br from-fuchsia-200 via-cyan-200 to-lime-200'> */ }

