import React, { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { isBookingModalOpen } from '../../store/uiStore';
import { useStore } from '@nanostores/react';
import { currentUser, isAuthModalOpen, clearAuthSession } from '../../store/authStore';
import './Navbar.css';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useStore(currentUser);

  // Using a generic Maps and WhatsApp link for now
  const MAPS_LINK = "https://maps.app.goo.gl/search/Guamal+Meta";
  const WA_LINK = "https://wa.me/573001234567";

  const links = [
    { name: 'Inicio', href: '/', external: false },
    { name: 'Alojamiento', href: '/alojamiento', external: false },
    { name: 'Experiencia', href: '/experiencia', external: false },
    { name: 'Destinos & Turismo', href: '/guamal', external: false },
    { name: 'Galería', href: '/galeria', external: false },
    { name: 'Contacto', href: '/contacto', external: false },
  ];

  return (
    <nav className="fixed w-full z-50 bg-guamal-cream/90 backdrop-blur-md border-b border-guamal-green/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-guamal-green rounded-xl flex items-center justify-center text-white font-serif font-bold text-sm tracking-wider shadow-md group-hover:bg-guamal-green-light transition-all duration-300">
                MCJ
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-guamal-green text-xl tracking-tight leading-tight">Villa MCJ</span>
                <span className="text-[10px] tracking-widest text-guamal-green-light uppercase font-semibold">Cabañas & Naturaleza</span>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-guamal-text hover:text-guamal-green text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <button
              onClick={() => isBookingModalOpen.set(true)}
              className="bg-guamal-green hover:bg-guamal-green-light text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservar
            </button>

            {/* Iniciar Sesión / Usuario Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <a
                  href="/admin"
                  className="flex items-center gap-2 bg-guamal-green/10 hover:bg-guamal-green/20 text-guamal-green px-3.5 py-2 rounded-full text-xs font-bold transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] bg-guamal-green text-white px-1.5 py-0.5 rounded font-mono">{user.role}</span>
                </a>
                <button
                  onClick={clearAuthSession}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => isAuthModalOpen.set(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-guamal-green hover:text-guamal-green-light border border-guamal-green/30 hover:border-guamal-green px-4 py-2 rounded-full transition-all cursor-pointer"
              >
                <User size={14} />
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-guamal-green hover:text-guamal-green-light focus:outline-none p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-guamal-cream border-b border-guamal-green/10 shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible h-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="block px-3 py-3 text-base font-medium text-guamal-text hover:text-guamal-green hover:bg-guamal-green/5 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                isBookingModalOpen.set(true);
              }}
              className="w-full bg-guamal-green text-white px-5 py-3 rounded-full text-base font-medium flex justify-center items-center gap-2 cursor-pointer"
            >
              Reservar ahora
            </button>

            {user ? (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="/admin"
                  className="w-full bg-guamal-green/10 text-guamal-green font-bold px-4 py-2.5 rounded-xl text-center text-sm block"
                  onClick={() => setIsOpen(false)}
                >
                  Panel Administrativo ({user.role})
                </a>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    clearAuthSession();
                  }}
                  className="w-full text-xs text-red-600 font-medium py-2"
                >
                  Cerrar Sesión ({user.email})
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  isAuthModalOpen.set(true);
                }}
                className="w-full border border-guamal-green/30 text-guamal-green px-5 py-2.5 rounded-full text-sm font-bold flex justify-center items-center gap-2 cursor-pointer"
              >
                <User size={16} />
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
