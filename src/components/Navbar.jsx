import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMenu();
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a 
            href="#" 
            className="font-mono text-xs sm:text-sm tracking-[0.05em] sm:tracking-[0.1em] uppercase hover:text-white/70 transition-colors z-50 relative truncate max-w-[200px] sm:max-w-none"
          >
            PANAV_PAYAPPAGOUDAR<span className="text-blue-500 animate-pulse">_</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 font-mono text-[11px] tracking-widest text-white/50">
            <button 
              onClick={() => scrollToSection('about')} 
              className="hover:text-white transition-colors"
            >
              01. ABOUT
            </button>
            <button 
              onClick={() => scrollToSection('venture')} 
              className="hover:text-white transition-colors"
            >
              02. VENTURE
            </button>
            <button 
              onClick={() => scrollToSection('experience')} 
              className="hover:text-white transition-colors"
            >
              03. EXPERIENCE
            </button>
            <button 
              onClick={() => scrollToSection('projects')} 
              className="hover:text-white transition-colors"
            >
              04. PROJECTS
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-6 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            >
              GET IN TOUCH
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-white z-50 relative p-2.5 rounded-md border border-white/20 bg-black hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Open Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black z-[60] transform transition-transform duration-500 cubic-bezier(0.77, 0, 0.175, 1) flex flex-col justify-center items-center space-y-8 md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <button 
            onClick={closeMenu}
            className="absolute top-6 right-6 text-white/60 hover:text-white p-4 focus:outline-none"
            aria-label="Close Menu"
          >
            <X className="w-8 h-8" />
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-3xl font-light tracking-tight hover:text-white/60 transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('venture')}
            className="text-3xl font-light tracking-tight hover:text-white/60 transition-colors"
          >
            Venture
          </button>
          <button 
            onClick={() => scrollToSection('experience')}
            className="text-3xl font-light tracking-tight hover:text-white/60 transition-colors"
          >
            Experience
          </button>
          <button 
            onClick={() => scrollToSection('projects')}
            className="text-3xl font-light tracking-tight hover:text-white/60 transition-colors"
          >
            Projects
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-xl font-mono border border-white/20 px-8 py-3 rounded-full mt-8 bg-white text-black font-semibold"
          >
            GET IN TOUCH
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;