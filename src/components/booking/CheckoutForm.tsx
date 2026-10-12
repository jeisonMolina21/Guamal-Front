import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import './CheckoutForm.css';

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
        guestsCount: Number(state.guestsCount),
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

  if (!state.selectedPropertyId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <p className="text-red-500 font-medium text-lg">Por favor selecciona una propiedad primero.</p>
        <a href="/reservar/disponibilidad" className="mt-6 inline-block bg-guamal-green text-white px-6 py-2 rounded-full font-medium">Volver a Casas</a>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 md:p-12 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-guamal-green-light to-guamal-green"></div>
      
      <h2 className="text-3xl font-serif font-bold text-guamal-green mb-8">Tus Datos Personales</h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-8 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase ml-1">Nombre Completo</label>
          <input 
            type="text" 
            required 
            value={state.guestName}
            onChange={(e) => updateField('guestName', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-guamal-green/20 focus:border-guamal-green outline-none transition-all shadow-sm"
            placeholder="Ej. Juan Pérez"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase ml-1">Correo Electrónico</label>
          <input 
            type="email" 
            required 
            value={state.guestEmail}
            onChange={(e) => updateField('guestEmail', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-guamal-green/20 focus:border-guamal-green outline-none transition-all shadow-sm"
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase ml-1">WhatsApp / Teléfono</label>
          <input 
            type="tel" 
            required 
            value={state.guestPhone}
            onChange={(e) => updateField('guestPhone', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-guamal-green/20 focus:border-guamal-green outline-none transition-all shadow-sm"
            placeholder="+57 300 000 0000"
          />
        </div>

        <div className="pt-8">
          <motion.button 
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit" 
            disabled={loading}
            className="relative w-full bg-guamal-green text-white font-bold text-lg py-4 rounded-xl hover:bg-guamal-green-light transition-colors disabled:opacity-80 overflow-hidden shadow-lg"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto"
              />
            ) : (
              'Completar Solicitud'
            )}
          </motion.button>
          <p className="text-xs text-center text-gray-400 mt-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Tus datos están protegidos y encriptados.
          </p>
        </div>
      </form>
    </motion.div>
  );
};
