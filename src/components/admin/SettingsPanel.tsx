import React, { useState, useEffect } from 'react';
import { Settings, Phone, MessageSquare, Clock, MapPin, CreditCard, Tag, Plus, Check, Save, AlertCircle } from 'lucide-react';
import { api, API_URL, type SystemSetting, type Package } from '../../services/api';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'packages'>('settings');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // New package form state
  const [newPkg, setNewPkg] = useState({
    title: '',
    slug: '',
    description: '',
    discountPercentage: 10,
    minNights: 2,
    minGuests: 2,
  });
  const [showNewPkgModal, setShowNewPkgModal] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.getAllSettings(),
        api.getPackages(true)
      ]);
      setSettings(s);
      setPackages(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSaveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    const ok = await api.updateSetting(key, value);
    setSavingKey(null);
    if (ok) {
      setSavedSuccess(key);
      setTimeout(() => setSavedSuccess(null), 3000);
    }
  };

  const handleTogglePackage = async (pkg: Package) => {
    const updated = !pkg.isActive;
    const ok = await api.updatePackage(pkg.id, { isActive: updated });
    if (ok) {
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, isActive: updated } : p));
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg)
      });
      if (res.ok) {
        setShowNewPkgModal(false);
        setNewPkg({ title: '', slug: '', description: '', discountPercentage: 10, minNights: 2, minGuests: 2 });
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
        Cargando parámetros y paquetes de configuración...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex bg-gray-200/70 p-1.5 rounded-2xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-guamal-green text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={16} />
          Parámetros Globales ({settings.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-guamal-green text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tag size={16} />
          Paquetes y Ofertas ({packages.length})
        </button>
      </div>

      {activeTab === 'settings' ? (
        /* TAB 1: SYSTEM SETTINGS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting) => (
            <div 
              key={setting.key}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                    {setting.category}
                  </span>
                  {setting.isPublic ? (
                    <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                      Público en Web
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded">
                      Privado Admin
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-base text-gray-900 mb-1">
                  {setting.label}
                </h4>
                {setting.description && (
                  <p className="text-xs text-gray-400 mb-4 font-light">
                    {setting.description}
                  </p>
                )}

                <div className="mt-2">
                  {setting.key.includes('msg') || setting.key.includes('bancolombia') ? (
                    <textarea
                      rows={3}
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:bg-white focus:outline-none focus:border-guamal-green"
                    />
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:border-guamal-green"
                    />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400">
                  clave: {setting.key}
                </span>

                <button
                  onClick={() => saveSetting(setting.key, setting.value)}
                  disabled={savingKey === setting.key}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    savedSuccess === setting.key
                      ? 'bg-green-600 text-white'
                      : 'bg-guamal-green hover:bg-guamal-green-light text-white'
                  }`}
                >
                  {savedSuccess === setting.key ? (
                    <>
                      <Check size={14} /> Guardado
                    </>
                  ) : savingKey === setting.key ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save size={14} /> Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAB 2: PACKAGES & OFFERS */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">Promociones y Paquetes de Alojamiento</h3>
              <p className="text-xs text-gray-500">Configura planes especiales para fines de semana, parejas, grupos o temporadas festivas.</p>
            </div>
            <button
              onClick={() => setShowNewPkgModal(true)}
              className="bg-guamal-green hover:bg-guamal-green-light text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Plus size={16} /> Crear Paquete
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  pkg.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                      {pkg.discountPercentage}% Descuento
                    </span>
                    <button
                      onClick={() => togglePackageActive(pkg)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        pkg.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pkg.isActive ? '● Activo en Web' : '○ Pausado'}
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-lg text-gray-900 mb-2">
                    {pkg.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] font-medium text-gray-500">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">Mín. {pkg.minNights} noches</span>
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">Mín. {pkg.minGuests} huéspedes</span>
                    {pkg.fixedPrice && (
                      <span className="bg-guamal-green/10 text-guamal-green font-bold px-2.5 py-1 rounded-lg">
                        Tarifa fija: ${pkg.fixedPrice.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Slug: /{pkg.slug}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal to create new package */}
          {showNewPkgModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in-95">
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">Nuevo Paquete / Promoción</h3>
                <p className="text-xs text-gray-500 mb-6">Crea una oferta especial disponible para que los huéspedes reserven.</p>

                <form onSubmit={handleCreatePackage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Título de la Oferta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Plan Romántico Parejas"
                      value={newPkg.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                        setNewPkg({ ...newPkg, title, slug });
                      }}
                      className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-guamal-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detalles de lo que incluye el paquete..."
                      value={newPkg.description}
                      onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-guamal-green"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descuento (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newPkg.discountPercentage}
                        onChange={(e) => setNewPkg({ ...newPkg, discountPercentage: Number(e.target.value) })}
                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mín. Noches</label>
                      <input
                        type="number"
                        min="1"
                        value={newPkg.minNights}
                        onChange={(e) => setNewPkg({ ...newPkg, minNights: Number(e.target.value) })}
                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mín. Personas</label>
                      <input
                        type="number"
                        min="1"
                        value={newPkg.minGuests}
                        onChange={(e) => setNewPkg({ ...newPkg, minGuests: Number(e.target.value) })}
                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewPkgModal(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-guamal-green hover:bg-guamal-green-light rounded-xl text-sm font-bold text-white shadow-sm"
                    >
                      Crear Paquete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
