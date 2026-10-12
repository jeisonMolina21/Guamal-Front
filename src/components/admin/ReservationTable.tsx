import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { api } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './ReservationTable.css';

export const ReservationTable: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const ok = await api.updateReservationStatus(id, newStatus);
    if (ok) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const filtered = reservations.filter(r => {
    const guestName = r.guest ? (r.guest.fullName || `${r.guest.firstName || ''} ${r.guest.lastName || ''}`) : '';
    const code = r.reservationCode || r.id || '';
    const matchesSearch = guestName.toLowerCase().includes(searchTerm.toLowerCase()) || code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = [
      'Código Reserva', 'Huésped', 'Teléfono', 'Email', 
      'Propiedad', 'Llegada (Check-In)', 'Salida (Check-Out)', 
      'Aforo / Personas', 'Total (COP)', 'Anticipo Requerido', 
      'Saldo Pendiente', 'Estado', 'Canal Origen', 'Fecha Reserva'
    ];
    const rows = filtered.map(r => {
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
        r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CO') : ''
      ];
    });

    exportToCSV('Reservas_Guamal_Mini_Barrio', headers, rows);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de reserva o huésped..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-guamal-green"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleExport}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download size={15} />
            Exportar Excel
          </button>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-guamal-green"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="CHECK_IN">Check-In</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">
          Cargando reservas desde MariaDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Clock size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="font-medium">No se encontraron reservas</p>
          <p className="text-xs text-gray-400">Las reservas creadas desde el portal web aparecerán aquí en tiempo real.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4">Código Reserva</th>
                <th className="p-4">Huésped</th>
                <th className="p-4">Propiedad</th>
                <th className="p-4">Fechas (In / Out)</th>
                <th className="p-4 text-right">Total / Anticipo</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filtered.map((res) => {
                const guestName = res.guest ? (res.guest.fullName || `${res.guest.firstName || ''} ${res.guest.lastName || ''}`) : 'Sin asignar';
                const propertyName = res.property ? res.property.name : 'Casa Guamal';
                const checkInDate = new Date(res.checkIn);
                const checkOutDate = new Date(res.checkOut);

                return (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-guamal-green text-xs bg-guamal-green/10 px-2.5 py-1 rounded-lg">
                        {res.reservationCode || res.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{guestName}</div>
                      <div className="text-xs text-gray-500">{res.guest?.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-800">{propertyName}</span>
                      <span className="text-xs text-gray-400 block">{res.guestsCount} personas</span>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      <div>Llegada: {format(checkInDate, 'dd MMM yyyy', { locale: es })}</div>
                      <div className="text-gray-400">Salida: {format(checkOutDate, 'dd MMM yyyy', { locale: es })}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-gray-900 text-sm">
                        ${Number(res.totalPrice).toLocaleString('es-CO')}
                      </div>
                      <div className="text-xs text-gray-400">
                        Anticipo: ${Number(res.depositRequired || res.totalPrice * 0.5).toLocaleString('es-CO')}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusChange(res.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          res.status === 'CONFIRMADA' ? 'bg-green-50 text-green-800 border-green-200' :
                          res.status === 'PENDIENTE' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          res.status === 'CHECK_IN' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          res.status === 'COMPLETADA' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="CONFIRMADA">CONFIRMADA</option>
                        <option value="CHECK_IN">CHECK-IN</option>
                        <option value="COMPLETADA">COMPLETADA</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
