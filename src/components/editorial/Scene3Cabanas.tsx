import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
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

export function Scene3Cabanas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Detect mobile viewport to deliver touch-first swipe ergonomics at 60 FPS
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalCabins = properties.length;

  // Scroll tracking for the pinned section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Physical Apple spring momentum smoother for fluid, natural 60 FPS transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 25,
    mass: 0.8,
    restDelta: 0.0001
  });

  // Calculate current active cabin index based on scroll progress for indicators
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      const index = Math.min(Math.floor(latest * totalCabins), totalCabins - 1);
      setActiveScrollIndex(Math.max(0, index));
    });
    return () => unsubscribe();
  }, [smoothProgress, totalCabins]);

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

  const scrollToCabin = (index: number) => {
    if (isMobile) {
      setActiveMobileIndex(index);
      return;
    }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const totalHeight = rect.height - window.innerHeight;
    const targetScroll = containerTop + (index / (totalCabins - 1)) * totalHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={containerRef}
      id="alojamiento"
      className="relative bg-[#070A09] text-[#F4F0E8]"
    >
      {/* 
        DESKTOP EXPERIENCE (lg:block): Pinned Full-Bleed 100vw x 100vh with Kinetic Clip-Path Wipe Masks
      */}
      <div 
        className="hidden lg:block relative"
        style={{ height: `${totalCabins * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          
          {/* Layered Full-Bleed Cabin Scenes with Clip-Path Wipe */}
          {properties.map((cabin, index) => {
            const meta = CABIN_EDITORIAL_META[cabin.id] || {
              italicWord: cabin.name,
              restWord: 'Estancia',
              microEssence: cabin.description.slice(0, 75),
              specs: `${cabin.capacity} Huéspedes`
            };

            const isBase = index === 0;
            const startRange = (index - 1) / (totalCabins - 1);
            const endRange = index / (totalCabins - 1);

            return (
              <CabinWipeScene
                key={cabin.id}
                cabin={cabin}
                index={index}
                totalCabins={totalCabins}
                meta={meta}
                isBase={isBase}
                startRange={startRange}
                endRange={endRange}
                scrollYProgress={smoothProgress}
                onBook={handleBookCabin}
                formatPrice={formatPrice}
              />
            );
          })}

          {/* Persistent Minimal Editorial HUD / Navigation Overlay */}
          <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-8 sm:p-12 lg:p-14">
            
            {/* Top Bar: Section Title & Coordinates */}
            <div className="flex items-center justify-between text-[11px] font-sans tracking-[0.25em] uppercase text-[#F4F0E8]/70">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4F0E8]/80 animate-pulse" />
                <span>Colección de Estancias</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#F4F0E8]/50">Desliza para recorrer cada cabaña</span>
                <span>
                  {String(activeScrollIndex + 1).padStart(2, '0')} / {String(totalCabins).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Bottom Floating Navigation Dots / Scrub Bar */}
            <div className="flex items-end justify-between pointer-events-auto">
              
              {/* Direct Scene Jump Indicators */}
              <div className="flex items-center gap-3 sm:gap-4 bg-[#070A09]/60 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10">
                {properties.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => scrollToCabin(i)}
                    className={`group flex items-center gap-2 py-1 px-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeScrollIndex === i ? 'text-white' : 'text-white/40 hover:text-white/80'
                    }`}
                    aria-label={`Ir a cabaña ${i + 1}`}
                  >
                    <span className="text-[11px] font-mono tracking-wider">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span 
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        activeScrollIndex === i ? 'w-6 bg-[#F4F0E8]' : 'w-1.5 bg-white/20 group-hover:bg-white/40'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Privatization Capsule Note */}
              <button
                onClick={() => handleBookCabin(properties[0].id)}
                className="flex items-center gap-3 text-xs tracking-wider uppercase text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full border border-white/10 backdrop-blur-md cursor-pointer"
              >
                <span>Reserva de villa completa (15+ pers)</span>
                <ArrowRight size={13} className="text-[#F4F0E8]" />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* 
        MOBILE TOUCH-FIRST EXPERIENCE (lg:hidden): High-performance 60 FPS Swiper
      */}
      <div className="block lg:hidden relative min-h-screen w-full flex flex-col justify-between py-12 px-5 sm:px-8">
        
        {/* Top Mobile Meta */}
        <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-white/60 mb-6 pt-10">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Estancias Privadas
          </span>
          <span className="font-mono">
            {String(activeMobileIndex + 1).padStart(2, '0')} / {String(totalCabins).padStart(2, '0')}
          </span>
        </div>

        {/* Active Cabin Full-Bleed Stage */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={properties[activeMobileIndex].id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={properties[activeMobileIndex].imageUrl}
                alt={properties[activeMobileIndex].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A09] via-black/30 to-black/40" />

              {/* Overlaid Editorial Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs tracking-widest px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/90">
                    N° {String(activeMobileIndex + 1).padStart(2, '0')}
                  </span>
                  <div className="text-right">
                    <span className="block text-base font-medium text-white">
                      {formatPrice(properties[activeMobileIndex].pricePerNight)}
                    </span>
                    <span className="text-[10px] text-white/60 tracking-wider uppercase">por noche</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-4xl font-serif text-white tracking-tight mb-2">
                    {properties[activeMobileIndex].name}
                  </h3>
                  <p className="text-xs text-white/80 font-light mb-3">
                    {CABIN_EDITORIAL_META[properties[activeMobileIndex].id]?.microEssence || properties[activeMobileIndex].description.slice(0, 80)}
                  </p>
                  <div className="text-[11px] font-sans text-white/60 uppercase tracking-widest">
                    {CABIN_EDITORIAL_META[properties[activeMobileIndex].id]?.specs}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Controls & Action */}
        <div className="mt-6 flex flex-col gap-4">
          
          {/* Quick Cabin Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {properties.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveMobileIndex(i)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 cursor-pointer ${
                  activeMobileIndex === i
                    ? 'bg-[#F4F0E8] text-[#070A09] font-bold shadow-md'
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                {String(i + 1).padStart(2, '0')} {c.name.replace('Casa ', '').replace('Cabaña ', '').replace('Suite ', '').replace('Refugio ', '')}
              </button>
            ))}
          </div>

          {/* Direct Primary Action */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleBookCabin(properties[activeMobileIndex].id)}
            className="w-full py-4 rounded-2xl bg-[#F4F0E8] text-[#12201C] font-semibold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Reservar {properties[activeMobileIndex].name}</span>
            <ArrowRight size={16} />
          </motion.button>

        </div>

      </div>
    </section>
  );
}

// -------------------------------------------------------------------------------------------------
// Subcomponent: Individual Full-Bleed Cabin Scene with Mask Wipe Interpolation
// -------------------------------------------------------------------------------------------------
interface CabinWipeSceneProps {
  cabin: Property;
  index: number;
  totalCabins: number;
  meta: { italicWord: string; restWord: string; microEssence: string; specs: string };
  isBase: boolean;
  startRange: number;
  endRange: number;
  scrollYProgress: any;
  onBook: (id: string) => void;
  formatPrice: (price: number) => string;
}

function CabinWipeScene({
  cabin,
  index,
  totalCabins,
  meta,
  isBase,
  startRange,
  endRange,
  scrollYProgress,
  onBook,
  formatPrice
}: CabinWipeSceneProps) {
  
  // Wipe mask transition:
  // Base cabin (0) is fully visible at 0%. Subsequent cabins wipe from right (100%) to left (0%)
  const wipeProgress = useTransform(
    scrollYProgress,
    [startRange, endRange],
    [100, 0],
    { clamp: true }
  );

  // Parallax zoom on the background photo for tactile depth
  const imageScale = useTransform(
    scrollYProgress,
    [Math.max(0, startRange - 0.1), Math.min(1, endRange + 0.1)],
    [1.08, 1.0]
  );

  // Subtitle/content subtle vertical drift
  const contentY = useTransform(
    scrollYProgress,
    [startRange, endRange],
    [30, 0]
  );

  // Clip-path inset wipe: inset(0% 0% 0% ${wipeProgress}%)
  // Creates a clean razor-sharp architectural curtain wipe across the screen
  const clipPathStyle = isBase
    ? 'inset(0% 0% 0% 0%)'
    : useMotionTemplate`inset(0% 0% 0% ${wipeProgress}%)`;

  return (
    <motion.div
      style={{
        clipPath: clipPathStyle,
        zIndex: 10 + index
      }}
      className="absolute inset-0 w-full h-full will-change-[clip-path]"
    >
      {/* High-Resolution Full-Bleed Photography */}
      <motion.div 
        style={{ scale: isBase ? 1.0 : imageScale }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={cabin.imageUrl}
          alt={cabin.name}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover object-center"
        />

        {/* Cinematographic Editorial Vignette: natural darkness for typography, 0 harsh bands */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A09] via-[#070A09]/40 to-[#070A09]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-[#070A09]/20 to-[#070A09]/80" />
      </motion.div>

      {/* Editorial Content Overlay: Zero cards, 100% typography & architecture */}
      <div className="absolute inset-0 flex flex-col justify-end pb-28 sm:pb-32 lg:pb-36 px-8 sm:px-14 lg:px-20 z-20 pointer-events-none">
        <motion.div 
          style={{ y: isBase ? 0 : contentY }}
          className="max-w-5xl"
        >
          {/* Top Cabin Numeral + Price in Clean Grotesque */}
          <div className="flex items-baseline gap-6 mb-3 sm:mb-5">
            <span className="font-mono text-sm sm:text-base tracking-[0.25em] text-[#F4F0E8]/70">
              N° {String(index + 1).padStart(2, '0')}
            </span>
            <span className="h-px w-10 bg-[#F4F0E8]/30 inline-block self-center" />
            <span className="font-mono text-base sm:text-xl text-[#F4F0E8] tracking-tight">
              {formatPrice(cabin.pricePerNight)}
              <span className="text-xs sm:text-sm text-[#F4F0E8]/60 font-sans tracking-normal ml-1.5 font-light">
                / noche
              </span>
            </span>
          </div>

          {/* Monumental Headline: Display Serif with Mix of Weight & Italics */}
          <h2 className="text-[clamp(3.5rem,8vw,8.5rem)] font-serif font-light text-[#F4F0E8] leading-[0.92] tracking-tight mb-5 sm:mb-7">
            {meta.restWord}{' '}
            <span className="italic font-normal font-serif text-[#F4F0E8]">
              {meta.italicWord}
            </span>
          </h2>

          {/* Micro Essence: Exactly under 12 words */}
          <p className="text-base sm:text-xl text-[#F4F0E8]/85 font-light max-w-xl leading-relaxed mb-6 sm:mb-8 font-sans">
            {meta.microEssence}
          </p>

          {/* Technical Specs & Action Capsule */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 pointer-events-auto">
            
            {/* Specs Line */}
            <div className="text-xs sm:text-sm font-sans tracking-[0.16em] uppercase text-[#F4F0E8]/60 border-l border-white/20 pl-4 py-0.5">
              {meta.specs}
            </div>

            {/* Apple-grade Snappy Action Button */}
            <motion.button
              whileHover={{ scale: 1.03, x: 2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onBook(cabin.id)}
              className="group px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#F4F0E8] hover:bg-white text-[#12201C] font-semibold text-xs sm:text-sm tracking-wide uppercase transition-colors shadow-[0_15px_35px_rgba(0,0,0,0.4)] flex items-center gap-3 cursor-pointer"
            >
              <span>Reservar {cabin.name}</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </motion.button>

          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}
