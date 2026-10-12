import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Plus, CheckCircle, Clock, XCircle, Search, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './PaymentsTable.css';

export const PaymentsTable: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    const success = await api.updatePaymentStatus(paymentId, newStatus);
    if (success) {
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
      showNotification(`Pago ${paymentId} marcado como ${newStatus}`);
    } else {
      showNotification('Error al actualizar estado del pago', 'error');
    }
  };

  const handleExport = () => {
    const headers = [
      'ID Transacción', 'Código Reserva', 'Huésped', 'Teléfono', 
      'Propiedad', 'Monto (COP)', 'Método', 'Estado', 'Fecha'
    ];
    const rows = filteredPayments.map(p => {
      const guest = p.reservation?.guest;
      const guestName = guest ? (guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`) : (p.guest || 'Sin asignar');
      const resCode = p.reservation?.reservationCode || p.reservationId || p.resId || 'N/A';
      const propName = p.reservation?.property?.name || 'Guamal Mini Barrio';
      const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : (p.date || '');
      
      return [
        p.id,
        resCode,
        guestName,
        guest?.phone || '',
        propName,
        p.amount || 0,
        p.method || 'TRANSFERENCIA',
        p.status || 'PENDIENTE',
        dateStr
      ];
    });

    exportToCSV('Libro_Pagos_Anticipos_Guamal', headers, rows);
    showNotification('Reporte de pagos descargado en Excel/CSV.');
  };

  const filteredPayments = payments.filter(p => {
    const guest = p.reservation?.guest;
    const guestName = guest ? (guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`) : (p.guest || '');
    const query = searchTerm.toLowerCase();
    const idMatch = p.id?.toLowerCase().includes(query);
    const guestMatch = guestName.toLowerCase().includes(query);
    const methodMatch = p.method?.toLowerCase().includes(query);
    
    const matchesSearch = idMatch || guestMatch || methodMatch;
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = filteredPayments
    .filter(p => p.status === 'APROBADO' || p.status === 'COMPLETED')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toast Notification */}
      {message && (
        <div className={`p-4 mx-6 mt-6 rounded-2xl flex items-center justify-between transition-all ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
          <h3 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
            <CreditCard size={20} className="text-guamal-green" />
            Registro de Pagos y Anticipos
          </h3>
          <p className="text-xs text-gray-500">
            Total Aprobado en Vista: <span className="font-bold text-guamal-green">${totalCollected.toLocaleString('es-CO')} COP</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3 bg-white">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID transacción, reserva o nombre de huésped..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-guamal-green"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:border-guamal-green w-full sm:w-auto"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="APROBADO">Aprobados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="RECHAZADO">Rechazados</option>
        </select>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">Cargando pagos desde MariaDB...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <CreditCard size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="font-medium">No se encontraron pagos registrados</p>
          <p className="text-xs text-gray-400">Los pagos y anticipos registrados por los clientes se reflejarán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">ID Transacción</th>
                <th className="p-4 font-semibold">Reserva / Huésped</th>
                <th className="p-4 font-semibold">Monto</th>
                <th className="p-4 font-semibold">Método</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPayments.map((payment) => {
                const guest = payment.reservation?.guest;
                const guestName = guest ? (guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`) : (payment.guest || 'Huésped Guamal');
                const resCode = payment.reservation?.reservationCode || payment.reservationId || payment.resId || 'N/A';
                const dateStr = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('es-CO') : (payment.date || 'Reciente');
                const isApproved = payment.status === 'APROBADO' || payment.status === 'COMPLETED';

                return (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {payment.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900">{guestName}</span>
                        <span className="text-xs text-gray-400 font-mono">Res: {resCode}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-sm">
                      ${Number(payment.amount).toLocaleString('es-CO')} COP
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {payment.method || 'TRANSFERENCIA'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {dateStr}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={payment.status || 'PENDIENTE'}
                        onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          isApproved ? 'bg-green-50 text-green-800 border-green-200' :
                          payment.status === 'RECHAZADO' ? 'bg-red-50 text-red-800 border-red-200' :
                          'bg-yellow-50 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        <option value="APROBADO">APROBADO</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="RECHAZADO">RECHAZADO</option>
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
