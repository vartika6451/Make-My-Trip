import { create } from 'zustand';
import api from '../utils/api';

interface UserProfile {
  email: string;
  name: string;
  role: string;
  walletBalance: number;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  addWalletFunds: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, name, role, walletBalance } = response.data;
      localStorage.setItem('token', token);
      set({
        token,
        isAuthenticated: true,
        user: { email, name, role, walletBalance },
        loading: false,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Invalid username or password',
        loading: false,
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post('/api/auth/register', { name, email, password });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Email already registered',
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  fetchProfile: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const response = await api.get('/api/auth/profile');
      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      get().logout();
      set({ loading: false });
    }
  },

  addWalletFunds: async (amount) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/api/auth/wallet?amount=${amount}`);
      set({
        user: response.data,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to add funds',
        loading: false,
      });
    }
  },
}));
