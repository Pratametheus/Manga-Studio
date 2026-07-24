import { motion } from 'motion/react';

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number;
}

export function InfiniteMarquee({ items, speed = 40 }: InfiniteMarqueeProps) {
  return (
    <div className="relative w-full overflow-hidden bg-pink-500 py-4 flex items-center border-y-4 border-slate-900 border-dashed">
      <motion.div
        className="flex whitespace-nowrap gap-12 px-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {/* Render twice for seamless looping */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="text-xl md:text-3xl font-black uppercase tracking-widest text-white font-heading">
              {item}
            </span>
            <span className="text-slate-900 text-3xl">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
