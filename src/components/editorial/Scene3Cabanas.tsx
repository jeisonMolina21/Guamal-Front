/**
 * @fileoverview Colección de Estancias - Escena 3
 * @description Escaparate cinematográfico full-bleed de las 6 cabañas de Villa MCJ.
 * Opera de forma autónoma con temporizador de 5 segundos, transición por máscara de
 * cortina arquitectónica (clip-path wipe), pausa reactiva al cursor y soporte WCAG para movimiento reducido.
 * @module Scene3Cabanas
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { MOCK_PROPERTIES } from '../../services/api';
import type { Property } from '../../services/api';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';

// Architectural curated details for the 6 properties (max 12 words per micro-phrase)
const CABIN_EDITORIAL_META: Record<string, { italicWord: string; restWord: string; microEssence: string; specs: string }> = {
  '11111111-1111-1111-1111-111111111111': {
    italicWord: 'Ceiba',
    restWord: 'Casa',
    microEssence: 'Brisa cordillerana al caer la tarde, frente al solárium y piscina.',
    specs: '4 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '22222222-2222-2222-2222-222222222222': {
    italicWord: 'Samán',
    restWord: 'Casa',
    microEssence: 'Ventilación bioclimática continua y sala abierta hacia el jardín autóctono.',
    specs: '5 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '33333333-3333-3333-3333-333333333333': {
    italicWord: 'Moriche',
    restWord: 'Casa',
    microEssence: 'Estancia insignia con asador BBQ privado a la leña y mirador.',
    specs: '6 Huéspedes · 3 Alcobas · 2 Baños'
  },
  '44444444-4444-4444-4444-444444444444': {
    italicWord: 'Guayacán',
    restWord: 'Cabaña',
    microEssence: 'Sombra natural continua entre palmas nativas y trino de aves matutinas.',
    specs: '4 Huéspedes · 2 Alcobas · 1 Baño'
  },
  '55555555-5555-5555-5555-555555555555': {
    italicWord: 'Yarumo',
    restWord: 'Suite',
    microEssence: 'Refugio íntimo en pareja con solárium privado y acabados en piedra.',
    specs: '2 Huéspedes · Cama King · Solárium'
  },
  '66666666-6666-6666-6666-666666666666': {
    italicWord: 'Palma Real',
    restWord: 'Refugio',
    microEssence: 'Gran formato familiar con doble terraza y senderos directos al bosque.',
    specs: '8 Huéspedes · 4 Alcobas · 2 Baños'
  }
};

const AUTO_INTERVAL_MS = 5000; // 5.0 seconds per cabin scene (requested by user)

export function Scene3Cabanas() {
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (right to left), -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

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
    setProgressPercent(0);
  }, [totalCabins]);

  const prevCabin = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalCabins) % totalCabins);
    setProgressPercent(0);
  }, [totalCabins]);

  const selectCabin = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgressPercent(0);
  };

  // Autoplay timer with linear micro-progress line
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 65; // update every 65ms
    const stepIncrement = (intervalStep / AUTO_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          nextCabin();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, nextCabin]);

  const handleBookCabin = (propertyId: string) => {
    reservationStore.setKey('selectedPropertyId', propertyId);
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
      // Normal single-screen height: independent of vertical scroll!
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-[#070A09] text-[#F4F0E8] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
              className="w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.02]"
              loading="eager"
            />

            {/* Architectural Cinematographic Gradient Vignette for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A09] via-[#070A09]/30 to-[#070A09]/50 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-[#070A09]/15 to-[#070A09]/70 pointer-events-none" />
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Colección de Estancias</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
            {/* Auto indicator pill */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 py-1 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-[10px]"
              title={isPaused ? "Reanudar auto-avance" : "Pausar auto-avance"}
            >
              {isPaused ? <Play size={10} /> : <Pause size={10} />}
              <span className="hidden sm:inline">{isPaused ? "Pausado" : "Auto-avance"}</span>
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
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextCabin}
                    aria-label="Cabaña siguiente"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2 sm:gap-3 bg-[#070A09]/60 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 overflow-x-auto scrollbar-none max-w-full">
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
                      <motion.div
                        className="h-full bg-[#F4F0E8]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group / Villa Completa Privatization Note */}
          <button
            onClick={() => handleBookCabin(properties[0].id)}
            className="hidden xl:flex items-center gap-3 text-xs tracking-wider uppercase text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full border border-white/10 backdrop-blur-md cursor-pointer shrink-0"
          >
            <span>Cotizar villa completa (15+ pers)</span>
            <ArrowRight size={13} className="text-[#F4F0E8]" />
          </button>

        </div>

      </div>

    </section>
  );
}
