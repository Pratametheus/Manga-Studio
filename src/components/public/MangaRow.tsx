import { useRef } from 'react';
import { ProjectManga } from '../../../types';
import { MangaCard } from './MangaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MangaRowProps {
  title: string;
  mangas: ProjectManga[];
}

export function MangaRow({ title, mangas }: MangaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (mangas.length === 0) return null;

  return (
    <div className="py-6 group relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide border-l-4 border-yellow-400 pl-3 leading-none">
          {title}
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-20 flex items-center justify-start px-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <div className="w-10 h-10 bg-black/50 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronLeft className="w-6 h-6" />
          </div>
        </button>

        {/* Row Content */}
        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-10 pt-4 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-20 flex items-center justify-end px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-10 h-10 bg-black/50 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}
