import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Compass, Clock, ExternalLink, ArrowRight, Sparkles, Droplets, Mountain, Coffee, Sun } from 'lucide-react';
import { GUAMAL_DESTINATIONS, type DestinationSpot } from '../../data/destinations';

export function DestinationExplorer() {
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [selectedSpot, setSelectedSpot] = useState<DestinationSpot>(GUAMAL_DESTINATIONS[0]);

  const categories = [
    { label: 'Todos los Destinos', value: 'TODOS' },
    { label: 'Ríos & Balnearios', value: 'Río & Balneario' },
    { label: 'Cascadas & Senderos', value: 'Cascadas' },
    { label: 'Gastronomía Llanera', value: 'Gastronomía' },
    { label: 'Agroturismo & Cacao', value: 'Cultura & Aventura' }
  ];

  const filtered = activeCategory === 'TODOS'
    ? GUAMAL_DESTINATIONS
    : GUAMAL_DESTINATIONS.filter(d => d.category === activeCategory);

  return (
    <div className="relative w-full text-white" id="destinos-explorer">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[450px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs font-bold uppercase tracking-[0.16em] mb-4">
              <Compass size={14} className="text-white/80" />
              Guía de Destinos Reales en Guamal, Meta
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.08] tracking-tight">
              Puerta de entrada a los <br />
              <span className="font-editorial-italic font-normal text-white/70">tesoros del piedemonte.</span>
            </h2>

            <p className="text-sm sm:text-base text-white/80 mt-6 font-light leading-relaxed max-w-xl">
              Lugares reales, balnearios de agua cristalina y senderos certificados. Desde Villa MCJ podrás armar tus planes diarios a menos de 25 minutos sin estrés.
            </p>
          </div>

          {/* Segmented Category Filter */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === c.value
                    ? 'bg-white text-[#070B0A] shadow-md scale-100 font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Stage: Big Editorial Magazine Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Big Featured Screen (7 cols) */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative group">
            
            <div className="relative aspect-[16/10] overflow-hidden bg-[#08110F]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedSpot.id}
                  src={selectedSpot.imageUrl}
                  alt={selectedSpot.name}
                  initial={{ opacity: 0.6, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1.0 }}
                  exit={{ opacity: 0.7 }}
                  transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#142723] via-[#142723]/40 to-transparent pointer-events-none" />

              {/* Floating Meta Pills */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2 pointer-events-none">
                <span className="px-3.5 py-1 rounded-full bg-white text-[#070B0A] text-xs font-bold uppercase tracking-wider shadow-lg">
                  {selectedSpot.badge}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5">
                  <Clock size={12} className="text-white/80" />
                  A solo {selectedSpot.distanceMinutes} minutos de Villa MCJ
                </span>
              </div>

              {/* Title inside media */}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                  {selectedSpot.category}
                </span>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mt-1 mb-2">
                  {selectedSpot.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 font-light">
                  {selectedSpot.highlight}
                </p>
              </div>
            </div>

            {/* Bottom info panel */}
            <div className="p-6 sm:p-8 bg-[#142723]/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/10">
              <div className="max-w-md">
                <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed mb-3">
                  {selectedSpot.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
                  <Sparkles size={14} className="shrink-0" />
                  <span>Tip Local: {selectedSpot.tips}</span>
                </div>
              </div>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-[#070B0A] font-bold text-xs uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 shrink-0 border border-white/20"
              >
                <Navigation size={14} />
                <span>Ruta en Maps</span>
                <ExternalLink size={12} />
              </motion.a>
            </div>

          </div>

          {/* Interactive Thumbnails Rail (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[620px] overflow-y-auto pr-2">
            {filtered.map((spot) => {
              const isSelected = selectedSpot.id === spot.id;
              return (
                <motion.div
                  key={spot.id}
                  whileHover={{ scale: 1.015, x: 3 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-4 rounded-2xl border transition-colors duration-250 cursor-pointer flex gap-4 items-center ${
                    isSelected
                      ? 'bg-white/15 border-white shadow-[0_4px_25px_rgba(255,255,255,0.15)] scale-[1.01]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#E0BA80]' : 'text-white/60'}`}>
                        {spot.category}
                      </span>
                      <span className="text-[11px] text-white/70 flex items-center gap-1">
                        <Clock size={11} className="text-[#C69A59]" />
                        {spot.distanceMinutes} min
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate font-serif">
                      {spot.name}
                    </h4>

                    <p className="text-xs text-white/70 truncate mt-0.5 font-light">
                      {spot.highlight}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#F4F0E8] text-[#12201C]' : 'bg-white/10 text-white/40'
                    }`}>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
