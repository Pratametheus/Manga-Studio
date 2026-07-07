import { useState, useEffect } from 'react';
import { ProjectManga } from '../../../types';
import { ExternalLink, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroCarouselProps {
  mangas: ProjectManga[];
}

export function HeroCarousel({ mangas }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (mangas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mangas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [mangas]);

  if (mangas.length === 0) return null;

  const current = mangas[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % mangas.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + mangas.length) % mangas.length);

  return (
    <div id="hero" className="relative w-full h-[85vh] min-h-[600px] max-h-[800px] overflow-hidden bg-black group">
      {/* Background Cover */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${current.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'})` }}
      />
      
      {/* Gradients to blend with dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6 animate-fade-in-up">
            
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase rounded">Karya Pilihan</span>
              <span className="text-yellow-400 font-bold text-sm tracking-widest uppercase">{current.target_pasar}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
              {current.judul}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 line-clamp-3 font-medium max-w-xl text-shadow-md">
              {current.logline || current.sinopsis_lengkap}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <a 
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-black text-lg tracking-widest uppercase rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
              >
                <ExternalLink className="w-6 h-6" />
                Baca di Webtoon
              </a>
              <button className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg tracking-widest uppercase rounded-lg transition-all backdrop-blur-md border border-white/20 hover:scale-105">
                <Info className="w-6 h-6" />
                Detail Project
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Controls */}
      {mangas.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {mangas.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-10 h-2 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'w-2 h-2 bg-white/40 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
