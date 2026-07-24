import { useRef, useEffect, useState } from "react";
import { ProjectManga } from "../../types";
import { MangaCard } from "./MangaCard";
import { motion, useInView } from "motion/react";
import { PenTool } from "lucide-react";

interface DragCarouselProps {
  mangas: ProjectManga[];
  title?: string;
}

export function DragCarousel({ mangas, title = "Mahakarya Terbaru" }: DragCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = containerRef.current.offsetWidth;
    const maxScroll = containerWidth - trackWidth;

    setDragConstraints({ right: 0, left: Math.min(0, maxScroll) });
  }, [mangas]);

  return (
    <section ref={containerRef} className="py-24 bg-slate-50 border-t border-slate-100 relative z-10 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900"
        >
          {title.split(' ').map((word, i) => (
            <span key={i}>
              {i === title.split(' ').length - 1 ? (
                <span className="text-pink-500">{word}</span>
              ) : (
                <>{word} </>
              )}
            </span>
          ))}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 font-medium mt-3 flex items-center gap-2"
        >
          Tarik untuk menjelajah ←→
        </motion.p>
      </div>

      {mangas.length > 0 ? (
        <>
          {/* Draggable Track Container */}
          <div className="overflow-hidden px-6 md:px-12 pb-8 cursor-grab active:cursor-grabbing">
            <motion.div
              ref={trackRef}
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={0.15}
              dragTransition={{ bounceStiffness: 200, bounceDamping: 25 }}
              className="flex gap-6 md:gap-8 w-max"
            >
              {mangas.map((manga, i) => (
                <motion.div
                  key={manga.id}
                  className="w-[220px] sm:w-[260px] md:w-[300px] lg:w-[340px] pointer-events-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                >
                  <MangaCard manga={manga} />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Gradient fade edges */}
          <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100">
            <PenTool className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada karya terbaru untuk ditampilkan.</p>
          </div>
        </div>
      )}
    </section>
  );
}
