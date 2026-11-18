import { BrowserRouter } from "react-router-dom"

import NavBar from "./components/Navbar"
import Hero from "./components/Hero"
import About from "./components/About"
import Work from "./components/Work"
import Contact from "./components/Contact"
import Experience from "./components/Experience"
import Github from "./components/Github"

const App = () => {
  return (
    <>
      <BrowserRouter>
      <div className='relative z-0 bg-primary'>
        <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
          <NavBar />
          <Hero />
        </div>
        <About />
        <Work />
        <Experience />
        <Github />
        <Contact />
      </div>
    </BrowserRouter>
    </>
  )
}

export default App