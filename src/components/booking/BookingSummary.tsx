import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { api, type Property, MOCK_PROPERTIES } from '../../services/api';
import { motion } from 'framer-motion';

export const BookingSummary: React.FC = () => {
  const state = useStore(reservationStore);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (state.selectedPropertyId) {
      const found = MOCK_PROPERTIES.find(p => p.id === state.selectedPropertyId);
      if (found) {
        setProperty(found);
      } else {
        api.getProperty(state.selectedPropertyId).then(p => p && setProperty(p));
      }
    }
  }, [state.selectedPropertyId]);

  if (!state.checkInDate || !state.checkOutDate) return null;

  const checkIn = new Date(state.checkInDate);
  const checkOut = new Date(state.checkOutDate);
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const displayProp = property || MOCK_PROPERTIES[0];
  const unitPrice = displayProp.pricePerNight || displayProp.basePrice || 180000;
  const totalPrice = unitPrice * nights;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl text-white"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <h3 className="text-lg font-serif font-bold text-white">Resumen de Estadía</h3>
        <span className="text-[10px] uppercase tracking-widest text-white/40">Villa MCJ</span>
      </div>
      
      {displayProp && (
        <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
          <img 
            src={displayProp.imageUrl || "/hero-cabanas.jpg"} 
            alt={displayProp.name} 
            className="w-20 h-20 object-cover rounded-2xl border border-white/10" 
          />
          <div className="flex flex-col justify-center">
            <h4 className="font-serif font-bold text-white text-base mb-1">{displayProp.name}</h4>
            <span className="text-[11px] text-white/60">
              Hasta {displayProp.capacity} huéspedes
            </span>
            <span className="text-xs font-semibold text-emerald-400 mt-1">
              ${unitPrice.toLocaleString('es-CO')} / noche
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3 text-xs text-white/70 mb-6">
        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">Llegada</span>
          <strong className="text-white font-mono">{state.checkInDate}</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">Salida</span>
          <strong className="text-white font-mono">{state.checkOutDate}</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">Estadía</span>
          <strong className="text-white">{nights} {nights === 1 ? 'noche' : 'noches'}</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">Huéspedes</span>
          <strong className="text-white">{state.guestsCount || 2} personas</strong>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>${unitPrice.toLocaleString('es-CO')} × {nights} noches</span>
          <span>${totalPrice.toLocaleString('es-CO')}</span>
        </div>
        
        <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
          <span className="text-xs uppercase tracking-widest text-white/60 font-medium">Total Estimado</span>
          <span className="text-2xl font-serif font-bold text-white">${totalPrice.toLocaleString('es-CO')}</span>
        </div>
        <p className="text-[10px] text-right text-white/40 mt-1">COP • Tarifa directa sin comisiones ocultas</p>
      </div>
    </motion.div>
  );
};
