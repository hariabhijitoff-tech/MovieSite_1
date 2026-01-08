import { useState, useEffect, useRef } from 'react'
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

  const cache = useRef({})

  useDebounce(() => setdebouncedTerm(searchTerm), 1000, [searchTerm]);


  useEffect(() => {
    const controller = new AbortController(); 
    const signal = controller.signal;
    const fetchMovies = async () => {
        if (!debouncedTerm) {
      setmovieList([])
      seterrorMessage("")
      return
    }

    if (cache.current[debouncedTerm]) {
      setmovieList(cache.current[debouncedTerm])
      return
    }

    setloading(true)
    seterrorMessage("")
    try {
      const endpoint =
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          API_BASE_URL + "&s=" + debouncedTerm
        )}`

      const response = await fetch(endpoint, { ...API_OPTIONS, signal })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.Response === "False") {
        seterrorMessage("No movies found.")
        setmovieList([])
        return
      }
      setmovieList(data.Search || [])
      seterrorMessage("")
      cache.current[debouncedTerm] = data.Search || []
      console.log(data)
    }
    catch (error) {
      if(error.name === 'AbortError') {
        return
      }
      console.error("Error fetching movies:", error)
      seterrorMessage("Failed to fetch movies. Please try again later.")
    }

    finally {
      if(!signal.aborted){
      setloading(false)
      }
    }

  }
  
  fetchMovies()
  
  return () => controller.abort()
  
  }, [debouncedTerm])


  return (
    <>
      <main className='h-[3000px] w-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center'>
        <Navbar />
        <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <section className='all-movies w-[80%] mt-8 mb-12'>
          <h2 className='text-2xl text-white font-bold pb-2'>ALL MOVIES</h2>
          {movieList.length > 0 && (
            <p className="text-slate-300 mb-2">
              Showing {movieList.length} results for "{debouncedTerm}"
            </p>
          )}

          {loading ? (
            <p className='text-white'><SpinnerIcon /></p>
          ) : errorMessage ? errorMessage : movieList.length > 0 ? (
            <div className='movie-grid grid grid-cols-4 gap-6 p-4'>
              {movieList.map((movie) => (
                <div key={movie.imdbID} className='movie-card w-74 h-fit min-h-[460px] bg-slate-700 rounded-4xl shadow-md p-4 flex flex-col transition-all ease-in hover:scale-105 hover:bg-slate-600 cursor-pointer'>
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : "./src/assets/poster.png"}
                    alt={movie.Title}
                    className='movie-poster m-auto w-64 max-w-64 rounded-2xl drop-shadow-2xl'
                  />
                  <div className="infos text-white text-md my-2 px-2 flex flex-col items-baseline gap-2">
                    <h3 className='movie-title text-xl font-bold'>{movie.Title}</h3>
                    <div className="data flex gap-4">
                    <p className='movie-year'>{movie.Year}</p>
                    <span>•</span>
                    <p className='movie-rating'>{movie.Type }</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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