import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export function Scene1Apertura() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Clip-path inset interpolation: begins centered with rounded corners, expands to 100% full-bleed
  const topInset = useTransform(scrollYProgress, [0, 0.65], [18, 0]);
  const rightInset = useTransform(scrollYProgress, [0, 0.65], [22, 0]);
  const bottomInset = useTransform(scrollYProgress, [0, 0.65], [18, 0]);
  const leftInset = useTransform(scrollYProgress, [0, 0.65], [22, 0]);
  const radiusInset = useTransform(scrollYProgress, [0, 0.65], [32, 0]);

  const clipPath = useMotionTemplate`inset(${topInset}% ${rightInset}% ${bottomInset}% ${leftInset}% round ${radiusInset}px)`;

  // Inner image scale counter-balance for depth
  const imgScale = useTransform(scrollYProgress, [0, 0.65, 1], [1.14, 1.0, 1.04]);

  // Typography splits letter-by-letter and drifts outward in parallax
  const xLeftTitle = useTransform(scrollYProgress, [0, 0.55], ['0vw', '-22vw']);
  const xRightTitle = useTransform(scrollYProgress, [0, 0.55], ['0vw', '22vw']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  // Meta elements fade quickly on scroll
  const metaOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  // Subtle subtitle revealed once the image expands
  const captionOpacity = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.6, 0.85], [20, 0]);

  return (
    <section ref={containerRef} className="relative h-[220vh] w-full" id="apertura">
      
      {/* Sticky Fullscreen Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#F4F0E8] select-none">
        
        {/* Top Minimal Editorial Coordinates */}
        <motion.div 
          style={{ opacity: metaOpacity }}
          className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.22em] text-[#12201C]/60"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12201C]/80"></span>
            <span>4.0744° N, 73.7661° W</span>
          </div>
          <span>Guamal, Meta • Colombia</span>
          <span className="hidden sm:inline">A orillas del río Humadea</span>
        </motion.div>

        {/* Massive Editorial Headline Split (Layered behind/around the central photo) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
          
          {/* Top Word: VILLA */}
          <motion.div 
            style={{ x: xLeftTitle, opacity: titleOpacity }}
            className="flex items-center justify-center font-display-serif text-[clamp(4.5rem,14vw,17rem)] font-light leading-[0.88] tracking-[-0.04em] text-[#12201C]"
          >
            <span>V</span>
            <span>I</span>
            <span className="font-editorial-italic font-normal">L</span>
            <span>L</span>
            <span>A</span>
          </motion.div>

          {/* Bottom Word: MCJ with Character Serif Italic */}
          <motion.div 
            style={{ x: xRightTitle, opacity: titleOpacity }}
            className="flex items-center justify-center font-display-serif text-[clamp(4.5rem,14vw,17rem)] font-light leading-[0.88] tracking-[-0.04em] text-[#12201C] mt-[-1vw]"
          >
            <span className="font-editorial-italic font-normal text-[#C25E3E]">M</span>
            <span>C</span>
            <span>J</span>
          </motion.div>

        </div>

        {/* Central Expanding Photo Portal (Full Bleed on scroll) */}
        <motion.div 
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full z-20 overflow-hidden shadow-[0_30px_90px_rgba(18,32,28,0.2)]"
          data-cursor="Explorar"
        >
          <motion.img 
            src="/hero-cabanas.jpg" 
            alt="Villa MCJ, cabañas bioclimáticas y piscina frente a la vegetación nativa en Guamal, Meta"
            style={{ scale: imgScale }}
            className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.03]"
            loading="eager"
            fetchpriority="high"
          />

          {/* Vignette Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Caption revealed once photo is full screen */}
          <motion.div 
            style={{ opacity: captionOpacity, y: captionY }}
            className="absolute bottom-12 left-8 sm:left-14 right-8 sm:right-14 z-30 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white"
          >
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-white/60 block mb-1">
                Amanecer en el piedemonte
              </span>
              <p className="font-display-serif text-2xl sm:text-4xl text-white font-light tracking-tight max-w-xl">
                Cabañas bioclimáticas entre brisa cordillerana y el río Humadea.
              </p>
            </div>

            <div className="text-right text-[11px] font-sans text-white/60 uppercase tracking-[0.2em]">
              <span>Desliza para adentrarte ↓</span>
            </div>
          </motion.div>

        </motion.div>

        {/* Bottom Scroll Cue */}
        <motion.div 
          style={{ opacity: metaOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-[10px] font-sans uppercase tracking-[0.25em] text-[#12201C]/50 flex items-center gap-2"
        >
          <span className="w-1 h-3 rounded-full border border-[#12201C]/40 inline-block animate-bounce"></span>
          <span>Desplaza para abrir el día</span>
        </motion.div>

      </div>

    </section>
  );
}
