import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ArrowRight, Sparkles, Home, ChevronUp, ChevronDown, X } from 'lucide-react';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';

// Apple & Emil Kowalski Spring & Ease Definitions
const emilSpring = { type: 'spring' as const, stiffness: 320, damping: 28, mass: 0.8 };
const popoverSpring = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.7 };
const smoothEase = [0.23, 1, 0.32, 1] as const;

export function HeroQuickBooking() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteractedWithTooltip, setHasInteractedWithTooltip] = useState(false);

  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: ''
  });
  const [guests, setGuests] = useState(2);
  const [cabinPref, setCabinPref] = useState('cualquiera');

  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll detection & stationary idle trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrolledDown = window.scrollY > 280;
      setIsScrolled(scrolledDown);

      // Hide tooltip while actively scrolling
      setShowTooltip(false);

      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }

      // If user stops scrolling for 2.2 seconds and is scrolled down, trigger gentle tooltip
      if (scrolledDown && !hasInteractedWithTooltip) {
        scrollTimer.current = setTimeout(() => {
          setShowTooltip(true);
        }, 2200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [hasInteractedWithTooltip]);

  // Auto-dismiss tooltip after 8 seconds of appearance
  useEffect(() => {
    if (showTooltip) {
      const dismissTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
      return () => clearTimeout(dismissTimer);
    }
  }, [showTooltip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dates.checkIn && dates.checkOut) {
      reservationStore.setKey('checkInDate', dates.checkIn);
      reservationStore.setKey('checkOutDate', dates.checkOut);
    }
    reservationStore.setKey('guestsCount', String(guests));

    if (cabinPref !== 'cualquiera') {
      reservationStore.setKey('selectedPropertyId', cabinPref);
    }

    isBookingModalOpen.set(true);
  };

  const handleOpenFromBubble = () => {
    setHasInteractedWithTooltip(true);
    setShowTooltip(false);
    isBookingModalOpen.set(true);
  };

  return (
    <AnimatePresence>
      {!isScrolled && (
        /* TOP HERO STATE: Sleek Glass Island in bottom center of Hero */
        <motion.div
          key="top-hero-glass-bar"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.45, ease: smoothEase }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl"
        >
          <div className="glass-island rounded-3xl p-3 sm:p-4 text-white">
            
            {/* Collapsed Bar / Trigger */}
            <div className="flex items-center justify-between gap-3 px-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      {dates.checkIn && dates.checkOut ? `${dates.checkIn} → ${dates.checkOut}` : 'Consultar Disponibilidad'}
                    </span>
                    <span className="text-[11px] text-white/60">
                      {guests} huéspedes • {cabinPref === 'cualquiera' ? 'Todas las cabañas' : 'Cabaña elegida'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                  <span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Modificar Fechas'}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => isBookingModalOpen.set(true)}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-white/90 text-[#070B0A] text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Reservar</span>
                <ArrowRight size={13} />
              </motion.button>
            </div>

            {/* Expandable Form Body */}
            <AnimatePresence>
              {isExpanded && (
                <motion.form
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.35, ease: smoothEase }}
                  onSubmit={handleSubmit}
                  className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center overflow-hidden"
                >
                  <div className="lg:col-span-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-colors focus-within:border-white">
                    <label className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/60 mb-1">
                      Llegada
                    </label>
                    <input
                      type="date"
                      value={dates.checkIn}
                      onChange={(e) => setDates(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none cursor-pointer [color-scheme:dark]"
                      required
                    />
                  </div>

                  <div className="lg:col-span-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-colors focus-within:border-white">
                    <label className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/60 mb-1">
                      Salida
                    </label>
                    <input
                      type="date"
                      value={dates.checkOut}
                      onChange={(e) => setDates(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none cursor-pointer [color-scheme:dark]"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-colors focus-within:border-white">
                    <label className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/60 mb-1">
                      Huéspedes
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value={1} className="bg-[#070B0A] text-white">1 persona</option>
                      <option value={2} className="bg-[#070B0A] text-white">2 personas</option>
                      <option value={3} className="bg-[#070B0A] text-white">3 personas</option>
                      <option value={4} className="bg-[#070B0A] text-white">4 personas</option>
                      <option value={5} className="bg-[#070B0A] text-white">5 personas</option>
                      <option value={6} className="bg-[#070B0A] text-white">6 personas</option>
                      <option value={15} className="bg-[#070B0A] text-white">15 (Todo)</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-colors focus-within:border-white">
                    <label className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/60 mb-1">
                      Cabaña
                    </label>
                    <select
                      value={cabinPref}
                      onChange={(e) => setCabinPref(e.target.value)}
                      className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="cualquiera" className="bg-[#070B0A] text-white">Todas</option>
                      <option value="1" className="bg-[#070B0A] text-white">Casa Ceiba</option>
                      <option value="2" className="bg-[#070B0A] text-white">Casa Samán</option>
                      <option value="3" className="bg-[#070B0A] text-white">Casa Moriche</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full h-[48px] bg-white hover:bg-white/90 text-[#070B0A] font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Cotizar</span>
                      <ArrowRight size={13} />
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
