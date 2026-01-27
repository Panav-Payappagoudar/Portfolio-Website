import React from 'react';
import { ReactLenis } from 'lenis/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Founder from './components/Founder';
import Experience from './components/Experience';
import BentoGrid from './components/BentoGrid';
import Education from './components/Education';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Background from './components/Background';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <ReactLenis root>
      <div className="relative w-full min-h-screen text-white">
        <CustomCursor />
        <Background />
        <Navbar />
        <main className="relative z-10 flex flex-col items-center w-full">
          <Hero />
          <About />
          <Founder />
          <Experience />
          <BentoGrid />
          <Education />
          <Skills />
          <Footer />
        </main>
      </div>
    </ReactLenis>
  );
}

export default App;