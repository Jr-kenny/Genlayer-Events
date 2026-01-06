import { useEffect } from 'react';

const DynamicBackground = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-overlay pointer-events-none z-0 dark:opacity-100 opacity-30" />
      
      {/* Dynamic lighting blob */}
      <div className="dynamic-blob dark:opacity-100 opacity-50" />
      
      {/* Noise overlay */}
      <div className="noise-overlay dark:opacity-5 opacity-[0.02]" />
    </>
  );
};

export default DynamicBackground;
