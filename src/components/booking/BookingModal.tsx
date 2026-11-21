import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, CheckCircle2, Calendar, Users, Shield, Sparkles, MessageSquare } from 'lucide-react';
import { BookingSearch } from '../home/BookingSearch';
import { CheckoutForm } from './CheckoutForm';
import { findBookingBundles, type BookingBundle } from '../../utils/bookingEngine';
import { MOCK_PROPERTIES } from '../../services/api';
import { SITE } from '../../config/site';

const emilSpring = { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 };

export const BookingModal: React.FC = () => {
  const isOpen = useStore(isBookingModalOpen);
  const resState = useStore(reservationStore);
  
  const [step, setStep] = useState<'SEARCH' | 'RESULTS' | 'CHECKOUT' | 'CONFIRMATION'>('SEARCH');
  const [confirmedId, setConfirmedId] = useState('');
  const [bundles, setBundles] = useState<BookingBundle[]>([]);

  // Find cabin image or default
  const selectedCabin = MOCK_PROPERTIES.find(p => p.id === resState.selectedPropertyId) || MOCK_PROPERTIES[0];

  useEffect(() => {
    if (isOpen) {
      if (resState.checkInDate && resState.checkOutDate) {
        setStep('CHECKOUT');
      } else {
        setStep('SEARCH');
      }
    }
  }, [isOpen]);

  const handleSearchComplete = async () => {
    const state = reservationStore.get();
    const guests = parseInt(state.guestsCount || '2');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          
          {/* Backdrop with deep blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={() => isBookingModalOpen.set(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container: Architectural Obsidian Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={emilSpring}
            className="relative w-full max-w-5xl bg-[#090E0C] text-white rounded-[32px] sm:rounded-[36px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row max-h-[92vh] z-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => isBookingModalOpen.set(false)}
              aria-label="Cerrar modal"
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <X size={18} />
            </button>

            {/* Left Stage - Immersive Cabin Photography */}
            <div className="hidden md:block w-2/5 relative bg-black/50 overflow-hidden">
              <img 
                src={selectedCabin.imageUrl || "/hero-cabanas.jpg"} 
                alt={selectedCabin.name} 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090E0C] via-[#090E0C]/40 to-black/20 flex flex-col justify-between p-8 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] text-white/90 self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Villa MCJ • Guamal, Meta</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Alojamiento</span>
                  <h3 className="text-3xl font-serif font-bold text-white mb-1">{selectedCabin.name}</h3>
                  <p className="text-white/70 text-xs mb-4 font-light leading-relaxed">{selectedCabin.description}</p>
                  
                  <div className="flex items-baseline gap-2 pt-3 border-t border-white/15">
                    <span className="text-2xl font-serif font-bold text-white">${selectedCabin.pricePerNight?.toLocaleString('es-CO')}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50 font-sans">COP / noche</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Dynamic SaaS Reservation Flow */}
            <div className="w-full md:w-3/5 p-6 sm:p-10 md:p-12 bg-[#090E0C] flex flex-col min-h-[440px] overflow-y-auto">
              {step === 'SEARCH' ? (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center h-full"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] font-semibold tracking-widest uppercase mb-3 self-start">
                    <span>Paso 01 • Disponibilidad</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Consulta tus Fechas</h2>
                  <p className="text-white/60 text-xs sm:text-sm mb-8 font-light">Verifica en tiempo real el aforo y las tarifas para tu estancia.</p>
                  
                  <BookingSearch isModal={true} onSearchComplete={handleSearchComplete} />
                </motion.div>
              ) : step === 'RESULTS' ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <button 
                    onClick={() => setStep('SEARCH')}
                    className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-6 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Modificar Fechas
                  </button>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">Opciones Disponibles</h2>
                  <p className="text-white/60 text-xs mb-6 font-light">Opciones para {resState.guestsCount} personas, del {resState.checkInDate} al {resState.checkOutDate}.</p>
                  
                  <div className="space-y-3 overflow-y-auto pr-1 pb-6">
                    {bundles.map(bundle => (
                      <div key={bundle.id} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:border-white/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-serif font-bold text-lg text-white">
                              {bundle.type === 'BUNDLE' ? 'Paquete Grupal Completo' : bundle.properties[0].name}
                            </h4>
                            <p className="text-xs text-white/60 font-light mt-0.5">{bundle.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-serif font-bold text-white">${bundle.totalPrice.toLocaleString('es-CO')}</p>
                            <span className="text-[10px] text-white/50 uppercase">por noche</span>
                          </div>
                        </div>
                        
                        <div className="py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-white/80 mb-4">
                          <span>Capacidad total garantizada</span>
                          <strong className="text-white">{bundle.totalCapacity} Huéspedes</strong>
                        </div>

                        <button 
                          onClick={() => handleSelectBundle(bundle)}
                          className="w-full py-3 rounded-full bg-white hover:bg-white/90 text-[#070B0A] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
                        >
                          Seleccionar Esta Cabaña →
                        </button>
                      </div>
                    ))}
                    
                    {bundles.length === 0 && (
                      <div className="text-center p-8 bg-white/[0.02] rounded-2xl border border-white/10 text-white/60 text-xs">
                        No hay disponibilidad para el aforo completo en esas fechas. Intenta con otras fechas o consúltanos directamente por WhatsApp.
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
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <button 
                    onClick={() => setStep('SEARCH')}
                    className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-6 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Cambiar Datos
                  </button>
                  <CheckoutForm onSuccess={(resId) => {
                    setConfirmedId(resId);
                    setStep('CONFIRMATION');
                  }} />
                </motion.div>
              ) : (
                <motion.div 
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center h-full text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">¡Reserva Registrada!</h2>
                  <p className="text-white/70 text-xs sm:text-sm mb-4">Código de seguimiento: <strong className="text-white font-mono text-base">{confirmedId}</strong></p>
                  
                  <p className="text-white/60 text-xs max-w-sm mb-8 font-light leading-relaxed">
                    Hemos registrado tu solicitud. Te enviaremos el comprobante y datos de confirmación para coordinar el ingreso.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <a
                      href={`https://wa.me/${SITE.whatsapp}?text=Hola,%20acabo%20de%20reservar%20con%20el%20código%20${confirmedId}%20en%20Villa%20MCJ`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} />
                      <span>Verificar por WhatsApp</span>
                    </a>

                    <button 
                      onClick={() => {
                        isBookingModalOpen.set(false);
                        setStep('SEARCH');
                      }}
                      className="flex-1 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
