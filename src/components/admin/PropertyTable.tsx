import React, { useState, useEffect, useRef } from 'react';
import { Home, Users, Bed, Bath, Edit2, Plus, Trash2, Download, X, Check, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { api, type Property } from '../../services/api';
import { exportToCSV } from '../../utils/exportToExcel';
import './PropertyTable.css';

export const PropertyTable: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputEditRef = useRef<HTMLInputElement>(null);
  const fileInputNewRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 4,
    pricePerNight: 180000,
    bedrooms: 2,
    bathrooms: 1,
    status: 'ACTIVA',
    imageUrl: '/hero-cabanas.jpg'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const houseName = formData.name || (isNew ? 'nueva-casa' : editingProp?.name || 'casa');
    setUploading(true);
    try {
      const res = await api.uploadImage(file, houseName);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, imageUrl: res.url! }));
        showNotification(`¡Imagen guardada en el servidor como ${res.url}!`);
      } else {
        showNotification(res.error || 'Error al subir la imagen', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al cargar el archivo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getAllProperties();
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openEdit = (prop: Property) => {
    setEditingProp(prop);
    setFormData({
      name: prop.name,
      description: prop.description || '',
      capacity: prop.capacity || 4,
      pricePerNight: prop.pricePerNight || 180000,
      bedrooms: prop.bedrooms || 2,
      bathrooms: prop.bathrooms || 1,
      status: prop.status || 'ACTIVA',
      imageUrl: prop.imageUrl || '/hero-cabanas.jpg'
    });
  };

  const openNew = () => {
    setFormData({
      name: '',
      description: '',
      capacity: 4,
      pricePerNight: 200000,
      bedrooms: 2,
      bathrooms: 1,
      status: 'ACTIVA',
      imageUrl: '/hero-cabanas.jpg'
    });
    setIsNewModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSaving(true);
    try {
      const success = await api.updateProperty(editingProp.id, formData);
      if (success) {
        showNotification(`¡Cabaña "${formData.name}" actualizada con éxito!`);
        setEditingProp(null);
        await loadProperties();
      } else {
        showNotification('No se pudo actualizar la propiedad en MariaDB', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      const result = await api.createProperty(formData);
      if (result.success) {
        showNotification(`¡Cabaña "${formData.name}" creada con éxito!`);
        setIsNewModalOpen(false);
        await loadProperties();
      } else {
        showNotification(result.error || 'Error al crear la propiedad', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al crear', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prop: Property) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${prop.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const ok = await api.deleteProperty(prop.id);
      if (ok) {
        showNotification(`Cabaña "${prop.name}" eliminada.`);
        await loadProperties();
      } else {
        showNotification('No se pudo eliminar la cabaña', 'error');
      }
    } catch (e) {
      showNotification('Error al eliminar', 'error');
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Nombre Cabaña', 'Capacidad', 'Habitaciones', 'Baños', 'Precio Noche (COP)', 'Estado', 'Descripción'];
    const rows = properties.map(p => [
      p.id,
      p.name,
      p.capacity,
      p.bedrooms || 2,
      p.bathrooms || 1,
      p.pricePerNight,
      p.status || 'ACTIVA',
      p.description
    ]);
    exportToCSV('Directorio_Casas_Guamal', headers, rows);
    showNotification('Archivo Excel/CSV generado y descargado correctamente.');
  };

  return (
    <div className="prop-table-container">
      {/* Toast Notification */}
      {message && (
        <div className={`prop-toast ${message.type === 'success' ? 'prop-toast-success' : 'prop-toast-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="prop-toast-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="prop-table-header">
        <div>
          <h3 className="prop-header-title">
            <Home size={20} style={{ color: 'var(--color-guamal-green, #1E3A34)' }} />
            Directorio de Casas de Guamal Mini Barrio
          </h3>
          <p className="prop-header-subtitle">Cabañas activas, en mantenimiento y tarifas en tiempo real.</p>
        </div>
        <div className="prop-header-actions">
          <button onClick={handleExport} className="btn-export-excel">
            <Download size={15} />
            Exportar Excel
          </button>
          <button onClick={openNew} className="btn-add-house">
            <Plus size={16} />
            Añadir Casa
          </button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
          Cargando casas desde MariaDB...
        </div>
      ) : (
        <div className="prop-table-wrapper">
          <table className="prop-table">
            <thead>
              <tr>
                <th>Cabaña</th>
                <th style={{ textAlign: 'center' }}>Capacidad</th>
                <th style={{ textAlign: 'center' }}>Distribución</th>
                <th>Precio / Noche</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop.id}>
                  <td>
                    <div className="prop-cell-info">
                      <img 
                        src={prop.imageUrl || '/hero-cabanas.jpg'} 
                        alt={prop.name} 
                        className="prop-img-thumbnail" 
                        onError={(e: any) => { e.target.src = '/hero-cabanas.jpg'; }}
                      />
                      <div>
                        <span className="prop-name">{prop.name}</span>
                        <span className="prop-desc">{prop.description}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="prop-capacity-badge">
                      <Users size={12} /> {prop.capacity} pers.
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="prop-distribution-text">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Bed size={14} style={{ color: '#9ca3af' }} /> {prop.bedrooms || 2} habs
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Bath size={14} style={{ color: '#9ca3af' }} /> {prop.bathrooms || 1} baños
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="prop-price-text">
                      ${Number(prop.pricePerNight).toLocaleString('es-CO')} COP
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`prop-status-pill ${
                      prop.status === 'ACTIVA' 
                        ? 'prop-status-activa' 
                        : prop.status === 'MANTENIMIENTO'
                        ? 'prop-status-mantenimiento'
                        : 'prop-status-inactiva'
                    }`}>
                      {prop.status === 'ACTIVA' ? '● Activa' : prop.status === 'MANTENIMIENTO' ? '● Mantenimiento' : '● Inactiva'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEdit(prop)}
                        className="prop-action-btn prop-action-edit"
                        title="Editar Propiedad"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prop)}
                        className="prop-action-btn prop-action-delete"
                        title="Eliminar Propiedad"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: EDITAR CASA */}
      {editingProp && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Editar {editingProp.name}</h3>
                <p className="modal-subtitle">Actualiza precios, aforo y estado operativo.</p>
              </div>
              <button onClick={() => setEditingProp(null)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-field-group">
                <label className="form-label">Nombre de la Casa</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-field-group">
                <div>
                  <label className="form-label">Precio / Noche (COP)</label>
                  <input 
                    type="number" 
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    required
                    min={0}
                    step={10000}
                    className="form-input"
                    style={{ fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label className="form-label">Aforo Máximo (Pers.)</label>
                  <input 
                    type="number" 
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    required
                    min={1}
                    max={20}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="form-field-group">
                <div>
                  <label className="form-label">Habitaciones</label>
                  <input 
                    type="number" 
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    min={1}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Baños</label>
                  <input 
                    type="number" 
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    min={1}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Estado</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                    style={{ fontWeight: 700 }}
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="INACTIVA">INACTIVA</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-label">Fotografía de la Cabaña (Subir archivo)</label>
                <input 
                  type="file" 
                  ref={fileInputEditRef}
                  onChange={(e) => handleFileUpload(e, false)}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                />
                <div 
                  onClick={() => fileInputEditRef.current?.click()}
                  className="prop-upload-zone"
                >
                  <Upload size={22} style={{ color: 'var(--color-guamal-green, #1E3A34)' }} />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                      {uploading ? 'Subiendo imagen al servidor...' : 'Haz clic para seleccionar imagen de la casa'}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                      Se guardará con el nombre de la cabaña en <code style={{ backgroundColor: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>public/uploads/{formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'casa'}.jpg</code>
                    </span>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="prop-upload-preview-box">
                    <img 
                      src={formData.imageUrl} 
                      alt="preview" 
                      className="prop-upload-preview-img"
                      onError={(e: any) => { e.target.src = '/hero-cabanas.jpg'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={14} /> Imagen asignada correctamente
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#6b7280', display: 'block', wordBreak: 'break-all' }}>
                        {formData.imageUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-field-group">
                <label className="form-label">Descripción y Comodidades</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Detalles sobre aire acondicionado, hamacas, asador BBQ..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-submit"
                >
                  {saving ? 'Guardando en DB...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AÑADIR NUEVA CASA */}
      {isNewModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Añadir Nueva Cabaña</h3>
                <p className="modal-subtitle">Registra una nueva propiedad en Guamal Mini Barrio.</p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-field-group">
                <label className="form-label">Nombre de la Casa</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Casa Caracolí"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-field-group">
                <div>
                  <label className="form-label">Precio / Noche (COP)</label>
                  <input 
                    type="number" 
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    required
                    min={0}
                    step={10000}
                    className="form-input"
                    style={{ fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label className="form-label">Aforo Máximo (Pers.)</label>
                  <input 
                    type="number" 
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    required
                    min={1}
                    max={20}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="form-field-group">
                <div>
                  <label className="form-label">Habitaciones</label>
                  <input 
                    type="number" 
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    min={1}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Baños</label>
                  <input 
                    type="number" 
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    min={1}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Estado</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                    style={{ fontWeight: 700 }}
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="INACTIVA">INACTIVA</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-label">Foto de la Cabaña (Subir archivo local)</label>
                <input 
                  type="file" 
                  ref={fileInputNewRef} 
                  onChange={(e) => handleFileUpload(e, true)} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                
                <div 
                  onClick={() => fileInputNewRef.current?.click()}
                  className="prop-upload-zone"
                >
                  <Upload size={22} style={{ color: 'var(--color-guamal-green, #1E3A34)' }} />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                      {uploading ? 'Subiendo imagen al servidor...' : 'Haz clic para seleccionar imagen de la casa'}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                      Se guardará con el nombre de la cabaña en <code style={{ backgroundColor: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>public/uploads/{formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'nueva-casa'}.jpg</code>
                    </span>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="prop-upload-preview-box">
                    <img 
                      src={formData.imageUrl} 
                      alt="preview" 
                      className="prop-upload-preview-img"
                      onError={(e: any) => { e.target.src = '/hero-cabanas.jpg'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={14} /> Imagen asignada correctamente
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#6b7280', display: 'block', wordBreak: 'break-all' }}>
                        {formData.imageUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-field-group">
                <label className="form-label">Descripción y Comodidades</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Detalles sobre aire acondicionado, hamacas, asador BBQ..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-submit"
                >
                  {saving ? 'Registrando...' : 'Crear Cabaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
