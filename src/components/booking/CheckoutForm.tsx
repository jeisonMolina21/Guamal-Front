import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const CheckoutForm: React.FC<{ onSuccess?: (resId: string) => void }> = ({ onSuccess }) => {
  const state = useStore(reservationStore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createReservation({
        propertyId: state.selectedPropertyId,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        guestsCount: Number(state.guestsCount || 2),
        guest: {
          name: state.guestName,
          email: state.guestEmail,
          phone: state.guestPhone
        }
      });

      if (res.success && res.reservationId) {
        if (onSuccess) {
          onSuccess(res.reservationId);
        } else {
          window.location.href = `/reservar/confirmacion?id=${res.reservationId}`;
        }
      } else {
        setError(res.error || 'Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    reservationStore.set({ ...state, [field]: value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-1 sm:p-2 text-white"
    >
      <div className="mb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Paso Final</span>
        <h2 className="text-2xl font-serif font-bold text-white">Datos de Contacto</h2>
        <p className="text-xs text-white/60 font-light mt-1">Completa tus datos para enviarte la confirmación oficial.</p>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6 text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">Nombre Completo</label>
          <input 
            type="text" 
            required 
            value={state.guestName || ''}
            onChange={(e) => updateField('guestName', e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:border-white focus:outline-none transition-all"
            placeholder="Ej. Juan Pérez"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">Correo Electrónico</label>
          <input 
            type="email" 
            required 
            value={state.guestEmail || ''}
            onChange={(e) => updateField('guestEmail', e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:border-white focus:outline-none transition-all"
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">WhatsApp / Teléfono Móvil</label>
          <input 
            type="tel" 
            required 
            value={state.guestPhone || ''}
            onChange={(e) => updateField('guestPhone', e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:border-white focus:outline-none transition-all"
            placeholder="+57 300 000 0000"
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-full bg-white hover:bg-white/90 text-[#070B0A] font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_6px_30px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                className="w-5 h-5 border-2 border-[#070B0A]/30 border-t-[#070B0A] rounded-full"
              />
            ) : (
              'Completar Solicitud de Reserva →'
            )}
          </button>
          
          <p className="text-[11px] text-center text-white/40 mt-4 leading-relaxed">
            Tus datos están protegidos. Te enviaremos la confirmación oficial y comprobante por WhatsApp.
          </p>
        </div>
      </form>
    </motion.div>
  );
};
