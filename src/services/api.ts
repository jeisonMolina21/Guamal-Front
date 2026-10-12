export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'USUARIO' | 'RECEPCIONISTA' | 'ADMINISTRADOR' | 'SUPERADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  basePrice?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
}

export interface Inquiry {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  channel?: string;
  datesOfInterest?: string;
  guestsCount?: number;
  message?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export interface SystemSetting {
  id?: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description?: string;
  isPublic?: boolean;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  discountPercentage: number;
  fixedPrice?: number;
  minNights: number;
  minGuests: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  bannerImage?: string;
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Casa Ceiba',
    description: 'Hermosa cabaña prefabricada con vista al jardín, terraza privada con hamacas, aire acondicionado y cocina dotada.',
    pricePerNight: 180000,
    basePrice: 180000,
    capacity: 4,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    imageUrl: '/hero-cabanas.jpg'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Casa Samán',
    description: 'Espaciosa y fresca, perfecta para familias o grupos de amigos en busca de descanso profundo y confort.',
    pricePerNight: 200000,
    basePrice: 200000,
    capacity: 5,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Casa Moriche',
    description: 'La cabaña más amplia del mini barrio, con tres habitaciones, dos baños y zona BBQ privada.',
    pricePerNight: 250000,
    basePrice: 250000,
    capacity: 6,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop'
  }
];

export const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? (window.location.hostname.includes('villa-mcj')
      ? 'https://api-villa-mcj.markivo.site/api'
      : 'https://api.villa.mcj.markivo.site/api')
  : 'http://localhost:3000/api';

function normalizeProperty(p: any): Property {
  return {
    id: String(p.id),
    name: p.name || 'Casa en Guamal',
    description: p.description || 'Alojamiento confortable en Guamal, Meta.',
    pricePerNight: Number(p.pricePerNight || p.basePrice || 180000),
    basePrice: Number(p.pricePerNight || p.basePrice || 180000),
    capacity: Number(p.capacity || p.maxGuests || 4),
    maxGuests: Number(p.capacity || p.maxGuests || 4),
    bedrooms: Number(p.bedrooms || 2),
    bathrooms: Number(p.bathrooms || 1),
    status: p.status || 'ACTIVA',
    imageUrl: p.imageUrl || '/hero-cabanas.jpg'
  };
}

export const api = {
  // --- PROPERTIES ---
  checkAvailability: async (checkIn?: string, checkOut?: string, guests?: number): Promise<Property[]> => {
    try {
      let url = `${API_URL}/properties`;
      const params = new URLSearchParams();
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (guests) params.append('guests', String(guests));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeProperty);
        }
      }
    } catch (e) {
      console.warn('Backend no disponible, usando casas predeterminadas.');
    }
    return MOCK_PROPERTIES.filter(p => (guests ? p.capacity >= guests : true));
  },

  getProperty: async (id: string): Promise<Property | undefined> => {
    try {
      const res = await fetch(`${API_URL}/properties/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data) return normalizeProperty(data);
      }
    } catch (e) {
      console.warn('Backend no disponible, buscando en datos locales.');
    }
    const found = MOCK_PROPERTIES.find(p => p.id === id);
    return found || MOCK_PROPERTIES[0];
  },

  // --- RESERVATIONS ---
  createReservation: async (data: any): Promise<{ success: boolean; reservationId?: string; reservationCode?: string; error?: string; code?: string }> => {
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (!res.ok) {
        return {
          success: false,
          code: resData.code || 'RESERVATION_ERROR',
          error: resData.error || 'Error al procesar la reserva'
        };
      }

      return {
        success: true,
        reservationId: resData.reservationId,
        reservationCode: resData.reservationCode,
      };
    } catch (e: any) {
      return {
        success: false,
        code: 'NETWORK_ERROR',
        error: 'No fue posible conectar con el servidor de reservas. Verifica tu conexión e intenta nuevamente.'
      };
    }
  },

  getReservations: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_URL}/reservations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  updateReservationStatus: async (id: string, status: string, notes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- INQUIRIES / LEADS (Prospectos y Consultas) ---
  createInquiry: async (inquiry: Inquiry): Promise<{ success: boolean; inquiry?: any }> => {
    try {
      const res = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('No se pudo guardar la consulta en el backend:', e);
    }
    return { success: false };
  },

  getInquiries: async (): Promise<Inquiry[]> => {
    try {
      const res = await fetch(`${API_URL}/inquiries`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  updateInquiryStatus: async (id: string, status: string, notes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- SETTINGS (Parámetros) ---
  getPublicSettings: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetch(`${API_URL}/settings/public`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend settings no disponible');
    }
    return {
      whatsapp_number: '+57 300 123 4567',
      whatsapp_welcome_msg: 'Hola, quisiera asesoría para reservar en Guamal Mini Barrio.',
      min_deposit_percentage: '50',
      check_in_time: '15:00',
      check_out_time: '13:00',
      hostal_address: 'Sector Campestre Vía Humadea, Guamal, Meta, Colombia'
    };
  },

  getAllSettings: async (): Promise<SystemSetting[]> => {
    try {
      const res = await fetch(`${API_URL}/settings/`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  updateSetting: async (key: string, value: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/settings/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- PACKAGES & PROMOTIONS ---
  getPackages: async (all: boolean = false): Promise<Package[]> => {
    try {
      const res = await fetch(`${API_URL}/packages${all ? '?all=true' : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  updatePackage: async (id: string, data: Partial<Package>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- PROPERTIES (ADMIN & MANAGEMENT) ---
  getAllProperties: async (): Promise<Property[]> => {
    try {
      const res = await fetch(`${API_URL}/properties?all=true`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeProperty);
        }
      }
    } catch (e) {
      console.warn('Error fetching all properties:', e);
    }
    return MOCK_PROPERTIES;
  },

  createProperty: async (data: Partial<Property>): Promise<{ success: boolean; property?: Property; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const prop = await res.json();
        return { success: true, property: normalizeProperty(prop) };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Error al crear la cabaña' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión' };
    }
  },

  updateProperty: async (id: string, data: Partial<Property>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating property:', e);
      return false;
    }
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting property:', e);
      return false;
    }
  },

  uploadImage: async (file: File, houseName: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          data: base64,
          houseName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Error al subir la imagen' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  },

  // --- GUESTS ---
  getGuests: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_URL}/guests`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  createGuest: async (data: any): Promise<{ success: boolean; guest?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const guest = await res.json();
        return { success: true, guest };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Error al guardar el huésped' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión' };
    }
  },

  updateGuest: async (id: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating guest:', e);
      return false;
    }
  },

  deleteGuest: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/guests/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting guest:', e);
      return false;
    }
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_URL}/payments`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error fetching payments:', e);
    }
    return [];
  },

  createPayment: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Error creating payment:', e);
      return false;
    }
  },

  updatePaymentStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/payments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating payment status:', e);
      return false;
    }
  },

  // --- ADMIN DASHBOARD ---
  getDashboardStats: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return {
      reservationsToday: 0,
      checkinsToday: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      totalGuests: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      totalProperties: 3,
      occupiedProperties: 0,
      recentArrivals: [],
      revenueTrend: []
    };
  },

  // --- STAFF & USER MANAGEMENT ---
  getUsers: async (): Promise<StaffUser[]> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('guamal_token') : null;
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error fetching users:', e);
    }
    return [];
  },

  createUser: async (data: { name: string; email: string; password: string; role: string }): Promise<{ success: boolean; user?: StaffUser; error?: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('guamal_token') : null;
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Error al crear usuario' };
      }
      return { success: true, user: json.user };
    } catch (e: any) {
      console.error('Error creating user:', e);
      return { success: false, error: e.message || 'Error de conexión' };
    }
  },

  updateUserRole: async (id: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('guamal_token') : null;
      const res = await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al actualizar rol' };
      return { success: true };
    } catch (e: any) {
      console.error('Error updating role:', e);
      return { success: false, error: e.message };
    }
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('guamal_token') : null;
      const res = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isActive })
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al cambiar estado' };
      return { success: true };
    } catch (e: any) {
      console.error('Error updating user status:', e);
      return { success: false, error: e.message };
    }
  },

  deleteUser: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('guamal_token') : null;
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al eliminar usuario' };
      return { success: true };
    } catch (e: any) {
      console.error('Error deleting user:', e);
      return { success: false, error: e.message };
    }
  }
};

