import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Compass, Calendar, User, Sparkles } from 'lucide-react';
import { isBookingModalOpen } from '../../store/uiStore';
import { useStore } from '@nanostores/react';
import { currentUser, isAuthModalOpen } from '../../store/authStore';
import { SITE } from '../../config/site';

export function Navbar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useStore(currentUser);
  // Sobre fondos claros (y sin haber hecho scroll) la barra usa tinta oscura; con scroll vuelve a la barra oscura.
  const onLight = tone === 'light' && !isScrolled;
  const ink = onLight ? 'text-[#12201C]' : 'text-white';
  const inkSoft = onLight ? 'text-[#12201C]/60' : 'text-white/60';
  const glass = onLight
    ? 'bg-[#12201C]/5 hover:bg-[#12201C]/10 border-[#12201C]/15 text-[#12201C]'
    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Cabañas', href: '/#alojamiento', num: '01' },
    { label: 'Experiencias', href: '/#experiencia', num: '02' },
    { label: 'Destinos Guamal', href: '/#destinos-guamal', num: '03' },
    { label: 'Galería', href: '/galeria', num: '04' },
    { label: 'Contacto', href: '/contacto', num: '05' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'py-3.5 bg-[#070B0A]/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)]'
            : onLight ? 'py-6 bg-transparent' : 'py-6 bg-gradient-to-b from-black/60 via-black/20 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          
          {/* Brand Identity / Monogram */}
          <a href="/" className="group flex items-center gap-3.5 focus:outline-none">
            <div className={`w-10 h-10 rounded-full border backdrop-blur-md hidden sm:flex items-center justify-center font-serif text-xs font-bold tracking-widest transition-all duration-500 group-hover:scale-105 ${onLight ? 'border-[#12201C]/25 bg-[#12201C]/5 text-[#12201C]' : 'border-white/20 bg-white/5 text-white group-hover:border-white/50'}`}>
              MCJ
            </div>
            <div className="flex flex-col">
              <span className={`font-serif text-xl sm:text-2xl font-bold tracking-tight leading-none whitespace-nowrap ${ink} transition-colors`}>
                Villa MCJ
              </span>
              <span className={`hidden sm:block whitespace-nowrap text-[9px] uppercase tracking-[0.24em] font-medium ${inkSoft} mt-1`}>
                Guamal, Meta • Eco-Refugio
              </span>
            </div>
          </a>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Login / Acceso Button — Always accessible directly */}
            {user ? (
              <a
                href="/admin"
                className={`px-3 py-2 rounded-full ${glass} backdrop-blur-md border text-xs font-semibold uppercase tracking-[0.12em] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer`}
                title={`Panel de administración (${user.name})`}
              >
                <User size={13} className="text-emerald-400" />
                <span className="hidden md:inline font-mono">{user.name.split(' ')[0]}</span>
              </a>
            ) : (
              <button
                onClick={() => isAuthModalOpen.set(true)}
                className={`px-3 py-2 rounded-full ${glass} backdrop-blur-md border text-xs font-semibold uppercase tracking-[0.12em] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer`}
                title="Acceso administrativo / Iniciar sesión"
              >
                <User size={13} className="opacity-80" />
                <span className="hidden sm:inline">Ingresar</span>
              </button>
            )}

            {/* Minimal Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`px-3.5 py-2 rounded-full ${glass} backdrop-blur-md border text-xs font-semibold uppercase tracking-[0.12em] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer`}
            >
              <Menu size={13} className="opacity-80" />
              <span className="hidden sm:inline">Explorar</span>
            </button>

            {/* Direct Reservation CTA */}
            <button
              onClick={() => isBookingModalOpen.set(true)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 active:scale-95 flex items-center gap-1.5 cursor-pointer ${onLight ? 'bg-[#12201C] hover:bg-[#12201C]/90 text-[#F4F0E8]' : 'bg-white hover:bg-white/90 text-[#070B0A] shadow-[0_4px_25px_rgba(255,255,255,0.2)]'}`}
            >
              <Calendar size={13} />
              <span>Reservar</span>
            </button>

          </div>

        </div>
      </header>

      {/* Fullscreen Cinematic Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 bg-[#070B0A]/96 backdrop-blur-3xl flex flex-col justify-between p-8 sm:p-16"
          >
            {/* Top Bar of Menu */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.24em] font-bold text-white/70">
                Navegación • Villa MCJ
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Cerrar navegación"
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Large Editorial Nav Links */}
            <div className="max-w-5xl mx-auto w-full py-12">
              <nav className="space-y-4 sm:space-y-6">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-baseline gap-6 text-3xl sm:text-5xl lg:text-6xl font-serif text-white/80 hover:text-white transition-colors border-b border-white/10 pb-4"
                  >
                    <span className="text-xs sm:text-sm font-sans font-medium text-white/40 tracking-widest">
                      {link.num}
                    </span>
                    <span className="group-hover:translate-x-3 transition-transform duration-300">
                      {link.label}
                    </span>
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Bottom Bar in Menu */}
            <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10 text-white/70 text-xs">
              <div className="flex items-center gap-6">
                <span>Sector Campestre Vía Humadea, Guamal, Meta</span>
                <span>•</span>
                <a href={SITE.phoneHref} className="hover:text-white transition-colors">{SITE.phoneDisplay}</a>
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <a href="/admin" className="text-white font-bold underline">Panel ({user.name})</a>
                ) : (
                  <button onClick={() => { setIsMenuOpen(false); isAuthModalOpen.set(true); }} className="hover:text-white cursor-pointer">
                    Acceso Administrativo
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
