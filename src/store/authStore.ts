import { atom } from 'nanostores';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USUARIO' | 'RECEPCIONISTA' | 'ADMINISTRADOR' | 'SUPERADMIN';
}

export const isAuthModalOpen = atom<boolean>(false);
export const currentUser = atom<AuthUser | null>(null);

// Initialize from localStorage if in browser
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('guamal_user');
  const token = localStorage.getItem('guamal_token');
  if (savedUser && token) {
    try {
      currentUser.set(JSON.parse(savedUser));
    } catch (e) {
      localStorage.removeItem('guamal_user');
      localStorage.removeItem('guamal_token');
    }
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guamal_token', token);
    localStorage.setItem('guamal_user', JSON.stringify(user));
  }
  currentUser.set(user);
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guamal_token');
    localStorage.removeItem('guamal_user');
  }
  currentUser.set(null);
  window.location.href = '/';
}
