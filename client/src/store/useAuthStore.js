import { create } from 'zustand';
import api from '../api/axiosInstance';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Check auth on initial application load
  checkAuth: async () => {
    const token = localStorage.getItem('shopera_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('shopera_token');
      delete api.defaults.headers.common["Authorization"];
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.data?.accessToken) {
      localStorage.setItem('shopera_token', data.data.accessToken);
    }
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.data?.accessToken) {
      localStorage.setItem('shopera_token', data.data.accessToken);
    }
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    try {
      if (localStorage.getItem("shopera_token")) {
        await api.post("/auth/logout");
      }
    } catch {
      // Ignore network/auth error during logout
    } finally {
      localStorage.removeItem("shopera_token");
      delete api.defaults.headers.common["Authorization"];
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));