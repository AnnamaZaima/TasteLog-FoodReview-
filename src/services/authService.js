// client/src/services/authService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/auth`;

// Create axios instance for auth
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh/errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for requests
async function request(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Request failed';
    const e = new Error(msg);
    e.response = err?.response;
    throw e;
  }
}

// Authentication methods
export const register = async (userData) => {
  const data = await request(authApi.post('/register', userData));
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const login = async (credentials) => {
  const data = await request(authApi.post('/login', credentials));
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getProfile = async () => {
  return request(authApi.get('/profile'));
};

export const updateProfile = async (profileData) => {
  const data = await request(authApi.put('/profile', profileData));
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const changePassword = async (passwordData) => {
  return request(authApi.put('/change-password', passwordData));
};

export const refreshToken = async () => {
  const data = await request(authApi.post('/refresh-token'));
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Utility functions
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && ['admin', 'superadmin'].includes(user.role);
};

export const isSuperAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'superadmin';
};
