/**
 * @fileoverview Colección de Estancias - Escena 3
 * @description Escaparate cinematográfico full-bleed de las 6 cabañas de Villa MCJ.
 * Opera de forma autónoma con animación CSS (.cabin-progress), transición por máscara de
 * cortina arquitectónica (clip-path wipe), pausa automática fuera de pantalla y por pestaña,
 * precarga de imágenes contiguas y soporte WCAG para movimiento reducido.
 * @module Scene3Cabanas
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { MOCK_PROPERTIES } from '../../services/api';
import type { Property } from '../../services/api';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';

// Architectural editorial dictionary for each cabin
const CABIN_EDITORIAL_META: Record<string, { italicWord: string; restWord: string; microEssence: string; specs: string }> = {
  '1': {
    italicWord: 'Ceiba',
    restWord: 'Casa',
    microEssence: 'Frente al solárium y piscina. Captura la brisa fresca del piedemonte al atardecer.',
    specs: '4 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '2': {
    italicWord: 'Samán',
    restWord: 'Casa',
    microEssence: 'Ventilación bioclimática cruzada con sala abierta y vista al jardín autóctono.',
    specs: '5 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '3': {
    italicWord: 'Moriche',
    restWord: 'Casa',
    microEssence: 'Estancia insignia con kiosco asador BBQ privado y terraza mirador panorámica.',
    specs: '6 Huéspedes · 3 Alcobas · 2 Baños'
  },
  '4': {
    italicWord: 'Guayacán',
    restWord: 'Cabaña',
    microEssence: 'Rodeada de sombra natural de palmas de moriche y canto de aves al alba.',
    specs: '4 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '5': {
    italicWord: 'Yarumo',
    restWord: 'Suite',
    microEssence: 'Espacio boutique íntimo para parejas con deck de solárium y silencio absoluto.',
    specs: '2 Huéspedes · 1 Suite King · 1 Baño'
  },
  '6': {
    italicWord: 'Palma Real',
    restWord: 'Refugio',
    microEssence: 'Gran formato familiar con doble terraza y senderos directos al bosque.',
    specs: '8 Huéspedes · 4 Alcobas · 2 Baños'
  }
};

export function Scene3Cabanas() {
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (right to left), -1 = backward
  const [manualPause, setManualPause] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  // El avance corre solo si el usuario no lo pausó, no está encima, la sección se ve y la pestaña está activa.
  const running = !manualPause && !hovering && inView && tabVisible;

  const totalCabins = properties.length;
  const currentCabin = properties[currentIndex];
  const meta = CABIN_EDITORIAL_META[currentCabin.id] || {
    italicWord: currentCabin.name,
    restWord: 'Estancia',
    microEssence: currentCabin.description.slice(0, 75),
    specs: `${currentCabin.capacity} Huéspedes`
  };

  const nextCabin = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalCabins);
  }, [totalCabins]);

  const prevCabin = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalCabins) % totalCabins);
  }, [totalCabins]);

  const selectCabin = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Visibilidad de la sección y de la pestaña (pausa el avance cuando nadie lo mira).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Precarga de la cabaña anterior y la siguiente: el wipe nunca revela una foto sin cargar.
  useEffect(() => {
    if (totalCabins < 2) return;
    [(currentIndex + 1) % totalCabins, (currentIndex - 1 + totalCabins) % totalCabins].forEach((i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = properties[i].imageUrl;
    });
  }, [currentIndex, properties, totalCabins]);

  const handleBookCabin = (propertyId: string) => {
    reservationStore.setKey('selectedPropertyId', propertyId);
    isBookingModalOpen.set(true);
  };

  // "Villa completa" no es una cabaña: se abre el motor sin preseleccionar ninguna.
  const handleBookVilla = () => {
    reservationStore.setKey('selectedPropertyId', '');
    isBookingModalOpen.set(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const shouldReduceMotion = useReducedMotion();

  // Kinetic architectural curtain wipe mask variants (with WCAG reduced motion support)
  const wipeVariants = {
    enter: (dir: number) => ({
      clipPath: shouldReduceMotion 
        ? 'inset(0% 0% 0% 0%)' 
        : (dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)'),
      scale: shouldReduceMotion ? 1.0 : 1.05,
      opacity: shouldReduceMotion ? 0 : 1,
      zIndex: 20
    }),
    center: {
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1.0,
      opacity: 1,
      zIndex: 20,
      transition: {
        clipPath: { duration: shouldReduceMotion ? 0.2 : 0.38, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      scale: shouldReduceMotion ? 1.0 : 0.98,
      opacity: shouldReduceMotion ? 0 : 0.6,
      zIndex: 10,
      transition: {
        duration: shouldReduceMotion ? 0.18 : 0.32,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  // Content stagger transitions (sub-300ms, zero lag)
  const contentVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.32, delay: 0.04, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.20, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <section 
      id="alojamiento"
      ref={sectionRef}
      // Normal single-screen height: independent of vertical scroll!
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-[#070A09] text-[#F4F0E8] select-none"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {/* 
        FULL-BLEED BACKGROUND STAGE WITH CLIP-PATH WIPE MASK
      */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentCabin.id}
            custom={direction}
            variants={wipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full will-change-[clip-path,transform]"
          >
            <img
              src={currentCabin.imageUrl}
              alt={currentCabin.name}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />

            {/* Architectural Cinematographic Gradient Vignette for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A09] via-[#070A09]/30 to-[#070A09]/50 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 
        EDITORIAL HUD / TOP BAR & NAVIGATION (Always clear and accessible)
      */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 lg:p-16 pointer-events-none">
        
        {/* Top Minimal Header & Autoplay Status */}
        <div className="flex items-center justify-between text-[11px] font-sans tracking-[0.25em] uppercase text-white/70 pt-8 sm:pt-4">
          <div className="flex items-center gap-3">
            <span>Colección de Estancias</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
            {/* Auto indicator pill */}
            <button
              onClick={() => setManualPause(!manualPause)}
              className="flex items-center gap-2 py-1 px-3 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-[10px]"
              title={manualPause ? "Reanudar auto-avance" : "Pausar auto-avance"}
              aria-label={manualPause ? "Reanudar auto-avance" : "Pausar auto-avance"}
            >
              {manualPause ? <Play size={10} /> : <Pause size={10} />}
              <span className="hidden sm:inline">{manualPause ? "Pausado" : "Auto-avance"}</span>
            </button>

            {/* Current Index */}
            <span className="font-mono text-xs text-white/80">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalCabins).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* 
          CENTRAL/BOTTOM EDITORIAL INFORMATION: Zero Cards, Pure Architecture
        */}
        <div className="max-w-4xl pb-16 sm:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCabin.id}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Top Numeral + Price in Clean Grotesque */}
              <div className="flex items-baseline gap-4 sm:gap-6 mb-3 sm:mb-4">
                <span className="font-mono text-xs sm:text-sm tracking-[0.28em] text-[#F4F0E8]/70">
                  N° {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-8 bg-[#F4F0E8]/30 inline-block self-center" />
                <span className="font-mono text-base sm:text-xl text-[#F4F0E8] tracking-tight">
                  {formatPrice(currentCabin.pricePerNight)}
                  <span className="text-xs sm:text-sm text-[#F4F0E8]/60 font-sans tracking-normal ml-1.5 font-light">
                    / noche
                  </span>
                </span>
              </div>

              {/* Monumental Headline: Display Serif with Roman + Italic */}
              <h2 className="text-[clamp(3.2rem,7.5vw,7.8rem)] font-display-serif font-light text-[#F4F0E8] leading-[0.92] tracking-tight mb-4 sm:mb-6">
                {meta.restWord}{' '}
                <span className="font-editorial-italic font-normal text-[#F4F0E8]">
                  {meta.italicWord}
                </span>
              </h2>

              {/* Micro Essence: Max 12 words */}
              <p className="text-sm sm:text-lg text-[#F4F0E8]/85 font-light max-w-xl leading-relaxed mb-6 sm:mb-8 font-sans">
                {meta.microEssence}
              </p>

              {/* Actions & Specs Capsule */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pointer-events-auto">
                
                {/* Minimalist Specs */}
                <div className="text-xs sm:text-sm font-sans tracking-[0.16em] uppercase text-[#F4F0E8]/65 border-l border-white/25 pl-4 py-0.5">
                  {meta.specs}
                </div>

                {/* Apple-grade Snappy Action Button */}
                <motion.button
                  whileHover={{ scale: 1.03, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => handleBookCabin(currentCabin.id)}
                  className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#F4F0E8] hover:bg-white text-[#12201C] font-semibold text-xs sm:text-sm tracking-wide uppercase transition-colors shadow-[0_15px_35px_rgba(0,0,0,0.4)] flex items-center gap-3 cursor-pointer"
                >
                  <span>Reservar {currentCabin.name}</span>
                  <ArrowRight size={15} />
                </motion.button>

                {/* Arrows Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevCabin}
                    aria-label="Cabaña anterior"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextCabin}
                    aria-label="Cabaña siguiente"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 
          BOTTOM CHIPS / TIMER PROGRESS HUD
        */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-auto">
          
          {/* Segmented Cabin Selectors with Active Timer Line */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#070A09]/70 px-4 py-2.5 rounded-full border border-white/10 overflow-x-auto scrollbar-none max-w-full">
            {properties.map((c, i) => {
              const isSelected = i === currentIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCabin(i)}
                  className={`group relative flex flex-col items-center py-1.5 px-3 rounded-full transition-all duration-300 shrink-0 cursor-pointer ${
                    isSelected ? 'text-white' : 'text-white/45 hover:text-white/80'
                  }`}
                  aria-label={`Ver estancia ${i + 1}: ${c.name}`}
                >
                  <span className="text-[11px] font-mono tracking-wider mb-1">
                    {String(i + 1).padStart(2, '0')}{' '}
                    <span className="hidden md:inline font-sans font-light">
                      {c.name.replace('Casa ', '').replace('Cabaña ', '').replace('Suite ', '').replace('Refugio ', '')}
                    </span>
                  </span>

                  {/* Micro Progress Line on Selected Cabin */}
                  <div className="w-full h-0.5 bg-white/15 rounded-full overflow-hidden">
                    {isSelected && (
                      <div
                        className="cabin-progress h-full w-full bg-[#F4F0E8]"
                        style={{ animationPlayState: running ? 'running' : 'paused' }}
                        onAnimationEnd={nextCabin}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group / Villa Completa Privatization Note */}
          <button
            onClick={handleBookVilla}
            className="hidden md:flex items-center gap-3 text-xs tracking-wider uppercase text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full border border-white/10 cursor-pointer shrink-0"
          >
            <span>Cotizar villa completa (15+ pers)</span>
            <ArrowRight size={13} className="text-[#F4F0E8]" />
          </button>

        </div>

      </div>

    </section>
  );
}
