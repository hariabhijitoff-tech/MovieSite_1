import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
        <div className='search flex items-center gap-2 text-white w-[440px] rounded-2xl border-1 border-slate-600 focus-within:border-0 bg-[#121B30] px-4 py-2 mt-12 focus-within:ring-2 ring-amber-700 focus-within:scale-110 transition-all ease-in'>
            <img className=' size-6' src="./src/assets/search.svg" alt="searxch" />
            <input type="text" className=' px-2 py-2 text-xl grow-1 outline-0' placeholder='enter movie name' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
  )
}

export default Search
