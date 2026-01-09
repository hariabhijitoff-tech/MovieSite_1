import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SpinnerIcon from './components/SpinnerIcon'
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
  const [debouncedTerm, setdebouncedTerm] = useState('')
  const [pageNo, setpageNo] = useState(1)
  const [totalResults, settotalResults] = useState(0)
  const [type, settype] = useState('')
  const [hasSearched, sethasSearched] = useState(false)
  const [selectedMovie, setselectedMovie] = useState(null)
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


  useLayoutEffect(() => {
    window.scrollTo({
      top: 340,
      left: 0,
      behavior: 'smooth'
    })
  }, [pageNo])


  return (
    <>
      <main className='max-h-[2500px] min-h-[1600px] w-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center'>
        <Navbar />
        <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <section className='all-movies w-[80%] mt-8 mb-12'>
          <div className="allmovies-header flex justify-between items-center">
            <h2 className='text-2xl text-white font-bold pb-2'>ALL {type=== "" ? "RESULTS" : type === "series" ? `${type.toUpperCase()}`:`${type.toUpperCase()}S`}</h2>
            <div className="group relative">

              <button className='type-btn font-bold bg-slate-700 text-white px-4 py-2 rounded-2xl cursor-pointer focus:scale-95 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600'>Type</button>

              <div className='absolute z-10 opacity-100 group-hover:opacity-100 group-hover:visible group-hover:translate-y-1 transition-all ease-in focus-within:opacity-100 focus-within:visible focus-within:translate-y-1 invisible translate-y-0 top-10 right-0 bg-slate-700 rounded-2xl shadow-lg mt-1 text-white font-light flex flex-col gap-2'>
                <div onClick={()=>settype("")} className="type-movie cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100 rounded-t-2xl">All</div>
                <div onClick={()=>settype("movie")} className="type-movie cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100 rounded-t-2xl">Movie</div>
                <div onClick={()=>settype("series")} className="type-series cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100">Series</div>
                <div onClick={()=>settype("game")} className="type-games cursor-pointer hover:bg-slate-500 px-4 py-2 transition-all ease-in duration-100 rounded-b-2xl">Game</div>
              </div>
            </div>
          </div>

          {loading ? (
            <p className='text-white'><SpinnerIcon /></p>
          ) : errorMessage ? <div className='text-white'>{errorMessage}</div> : movieList.length > 0 ? (
            <div className="wrapper">
                <p className="text-slate-300 mb-2">
                  Showing {movieList.length} of {totalResults} results for "{debouncedTerm}"
                </p>
              <div className='movie-grid grid grid-cols-5 gap-6 p-4 relative'>
            { selectedMovie && (<><div id='full-card' className="w-220 h-130 fixed z-30 bg-red-800 rounded-3xl inset-0 m-auto">
              <button className='cursor-pointer rounded full bg-amber-400 text-7xl absolute right-0' onClick={()=>setselectedMovie(null)}>X</button>
            </div>
              <div className="backdrop-wrap w-screen h-screen fixed inset-0 z-20 backdrop-blur-[2px] bg-slate-900/40"></div></>)}
                {movieList.map((movie) => (
                  <div key={movie.imdbID} onClick={()=>setselectedMovie(movie)} className='movie-card w-64 h-fit min-h-[400px] bg-slate-700 rounded-4xl shadow-md p-4 flex flex-col transition-all ease-in hover:scale-105 hover:bg-slate-600 cursor-pointer'>
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
                ))}
              </div>
              <div className="page-no text-md text-center text-white mt-6 pb-4"> Page {pageNo} of {totalPages}</div>

              <div className="pages text-center flex justify-center gap-10">
                <button disabled={pageNo === 1} onClick={() => { setpageNo(prev => prev - 1) }} className='prev-btn bg-slate-700 text-white px-3 py-3 rounded-2xl cursor-pointer hover:scale-90 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600 disabled:pointer-events-none disabled:bg-slate-500'>&lt;&lt; Prev</button>
                <button disabled={pageNo === totalPages} onClick={() => { setpageNo(prev => prev + 1); }} className='next-btn bg-slate-700 text-white px-3 py-3 rounded-2xl cursor-pointer hover:scale-90 transition-all ease-in hover:bg-slate-600 drop-shadow-slate-800 drop-shadow-md border-1 border-slate-600 disabled:pointer-events-none disabled:bg-slate-500'>Next &gt;&gt;</button>
              </div>
            </div>
          ) : !loading && hasSearched && movieList.length === 0 && !errorMessage && (
            <p className='text-red-400'>No movies found. Try a different search.</p>
          )}
        </section>
      </main>
    </>
  )
}

export default App








{/* <h1 className='text-6xl font-bold mx-12'>{name?<>Hello, <span className='bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent'>{name} !</span></>: "Hello"}</h1> */ }
{/* <main className='h-screen w-screen flex flex-col justify-center items-start bg-gradient-to-br from-fuchsia-200 via-cyan-200 to-lime-200'> */ }