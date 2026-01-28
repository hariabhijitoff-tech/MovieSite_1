import React from 'react'
import { useEffect, useState } from 'react'



const RecentlyViewed = ({ setselectedMovie }) => {

    const [recents, setrecents] = useState([])

    useEffect(() => {
        const getRecentlyViewed = () => { return JSON.parse(localStorage.getItem("recently_viewed_movies")) || []; }
        setrecents(getRecentlyViewed());
    }, [])


    return (
        <div className='w-[80%]'>
            <h2 className='text-2xl text-white font-bold pb-2 mb-4 '>Recently Viewed</h2>
            <div className="recently-viewed-movies flex gap-6 overflow-x-auto pb-4 m-auto w-[1416px]">
                {recents.length === 0 ? (
                    <p className='text-white'>No recently viewed movies.</p>) : (
                    recents.map((movie) => (
                        <div key={movie.imdbID} onClick={() => setselectedMovie(movie)} className='movie-card w-54 h-fit min-h-[200px] bg-slate-700 rounded-4xl shadow-md p-4 flex flex-col transition-all ease-in hover:scale-105 hover:bg-slate-600 cursor-pointer'>
                            <img
                                src={movie.Poster !== "N/A" ? movie.Poster : "./src/assets/poster.png"}
                                alt={movie.Title}
                                className='movie-poster m-auto w-46 max-w-46 h-[2/3] max-h-66 rounded-2xl drop-shadow-2xl'
                            />
                            <div className="infos text-white text-md my-2 px-2 flex flex-col items-baseline gap-2">
                                <h3 className='movie-title text-md font-bold'>{movie.Title}</h3>
                                <div className="data flex gap-4">
                                    <p className='movie-year'>{movie.Year}</p>
                                    <span>•</span>
                                    <p className='movie-rating'>{movie.Type}</p>
                                </div>
                            </div>
                        </div>)))}
                        </div>
        </div>
        )
}

export default RecentlyViewed
