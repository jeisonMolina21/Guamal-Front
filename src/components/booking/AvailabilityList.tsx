import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { reservationStore } from '../../store/reservationStore';
import { api, type Property } from '../../services/api';
import { motion } from 'framer-motion';
import './AvailabilityList.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const AvailabilityList: React.FC = () => {
  const state = useStore(reservationStore);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.checkInDate || !state.checkOutDate) {
      window.location.href = '/reservar';
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const available = await api.checkAvailability(state.checkInDate, state.checkOutDate, Number(state.guestsCount));
        setProperties(available);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [state.checkInDate, state.checkOutDate, state.guestsCount]);

  const handleSelect = (propertyId: string) => {
    reservationStore.set({ ...state, selectedPropertyId: propertyId });
    window.location.href = `/reservar/checkout`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-guamal-green"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {properties.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50">
          <h3 className="text-2xl font-serif text-gray-800 mb-3">No hay casas disponibles</h3>
          <p className="text-gray-500 max-w-md mx-auto">Lo sentimos, no hay disponibilidad para estas fechas o cantidad de personas. Por favor intenta con otras fechas.</p>
          <button onClick={() => window.location.reload()} className="inline-block mt-6 px-6 py-2 border-2 border-guamal-green text-guamal-green rounded-full font-medium hover:bg-guamal-green hover:text-white transition-colors">Volver a buscar</button>
        </motion.div>
      ) : (
        <>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-gray-600 mb-6 font-medium text-lg">
            Hemos encontrado <span className="text-guamal-green font-bold">{properties.length}</span> opciones mágicas para ti:
          </motion.p>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {properties.map(house => (
              <motion.div key={house.id} variants={item} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100/50 flex flex-col group">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={house.imageUrl} 
                    alt={house.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-guamal-green shadow-sm">
                    Disponible
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow relative bg-white">
                  <h3 className="text-3xl font-serif font-bold text-guamal-green mb-3">{house.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{house.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-guamal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {house.maxGuests ?? house.capacity} max
                    </span>
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-guamal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      {house.bedrooms ?? Math.max(1, Math.round((house.capacity || 4) / 2))} hab
                    </span>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Por noche</p>
                      <p className="text-3xl font-bold text-guamal-green">${(house.basePrice ?? house.pricePerNight).toLocaleString('es-CO')}</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelect(house.id)}
                      className="bg-guamal-green text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-guamal-green-light transition-colors shadow-lg"
                    >
                      Reservar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};
