import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BookingSearch } from '../home/BookingSearch';
import { CheckoutForm } from './CheckoutForm';
import { findBookingBundles, type BookingBundle } from '../../utils/bookingEngine';
import './BookingModal.css';

export const BookingModal: React.FC = () => {
  const isOpen = useStore(isBookingModalOpen);
  const resState = useStore(reservationStore);
  
  const [step, setStep] = useState<'SEARCH' | 'RESULTS' | 'CHECKOUT' | 'CONFIRMATION'>('SEARCH');
  const [confirmedId, setConfirmedId] = useState('');
  const [bundles, setBundles] = useState<BookingBundle[]>([]);

  const handleSearchComplete = async () => {
    const state = reservationStore.get();
    const guests = parseInt(state.guestsCount || '1');
    const result = await findBookingBundles(guests, state.checkInDate || '', state.checkOutDate || '');
    setBundles(result);
    setStep('RESULTS');
  };

  const handleSelectBundle = (bundle: BookingBundle) => {
    reservationStore.set({
      ...reservationStore.get(),
      selectedPropertyId: bundle.type === 'SINGLE' ? bundle.properties[0].id : 'bundle'
    });
    setStep('CHECKOUT');
  };

  if (!isOpen) {
    if (step !== 'SEARCH') setStep('SEARCH'); // Reset on close
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => isBookingModalOpen.set(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={() => isBookingModalOpen.set(false)}
            className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white rounded-full p-2 text-gray-800 transition-colors backdrop-blur-md shadow-sm"
          >
            <X size={24} />
          </button>

          {/* Left Side - Image */}
          <div className="hidden md:block w-2/5 relative">
            <img 
              src="https://images.unsplash.com/photo-1542314831-c5a4d40715af?q=80&w=1000&auto=format&fit=crop" 
              alt="Cabaña Guamal" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Reserva tu descanso</h3>
              <p className="text-white/80 text-sm">Disponibilidad en tiempo real</p>
            </div>
          </div>

          {/* Right Side - Dynamic Content */}
          <div className="w-full md:w-3/5 p-8 md:p-12 bg-guamal-cream/30 flex flex-col min-h-[400px]">
            {step === 'SEARCH' ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col justify-center h-full"
              >
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Consultar Disponibilidad</h2>
                <p className="text-gray-600 mb-8">Ingresa tus fechas para conocer el aforo disponible.</p>
                <BookingSearch isModal={true} onSearchComplete={handleSearchComplete} />
              </motion.div>
            ) : step === 'RESULTS' ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <button 
                  onClick={() => setStep('SEARCH')}
                  className="flex items-center gap-2 text-guamal-green font-medium mb-6 hover:underline"
                >
                  <ArrowLeft size={16} /> Volver a buscar
                </button>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Opciones Disponibles</h2>
                <p className="text-gray-600 mb-6">Encontramos estas opciones para {resState.guestsCount} personas, del {resState.checkInDate} al {resState.checkOutDate}.</p>
                
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-8">
                  {bundles.map(bundle => (
                    <div key={bundle.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-guamal-green/50 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            {bundle.type === 'BUNDLE' ? 'Paquete Grupal' : bundle.properties[0].name}
                            {bundle.type === 'BUNDLE' && <span className="bg-guamal-green/10 text-guamal-green text-xs px-2 py-1 rounded-full">Sugerido</span>}
                          </h4>
                          <p className="text-sm text-gray-500">{bundle.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-guamal-green">${bundle.totalPrice.toLocaleString('es-CO')}</p>
                          <p className="text-xs text-gray-400">por noche</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-guamal-green"/>
                          Capacidad total: {bundle.totalCapacity} personas
                        </p>
                      </div>

                      <button 
                        onClick={() => handleSelectBundle(bundle)}
                        className="w-full bg-guamal-green text-white py-3 rounded-xl font-medium hover:bg-guamal-green-light transition-colors"
                      >
                        Reservar esta opción
                      </button>
                    </div>
                  ))}
                  
                  {bundles.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
                      Lo sentimos, no hay suficiente capacidad disponible para las fechas seleccionadas.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : step === 'CHECKOUT' ? (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <button 
                  onClick={() => setStep('RESULTS')}
                  className="flex items-center gap-2 text-guamal-green font-medium mb-6 hover:underline"
                >
                  <ArrowLeft size={16} /> Volver a opciones
                </button>
                <CheckoutForm onSuccess={(resId) => {
                  setConfirmedId(resId);
                  setStep('CONFIRMATION');
                }} />
              </motion.div>
            ) : (
              <motion.div 
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h2>
                <p className="text-gray-600 mb-2">Tu código de reserva es: <strong className="text-guamal-green text-lg">{confirmedId}</strong></p>
                <p className="text-gray-500 mb-8">Hemos enviado los detalles a tu correo electrónico y a tu WhatsApp.</p>
                <button 
                  onClick={() => {
                    isBookingModalOpen.set(false);
                    setStep('SEARCH');
                  }}
                  className="bg-guamal-green text-white px-8 py-3 rounded-xl font-medium hover:bg-guamal-green-light transition-colors"
                >
                  Entendido, volver al inicio
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
