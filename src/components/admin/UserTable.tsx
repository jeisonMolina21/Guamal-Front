import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Key, Trash2, CheckCircle2, 
  XCircle, Search, X, ShieldAlert, Check, RefreshCw
} from 'lucide-react';
import { api, type StaffUser } from '../../services/api';
import { currentUser } from '../../store/authStore';
import { useStore } from '@nanostores/react';
import './UserTable.css';

export function UserTable() {
  const loggedInUser = useStore(currentUser);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPCIONISTA'
  });
  const [selectedNewRole, setSelectedNewRole] = useState<string>('RECEPCIONISTA');
  const [submitting, setSubmitting] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e: any) {
      showNotification('Error al cargar la lista de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createUser(newUserData);
      if (res.success) {
        showNotification(`Usuario "${newUserData.name}" creado con éxito`);
        setIsCreateOpen(false);
        setNewUserData({ name: '', email: '', password: '', role: 'RECEPCIONISTA' });
        await fetchUsers();
      } else {
        showNotification(res.error || 'No se pudo crear el usuario', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error de conexión', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.updateUserRole(selectedUser.id, selectedNewRole);
      if (res.success) {
        showNotification(`Rol de "${selectedUser.name}" cambiado a ${selectedNewRole}`);
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        await fetchUsers();
      } else {
        showNotification(res.error || 'No se pudo cambiar el rol', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    if (user.id === loggedInUser?.id) {
      showNotification('No puedes desactivar tu propia cuenta', 'error');
      return;
    }
    const newStatus = !user.isActive;
    try {
      const res = await api.updateUserStatus(user.id, newStatus);
      if (res.success) {
        showNotification(`Usuario "${user.name}" ${newStatus ? 'activado' : 'desactivado'}`);
        await fetchUsers();
      } else {
        showNotification(res.error || 'Error al modificar estado', 'error');
      }
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    if (user.id === loggedInUser?.id) {
      showNotification('No puedes eliminar tu propia cuenta', 'error');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar permanentemente a "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        showNotification(`Usuario "${user.name}" eliminado correctamente`);
        await fetchUsers();
      } else {
        showNotification(res.error || 'Error al eliminar usuario', 'error');
      }
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="role-badge role-superadmin"><ShieldAlert size={12} /> Superadmin</span>;
      case 'ADMINISTRADOR':
        return <span className="role-badge role-admin"><Shield size={12} /> Administrador</span>;
      case 'RECEPCIONISTA':
        return <span className="role-badge role-receptionist"><Users size={12} /> Recepcionista</span>;
      default:
        return <span className="role-badge role-user">Huésped / Usuario</span>;
    }
  };

  return (
    <div className="users-container">
      
      {/* Toast notification */}
      {notification && (
        <div style={{
          backgroundColor: notification.type === 'success' ? '#166534' : '#991b1b',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {notification.type === 'success' ? <Check size={18} /> : <XCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="users-header">
        <div>
          <h2 className="users-title">
            <Users size={22} style={{ color: '#1E3A34' }} />
            Gestión de Usuarios & Personal
          </h2>
          <p className="users-subtitle">
            Crea recepcionistas, administradores y gestiona permisos del sistema Villa MCJ.
          </p>
        </div>

        <div className="users-header-actions">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="users-search-input"
            />
          </div>

          <button onClick={fetchUsers} className="btn-icon-action" title="Recargar lista">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button onClick={() => setIsCreateOpen(true)} className="users-btn-new">
            <UserPlus size={18} />
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="users-table-card">
        {loading && users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            Cargando usuarios desde MariaDB...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No se encontraron usuarios registrados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol Asignado</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <span className={`status-pill ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot"></span>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="user-actions" style={{ justifyContent: 'flex-end' }}>
                        
                        {/* Change role button */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedNewRole(user.role);
                            setIsRoleModalOpen(true);
                          }}
                          className="btn-icon-action"
                          title="Cambiar rol"
                        >
                          <Key size={15} />
                        </button>

                        {/* Toggle active button */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="btn-icon-action"
                          title={user.isActive ? 'Desactivar acceso' : 'Reactivar acceso'}
                        >
                          {user.isActive ? (
                            <XCircle size={15} style={{ color: '#dc2626' }} />
                          ) : (
                            <CheckCircle2 size={15} style={{ color: '#059669' }} />
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="btn-icon-action btn-icon-danger"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREAR USUARIO */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header-users">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                Crear Nuevo Usuario / Staff
              </h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body-users">
                <div>
                  <label className="modal-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="Ej: Camilo Pérez"
                    className="modal-input"
                  />
                </div>

                <div>
                  <label className="modal-label">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="camilo@villamcj.com"
                    className="modal-input"
                  />
                </div>

                <div>
                  <label className="modal-label">Contraseña Inicial</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="modal-input"
                  />
                </div>

                <div>
                  <label className="modal-label">Rol y Permisos</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="modal-input"
                    style={{ fontWeight: 600 }}
                  >
                    <option value="RECEPCIONISTA">RECEPCIONISTA (Ver reservas, pagos, check-ins)</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR (Gestión total de casas, tarifas y reservas)</option>
                    <option value="USUARIO">USUARIO / HUÉSPED (Solo consulta y reserva pública)</option>
                    {loggedInUser?.role === 'SUPERADMIN' && (
                      <option value="SUPERADMIN">SUPERADMIN (Control total de usuarios y sistema)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Creando en DB...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR ROL */}
      {isRoleModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header-users">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                Cambiar Rol de Acceso
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-users">
              <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                Modificando permisos de <strong>{selectedUser.name}</strong> ({selectedUser.email}):
              </p>

              <div>
                <label className="modal-label">Seleccionar Nuevo Rol</label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value)}
                  className="modal-input"
                  style={{ fontWeight: 600 }}
                >
                  <option value="USUARIO">USUARIO / HUÉSPED</option>
                  <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  {loggedInUser?.role === 'SUPERADMIN' && (
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  )}
                </select>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleChangeRole}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Guardando...' : 'Actualizar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
