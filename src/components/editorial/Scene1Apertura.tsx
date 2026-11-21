/**
 * @fileoverview Apertura Cinemática - Escena 1 (Hero Split Iconic Animation)
 * @description Experiencia de entrada con la identidad monumental VILLA / MCJ dividida en
 * tipografía monumental display serif con desplazamiento en paralaje opuesto (izquierda / derecha),
 * mientras el portal fotográfico central enmarcado (round 32px) se expande con física fluida
 * hacia pantalla completa (full-bleed), revelando la serenidad del amanecer en el piedemonte.
 * @module Scene1Apertura
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion';

export function Scene1Apertura() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const shouldReduceMotion = useReducedMotion();

  // Lenis ya suaviza la rueda; un resorte extra sumaba latencia y trabajo por frame.
  const progress = scrollYProgress;

  // 1. Clip-path inset interpolation: begins centered with rounded corners (card), expands to 100% full-bleed
  const topInset = useTransform(progress, [0, 0.68], [33, 0]);
  const rightInset = useTransform(progress, [0, 0.68], [8, 0]);
  const bottomInset = useTransform(progress, [0, 0.68], [28, 0]);
  const leftInset = useTransform(progress, [0, 0.68], [8, 0]);
  const radiusInset = useTransform(progress, [0, 0.68], [32, 0]);

  const animatedClipPath = useMotionTemplate`inset(${topInset}% ${rightInset}% ${bottomInset}% ${leftInset}% round ${radiusInset}px)`;
  const clipPath = shouldReduceMotion ? 'inset(0% 0% 0% 0% round 0px)' : animatedClipPath;

  // 2. Inner image counter-balance zoom for physical depth
  const imgScale = useTransform(progress, [0, 0.68, 1], [1.14, 1.0, 1.02]);

  // 3. Typography splits letter-by-letter and drifts outward in smooth parallax
  const xLeftTitle = useTransform(progress, [0, 0.55], ['0vw', '-22vw']);
  const xRightTitle = useTransform(progress, [0, 0.55], ['0vw', '22vw']);
  const titleOpacity = useTransform(progress, [0, 0.45], [1, 0]);

  // 4. Meta coordinates and scroll cue fade out on initial scroll
  const metaOpacity = useTransform(progress, [0, 0.22], [1, 0]);

  // 5. Editorial caption revealed once the photo blooms to full screen
  const captionOpacity = useTransform(progress, [0.62, 0.88], [0, 1]);
  const captionY = useTransform(progress, [0.62, 0.88], [24, 0]);

  return (
    <section ref={containerRef} className="relative h-[200vh] w-full" id="inicio">
      
      {/* Sticky Fullscreen Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#F4F0E8] select-none">
        
        {/* Top Minimal Editorial Coordinates */}
        <motion.div 
          style={{ opacity: metaOpacity }}
          className="absolute top-[88px] left-8 right-8 z-30 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.25em] text-[#12201C]/65"
        >
          <div className="flex items-center gap-2">
            <span>4.0744° N, 73.7661° W</span>
          </div>
          <span className="hidden sm:inline">Guamal, Meta • Colombia</span>
          <span className="hidden sm:inline text-[#12201C]/50">A orillas del río Humadea</span>
        </motion.div>

        {/* Massive Editorial Headline Split: VILLA (Top) / MCJ (Bottom) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-between pt-[clamp(110px,15vh,150px)] pb-[clamp(60px,9vh,100px)] pointer-events-none px-4">
          
          {/* Top Word: VILLA */}
          <motion.div 
            style={{ 
              x: shouldReduceMotion ? 0 : xLeftTitle, 
              opacity: shouldReduceMotion ? 0 : titleOpacity 
            }}
            className="flex items-center justify-center font-display-serif text-[clamp(4rem,12.5vw,15rem)] font-light leading-[0.88] tracking-[-0.04em] text-[#12201C]"
          >
            <span>V</span>
            <span>I</span>
            <span className="font-editorial-italic font-normal">L</span>
            <span>L</span>
            <span>A</span>
          </motion.div>

          {/* Bottom Word: MCJ with Character Serif Italic */}
          <motion.div 
            style={{ 
              x: shouldReduceMotion ? 0 : xRightTitle, 
              opacity: shouldReduceMotion ? 0 : titleOpacity 
            }}
            className="flex items-center justify-center font-display-serif text-[clamp(4rem,12.5vw,15rem)] font-light leading-[0.88] tracking-[-0.04em] text-[#12201C]"
          >
            <span className="font-editorial-italic font-normal text-[#C25E3E]">M</span>
            <span>C</span>
            <span>J</span>
          </motion.div>

        </div>

        {/* Central Expanding Photo Portal (Framed Card -> Full Bleed on scroll) */}
        <motion.div 
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full z-20 overflow-hidden"
          data-cursor="Explorar"
        >
          <motion.img 
            src="/hero-cabanas.jpg" 
            alt="Villa MCJ, cabañas bioclimáticas y piscina frente a la vegetación nativa en Guamal, Meta"
            style={{ scale: shouldReduceMotion ? 1 : imgScale }}
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
          />

          {/* Vignette Overlay for Depth & Typography Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

          {/* Editorial Caption revealed once photo expands full-bleed */}
          <motion.div 
            style={{ 
              opacity: shouldReduceMotion ? 1 : captionOpacity, 
              y: shouldReduceMotion ? 0 : captionY 
            }}
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
          </motion.div>

        </motion.div>

        {/* Bottom Scroll Cue */}
        <motion.div 
          style={{ opacity: metaOpacity }}
          className="absolute bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 text-[10px] font-sans uppercase tracking-[0.25em] text-[#12201C]/50 flex items-center gap-2"
        >
          <span>Desplaza</span>
        </motion.div>

      </div>

    </section>
  );
}
