import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  me: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/auth/me');
      set({ user: data?.user ?? null, isLoading: false });
      return data?.user ?? null;
    } catch (e) {
      set({
        user: null,
        isLoading: false,
        error: msg(e, 'Failed to fetch user.'),
      });
      return null;
    }
  },

  register: async ({ name, email, password, role }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      set({
        user: data.user,
        isLoading: false,
        success: data.message || 'Registered.',
      });
      return data.user;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Registration failed.') });
      throw e;
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({
        user: data.user,
        isLoading: false,
        success: data.message || 'Logged in.',
      });
      return data.user;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Login failed.') });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/auth/logout', { method: 'POST' });
      set({
        user: null,
        isLoading: false,
        success: data.message || 'Logged out.',
      });
      return true;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Logout failed.') });
      throw e;
    }
  },

  isAdmin: () => (get().user?.role || '').toLowerCase() === 'admin',
  isUser: () => (get().user?.role || '').toLowerCase() === 'user',
}));
