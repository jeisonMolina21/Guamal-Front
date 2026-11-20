/**
 * @fileoverview Explorador de Destinos & Galería de Guamal - Escena 5
 * @description Escenario de pantalla única (Single Viewport 100vh) que integra
 * la guía georreferenciada de balnearios del río Humadea y senderos del piedemonte
 * conmutables con la galería fotográfica viva de Villa MCJ.
 * @module DestinationExplorer
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Clock, Navigation, ExternalLink, ArrowRight, Camera } from 'lucide-react';
import { GUAMAL_DESTINATIONS, type DestinationSpot } from '../../data/destinations';

const GALLERY_POSTALS = [
  {
    id: 'gal-1',
    name: 'Cabañas entre el bosque nativo',
    category: 'Arquitectura',
    distanceMinutes: 0,
    highlight: 'Diseño bioclimático integrado',
    description: 'Estructuras pensadas para capturar las corrientes de aire fresco que bajan de la cordillera.',
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1400&auto=format&fit=crop',
    mapsQuery: 'Villa+MCJ+Guamal+Meta',
    badge: 'En la Villa',
    tips: 'La mejor brisa se siente entre las 4:30 pm y las 6:30 pm.'
  },
  {
    id: 'gal-2',
    name: 'Tardes de Sol & Solárium',
    category: 'Piscina & Jardines',
    distanceMinutes: 0,
    highlight: 'Piscina y tumbonas privadas',
    description: 'Agua cristalina tratada rodeada de palmas autóctonas y vegetación del piedemonte.',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1400&auto=format&fit=crop',
    mapsQuery: 'Villa+MCJ+Guamal+Meta',
    badge: 'Descanso',
    tips: 'Disfruta de la piscina con vista despejada al atardecer llanero.'
  },
  {
    id: 'gal-3',
    name: 'Hamacas frente a la cordillera',
    category: 'Desconexión',
    distanceMinutes: 0,
    highlight: 'Siestas con brisa continua',
    description: 'Corredores perimetrales amplios equipados con hamacas dobles tejidas.',
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1400&auto=format&fit=crop',
    mapsQuery: 'Villa+MCJ+Guamal+Meta',
    badge: 'Silencio',
    tips: 'Silencio campestre total para lectura y desconexión digital.'
  },
  {
    id: 'gal-4',
    name: 'Kiosco BBQ para asados a la leña',
    category: 'Gastronomía',
    distanceMinutes: 0,
    highlight: 'Mamona y carnes a la brasa',
    description: 'Área social campestre dotada para compartir asados familiares al aire libre.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop',
    mapsQuery: 'Villa+MCJ+Guamal+Meta',
    badge: 'Tradición',
    tips: 'Disfruta de carne a la llanera preparada a fuego lento.'
  }
];

export function DestinationExplorer() {
  const [activeTab, setActiveTab] = useState<'DESTINOS' | 'GALERIA'>('DESTINOS');
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [selectedSpot, setSelectedSpot] = useState<DestinationSpot>(GUAMAL_DESTINATIONS[0]);

  const displayedList = activeTab === 'DESTINOS'
    ? (activeCategory === 'TODOS' ? GUAMAL_DESTINATIONS : GUAMAL_DESTINATIONS.filter(d => d.category === activeCategory))
    : (GALLERY_POSTALS as DestinationSpot[]);

  // Keep selected spot valid if category changes
  const activeSpot = displayedList.find(d => d.id === selectedSpot.id) || displayedList[0];

  return (
    <section 
      id="destinos-guamal"
      // Single Screen Height in Desktop: Zero Page Scroll, 100% Contained in Viewport
      className="relative w-full lg:h-screen min-h-[700px] max-h-[960px] bg-[#070A09] text-[#F4F0E8] flex flex-col justify-between py-10 lg:py-10 px-6 sm:px-10 lg:px-14 select-none overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* TOP COMPACT EDITORIAL HEADER: Pure Architecture                           */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-[#F4F0E8]/70 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>05 / Territorio & Piedemonte</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light text-[#F4F0E8] tracking-tight leading-tight">
            Puerta de entrada a los <span className="font-editorial-italic font-normal text-[#F4F0E8]">tesoros del río.</span>
          </h2>
        </div>

        {/* Mode Switcher Tabs: Destinos vs Galería */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/15">
          <button
            onClick={() => {
              setActiveTab('DESTINOS');
              setSelectedSpot(GUAMAL_DESTINATIONS[0]);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'DESTINOS'
                ? 'bg-[#F4F0E8] text-[#12201C] shadow-md font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Compass size={13} />
              <span>Rutas & Balnearios</span>
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('GALERIA');
              setSelectedSpot(GALLERY_POSTALS[0] as DestinationSpot);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'GALERIA'
                ? 'bg-[#F4F0E8] text-[#12201C] shadow-md font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Camera size={13} />
              <span>Galería de la Villa</span>
            </span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN SINGLE-STAGE LAYOUT: Left Big Image (60%) + Right Big Cards (40%)    */}
      {/* ========================================================================= */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1 my-4 overflow-hidden">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: HERO VISUAL STAGE (Big image with superimposed info)       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 sm:p-10 group bg-[#070A09]">
          
          {/* Active Big Picture */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSpot.id}
              initial={{ opacity: 0.5, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeSpot.imageUrl}
                alt={activeSpot.name}
                className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.03]"
                loading="eager"
              />

              {/* Cinematographic Gradient Vignette for Perfect Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A09]/95 via-[#070A09]/40 to-[#070A09]/50 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-[#070A09]/15 to-[#070A09]/70 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Top Overlaid Badge */}
          <div className="relative z-10 flex items-center justify-between text-white/90">
            <span className="px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-sans font-bold uppercase tracking-[0.18em]">
              {activeSpot.badge}
            </span>

            {activeSpot.distanceMinutes > 0 ? (
              <span className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/80 flex items-center gap-1.5">
                <Clock size={12} className="text-emerald-400" />
                <span>A solo {activeSpot.distanceMinutes} min de Villa MCJ</span>
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-[11px] font-mono text-emerald-300">
                Dentro de la propiedad
              </span>
            )}
          </div>

          {/* Bottom Overlaid Title, Story & Action */}
          <div className="relative z-10 text-[#F4F0E8] max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#F4F0E8]/70 block mb-1">
              {activeSpot.category}
            </span>

            <h3 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-serif font-light text-white leading-[1.06] tracking-tight mb-3 text-balance">
              {activeSpot.name}
            </h3>

            <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed font-sans mb-4 line-clamp-3">
              {activeSpot.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/20">
              <span className="text-[11px] font-sans text-white/70 italic">
                Tip: {activeSpot.tips}
              </span>

              {activeTab === 'DESTINOS' && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeSpot.mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F0E8] hover:bg-white text-[#12201C] font-semibold text-xs tracking-wider uppercase transition-colors shadow-lg cursor-pointer"
                >
                  <Navigation size={13} />
                  <span>Ruta en Maps</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: 4 STRUCTURED BIG CARDS (Zero Scrollbar, 100% Contained)   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 h-full">
          {displayedList.slice(0, 4).map((spot, i) => {
            const isSelected = activeSpot.id === spot.id;
            return (
              <motion.button
                key={spot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSpot(spot)}
                className={`group relative rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'border-white bg-white/20 shadow-[0_10px_30px_rgba(255,255,255,0.12)] ring-1 ring-white/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Big Preview Thumbnail */}
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-2.5 bg-black/40">
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md font-mono text-[10px] text-white">
                    0{i + 1}
                  </div>
                  {spot.distanceMinutes > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md font-mono text-[9px] text-white/90">
                      {spot.distanceMinutes} min
                    </div>
                  )}
                </div>

                {/* Spot Micro-Info */}
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-white/50 mb-0.5">
                    {spot.category}
                  </span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#F4F0E8] transition-colors">
                    {spot.name}
                  </h4>
                  <p className="text-[11px] text-white/70 font-light line-clamp-1 mt-0.5">
                    {spot.highlight}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM ULTRA-THIN BAR: Micro summary & Direct Link                        */}
      {/* ========================================================================= */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 shrink-0">
        <span className="hidden sm:inline">
          {activeTab === 'DESTINOS' 
            ? 'Todos los destinos se ubican a menos de 25 minutos desde Villa MCJ'
            : 'Fotografías directas de las instalaciones campestres de Villa MCJ'}
        </span>
        <a 
          href="/galeria" 
          className="text-white hover:text-white/80 font-semibold uppercase tracking-wider flex items-center gap-1.5 ml-auto cursor-pointer"
        >
          <span>Ver álbum completo</span>
          <ArrowRight size={13} />
        </a>
      </div>

    </section>
  );
}
