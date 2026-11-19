import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bed, Bath, ArrowRight, ArrowLeft, Pause, Play, Compass, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';

interface CabinData {
  id: string;
  num: string;
  name: string;
  subtitle: string;
  tag: string;
  description: string;
  pricePerNight: number;
  formattedPrice: string;
  image: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  distanceRiver: string;
  isRealPhoto: boolean;
  features: string[];
}

const CABINS: CabinData[] = [
  {
    id: "1",
    num: "01",
    name: "Casa Ceiba",
    subtitle: "Intimidad & Brisa de Cordillera",
    tag: "Parejas & Familias (4p)",
    description: "Orientada estratégicamente para capturar las corrientes de aire fresco que descienden de la cordillera al atardecer. Terraza privada con hamacas dobles frente al solárium y piscina.",
    pricePerNight: 180000,
    formattedPrice: "$180.000",
    image: "/hero-cabanas.jpg",
    capacity: "4 Huéspedes",
    bedrooms: "2 Alcobas",
    bathrooms: "1 Privado",
    distanceRiver: "10 Min",
    isRealPhoto: true,
    features: ["Terraza privada con hamacas", "Cocina semi-dotada", "Aire acondicionado silencioso", "Frente al solárium"]
  },
  {
    id: "2",
    num: "02",
    name: "Casa Samán",
    subtitle: "Amplitud & Conexión Natural",
    tag: "Familias & Amigos (5p)",
    description: "Diseñada con ventilación bioclimática cruzada, sala abierta con vista al jardín autóctono y comedor exterior cubierto. Ideal para desconexión profunda y confort.",
    pricePerNight: 200000,
    formattedPrice: "$200.000",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop",
    capacity: "5 Huéspedes",
    bedrooms: "2 Alcobas Amplias",
    bathrooms: "1 Completo",
    distanceRiver: "10 Min",
    isRealPhoto: false,
    features: ["Sala abierta al exterior", "Hamaca doble tradicional", "Smart TV & WiFi fibra", "Ventilación bioclimática"]
  },
  {
    id: "3",
    num: "03",
    name: "Casa Moriche",
    subtitle: "La Cabaña Insignia con BBQ",
    tag: "Grupos Grandes (6p)",
    description: "Nuestra cabaña de mayor capacidad. Cuenta con su propio kiosco BBQ para asados privados a la leña, 3 habitaciones independientes y terraza mirador panorámica.",
    pricePerNight: 250000,
    formattedPrice: "$250.000",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1400&auto=format&fit=crop",
    capacity: "6 Huéspedes",
    bedrooms: "3 Habitaciones",
    bathrooms: "2 Baños",
    distanceRiver: "10 Min",
    isRealPhoto: false,
    features: ["Kiosco asador BBQ privado", "3 Alcobas independientes", "Nevera grande y menaje", "Terraza panorámica"]
  },
  {
    id: "4",
    num: "04",
    name: "Cabaña Guayacán",
    subtitle: "Refugio del Bosque & Jardines",
    tag: "Equilibrio & Sombra (4p)",
    description: "Rodeada de árboles nativos y palmas de moriche. Su diseño resalta la sombra natural y el canto de las aves al amanecer, con corredor perimetral y hamacas.",
    pricePerNight: 195000,
    formattedPrice: "$195.000",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1400&auto=format&fit=crop",
    capacity: "4 Huéspedes",
    bedrooms: "2 Alcobas",
    bathrooms: "1 Privado",
    distanceRiver: "10 Min",
    isRealPhoto: false,
    features: ["Sombra vegetal continua", "Terraza jardín privada", "Cocina dotada", "Cerca a la piscina"]
  },
  {
    id: "5",
    num: "05",
    name: "Suite Yarumo",
    subtitle: "Romance & Solárium Privado",
    tag: "Parejas Exclusivo (2p)",
    description: "Espacio boutique íntimo pensado para escapadas en pareja. Cama king-size, baño con acabados rústicos de piedra y salida privada al deck de solárium.",
    pricePerNight: 165000,
    formattedPrice: "$165.000",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1400&auto=format&fit=crop",
    capacity: "2 Huéspedes",
    bedrooms: "1 Suite King",
    bathrooms: "1 Privado Lujo",
    distanceRiver: "10 Min",
    isRealPhoto: false,
    features: ["Deck solárium privado", "Cama King campestre", "Cafetera artesanal", "Silencio absoluto"]
  },
  {
    id: "6",
    num: "06",
    name: "Refugio Palma Real",
    subtitle: "Gran Formato Familiar & Social",
    tag: "Familias Numerosas (8p)",
    description: "La estancia más amplia de Villa MCJ para encuentros familiares extendidos. Amplia zona de comedor campestre, doble terraza y acceso privilegiado a los senderos.",
    pricePerNight: 320000,
    formattedPrice: "$320.000",
    image: "https://images.unsplash.com/photo-1542314831-c5a4d40715af?q=80&w=1400&auto=format&fit=crop",
    capacity: "8 Huéspedes",
    bedrooms: "4 Habitaciones",
    bathrooms: "2 Baños Amplios",
    distanceRiver: "10 Min",
    isRealPhoto: false,
    features: ["Capacidad hasta 8 personas", "Zona social integrada", "Menaje completo familiar", "Acceso directo a senderos"]
  }
];

const AUTOPLAY_INTERVAL_MS = 7000; // 7 segundos (entre 5 y 10s)

export function CabinCenterStage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = derecha a izquierda, -1 = izquierda a derecha
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const cabin = CABINS[currentIndex];

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % CABINS.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + CABINS.length) % CABINS.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const selectCabin = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // Timer principal de auto-play y barra de progreso continua
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setProgress(0);

    // Actualizador suave de progreso a 60fps
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL_MS) * 100, 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, goToNext]);

  const handleBookCabin = (cabinId: string) => {
    reservationStore.setKey('selectedPropertyId', cabinId);
    isBookingModalOpen.set(true);
  };

  // Apple & Emil Kowalski Spring Transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 },
        opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 },
        opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      }
    })
  };

  return (
    <section 
      className="py-24 sm:py-32 bg-[#070B0A] text-white relative overflow-hidden" 
      id="alojamiento"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Ambient background depth without glare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-white/[0.015] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Section Header with Live Status & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-14 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-[10px] font-semibold tracking-[0.2em] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Colección de Cabañas & Refugios • Villa MCJ</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-tight">
              Cabañas & refugios campestres. <br />
              <span className="font-editorial-italic text-white/60">Descanso en el corazón del llano.</span>
            </h2>
          </div>

          {/* Autoplay & Navigation Action Controls */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            
            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3.5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title={isPaused ? "Reanudar cinta automática" : "Pausar cinta automática"}
            >
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
              <span className="text-[11px] uppercase tracking-wider">{isPaused ? "Reanudar" : "Cinta Activa"}</span>
            </button>

            {/* Prev / Next Arrows (Apple Glass Style) */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10">
              <button
                onClick={goToPrev}
                aria-label="Cabaña anterior"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="w-px h-4 bg-white/15" />
              <button
                onClick={goToNext}
                aria-label="Siguiente cabaña"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Counter */}
            <div className="text-xs font-mono text-white/50 pl-2">
              <span className="text-white font-bold">{cabin.num}</span> / {String(CABINS.length).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 1. THE MONUMENTAL CENTER-STAGE FRAME (Larger & Expanded) */}
        <div className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.9)] bg-[#0C1210] min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 group">
          
          {/* Animated Cabin Image (Sliding from right to left smoothly) */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={cabin.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src={cabin.image}
                alt={cabin.name}
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>

          {/* Deep Vignette Gradients for Impeccable Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B0A] via-[#070B0A]/40 to-black/30 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />

          {/* Top Pill Badges & Progress Line */}
          <div className="relative z-20 flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium">
              <span>{cabin.subtitle}</span>
            </div>

            <div className="flex items-center gap-3">
              {cabin.isRealPhoto ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Fotografía Real Verificada</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/70 text-[11px]">
                  <span>{cabin.tag}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Stage: Ultra-clean typography and metrics */}
          <div className="relative z-20 max-w-2xl mt-48 sm:mt-64">
            
            {/* Title and Pricing in High Contrast */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-3">
              <h3 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                {cabin.name}
              </h3>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
                  {cabin.formattedPrice}
                </span>
                <span className="text-xs uppercase tracking-widest text-white/60 font-sans">
                  COP / noche
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed mb-6 max-w-xl drop-shadow-sm">
              {cabin.description}
            </p>

            {/* Apple Style Clean Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-white/15 text-white/90 text-xs mb-8 backdrop-blur-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Capacidad</span>
                <strong className="text-sm font-semibold text-white">{cabin.capacity}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Alcobas</span>
                <strong className="text-sm font-semibold text-white">{cabin.bedrooms}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Baño</span>
                <strong className="text-sm font-semibold text-white">{cabin.bathrooms}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Río Humadea</span>
                <strong className="text-sm font-semibold text-white">{cabin.distanceRiver}</strong>
              </div>
            </div>

            {/* Action Buttons: Pure White Pill (Apple/Linear style) */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleBookCabin(cabin.id)}
                className="px-8 py-4 rounded-full bg-white hover:bg-white/90 text-[#070B0A] font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_10px_35px_rgba(255,255,255,0.2)] flex items-center gap-2.5 cursor-pointer"
              >
                <span>Reservar {cabin.name}</span>
                <ArrowRight size={14} />
              </button>

              <a
                href={`/alojamiento/${cabin.id}`}
                className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold uppercase tracking-wider transition-all duration-200 backdrop-blur-md"
              >
                Ver Galería & Planos
              </a>
            </div>

          </div>

          {/* Continuous Timer Progress Bar at the Bottom of the Frame */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
            <div 
              className="h-full bg-white transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

        {/* 2. THE PHOTOGRAPHIC FILMSTRIP RIBBON (Cinta de Fotografía Horizontal) */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold block">
              Cinta de Fotografía • Haz clic en cualquier cabaña para enfocar
            </span>
            <span className="text-xs text-white/50">
              Desplazamiento automático cada 7 seg
            </span>
          </div>

          {/* Filmstrip Reel (Scrollable / Clickable Horizontal Ribbon) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CABINS.map((c, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCabin(idx)}
                  className={`group relative text-left rounded-2xl overflow-hidden border transition-all duration-300 p-2 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/15 border-white shadow-[0_8px_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-2 bg-black/40">
                    <img 
                      src={c.image} 
                      alt={c.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-white">
                      {c.num}
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-white rounded-xl pointer-events-none" />
                    )}
                  </div>

                  {/* Micro Info */}
                  <div>
                    <h4 className="text-xs font-serif font-bold text-white truncate">
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-white/60 block truncate">
                      {c.formattedPrice} / noche
                    </span>
                  </div>

                  {/* Segmented Timer Line inside the active ribbon card */}
                  {isSelected && (
                    <div className="w-full h-0.5 bg-white/20 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-[width] duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. EXCLUSIVE PRIVATIZATION BANNER (15+ Personas) */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold block mb-1">
              Opción Exclusiva
            </span>
            <h4 className="text-lg font-serif font-normal text-white">
              ¿Viajas en grupo grande, retiro o evento familiar?
            </h4>
            <p className="text-xs text-white/60 mt-1 max-w-xl">
              Privatiza Villa MCJ al 100%: Todas las cabañas independientes, piscina exclusiva, kiosco BBQ y senderos privados sin huéspedes ajenos.
            </p>
          </div>

          <a
            href="https://wa.me/573001234567?text=Hola,%20me%20interesa%20privatizar%20completamente%20Villa%20MCJ%20para%20un%20grupo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            Cotizar Villa Completa (15p) →
          </a>
        </div>

      </div>
    </section>
  );
}
