<<<<<<< HEAD
import React from 'react'
import Search from './Search'

const Hero = ({searchTerm, setSearchTerm}) => {
  return (
    <div className='container flex flex-col justify-center items-center text-center h-[60%] w-[80%] '>
      <h1 className='w-[50%] text-center text-6xl text-white font-bold px-18 pt-28'>Find Your Favourite <span className='text-amber-700'>Movies</span> Without Any Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
    </div>
  )
}

export default Hero
=======
import React from 'react'
import Search from './Search'

const Hero = ({searchTerm, setSearchTerm}) => {
  return (
    <div className='container flex flex-col items-center text-center h-auto w-[80%] '>
      <h1 className='w-[50%] text-center text-6xl text-white font-bold px-18 pt-28'>Find Your Favourite <span className='text-amber-700'>Movies</span> Without Any Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
    </div>
  )
}

export default Hero
>>>>>>> 038bbb9 (first commit)
