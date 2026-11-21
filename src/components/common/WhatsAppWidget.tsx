import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { SITE } from '../../config/site';
import './WhatsAppWidget.css';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestsCount, setGuestsCount] = useState('4');
  const [waPhone, setWaPhone] = useState(SITE.whatsapp);
  const [welcomeMsg, setWelcomeMsg] = useState('Hola, quisiera asesoría para encontrar una casa en Guamal.');

  // Fetch settings dynamically from database
  useEffect(() => {
    api.getPublicSettings().then(settings => {
      if (settings.whatsapp_number) {
        setWaPhone(settings.whatsapp_number.replace(/[^0-9]/g, ''));
      }
      if (settings.whatsapp_welcome_msg) {
        setWelcomeMsg(settings.whatsapp_welcome_msg);
      }
    }).catch(console.error);
  }, []);

  // Automatically open the popup window after 8 seconds on first visit,
  // and automatically close it after 15 seconds of inactivity if the user doesn't interact
  useEffect(() => {
    // Open timer (8 seconds)
    const openTimer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
      }
    }, 8000);

    return () => clearTimeout(openTimer);
  }, [hasInteracted]);

  // Auto-close timeout after 15 seconds if it was auto-opened
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      const closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, 15000);

      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, hasInteracted]);

  const handleToggle = () => {
    setHasInteracted(true);
    setIsOpen(prev => !prev);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    setIsOpen(false);
  };

  const handleSendWhatsApp = async (e: React.MouseEvent) => {
    setHasInteracted(true);
    setIsOpen(false);

    const nameToSave = guestName.trim() || 'Visitante Web';
    const messageText = `Hola, soy ${nameToSave}. ${welcomeMsg} Somos aproximadamente ${guestsCount} personas.`;

    // Save lead in background database
    try {
      api.createInquiry({
        fullName: nameToSave,
        phone: 'WhatsApp Directo',
        channel: 'WIDGET_WHATSAPP',
        guestsCount: Number(guestsCount) || 4,
        message: messageText,
      });
    } catch (err) {
      console.warn('Inquiry background log error:', err);
    }

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Ventana Emergente (Popup Card) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
            className="mb-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-100/80 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-guamal-green to-guamal-green-light text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    G
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-guamal-green rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Asesor Guamal Hostal</h4>
                  <p className="text-[11px] text-white/80">En línea para ayudarte</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Cerrar ventana"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-guamal-cream/20">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <p className="font-serif font-bold text-gray-900 text-base mb-1">
                  ¿Te ayudo a encontrar una casa?
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  Cuéntanos tu nombre y cuántas personas vienen para darte atención personalizada y cotización inmediata.
                </p>

                <div className="space-y-2">
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-guamal-green"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users size={14} className="text-gray-400" /> Huéspedes:
                    </span>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="bg-transparent font-bold text-guamal-green focus:outline-none cursor-pointer"
                    >
                      <option value="2">2 personas</option>
                      <option value="4">4 personas</option>
                      <option value="6">6 personas</option>
                      <option value="10">10+ (Grupo / Todo el barrio)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                className="w-full bg-[#1E3A34] hover:bg-[#142723] text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Send size={15} className="text-[#E0BA80]" />
                <span>Contactar vía WhatsApp</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Message Icon Button - Refined and tranquil */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir chat de WhatsApp"
        className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#142723] hover:bg-[#1E3A34] text-[#E0BA80] border border-[#C69A59]/40 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all cursor-pointer group"
      >
        <MessageCircle size={22} className="relative z-10 transition-transform group-hover:scale-105" />

        {/* Discreet status dot */}
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 border border-[#142723] rounded-full"></span>
      </motion.button>
    </div>
  );
};
