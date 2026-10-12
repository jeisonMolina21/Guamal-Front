import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import './WhatsAppWidget.css';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestsCount, setGuestsCount] = useState('4');
  const [waPhone, setWaPhone] = useState('573001234567');
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

  // Automatically open the popup window after 4 seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

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
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
              >
                <Send size={16} />
                Chatear por WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Message Icon Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir chat de WhatsApp"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_35px_rgba(37,211,102,0.6)] transition-all cursor-pointer group"
      >
        {/* Pulsing indicator ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:opacity-0" style={{ animationDuration: '3s' }}></span>

        <MessageCircle size={28} className="relative z-10 transition-transform group-hover:scale-110" />

        {/* Badge dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </motion.button>
    </div>
  );
};
