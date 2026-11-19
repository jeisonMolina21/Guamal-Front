import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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

interface WordProps {
  word: { text: string; italic: boolean };
  index: number;
  total: number;
  progress: any;
}

function ScrubbedWord({ word, index, total, progress }: WordProps) {
  // Stagger each word across the scroll timeline [0.08, 0.88]
  const start = 0.08 + (index / total) * 0.72;
  const end = start + 0.12;
  
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);

  return (
    <motion.span 
      style={{ opacity, y }}
      className={`inline-block mr-[0.28em] last:mr-0 transition-colors ${
        word.italic ? 'font-editorial-italic font-light' : 'font-normal'
      }`}
    >
      {word.text}
    </motion.span>
  );
}

export function Scene2Manifiesto() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Background mutates with the scroll: Morning Linen (#F4F0E8) -> Deep Forest Green (#12201C)
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    ['#F4F0E8', '#1E332E', '#12201C']
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#12201C', '#EAE6DD', '#F4F0E8']
  );

  const submetaOpacity = useTransform(scrollYProgress, [0.75, 0.95], [0, 1]);

  return (
    <motion.section 
      ref={containerRef} 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative h-[200vh] w-full"
      id="manifiesto"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between p-8 sm:p-14 lg:p-20 overflow-hidden">
        
        {/* Subtle Section Label */}
        <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.25em] opacity-50">
          <span>02 / Manifiesto</span>
          <span>Guamal, Meta</span>
        </div>

        {/* The Massive Editorial Scrubbed Sentence */}
        <div className="max-w-6xl mx-auto w-full my-auto text-left">
          <h2 className="font-display-serif text-[clamp(2.5rem,7vw,6.5rem)] leading-[1.08] tracking-[-0.03em] select-none text-balance">
            {WORDS.map((w, idx) => (
              <ScrubbedWord 
                key={idx} 
                word={w} 
                index={idx} 
                total={WORDS.length} 
                progress={scrollYProgress} 
              />
            ))}
          </h2>
        </div>

        {/* Minimal Understated Note at the End of Scrub */}
        <motion.div 
          style={{ opacity: submetaOpacity }}
          className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 text-xs font-sans tracking-wider opacity-60 border-t border-current/15 pt-6"
        >
          <span>Piedemonte llanero • Tres cabañas bioclimáticas independientes</span>
          <span>Siguiente: La Colección de Cabañas ↓</span>
        </motion.div>

      </div>
    </motion.section>
  );
}
