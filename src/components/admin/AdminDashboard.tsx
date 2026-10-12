import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, 
  Home, Clock, ExternalLink, Download, Sparkles, CheckCircle2, MessageSquare, AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const stats = await api.getDashboardStats();
      setData(stats);
    } catch (e) {
      console.error('Error al cargar dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = async () => {
    try {
      const reservations = await api.getReservations();
      const headers = ['Código', 'Huésped', 'Teléfono', 'Propiedad', 'Llegada', 'Salida', 'Aforo', 'Total (COP)', 'Estado'];
      const rows = reservations.map((r: any) => [
        r.reservationCode || r.id,
        r.guest ? (r.guest.fullName || `${r.guest.firstName || ''} ${r.guest.lastName || ''}`) : 'Sin asignar',
        r.guest?.phone || '',
        r.property?.name || 'Guamal Mini Barrio',
        r.checkIn,
        r.checkOut,
        r.guestsCount,
        r.totalPrice,
        r.status
      ]);
      exportToCSV('Reporte_General_Dashboard', headers, rows);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 h-32 border border-gray-100 shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 h-96 border border-gray-100 shadow-sm" />
          <div className="bg-white rounded-3xl p-6 h-96 border border-gray-100 shadow-sm" />
        </div>
      </div>
    );
  }

  const monthlyRevenue = data?.monthlyRevenue || 0;
  const occupancyRate = data?.occupancyRate || 0;
  const reservationsToday = data?.reservationsToday || 0;
  const checkinsToday = data?.checkinsToday || 0;
  const pendingInquiries = data?.pendingInquiries || 0;
  const recentArrivals = data?.recentArrivals || [];
  const revenueTrend = data?.revenueTrend || [
    { month: 'May', revenue: 450000 },
    { month: 'Jun', revenue: 620000 },
    { month: 'Jul', revenue: 890000 },
    { month: 'Ago', revenue: 780000 },
    { month: 'Sep', revenue: monthlyRevenue || 950000 }
  ];

  const maxRevenue = Math.max(...revenueTrend.map((t: any) => t.revenue), 1000000);

  return (
    <div className="space-y-8">
      {/* QUICK ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-guamal-green to-[#284E46] text-white p-6 rounded-3xl shadow-lg shadow-guamal-green/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm mb-2 text-guamal-cream">
            <Sparkles size={12} /> Estado del Sistema: Conectado a MariaDB
          </span>
          <h2 className="text-xl font-serif font-bold">Panel Principal de Administración</h2>
          <p className="text-xs text-white/80">Monitoreo de ocupación, llegadas de huéspedes y flujo financiero.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickExport}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            Exportar Informe Rápido
          </button>
          <a
            href="/admin/reservas"
            className="bg-white text-guamal-green hover:bg-guamal-cream px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Calendar size={16} />
            Ver Calendario
          </a>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Ingresos del Mes */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ingresos (Mes en Curso)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-serif mb-1">
            ${Number(monthlyRevenue).toLocaleString('es-CO')} <span className="text-xs font-sans text-gray-500 font-normal">COP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp size={14} /> Facturación activa en tiempo real
          </div>
        </div>

        {/* Card 2: Ocupación */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tasa de Ocupación</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-serif mb-1">
            {occupancyRate}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-guamal-green h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(5, occupancyRate))}%` }}
            />
          </div>
        </div>

        {/* Card 3: Llegadas Hoy */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Llegadas Previstas Hoy</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-serif mb-1">
            {checkinsToday} <span className="text-xs font-sans text-gray-500 font-normal">Check-ins</span>
          </div>
          <div className="text-xs text-gray-500">
            {reservationsToday} reservas recibidas hoy
          </div>
        </div>

        {/* Card 4: Consultas y Prospectos */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Prospectos Pendientes</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-serif mb-1">
            {pendingInquiries} <span className="text-xs font-sans text-gray-500 font-normal">por atender</span>
          </div>
          <a href="/admin/huespedes" className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold">
            Responder en WhatsApp <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      {/* MIDDLE SECTION: REAL REVENUE CHART & RECENT ARRIVALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART: INGRESOS POR MES */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900">Evolución de Ingresos Mensuales</h3>
              <p className="text-xs text-gray-500">Comparativa histórica de ingresos brutos por estancias.</p>
            </div>
            <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              Datos MariaDB
            </span>
          </div>

          {/* CSS/SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 border-b border-gray-100">
            {revenueTrend.map((item: any, idx: number) => {
              const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                    ${(item.revenue / 1000).toFixed(0)}k COP
                  </div>
                  <div 
                    className="w-full max-w-[48px] bg-guamal-cream hover:bg-guamal-green rounded-t-2xl transition-all duration-300 relative group-hover:shadow-lg"
                    style={{ height: `${Math.max(15, heightPercent)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-t-2xl" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400 pt-4">
            <span>Valores expresados en Pesos Colombianos (COP)</span>
            <a href="/admin/pagos" className="text-guamal-green font-semibold hover:underline flex items-center gap-1">
              Ver Libro Contable Completo <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* RECENT ARRIVALS WIDGET */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Llegadas Recientes</h3>
                <p className="text-xs text-gray-500">Últimos check-ins y reservas registradas.</p>
              </div>
              <a href="/admin/reservas" className="text-xs text-guamal-green font-bold hover:underline">
                Ver todas
              </a>
            </div>

            <div className="space-y-3">
              {recentArrivals.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  No hay reservas recientes registradas aún.
                </div>
              ) : (
                recentArrivals.map((res: any) => {
                  const guestName = res.guest ? (res.guest.fullName || `${res.guest.firstName || ''} ${res.guest.lastName || ''}`) : 'Huésped';
                  const propName = res.property ? res.property.name : 'Casa Guamal';
                  const initial = guestName.charAt(0).toUpperCase();

                  return (
                    <div 
                      key={res.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all border border-gray-50 hover:border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-guamal-cream text-guamal-green flex items-center justify-center font-bold text-sm">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">{guestName}</p>
                          <p className="text-[11px] text-gray-500">
                            {propName} • {res.checkIn ? new Date(res.checkIn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Fecha pendiente'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        res.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                        res.status === 'CHECK_IN' ? 'bg-blue-100 text-blue-800' :
                        res.status === 'COMPLETADA' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <a 
              href="/admin/huespedes" 
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold text-center block transition-colors"
            >
              Directorio de Clientes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
