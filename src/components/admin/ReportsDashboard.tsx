import React, { useState, useEffect } from 'react';
import { 
  Download, FileSpreadsheet, DollarSign, Calendar, Users, 
  Home, CheckCircle, TrendingUp, Sparkles, Filter 
} from 'lucide-react';
import { api } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './ReportsDashboard.css';

export const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalReservations: 0,
    totalGuests: 0,
    totalProperties: 3,
    avgTicket: 0
  });

  useEffect(() => {
    loadReportMetrics();
  }, []);

  const loadReportMetrics = async () => {
    try {
      const [reservations, guests, properties] = await Promise.all([
        api.getReservations(),
        api.getGuests(),
        api.getAllProperties()
      ]);

      const confirmed = reservations.filter((r: any) => 
        ['CONFIRMADA', 'CHECK_IN', 'COMPLETADA'].includes(r.status)
      );

      const revenue = confirmed.reduce((acc: number, r: any) => acc + Number(r.totalPrice || 0), 0);
      const avg = confirmed.length > 0 ? Math.round(revenue / confirmed.length) : 0;

      setStats({
        totalRevenue: revenue,
        totalReservations: reservations.length,
        totalGuests: guests.length,
        totalProperties: properties.length,
        avgTicket: avg
      });
    } catch (e) {
      console.error(e);
    }
  };

  // EXPORT FUNCTIONS
  const exportReservations = async () => {
    setLoading(true);
    try {
      const res = await api.getReservations();
      const headers = [
        'Código Reserva', 'Huésped', 'Teléfono Huésped', 'Email', 
        'Propiedad Asignada', 'Llegada', 'Salida', 'Aforo', 
        'Valor Total (COP)', 'Anticipo Requerido', 'Saldo Pendiente', 
        'Estado Reserva', 'Origen Reserva', 'Fecha de Registro'
      ];
      const rows = res.map((r: any) => {
        const guestName = r.guest ? (r.guest.fullName || `${r.guest.firstName || ''} ${r.guest.lastName || ''}`) : '';
        return [
          r.reservationCode || r.id,
          guestName,
          r.guest?.phone || '',
          r.guest?.email || '',
          r.property ? r.property.name : 'Guamal Mini Barrio',
          r.checkIn,
          r.checkOut,
          r.guestsCount,
          r.totalPrice,
          r.depositRequired || Math.round(r.totalPrice * 0.5),
          r.balanceDue || Math.round(r.totalPrice * 0.5),
          r.status,
          r.source || 'WEB_DIRECT',
          r.createdAt ? new Date(r.createdAt).toLocaleString('es-CO') : ''
        ];
      });
      exportToCSV('Reporte_Completo_Reservas_Guamal', headers, rows);
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    setLoading(true);
    try {
      const payments = await api.getPayments();
      const headers = [
        'ID Transacción', 'Reserva', 'Huésped', 'Teléfono', 
        'Propiedad', 'Monto (COP)', 'Método Pago', 'Estado Transacción', 'Fecha'
      ];
      const rows = payments.map((p: any) => {
        const guest = p.reservation?.guest;
        const guestName = guest ? (guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`) : (p.guest || '');
        return [
          p.id,
          p.reservation?.reservationCode || p.reservationId || 'N/A',
          guestName,
          guest?.phone || '',
          p.reservation?.property?.name || 'Guamal Mini Barrio',
          p.amount,
          p.method || 'TRANSFERENCIA',
          p.status || 'PENDIENTE',
          p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : (p.date || '')
        ];
      });
      exportToCSV('Libro_Caja_Pagos_Guamal', headers, rows);
    } finally {
      setLoading(false);
    }
  };

  const exportGuests = async () => {
    setLoading(true);
    try {
      const guests = await api.getGuests();
      const headers = [
        'ID Huésped', 'Nombre Completo', 'Tipo Doc', 'No. Documento', 
        'Teléfono / WhatsApp', 'Correo Electrónico', 'Ciudad Procedencia', 
        'Etiqueta', 'Estancias Realizadas', 'Total Invertido (COP)', 'Notas Internas'
      ];
      const rows = guests.map((g: any) => [
        g.id,
        g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim(),
        g.documentType || 'CC',
        g.documentId || 'No registrado',
        g.phone,
        g.email || '',
        g.cityOrigin || '',
        g.customerTag || 'NUEVO',
        g.totalStays || 1,
        g.totalSpent || 0,
        g.notes || ''
      ]);
      exportToCSV('Directorio_Clientes_Fidelizacion_Guamal', headers, rows);
    } finally {
      setLoading(false);
    }
  };

  const exportInquiries = async () => {
    setLoading(true);
    try {
      const inqs = await api.getInquiries();
      const headers = [
        'ID Prospecto', 'Nombre Interesado', 'Teléfono WhatsApp', 'Email', 
        'Canal de Captura', 'Fechas de Interés', 'Aforo Personas', 
        'Estado Comercial', 'Consulta / Mensaje', 'Fecha Creación'
      ];
      const rows = inqs.map((i: any) => [
        i.id || '',
        i.fullName,
        i.phone,
        i.email || '',
        i.channel || 'WEB',
        i.datesOfInterest || '',
        i.guestsCount || '',
        i.status || 'NUEVO',
        i.message || '',
        i.createdAt ? new Date(i.createdAt).toLocaleString('es-CO') : ''
      ]);
      exportToCSV('Informe_Prospectos_Marketing_Guamal', headers, rows);
    } finally {
      setLoading(false);
    }
  };

  const exportProperties = async () => {
    setLoading(true);
    try {
      const props = await api.getAllProperties();
      const headers = ['ID Cabaña', 'Nombre', 'Capacidad', 'Habitaciones', 'Baños', 'Precio Noche (COP)', 'Estado Operativo', 'Descripción'];
      const rows = props.map((p: any) => [
        p.id,
        p.name,
        p.capacity,
        p.bedrooms || 2,
        p.bathrooms || 1,
        p.pricePerNight,
        p.status || 'ACTIVA',
        p.description
      ]);
      exportToCSV('Inventario_Propiedades_Guamal', headers, rows);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-guamal-green to-[#284E46] text-white p-8 rounded-3xl shadow-lg shadow-guamal-green/10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm mb-3 text-guamal-cream">
          <FileSpreadsheet size={14} /> Centro de Exportación e Inteligencia de Negocio
        </span>
        <h2 className="text-2xl font-serif font-bold mb-2">Reportes y Descarga de Datos (Excel / CSV)</h2>
        <p className="text-sm text-white/80 max-w-2xl">
          Descarga en formato compatible con Microsoft Excel (con codificación UTF-8 y separadores en español) todos los registros históricos de reservas, pagos, huéspedes e inventario.
        </p>
      </div>

      {/* 4 SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-400">Facturación Confirmada</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gray-900">
            ${stats.totalRevenue.toLocaleString('es-CO')} <span className="text-xs font-normal text-gray-500 font-sans">COP</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-400">Ticket Promedio / Estancia</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gray-900">
            ${stats.avgTicket.toLocaleString('es-CO')} <span className="text-xs font-normal text-gray-500 font-sans">COP</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-400">Total Reservas</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gray-900">
            {stats.totalReservations} <span className="text-xs font-normal text-gray-500 font-sans">registros</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-400">Clientes en Ficha</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gray-900">
            {stats.totalGuests} <span className="text-xs font-normal text-gray-500 font-sans">huéspedes</span>
          </div>
        </div>
      </div>

      {/* EXPORT ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: RESERVAS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-guamal-cream text-guamal-green flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Libro de Reservas</h3>
            <p className="text-xs text-gray-500 mb-6">
              Exporta todas las reservas con códigos, check-in, check-out, aforo, totales, saldos y huéspedes asociados.
            </p>
          </div>
          <button
            onClick={exportReservations}
            disabled={loading}
            className="w-full py-3 bg-guamal-green hover:bg-[#152a25] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            Descargar Reservas (Excel)
          </button>
        </div>

        {/* CARD 2: PAGOS Y CAJA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Libro de Pagos y Caja</h3>
            <p className="text-xs text-gray-500 mb-6">
              Transacciones detalladas, anticipos recibidos, métodos de pago (Bancolombia, Nequi, Efectivo) y estados contables.
            </p>
          </div>
          <button
            onClick={exportPayments}
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            Descargar Libro de Caja (Excel)
          </button>
        </div>

        {/* CARD 3: DIRECTORIO HUÉSPEDES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Directorio de Huéspedes</h3>
            <p className="text-xs text-gray-500 mb-6">
              Base de datos completa con nombres, documentos de identidad, teléfonos de WhatsApp, correos, ciudades y notas.
            </p>
          </div>
          <button
            onClick={exportGuests}
            disabled={loading}
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            Descargar Huéspedes (Excel)
          </button>
        </div>

        {/* CARD 4: PROSPECTOS Y MARKETING */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Prospectos Comerciales</h3>
            <p className="text-xs text-gray-500 mb-6">
              Leads capturados vía WhatsApp Widget o Formulario Web con fechas de interés, mensajes y estado de seguimiento.
            </p>
          </div>
          <button
            onClick={exportInquiries}
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            Descargar Prospectos (Excel)
          </button>
        </div>

        {/* CARD 5: INVENTARIO DE CABAÑAS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Home size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Inventario de Propiedades</h3>
            <p className="text-xs text-gray-500 mb-6">
              Listado de cabañas, tarifas nocturnas oficiales, aforo máximo permitido y estado de mantenimiento.
            </p>
          </div>
          <button
            onClick={exportProperties}
            disabled={loading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            Descargar Inventario (Excel)
          </button>
        </div>
      </div>
    </div>
  );
};
