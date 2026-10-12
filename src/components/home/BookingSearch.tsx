import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { motion } from 'framer-motion';
import { getAvailableCapacity } from '../../utils/bookingEngine';
import { isBookingModalOpen } from '../../store/uiStore';
import './BookingSearch.css';

export const BookingSearch: React.FC<{ isModal?: boolean, onSearchComplete?: () => void }> = ({ isModal = false, onSearchComplete }) => {
  const state = useStore(reservationStore);
  
  const getTomorrowStr = (daysAhead: number = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(state.checkInDate || getTomorrowStr(1));
  const [checkOut, setCheckOut] = useState(state.checkOutDate || getTomorrowStr(3));
  const [guests, setGuests] = useState(state.guestsCount || '2');
  const [maxCapacity, setMaxCapacity] = useState<number>(15);

  // Update dynamic capacity when dates change
  useEffect(() => {
    let isMounted = true;
    
    async function updateCapacity() {
      if (checkIn && checkOut) {
        const capacity = await getAvailableCapacity(checkIn, checkOut);
        if (isMounted) {
          const cap = capacity > 0 ? capacity : 15;
          setMaxCapacity(cap);
          if (parseInt(guests) > cap && cap > 0) {
            setGuests(cap.toString());
          }
        }
      } else {
        if (isMounted) {
          setMaxCapacity(15);
        }
      }
    }

    updateCapacity();

    return () => { isMounted = false; };
  }, [checkIn, checkOut]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCheckIn = checkIn || getTomorrowStr(1);
    const effectiveCheckOut = checkOut || getTomorrowStr(3);
    
    reservationStore.set({
      ...state,
      checkInDate: effectiveCheckIn,
      checkOutDate: effectiveCheckOut,
      guestsCount: guests || '2'
    });

    if (onSearchComplete) {
      onSearchComplete();
    } else {
      isBookingModalOpen.set(true);
    }
  };

  const wrapperClass = isModal 
    ? "w-full flex flex-col gap-4" 
    : "relative -mt-12 md:-mt-16 mx-auto w-11/12 max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60 z-30";

  const formClass = isModal 
    ? "flex flex-col gap-4" 
    : "flex flex-col md:flex-row items-center gap-4";

  return (
    <motion.div 
      initial={!isModal ? { y: 40, opacity: 0 } : false}
      animate={!isModal ? { y: 0, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className={wrapperClass}
    >
      <form onSubmit={handleSearch} className={formClass}>
        
        {/* Check-in */}
        <div className="flex-1 w-full bg-white/50 rounded-2xl p-3 border border-transparent focus-within:border-guamal-green/30 focus-within:bg-white/80 transition-all duration-300 shadow-sm">
          <label className="block text-xs font-bold tracking-wider text-guamal-green uppercase mb-1">Entrada</label>
          <input 
            type="date" 
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-gray-800 bg-transparent border-none outline-none focus:ring-0 p-0 text-base font-medium"
            required
          />
        </div>

        {/* Check-out */}
        <div className="flex-1 w-full bg-white/50 rounded-2xl p-3 border border-transparent focus-within:border-guamal-green/30 focus-within:bg-white/80 transition-all duration-300 shadow-sm">
          <label className="block text-xs font-bold tracking-wider text-guamal-green uppercase mb-1">Salida</label>
          <input 
            type="date" 
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-gray-800 bg-transparent border-none outline-none focus:ring-0 p-0 text-base font-medium"
            required
          />
        </div>

        {/* Guests */}
        <div className={`flex-1 w-full rounded-2xl p-3 border border-transparent transition-all duration-300 shadow-sm ${maxCapacity === 0 ? 'bg-gray-100 opacity-60' : 'bg-white/50 focus-within:border-guamal-green/30 focus-within:bg-white/80'}`}>
          <label className="block text-xs font-bold tracking-wider text-guamal-green uppercase mb-1">
            {maxCapacity === 0 ? 'Elige fechas primero' : 'Huéspedes'}
          </label>
          <select 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            disabled={maxCapacity === 0}
            className="w-full text-gray-800 bg-transparent border-none outline-none focus:ring-0 p-0 text-base font-medium disabled:cursor-not-allowed"
          >
            {maxCapacity > 0 && Array.from({ length: maxCapacity }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
            ))}
            {maxCapacity === 0 && <option value="1">-</option>}
          </select>
        </div>

        {/* Search Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full md:w-auto h-full"
        >
          <button 
            type="submit" 
            className="w-full md:w-auto h-full bg-guamal-green hover:bg-guamal-green-light text-guamal-cream px-10 py-5 rounded-2xl font-bold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Ver Disponibilidad
          </button>
        </motion.div>

      </form>
    </motion.div>
  );
};
