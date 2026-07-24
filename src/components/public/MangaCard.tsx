import { ExternalLink } from 'lucide-react';
import { ProjectManga } from '../../types';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { MouseEvent } from 'react';

interface MangaCardProps {
  manga: ProjectManga;
}

export function MangaCard({ manga }: MangaCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "-100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "-100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link to={`/manga/${manga.id}`} className="block snap-start group relative flex-none w-full aspect-[3/4] cursor-pointer" style={{ perspective: 1000 }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-lg border border-pink-100 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'})` }}
        />
        
        {/* Dynamic Glare Effect */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
            x: glareX,
            y: glareY,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-10" />
        
        <div 
          className="absolute inset-0 p-4 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-30"
          style={{ transform: "translateZ(30px)" }} // Pop out text
        >
          <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100 drop-shadow-md">
            {manga.target_pasar}
          </span>
          <h3 className="font-bold text-white text-lg md:text-xl leading-tight line-clamp-2 text-shadow-sm font-heading tracking-tight">
            {manga.judul}
          </h3>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-150 font-medium">
            {manga.logline}
          </p>
        </div>

        <div 
          className="absolute top-4 right-4 w-10 h-10 bg-pink-500/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-pink-200 z-30 shadow-lg"
          style={{ transform: "translateZ(40px)" }}
        >
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    </Link>
  );
}
