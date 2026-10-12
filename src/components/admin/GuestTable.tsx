import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, UserCircle2, MessageSquare, Calendar, Users, 
  ExternalLink, Search, Download, Plus, Edit2, Trash2, X, Check, 
  AlertCircle, Tag, Clock 
} from 'lucide-react';
import { api, type Inquiry } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './GuestTable.css';

export const GuestTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guests' | 'inquiries'>('guests');
  const [guests, setGuests] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  
  // Modal and edit states
  const [editingGuest, setEditingGuest] = useState<any | null>(null);
  const [isNewGuestModalOpen, setIsNewGuestModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [guestFormData, setGuestFormData] = useState({
    fullName: '',
    documentType: 'CC',
    documentId: '',
    phone: '',
    email: '',
    cityOrigin: '',
    customerTag: 'NUEVO',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [guestsData, inquiriesData] = await Promise.all([
        api.getGuests(),
        api.getInquiries()
      ]);
      setGuests(guestsData);
      setInquiries(inquiriesData);
    } catch (err) {
      console.error('Error cargando directorio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openEditGuest = (guest: any) => {
    setEditingGuest(guest);
    const name = guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
    setGuestFormData({
      fullName: name,
      documentType: guest.documentType || 'CC',
      documentId: guest.documentId || '',
      phone: guest.phone || '',
      email: guest.email || '',
      cityOrigin: guest.cityOrigin || '',
      customerTag: guest.customerTag || 'NUEVO',
      notes: guest.notes || ''
    });
  };

  const openNewGuest = () => {
    setGuestFormData({
      fullName: '',
      documentType: 'CC',
      documentId: '',
      phone: '',
      email: '',
      cityOrigin: '',
      customerTag: 'NUEVO',
      notes: ''
    });
    setIsNewGuestModalOpen(true);
  };

  const handleSaveGuestEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    setSaving(true);
    try {
      const success = await api.updateGuest(editingGuest.id, guestFormData);
      if (success) {
        showNotification(`Huésped "${guestFormData.fullName}" actualizado.`);
        setEditingGuest(null);
        await loadData();
      } else {
        showNotification('No se pudo actualizar el huésped', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFormData.fullName || !guestFormData.phone) return;
    setSaving(true);
    try {
      const result = await api.createGuest(guestFormData);
      if (result.success) {
        showNotification(`Huésped "${guestFormData.fullName}" registrado exitosamente.`);
        setIsNewGuestModalOpen(false);
        await loadData();
      } else {
        showNotification(result.error || 'Error al registrar huésped', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error al registrar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (guest: any) => {
    const name = guest.fullName || 'este huésped';
    if (!window.confirm(`¿Deseas eliminar el registro de ${name}?`)) return;
    try {
      const ok = await api.deleteGuest(guest.id);
      if (ok) {
        showNotification(`Huésped ${name} eliminado.`);
        await loadData();
      } else {
        showNotification('No se pudo eliminar el huésped', 'error');
      }
    } catch (e) {
      showNotification('Error al eliminar', 'error');
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    const success = await api.updateInquiryStatus(inquiryId, newStatus);
    if (success) {
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq));
      showNotification('Estado del prospecto actualizado');
    }
  };

  // EXCEL EXPORTERS
  const handleExportGuests = () => {
    const headers = [
      'ID', 'Nombre Completo', 'Tipo Documento', 'No. Documento', 
      'Teléfono', 'Email', 'Ciudad / Municipio', 'Etiqueta', 
      'Estancias Realizadas', 'Total Gastado (COP)', 'Notas Internas'
    ];
    const rows = filteredGuests.map(g => [
      g.id,
      g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim(),
      g.documentType || 'CC',
      g.documentId || 'No registrado',
      g.phone,
      g.email || '',
      g.cityOrigin || '',
      g.customerTag || 'NUEVO',
      g.totalStays || (g.reservations ? g.reservations.length : 1),
      g.totalSpent || 0,
      g.notes || ''
    ]);
    exportToCSV('Directorio_Huespedes_Guamal', headers, rows);
    showNotification('Excel de Huéspedes descargado correctamente.');
  };

  const handleExportInquiries = () => {
    const headers = [
      'ID', 'Nombre Prospecto', 'Teléfono', 'Email', 
      'Canal Origen', 'Fechas de Interés', 'Personas', 
      'Estado', 'Mensaje / Pregunta', 'Fecha Registro'
    ];
    const rows = filteredInquiries.map(i => [
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
    exportToCSV('Prospectos_Consultas_Guamal', headers, rows);
    showNotification('Excel de Prospectos descargado correctamente.');
  };

  const filteredGuests = guests.filter(g => {
    const name = g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim();
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || (g.email && g.email.toLowerCase().includes(query)) || (g.phone && g.phone.includes(query)) || (g.documentId && g.documentId.includes(query));
  });

  const filteredInquiries = inquiries.filter(i => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = i.fullName.toLowerCase().includes(query) || 
      (i.email && i.email.toLowerCase().includes(query)) || 
      (i.phone && i.phone.includes(query)) ||
      (i.message && i.message.toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'TODOS' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      {/* Header & Segmented Tabs */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
        <div>
          <div className="flex bg-gray-200/70 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-guamal-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCircle2 size={16} />
              Huéspedes Confirmados ({guests.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-guamal-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={16} />
              Prospectos y Consultas ({inquiries.length})
            </button>
          </div>
        </div>

        {/* Action Buttons: Export & New */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={activeTab === 'guests' ? handleExportGuests : handleExportInquiries}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download size={15} />
            Exportar Excel
          </button>
          {activeTab === 'guests' && (
            <button
              onClick={openNewGuest}
              className="bg-guamal-green hover:bg-[#152a25] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              Añadir Huésped
            </button>
          )}
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
            placeholder={activeTab === 'guests' ? "Buscar por nombre, cédula, teléfono o email..." : "Buscar por nombre, teléfono o mensaje..."}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-guamal-green"
          />
        </div>

        {activeTab === 'inquiries' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:border-guamal-green w-full sm:w-auto"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="NUEVO">Nuevos</option>
            <option value="COTIZADO">Cotizados</option>
            <option value="EN_SEGUIMIENTO">En Seguimiento</option>
            <option value="CONVERTIDO">Convertidos</option>
            <option value="DESCARTADO">Descartados</option>
          </select>
        )}
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">
          Cargando registros desde MariaDB...
        </div>
      ) : activeTab === 'guests' ? (
        /* TAB 1: HUÉSPEDES REALES (CON RESERVA O REGISTRADOS) */
        <div className="overflow-x-auto">
          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <UserCircle2 size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-medium">No se encontraron huéspedes</p>
              <p className="text-xs text-gray-400">Puedes añadir uno manualmente o esperar a que reserven.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Huésped</th>
                  <th className="p-4 font-semibold">Documento / Origen</th>
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold text-center">Etiqueta</th>
                  <th className="p-4 font-semibold text-center">Estancias</th>
                  <th className="p-4 font-semibold text-right">Total Invertido</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredGuests.map((guest) => {
                  const name = guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-guamal-green/10 flex items-center justify-center text-guamal-green font-bold text-sm">
                            {name.charAt(0) || 'G'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{name}</span>
                            {guest.notes && (
                              <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs italic">
                                "{guest.notes}"
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        <div className="font-medium">{guest.documentId ? `${guest.documentType || 'CC'} ${guest.documentId}` : 'No registrado'}</div>
                        <div className="text-gray-400">{guest.cityOrigin || 'Colombia'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> {guest.phone}</span>
                          {guest.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400"/> {guest.email}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          guest.customerTag === 'VIP' ? 'bg-purple-100 text-purple-800' :
                          guest.customerTag === 'FRECUENTE' ? 'bg-blue-100 text-blue-800' :
                          guest.customerTag === 'CORPORATIVO' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {guest.customerTag || 'NUEVO'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-full text-xs">
                          {guest.totalStays || (guest.reservations ? guest.reservations.length : 1)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-800 text-xs">
                        ${Number(guest.totalSpent || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditGuest(guest)}
                            className="p-1.5 text-gray-600 hover:text-guamal-green hover:bg-guamal-green/10 rounded-lg transition-colors cursor-pointer"
                            title="Editar Huésped"
                          >
                            <Edit2 size={15} />
                          </button>
                          <a
                            href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                            title="Chatear por WhatsApp"
                          >
                            <ExternalLink size={12} /> WhatsApp
                          </a>
                          <button
                            onClick={() => handleDeleteGuest(guest)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Huésped"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* TAB 2: PROSPECTOS Y CONSULTAS */
        <div className="overflow-x-auto">
          {filteredInquiries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-medium">No hay consultas ni prospectos registrados</p>
              <p className="text-xs text-gray-400">Las personas que inicien chat por WhatsApp o formulario web aparecerán aquí.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Interesado / Prospecto</th>
                  <th className="p-4 font-semibold">Canal de Origen</th>
                  <th className="p-4 font-semibold">Interés / Huéspedes</th>
                  <th className="p-4 font-semibold">Mensaje o Pregunta</th>
                  <th className="p-4 font-semibold text-center">Estado Lead</th>
                  <th className="p-4 font-semibold text-right">Contacto Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredInquiries.map((inq) => {
                  const phoneClean = inq.phone.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hola ${inq.fullName}, te escribimos de Guamal Mini Barrio con respecto a tu consulta.`)}`;

                  return (
                    <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold text-sm">
                            {inq.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{inq.fullName}</span>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span>{inq.phone}</span>
                              {inq.email && <span className="text-gray-400">• {inq.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          inq.channel === 'WIDGET_WHATSAPP'
                            ? 'bg-green-100 text-green-800'
                            : inq.channel === 'FORMULARIO_CONTACTO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {inq.channel === 'WIDGET_WHATSAPP' ? 'WhatsApp Widget' : 'Formulario Web'}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('es-CO') : 'Reciente'}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-700">
                        {inq.datesOfInterest && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar size={12} className="text-guamal-green" />
                            <span>{inq.datesOfInterest}</span>
                          </div>
                        )}
                        {inq.guestsCount && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Users size={12} />
                            <span>{inq.guestsCount} personas</span>
                          </div>
                        )}
                        {!inq.datesOfInterest && !inq.guestsCount && (
                          <span className="text-gray-400">Información general</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600 max-w-xs">
                        <p className="line-clamp-2 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                          "{inq.message || 'Interesado en conocer tarifas y disponibilidad.'}"
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={inq.status || 'NUEVO'}
                          onChange={(e) => inq.id && handleStatusChange(inq.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                            inq.status === 'NUEVO' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            inq.status === 'COTIZADO' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            inq.status === 'EN_SEGUIMIENTO' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            inq.status === 'CONVERTIDO' ? 'bg-green-50 text-green-800 border-green-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          <option value="NUEVO">NUEVO</option>
                          <option value="COTIZADO">COTIZADO</option>
                          <option value="EN_SEGUIMIENTO">EN SEGUIMIENTO</option>
                          <option value="CONVERTIDO">CONVERTIDO (RESERVA)</option>
                          <option value="DESCARTADO">DESCARTADO</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <MessageSquare size={12} /> Contactar
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL: EDITAR HUÉSPED */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Editar Huésped</h3>
                <p className="text-xs text-gray-500">Actualiza datos personales, documento y notas de fidelización.</p>
              </div>
              <button 
                onClick={() => setEditingGuest(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGuestEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={guestFormData.fullName}
                  onChange={(e) => setGuestFormData({ ...guestFormData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tipo Doc</label>
                  <select 
                    value={guestFormData.documentType}
                    onChange={(e) => setGuestFormData({ ...guestFormData, documentType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs font-bold"
                  >
                    <option value="CC">Cédula (CC)</option>
                    <option value="CE">Cédula Ext. (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="NIT">NIT / Empresa</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">No. de Documento</label>
                  <input 
                    type="text" 
                    value={guestFormData.documentId}
                    onChange={(e) => setGuestFormData({ ...guestFormData, documentId: e.target.value })}
                    placeholder="Ej: 1121890123"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="text" 
                    value={guestFormData.phone}
                    onChange={(e) => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={guestFormData.email}
                    onChange={(e) => setGuestFormData({ ...guestFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Ciudad / Procedencia</label>
                  <input 
                    type="text" 
                    value={guestFormData.cityOrigin}
                    onChange={(e) => setGuestFormData({ ...guestFormData, cityOrigin: e.target.value })}
                    placeholder="Ej: Bogotá, Villavicencio..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Perfil / Etiqueta</label>
                  <select 
                    value={guestFormData.customerTag}
                    onChange={(e) => setGuestFormData({ ...guestFormData, customerTag: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs font-bold"
                  >
                    <option value="NUEVO">NUEVO</option>
                    <option value="FRECUENTE">FRECUENTE</option>
                    <option value="VIP">VIP</option>
                    <option value="CORPORATIVO">CORPORATIVO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notas Internas / Preferencias</label>
                <textarea 
                  rows={3}
                  value={guestFormData.notes}
                  onChange={(e) => setGuestFormData({ ...guestFormData, notes: e.target.value })}
                  placeholder="Ej: Prefiere casa fresca, viaja con mascota, solicita check-in temprano..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-guamal-green hover:bg-[#152a25] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Huésped'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AÑADIR NUEVO HUÉSPED */}
      {isNewGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Registrar Nuevo Huésped</h3>
                <p className="text-xs text-gray-500">Crea una ficha para reservas manuales o telefónicas.</p>
              </div>
              <button 
                onClick={() => setIsNewGuestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={guestFormData.fullName}
                  onChange={(e) => setGuestFormData({ ...guestFormData, fullName: e.target.value })}
                  required
                  placeholder="Ej: Andrés Morales"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tipo Doc</label>
                  <select 
                    value={guestFormData.documentType}
                    onChange={(e) => setGuestFormData({ ...guestFormData, documentType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs font-bold"
                  >
                    <option value="CC">Cédula (CC)</option>
                    <option value="CE">Cédula Ext. (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="NIT">NIT / Empresa</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">No. de Documento</label>
                  <input 
                    type="text" 
                    value={guestFormData.documentId}
                    onChange={(e) => setGuestFormData({ ...guestFormData, documentId: e.target.value })}
                    placeholder="Ej: 1121890123"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="text" 
                    value={guestFormData.phone}
                    onChange={(e) => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                    required
                    placeholder="+57 300 000 0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={guestFormData.email}
                    onChange={(e) => setGuestFormData({ ...guestFormData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Ciudad / Procedencia</label>
                  <input 
                    type="text" 
                    value={guestFormData.cityOrigin}
                    onChange={(e) => setGuestFormData({ ...guestFormData, cityOrigin: e.target.value })}
                    placeholder="Ej: Bogotá"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Perfil / Etiqueta</label>
                  <select 
                    value={guestFormData.customerTag}
                    onChange={(e) => setGuestFormData({ ...guestFormData, customerTag: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs font-bold"
                  >
                    <option value="NUEVO">NUEVO</option>
                    <option value="FRECUENTE">FRECUENTE</option>
                    <option value="VIP">VIP</option>
                    <option value="CORPORATIVO">CORPORATIVO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notas Internas</label>
                <textarea 
                  rows={3}
                  value={guestFormData.notes}
                  onChange={(e) => setGuestFormData({ ...guestFormData, notes: e.target.value })}
                  placeholder="Detalles de contacto o requerimientos especiales..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-guamal-green text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewGuestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-guamal-green hover:bg-[#152a25] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Registrar Huésped'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
