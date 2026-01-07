import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

function App() {

  const [name, setName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <>
    <main className='h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center'>
      <Navbar/>
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
    </main>
    </>
  )
}

export default App








{/* <h1 className='text-6xl font-bold mx-12'>{name?<>Hello, <span className='bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent'>{name} !</span></>: "Hello"}</h1> */}
{/* <main className='h-screen w-screen flex flex-col justify-center items-start bg-gradient-to-br from-fuchsia-200 via-cyan-200 to-lime-200'> */}