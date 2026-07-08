import { ExternalLink } from 'lucide-react';
import { ProjectManga } from '../../../types';
import { Link } from 'react-router-dom';

interface MangaCardProps {
  manga: ProjectManga;
}

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link 
      to={`/manga/${manga.id}`}
      className="block snap-start group relative flex-none w-[140px] sm:w-[180px] md:w-[220px] lg:w-[240px] aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 bg-gray-900 border border-white/10"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform">
        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          {manga.target_pasar}
        </span>
        <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 text-shadow-sm">
          {manga.judul}
        </h3>
        <p className="text-xs text-gray-300 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-150 font-medium">
          {manga.logline}
        </p>
      </div>

      <div className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/20">
        <ExternalLink className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
}
