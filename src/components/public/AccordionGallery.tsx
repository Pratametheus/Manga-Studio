import { useState, useRef, useEffect } from 'react';
import { ProjectManga } from '../../types';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink, PenTool } from 'lucide-react';

interface AccordionGalleryProps {
  mangas: ProjectManga[];
}

export function AccordionGallery({ mangas }: AccordionGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  if (mangas.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col md:flex-row w-full h-[550px] md:h-[600px] gap-2 md:gap-3 overflow-hidden rounded-3xl"
    >
      {mangas.map((manga, i) => {
        const isActive = hoveredIndex === i;

        return (
          <motion.div
            key={manga.id}
            className="relative cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? {
              opacity: 1,
              y: 0,
              flex: isActive ? 5 : 1,
            } : { opacity: 0, y: 40 }}
            transition={{
              flex: { type: 'spring', bounce: 0, duration: 0.7 },
              opacity: { duration: 0.6, delay: i * 0.08 },
              y: { duration: 0.6, delay: i * 0.08 }
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onClick={() => setHoveredIndex(i)}
          >
            {/* Background Image */}
            <motion.img
              src={manga.cover_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(manga.judul)}&background=1E293B&color=fff&size=400`}
              alt={manga.judul}
              className="absolute inset-0 w-full h-full object-cover origin-center"
              animate={{
                scale: isActive ? 1.05 : 1.2,
                opacity: isActive ? 1 : 0.4,
                filter: isActive ? 'grayscale(0%)' : 'grayscale(60%)'
              }}
              transition={{ duration: 0.7 }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Index number (inactive state) */}
            <AnimatePresence>
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none"
                >
                  <span className="font-heading text-6xl md:text-8xl font-bold text-white leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
              <motion.div
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 20
                }}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                transition={{ duration: 0.5, delay: isActive ? 0.2 : 0 }}
                className="flex flex-col justify-end"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-pink-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-full">
                    Unggulan
                  </span>
                  <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wide">
                    {manga.target_pasar}
                  </span>
                </div>

                <h3 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 leading-[1.05]">
                  {manga.judul}
                </h3>

                <p className="text-slate-300 text-sm md:text-base line-clamp-2 font-medium max-w-xl mb-6">
                  {manga.logline || manga.sinopsis_lengkap?.substring(0, 150)}
                </p>

                <Link
                  to={`/manga/${manga.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-pink-500 hover:text-white transition-colors rounded-full w-fit font-bold text-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lihat Detail
                </Link>
              </motion.div>

              {/* Inactive Vertical Title */}
              <AnimatePresence>
                {!isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-5 left-5 md:bottom-6 md:left-6 pointer-events-none"
                  >
                    <h3 className="font-heading text-lg md:text-xl font-bold text-white tracking-tight whitespace-nowrap md:writing-vertical md:rotate-180">
                      {manga.judul}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom line for active panel */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
