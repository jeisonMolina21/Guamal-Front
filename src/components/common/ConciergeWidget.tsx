import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, MessageSquare, X, Send, Calendar, Users, 
  MapPin, Compass, ArrowRight, Phone, CheckCircle2, Home, HelpCircle 
} from 'lucide-react';
import { isBookingModalOpen } from '../../store/uiStore';
import { reservationStore } from '../../store/reservationStore';
import { api } from '../../services/api';

// Emil Kowalski & Apple Motion Tuning
const springGentle = { type: 'spring' as const, stiffness: 320, damping: 28, mass: 0.8 };
const springPopover = { type: 'spring' as const, stiffness: 340, damping: 26, mass: 0.7 };

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  type?: 'text' | 'options' | 'cabins' | 'dates' | 'whatsapp_form';
  options?: { label: string; action: () => void; icon?: string }[];
  timestamp: string;
}

export const ConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIdleTooltip, setShowIdleTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Lead capture state
  const [guestName, setGuestName] = useState('');
  const [waPhone, setWaPhone] = useState('573001234567');
  const [welcomeMsg, setWelcomeMsg] = useState('Hola, quisiera asesoría para reservar en Villa MCJ.');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch public settings from backend
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

  // Idle tooltip trigger when user scrolls and stays stationary
  useEffect(() => {
    const handleScroll = () => {
      setShowIdleTooltip(false);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);

      if (window.scrollY > 240 && !hasInteracted && !isOpen) {
        scrollTimer.current = setTimeout(() => {
          setShowIdleTooltip(true);
        }, 2200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [hasInteracted, isOpen]);

  // First time auto-prompt after 9 seconds if untouched
  useEffect(() => {
    const promptTimer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setShowIdleTooltip(true);
      }
    }, 9000);
    return () => clearTimeout(promptTimer);
  }, [hasInteracted, isOpen]);

  // Auto-dismiss idle tooltip after 8s
  useEffect(() => {
    if (showIdleTooltip) {
      const dismissTimer = setTimeout(() => {
        setShowIdleTooltip(false);
      }, 8000);
      return () => clearTimeout(dismissTimer);
    }
  }, [showIdleTooltip]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! Te doy la bienvenida a Villa MCJ en Guamal, Meta. Soy tu Concierge virtual. ¿En qué te gustaría que te oriente hoy?',
      type: 'options',
      timestamp: getCurrentTime()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleOpenWidget = () => {
    setHasInteracted(true);
    setShowIdleTooltip(false);
    setIsOpen(true);
  };

  const handleCloseWidget = () => {
    setIsOpen(false);
  };

  const addBotMessage = (text: string, type: ChatMessage['type'] = 'text', options?: ChatMessage['options']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text,
          type,
          options,
          timestamp: getCurrentTime()
        }
      ]);
    }, 450);
  };

  // Flow handlers
  const handleSelectCheckAvailability = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: 'Quiero consultar disponibilidad y fechas.',
        timestamp: getCurrentTime()
      }
    ]);

    addBotMessage(
      'Contamos con 3 cabañas bioclimáticas independientes y piscina privada. ¿Para cuántos huéspedes deseas tu estadía?',
      'options',
      [
        {
          label: '2 personas (Pareja)',
          action: () => handleSelectGuests(2)
        },
        {
          label: '4 personas (Casa Ceiba)',
          action: () => handleSelectGuests(4, '1')
        },
        {
          label: '5 personas (Casa Samán)',
          action: () => handleSelectGuests(5, '2')
        },
        {
          label: '6 personas (Casa Moriche)',
          action: () => handleSelectGuests(6, '3')
        },
        {
          label: '15 personas (Toda la Villa)',
          action: () => handleSelectGuests(15, 'bundle')
        }
      ]
    );
  };

  const handleSelectGuests = (count: number, propertyId?: string) => {
    reservationStore.setKey('guestsCount', String(count));
    if (propertyId) {
      reservationStore.setKey('selectedPropertyId', propertyId);
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: `Somos ${count} personas.`,
        timestamp: getCurrentTime()
      }
    ]);

    addBotMessage(
      `¡Perfecto! He configurado tu grupo para ${count} personas. ¿Deseas abrir el calendario para ver fechas libres y tarifas exactas en tiempo real?`,
      'dates'
    );
  };

  const handleOpenBookingModal = () => {
    setIsOpen(false);
    isBookingModalOpen.set(true);
  };

  const handleSelectCabinsInfo = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: 'Cuéntame sobre las cabañas de Villa MCJ.',
        timestamp: getCurrentTime()
      }
    ]);

    addBotMessage(
      'Villa MCJ es un refugio boutique con 3 cabañas exclusivas:',
      'cabins'
    );
  };

  const handleSelectTourismInfo = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: '¿Qué destinos y balnearios quedan cerca?',
        timestamp: getCurrentTime()
      }
    ]);

    addBotMessage(
      'Villa MCJ está en una ubicación privilegiada de Guamal, Meta:\n\n• 🌊 Río Humadea (10 min): Pozas de agua cristalina y gastronomía llanera.\n• 🏞️ Cascada Monserrate Bajo (15 min): Senderismo ecológico en el piedemonte.\n• 🍫 Ruta del Cacao & Orotoy (12 min): Agroturismo y cata de chocolate local.\n\n¿Quieres que te preparemos un plan para tu visita?',
      'options',
      [
        {
          label: '📅 Consultar Fechas de Viaje',
          action: handleSelectCheckAvailability
        },
        {
          label: '💬 Consultar Asesor por WhatsApp',
          action: () => handleSelectWhatsApp('Quisiera recomendaciones turísticas de Guamal')
        }
      ]
    );
  };

  const handleSelectWhatsApp = (customTopic?: string) => {
    const topic = customTopic || 'Quisiera información y disponibilidad en Villa MCJ.';
    const name = guestName.trim() || 'Visitante Web';
    const message = `Hola, soy ${name}. ${topic}`;

    // Log inquiry in background
    try {
      api.createInquiry({
        fullName: name,
        phone: 'WhatsApp Concierge',
        channel: 'WIDGET_CONCIERGE',
        guestsCount: Number(reservationStore.get().guestsCount) || 2,
        message
      });
    } catch (e) {
      console.warn('Inquiry background log error:', e);
    }

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: userText,
        timestamp: getCurrentTime()
      }
    ]);

    // Smart Keyword Matching
    const lower = userText.toLowerCase();
    setTimeout(() => {
      if (lower.includes('disponib') || lower.includes('fecha') || lower.includes('reserva') || lower.includes('reservar')) {
        handleSelectCheckAvailability();
      } else if (lower.includes('precio') || lower.includes('tarifa') || lower.includes('costo') || lower.includes('cuanto vale')) {
        addBotMessage(
          'Las tarifas van desde $180.000 COP/noche (Casa Ceiba para 4 personas), $200.000 COP/noche (Casa Samán para 5) y $250.000 COP/noche (Casa Moriche con BBQ). ¿Deseas cotizar para tu fecha?',
          'options',
          [
            { label: '📅 Ver Fechas Libres', action: handleOpenBookingModal },
            { label: '💬 Preguntar por WhatsApp', action: () => handleSelectWhatsApp('Consulta sobre precios y cotización') }
          ]
        );
      } else if (lower.includes('piscina') || lower.includes('solarium') || lower.includes('clima')) {
        addBotMessage(
          'Sí, Villa MCJ cuenta con piscina al aire libre, solárium privado y zona de hamacas para uso exclusivo de los huéspedes. El clima es cálido y soleado de día (aprox. 28°C) y fresco por las corrientes de la cordillera en la noche.',
          'options',
          [
            { label: '🏡 Ver Cabañas', action: handleSelectCabinsInfo },
            { label: '📅 Consultar Fechas', action: handleSelectCheckAvailability }
          ]
        );
      } else if (lower.includes('mascota') || lower.includes('perro') || lower.includes('gato')) {
        addBotMessage(
          'Aceptamos mascotas educadas bajo solicitud previa para garantizar la tranquilidad de las áreas campestres. ¿Te gustaría consultarlo con el anfitrión?',
          'options',
          [
            { label: '💬 Consultar en WhatsApp', action: () => handleSelectWhatsApp('Quisiera consultar si puedo llevar a mi mascota') }
          ]
        );
      } else {
        addBotMessage(
          'Con gusto puedo ayudarte a consultar disponibilidad, mostrarte las cabañas o ponerte en contacto directo con nuestro anfitrión en WhatsApp.',
          'options',
          [
            { label: '📅 Consultar Disponibilidad', action: handleSelectCheckAvailability },
            { label: '🏡 Conocer las 3 Cabañas', action: handleSelectCabinsInfo },
            { label: '💬 Hablar por WhatsApp', action: () => handleSelectWhatsApp(userText) }
          ]
        );
      }
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* 1. Stationary Idle Tooltip (Prompt unificado y tranquilo) */}
      <AnimatePresence>
        {showIdleTooltip && !isOpen && (
          <motion.div
            key="concierge-idle-tooltip"
            initial={{ opacity: 0, scale: 0.92, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 8, filter: 'blur(2px)' }}
            transition={springPopover}
            className="mb-3 w-80 bg-[#0E1E1B]/95 backdrop-blur-2xl border border-[#C69A59]/40 text-white p-4.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative origin-bottom-right"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowIdleTooltip(false);
                setHasInteracted(true);
              }}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X size={13} />
            </button>

            <div className="flex items-center gap-2 text-[#E5C38F] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={13} />
              <span>Concierge Villa MCJ</span>
            </div>

            <p className="text-xs text-white/90 font-light leading-relaxed mb-3.5">
              ¿Deseas consultar disponibilidad en tiempo real o saber qué cabaña se adapta a tu grupo?
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleOpenWidget}
              className="w-full py-2.5 px-3 bg-[#C69A59] hover:bg-[#b58947] text-[#08110F] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Chatear con el Concierge</span>
              <ArrowRight size={13} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Chatbot Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="concierge-chat-window"
            initial={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: 12, filter: 'blur(4px)' }}
            transition={springGentle}
            className="mb-3 w-[92vw] sm:w-96 max-h-[82vh] bg-[#0E1E1B] text-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-[#C69A59]/30 flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-[#142723] p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#C69A59]/20 border border-[#C69A59]/40 flex items-center justify-center font-serif font-bold text-xs text-[#E5C38F]">
                    MCJ
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-[#142723] rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white leading-tight flex items-center gap-1.5">
                    <span>Concierge Villa MCJ</span>
                    <Sparkles size={12} className="text-[#E5C38F]" />
                  </h4>
                  <p className="text-[11px] text-[#E5C38F]/90 font-medium">Asistente Virtual • En línea</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSelectWhatsApp()}
                  title="Abrir chat en WhatsApp"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-emerald-400 transition-colors cursor-pointer"
                >
                  <Phone size={14} />
                </button>
                <button
                  onClick={handleCloseWidget}
                  aria-label="Cerrar chat"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#0E1E1B] to-[#08110F] text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#C69A59] text-[#08110F] font-medium rounded-tr-sm shadow-md'
                        : 'bg-white/10 text-white/95 rounded-tl-sm border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Cabins Quick Cards */}
                    {msg.type === 'cabins' && (
                      <div className="mt-3 space-y-2">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-serif font-bold text-[#E5C38F]">Casa Ceiba</span>
                            <span className="text-[11px] text-white/80">$180.000/noche</span>
                          </div>
                          <p className="text-[11px] text-white/70">Hasta 4 personas • Terraza privada con hamacas frente a la piscina.</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-serif font-bold text-[#E5C38F]">Casa Samán</span>
                            <span className="text-[11px] text-white/80">$200.000/noche</span>
                          </div>
                          <p className="text-[11px] text-white/70">Hasta 5 personas • Espacio amplio, vista natural y hamaca doble.</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-serif font-bold text-[#E5C38F]">Casa Moriche</span>
                            <span className="text-[11px] text-white/80">$250.000/noche</span>
                          </div>
                          <p className="text-[11px] text-white/70">Hasta 6 personas • Kiosco BBQ privado y 3 alcobas.</p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSelectCheckAvailability}
                          className="w-full mt-2 py-2 bg-[#C69A59] text-[#08110F] font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={13} />
                          <span>Consultar Disponibilidad</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Dates / Booking Modal Trigger */}
                    {msg.type === 'dates' && (
                      <div className="mt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleOpenBookingModal}
                          className="w-full py-2.5 px-3 bg-[#C69A59] hover:bg-[#b58947] text-[#08110F] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={14} />
                          <span>Abrir Calendario & Fechas</span>
                          <ArrowRight size={13} />
                        </motion.button>
                      </div>
                    )}

                    {/* Action Chips */}
                    {msg.options && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {msg.options.map((opt, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.015, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={opt.action}
                            className="text-left py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[#E5C38F] hover:text-white font-medium text-[11px] transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>{opt.label}</span>
                            <ArrowRight size={12} className="opacity-60" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-white/40 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Bot typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/10 w-16 text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C38F] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C38F] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C38F] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}

              {/* Default Quick Actions Root (always accessible) */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C38F]/70 block mb-2">
                  Accesos Directos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={handleSelectCheckAvailability}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar size={12} className="text-[#E5C38F]" />
                    <span>Disponibilidad</span>
                  </button>

                  <button
                    onClick={handleSelectCabinsInfo}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Home size={12} className="text-[#E5C38F]" />
                    <span>3 Cabañas</span>
                  </button>

                  <button
                    onClick={handleSelectTourismInfo}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass size={12} className="text-[#E5C38F]" />
                    <span>Río Humadea</span>
                  </button>

                  <button
                    onClick={() => handleSelectWhatsApp()}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone size={12} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-[#142723] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Escribe tu duda aquí..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-white/5 text-white placeholder-white/40 text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#C69A59] transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputValue.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  inputValue.trim()
                    ? 'bg-[#C69A59] text-[#08110F]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
              </motion.button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The ONE and ONLY Floating Action Capsule Button */}
      <motion.button
        onClick={() => {
          if (isOpen) {
            handleCloseWidget();
          } else {
            handleOpenWidget();
          }
        }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={springGentle}
        aria-label="Abrir Concierge Villa MCJ"
        className="group relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#0E1E1B] hover:bg-[#142723] text-white border border-[#C69A59]/40 shadow-[0_12px_35px_rgba(0,0,0,0.45)] flex items-center gap-3 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-[#C69A59] text-[#08110F] flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105">
          {isOpen ? <X size={16} /> : <Sparkles size={16} />}
        </div>

        <div className="text-left pr-1">
          <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#E5C38F] leading-none mb-0.5">
            Villa MCJ
          </span>
          <span className="text-xs font-semibold text-white leading-none">
            {isOpen ? 'Cerrar Concierge' : 'Concierge & Fechas'}
          </span>
        </div>

        {/* Emerald Live Pulse */}
        <span className="relative flex h-2.5 w-2.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </motion.button>

    </div>
  );
};
