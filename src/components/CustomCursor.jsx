import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const outline = cursorOutlineRef.current;
    
    if (!dot || !outline) return;

    let posX = 0;
    let posY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const animateCursor = () => {
      posX += (mouseX - posX) / 6;
      posY += (mouseY - posY) / 6;
      
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      
      outline.style.left = `${posX}px`;
      outline.style.top = `${posY}px`;
      
      requestAnimationFrame(animateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = () => {
      hoverRef.current = true;
      document.body.classList.add('hovering');
    };

    const handleMouseLeave = () => {
      hoverRef.current = false;
      document.body.classList.remove('hovering');
    };

    // Add event listeners to interactive elements
    const interactables = document.querySelectorAll(
      'a, button, .interactable, input, textarea, select'
    );
    
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    document.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorDotRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999]"
      />
      <div 
        ref={cursorOutlineRef} 
        className="fixed top-0 left-0 w-10 h-10 border border-white/30 rounded-full pointer-events-none z-[9999] transition-all duration-200"
      />
    </>
  );
};

export default CustomCursor;