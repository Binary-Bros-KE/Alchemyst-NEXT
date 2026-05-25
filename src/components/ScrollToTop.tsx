'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`bg-primary fixed bottom-6 right-6 max-md:bottom-4 max-md:right-4 z-50 flex h-10 w-10 max-md:w-10 max-md:h-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 p-1 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <img
        src="https://res.cloudinary.com/dowxcmeyy/image/upload/v1773152204/dildo-icon-new_i9xbee.png"
        alt="Scroll to top"
      />
    </button>
  );
}
