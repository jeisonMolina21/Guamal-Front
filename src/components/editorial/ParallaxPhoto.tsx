import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
}

/**
 * Foto a sangre con parallax lento. Solo anima `transform` (compositor), una sola vez por sección.
 * El escalado 1.16 deja un margen del 8% por lado, mayor que el desplazamiento de ±7%.
 */
export function ParallaxPhoto({ src, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        style={{ y: reduce ? 0 : y, scale: reduce ? 1 : 1.16 }}
        className="h-full w-full object-cover will-change-transform"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
