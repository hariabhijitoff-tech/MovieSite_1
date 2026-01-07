<<<<<<< HEAD
import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
        <div className='search flex items-center gap-2 text-white w-[440px] rounded-2xl bg-[#121B30] px-4 py-2 mt-12'>
            <img className=' size-6' src="./src/assets/search.svg" alt="searxch" />
            <input type="text" className=' px-2 py-2 text-xl grow-1 outline-0' placeholder='enter movie name' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
  )
}

export default Search
=======
import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
        <div className='search flex items-center gap-2 text-white w-[440px] rounded-2xl bg-[#121B30] px-4 py-2 mt-12'>
            <img className=' size-6' src="./src/assets/search.svg" alt="searxch" />
            <input type="text" className=' px-2 py-2 text-xl grow-1 outline-0' placeholder='enter movie name' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
  )
}

export default Search
>>>>>>> 038bbb9 (first commit)
