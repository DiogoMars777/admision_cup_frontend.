import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
applyGlobalInterceptor(api);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await api.post('/forgot-password', data);
    return response.data;
  },

  verifyCode: async (data) => {
    const response = await api.post('/verify-code', data);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/reset-password', {
      email: data.email,
      code: data.code,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { console.error(e); }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
