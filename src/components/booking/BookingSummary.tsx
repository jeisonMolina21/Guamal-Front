import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { api, type Property } from '../../services/api';
import { motion } from 'framer-motion';
import './BookingSummary.css';

export const BookingSummary: React.FC = () => {
  const state = useStore(reservationStore);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (state.selectedPropertyId) {
      api.getProperty(state.selectedPropertyId).then(p => p && setProperty(p));
    }
  }, [state.selectedPropertyId]);

  if (!state.checkInDate || !state.checkOutDate) return null;

  const checkIn = new Date(state.checkInDate);
  const checkOut = new Date(state.checkOutDate);
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl"
    >
      <h3 className="text-2xl font-serif font-bold text-guamal-green mb-6">Resumen</h3>
      
      {property && (
        <div className="flex gap-4 mb-8 pb-8 border-b border-gray-200/50">
          <img src={property.imageUrl} alt={property.name} className="w-24 h-24 object-cover rounded-2xl shadow-sm" />
          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-gray-800 text-lg mb-1">{property.name}</h4>
            <p className="text-sm text-gray-500 bg-gray-100/50 px-2 py-1 rounded-md inline-block self-start">
              Hasta {property.maxGuests ?? property.capacity} huéspedes
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 text-sm mb-8">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Llegada</span>
          <span className="font-bold text-gray-800 bg-white/50 px-3 py-1 rounded-lg">{state.checkInDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Salida</span>
          <span className="font-bold text-gray-800 bg-white/50 px-3 py-1 rounded-lg">{state.checkOutDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Huéspedes</span>
          <span className="font-bold text-gray-800 bg-white/50 px-3 py-1 rounded-lg">{state.guestsCount} personas</span>
        </div>
      </div>

      {property && (
        <div className="border-t border-gray-200/50 pt-6">
          <div className="flex justify-between text-gray-600 mb-3 font-medium">
            <span>${(property.basePrice ?? property.pricePerNight).toLocaleString('es-CO')} x {nights} {nights === 1 ? 'noche' : 'noches'}</span>
            <span>${((property.basePrice ?? property.pricePerNight) * nights).toLocaleString('es-CO')}</span>
          </div>
          
          <div className="flex justify-between font-bold text-2xl mt-6 pt-6 border-t border-gray-200/50 text-guamal-green">
            <span>Total a pagar</span>
            <span>${((property.basePrice ?? property.pricePerNight) * nights).toLocaleString('es-CO')}</span>
          </div>
          <p className="text-xs text-right text-gray-400 mt-2">Incluye impuestos locales</p>
        </div>
      )}
    </motion.div>
  );
};
