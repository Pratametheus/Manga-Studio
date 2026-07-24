import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const frameCount = 240;
    
    const currentFrame = (index: number) => 
      `/scroll-frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

    const images: HTMLImageElement[] = [];
    const sequence = { frame: 0 };
    let loadedCount = 0;

    // Preload all frames
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setLoading(false);
          render();
        } else if (i === 0) {
          // Draw first frame immediately when it's ready, while others are still loading
          render();
        }
      };
      images.push(img);
    }

    function render() {
      if (!canvas || !context) return;
      
      const img = images[sequence.frame];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Object-fit: cover simulation for canvas
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      // Use better rendering quality
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      context.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    // GSAP ScrollTrigger
    const tl = gsap.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=4000", // The scroll distance in pixels (longer = smoother scrub)
        scrub: 0.1, // Smoothness of scrub (small value for less lag but still smooth)
        pin: true,
      },
      onUpdate: render
    });

    // Responsive Canvas Sizing
    const handleResize = () => {
      // Setup high-DPI canvas
      const dpr = window.devicePixelRatio || 1;
      
      if (window.innerWidth < 768) {
         // Mobile portrait or square-ish
         canvas.width = window.innerWidth * dpr;
         canvas.height = window.innerHeight * dpr;
      } else {
         // Desktop landscape
         canvas.width = window.innerWidth * dpr;
         canvas.height = window.innerHeight * dpr;
      }
      
      // Normalize coordinate system to use css pixels
      context.scale(1, 1);
      render();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => {
      window.removeEventListener('resize', handleResize);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[100dvh] bg-[var(--color-background)] relative overflow-hidden flex items-center justify-center border-y border-white/5">
      
      {/* Fallback & Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)] z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            <p className="text-gray-400 font-light tracking-widest uppercase animate-pulse text-xs">Loading Experience...</p>
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Optional Gradient overlay to make text pop if added later */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-transparent to-[var(--color-background)] pointer-events-none mix-blend-overlay opacity-80"></div>
    </div>
  );
}
