/**
 * @fileoverview Apertura Cinemática - Escena 1
 * @description Experiencia de entrada con frase poética central (Manifiesto de la Villa)
 * y portal de imagen en iris orgánico que se expande del centro hacia los bordes
 * impulsado por física analógica de resorte (Apple & Emil Kowalski standards).
 * @module Scene1Apertura
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useReducedMotion } from 'framer-motion';

const WORDS = [
  { text: "El", italic: false },
  { text: "río", italic: true },
  { text: "murmura", italic: false },
  { text: "entre", italic: false },
  { text: "piedras.", italic: false },
  { text: "La", italic: false },
  { text: "selva", italic: false },
  { text: "cobija", italic: false },
  { text: "el", italic: false },
  { text: "descanso", italic: true },
  { text: "sin", italic: false },
  { text: "afán.", italic: false }
];

export function Scene1Apertura() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Physical Apple spring with gentle mass & low stiffness for a slow, organic, cinematic pace
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    mass: 1.0,
    restDelta: 0.0001
  });

  const shouldReduceMotion = useReducedMotion();

  // 1. Center-out expansion (Iris / Center-to-edges reveal mask)
  // Starts slowly and blooms majestically across a generous scroll window [0.12 -> 0.82]
  const circleRadius = useTransform(smoothProgress, [0.12, 0.82], [0, 135]);
  const animatedClipPath = useMotionTemplate`circle(${circleRadius}% at 50% 50%)`;
  const clipPath = shouldReduceMotion ? 'circle(100% at 50% 50%)' : animatedClipPath;

  // 2. Initial Manifest Phrase transforms: slow, serene float and fade
  const textScale = useTransform(smoothProgress, [0.08, 0.50], [1, 1.06]);
  const textOpacity = useTransform(smoothProgress, [0.18, 0.50], [1, 0]);
  const textY = useTransform(smoothProgress, [0.08, 0.50], [0, -25]);

  // 3. Subtle slow optical parallax on the revealed landscape photo
  const imgScale = useTransform(smoothProgress, [0.12, 0.85, 1], [1.22, 1.0, 1.02]);

  // 4. Coordinates & top label fade out gently as scroll begins
  const headerOpacity = useTransform(smoothProgress, [0.05, 0.28], [1, 0]);

  // 5. Revealed editorial identity once the portal is fully opened to the edges
  const revealedBrandOpacity = useTransform(smoothProgress, [0.72, 0.92], [0, 1]);
  const revealedBrandY = useTransform(smoothProgress, [0.72, 0.92], [28, 0]);

  // 6. Scroll cue fading out on initial interaction
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0]);

  return (
    // Height set to 250vh for an unhurried, luxurious, cinematic scroll pace
    <section ref={containerRef} className="relative h-[250vh] w-full" id="inicio">
      
      {/* Sticky Fullscreen Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none bg-[#F4F0E8]">
        
        {/* ========================================================================= */}
        {/* LAYER 1: BASE STAGE - The Poetic Manifest Phrase (Frase 02)              */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 sm:p-14 lg:p-20 text-[#12201C]">
          
          {/* Top Editorial Coordinates */}
          <motion.div 
            style={{ opacity: headerOpacity }}
            className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.25em] text-[#12201C]/65 pt-14 sm:pt-16"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12201C]/80 animate-pulse" />
              <span>4.0744° N, 73.7661° W</span>
            </div>
            <span className="hidden sm:inline">Guamal, Meta • Colombia</span>
            <span className="hidden md:inline text-[#12201C]/50">A orillas del río Humadea</span>
          </motion.div>

          {/* The Massive Architectural Phrase at Viewport Center */}
          <motion.div 
            style={{ 
              scale: textScale, 
              opacity: textOpacity, 
              y: textY 
            }}
            className="max-w-5xl mx-auto w-full my-auto text-center px-4"
          >
            <h1 className="font-display-serif text-[clamp(2.6rem,6.8vw,6.4rem)] font-light leading-[1.08] tracking-[-0.035em] text-[#12201C] text-balance">
              {WORDS.map((w, idx) => (
                <span 
                  key={idx} 
                  className={`inline-block mr-[0.26em] last:mr-0 ${
                    w.italic ? 'font-editorial-italic font-normal text-[#C25E3E]' : 'font-light'
                  }`}
                >
                  {w.text}
                </span>
              ))}
            </h1>

            <p className="mt-6 text-xs sm:text-sm font-sans uppercase tracking-[0.24em] text-[#12201C]/55 font-normal">
              Estancias bioclimáticas & Naturaleza privada
            </p>
          </motion.div>

          {/* Bottom Gentle Scroll Indicator */}
          <motion.div 
            style={{ opacity: scrollCueOpacity }}
            className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.22em] text-[#12201C]/50 pb-4"
          >
            <span>Villa MCJ</span>
            <div className="flex items-center gap-2 animate-bounce">
              <span>Desliza para adentrarte</span>
              <span className="text-sm">↓</span>
            </div>
            <span>01 / 06</span>
          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* LAYER 2: THE REVEAL PORTAL (Opens from Center to Edges via Mask Wipe)     */}
        {/* ========================================================================= */}
        <motion.div 
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full z-20 overflow-hidden will-change-[clip-path]"
          data-cursor="Explorar"
        >
          {/* Natural Depth Full-Bleed Photography */}
          <motion.div 
            style={{ scale: imgScale }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src="/hero-cabanas.jpg" 
              alt="Villa MCJ, arquitectura bioclimática y piscina frente a la vegetación en Guamal, Meta"
              className="w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.02]"
              loading="eager"
              fetchpriority="high"
            />

            {/* Natural Cinematographic Gradient for Contrast & Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A09] via-transparent to-[#070A09]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-[#070A09]/10 to-[#070A09]/60 pointer-events-none" />
          </motion.div>

          {/* Editorial Identity Revealed Once the Portal Reaches the Edges */}
          <motion.div 
            style={{ 
              opacity: revealedBrandOpacity, 
              y: revealedBrandY 
            }}
            className="absolute inset-0 z-30 flex flex-col justify-between p-8 sm:p-14 lg:p-20 text-[#F4F0E8] pointer-events-none"
          >
            {/* Top Minimal Pill */}
            <div className="flex items-center justify-between text-[11px] font-sans tracking-[0.25em] uppercase text-white/70 pt-14 sm:pt-16">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Guamal, Meta • Colombia
              </span>
              <span>Río Humadea</span>
            </div>

            {/* Bottom Monogram Title & Micro Essence */}
            <div className="max-w-4xl pb-6">
              <span className="block font-sans text-xs sm:text-sm uppercase tracking-[0.3em] text-[#F4F0E8]/70 mb-3">
                Refugio de Descanso
              </span>
              <h2 className="text-[clamp(3.2rem,8vw,8rem)] font-display-serif font-light leading-[0.92] tracking-tight text-[#F4F0E8] mb-5">
                Villa <span className="font-editorial-italic font-normal text-[#F4F0E8]">MCJ</span>
              </h2>
              <p className="text-sm sm:text-lg text-[#F4F0E8]/85 font-light font-sans max-w-xl leading-relaxed">
                Seis cabañas independientes rodeadas de bosque nativo, aire puro y el sonido apacible del río.
              </p>
            </div>

          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}
