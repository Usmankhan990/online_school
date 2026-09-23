import { useState, useEffect } from 'react';
import slide1 from '../assets/slides/slide1.jpg';
import slide2 from '../assets/slides/slide2.jpg';
import slide3 from '../assets/slides/slide3.jpg';

const SLIDES = [
  { img: slide1, title: 'Smart Digital Classrooms' },
  { img: slide2, title: 'Live Interactive Teaching' },
  { img: slide3, title: 'Collaborative Learning' },
];

export default function AuthBackgroundSlider({ overlayOpacity = 0.78 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Background Slides */}
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 5s ease-out',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              backgroundImage: `url(${slide.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'opacity, transform',
            }}
          />
        );
      })}

      {/* Professional Gradient Overlay for High Contrast & Text Legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, rgba(28, 25, 23, ${overlayOpacity}) 0%, rgba(44, 39, 36, ${Math.max(overlayOpacity - 0.08, 0.45)}) 50%, rgba(28, 25, 23, ${Math.min(overlayOpacity + 0.1, 0.95)}) 100%)`,
        }}
      />

      {/* Subtle Dot Grid Accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

    </div>
  );
}
