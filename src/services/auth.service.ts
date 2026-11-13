import api from './api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  shopName: string;
  currency: string;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    this.setUser(response.data.user);
    return response.data;
  },

  async register(name: string, email: string, password: string, shopName: string) {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, shopName });
    this.setUser(response.data.user);
    return response.data;
  },

  getUser(): AuthUser | null {
    try {
      const value = sessionStorage.getItem('ims-user');
      return value ? (JSON.parse(value) as AuthUser) : null;
    } catch {
      sessionStorage.removeItem('ims-user');
      return null;
    }
  },

  setUser(user: AuthUser | null) {
    localStorage.removeItem('token');
    if (user) sessionStorage.setItem('ims-user', JSON.stringify(user));
    else sessionStorage.removeItem('ims-user');
  },

  clearUser() {
    this.setUser(null);
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearUser();
    }
  },
};
