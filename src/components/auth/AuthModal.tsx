import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthModalOpen, setAuthSession, currentUser, clearAuthSession } from '../../store/authStore';
import { Lock, Mail, X, LogIn, ShieldCheck, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../../services/api';
import './AuthModal.css';

export const AuthModal: React.FC = () => {
  const isOpen = useStore(isAuthModalOpen);
  const user = useStore(currentUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    isAuthModalOpen.set(false);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Credenciales inválidas. Por favor verifica tu correo y contraseña.');
        setLoading(false);
        return;
      }

      // Save session
      setAuthSession(data.token, data.user);
      setLoading(false);
      isAuthModalOpen.set(false);

      // Redirect if staff/admin
      if (['SUPERADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA'].includes(data.user.role)) {
        window.location.href = '/admin';
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError('No fue posible conectar con el servidor de autenticación. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-guamal-green to-guamal-green-light text-white p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl leading-tight">Acceso al Sistema</h3>
                  <p className="text-xs text-white/80">Guamal Mini Barrio</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 bg-guamal-cream/20">
              {user ? (
                /* Already logged in view */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-guamal-green/10 text-guamal-green mx-auto flex items-center justify-center font-bold text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-gray-900">{user.name}</h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-guamal-green text-white rounded-full text-xs font-bold">
                      Rol: {user.role}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    {['SUPERADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA'].includes(user.role) && (
                      <a
                        href="/admin"
                        className="w-full bg-guamal-green hover:bg-guamal-green-light text-white font-bold py-3 rounded-xl text-sm transition-colors block text-center"
                      >
                        Ir al Panel Administrativo
                      </a>
                    )}
                    <button
                      onClick={clearAuthSession}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2"
                    >
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-guamal-green focus:ring-1 focus:ring-guamal-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm text-gray-800 focus:outline-none focus:border-guamal-green focus:ring-1 focus:ring-guamal-green"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-guamal-green hover:bg-guamal-green-light text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={16} />
                        Iniciar Sesión
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-gray-400 pt-2">
                    Acceso exclusivo para administradores, recepcionistas y usuarios registrados.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
