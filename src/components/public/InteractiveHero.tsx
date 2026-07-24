import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';

export function InteractiveHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const mascotX = useTransform(smoothX, (v) => v * -0.5);
  const mascotY = useTransform(smoothY, (v) => v * -0.5);
  const shape1X = useTransform(smoothX, (v) => v * 1.5);
  const shape1Y = useTransform(smoothY, (v) => v * 1.5);
  const shape2X = useTransform(smoothX, (v) => v * -1.2);
  const shape2Y = useTransform(smoothY, (v) => v * 1.2);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x * 100);
      mouseY.set(y * 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // GSAP stagger text reveal on mount
  useEffect(() => {
    if (!headlineRef.current) return;

    const lines = headlineRef.current.querySelectorAll('.hero-line');

    // Animate lines
    gsap.fromTo(lines,
      { opacity: 0, y: 40, rotateX: -60 },
      {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'expo.out',
        delay: 0.3
      }
    );

    // Animate subtitle
    if (subRef.current) {
      gsap.fromTo(subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, []);

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-white">
      {/* Grid dots background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ec4899 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      {/* Glowing Orb that follows mouse */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-pink-200/40 rounded-full blur-[120px] pointer-events-none z-0"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center mt-16 md:mt-0">
        <div className="text-center lg:text-left pt-8 md:pt-0" style={{ perspective: '600px' }}>
          <h1 ref={headlineRef} className="text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-black uppercase tracking-tighter leading-[0.9] text-slate-900 mb-4 lg:mb-6 font-heading">
            <span className="hero-line block">MELAMPAUI</span>
            <span className="hero-line block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">BATAS</span>
          </h1>
          <p ref={subRef} className="text-sm sm:text-base md:text-xl font-light text-slate-500 max-w-2xl leading-relaxed mx-auto lg:mx-0" style={{ opacity: 0 }}>
            MochiToon adalah studio produksi visual independen yang berdedikasi untuk mendobrak batasan komik web dan penceritaan visual.
          </p>
        </div>

        {/* Mascot Container with Parallax & Float */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="relative flex justify-center items-center h-[220px] sm:h-[280px] md:h-[400px] lg:h-[500px]"
        >
          <motion.div
            style={{ x: mascotX, y: mascotY }}
            className="relative z-20 w-full h-full flex justify-center items-center"
          >
            <motion.img
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              src="/Mochi-Mascot.webp"
              alt="MochiToon Mascot"
              className="w-[60%] sm:w-[70%] lg:w-[80%] max-w-[400px] object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Decorative floating shapes */}
          <motion.div
            style={{ x: shape1X, y: shape1Y }}
            className="absolute top-2 lg:top-10 right-2 lg:right-10 w-16 h-16 lg:w-32 lg:h-32 border-4 border-pink-200 rounded-full opacity-50 z-10"
          />
          <motion.div
            style={{ x: shape2X, y: shape2Y }}
            className="absolute bottom-2 lg:bottom-10 left-2 lg:left-10 w-20 h-20 lg:w-40 lg:h-40 bg-gradient-to-tr from-pink-100 to-transparent rounded-3xl rotate-12 opacity-60 z-10"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-20"
      >
        <ChevronDown className="w-8 h-8 text-pink-300" />
      </motion.div>
    </section>
  );
}
