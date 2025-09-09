// client/src/services/adminService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/admin`;

// Create axios instance for admin
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Dashboard
export const getDashboardStats = async () => {
  return request(adminApi.get('/dashboard'));
};

// User management
export const getUsers = async (params = {}) => {
  return request(adminApi.get('/users', { params }));
};

export const getAllUsers = async () => {
  return request(adminApi.get('/users'));
};

export const updateUser = async (userId, userData) => {
  return request(adminApi.put(`/users/${userId}`, userData));
};

export const updateUserRole = async (userId, role) => {
  return request(adminApi.put(`/users/${userId}/role`, { role }));
};

export const toggleUserStatus = async (userId) => {
  return request(adminApi.put(`/users/${userId}/toggle-status`));
};

export const deleteUser = async (userId) => {
  return request(adminApi.delete(`/users/${userId}`));
};

// Review management
export const getReviews = async (params = {}) => {
  return request(adminApi.get('/reviews', { params }));
};

export const getAllReviews = async () => {
  return request(adminApi.get('/reviews'));
};

export const updateReview = async (reviewId, reviewData) => {
  return request(adminApi.put(`/reviews/${reviewId}`, reviewData));
};

export const updateReviewStatus = async (reviewId, status) => {
  return request(adminApi.put(`/reviews/${reviewId}/status`, { status }));
};

export const deleteReview = async (reviewId) => {
  return request(adminApi.delete(`/reviews/${reviewId}`));
};

// Reports management
export const getReports = async (params = {}) => {
  return request(adminApi.get('/reports', { params }));
};

// Complaints management
export const getComplaints = async (params = {}) => {
  return request(adminApi.get('/complaints', { params }));
};

export const getAllComplaints = async () => {
  return request(adminApi.get('/complaints'));
};

export const updateComplaint = async (complaintId, complaintData) => {
  return request(adminApi.put(`/complaints/${complaintId}`, complaintData));
};

export const updateComplaintStatus = async (complaintId, status) => {
  return request(adminApi.put(`/complaints/${complaintId}/status`, { status }));
};

export const deleteComplaint = async (complaintId) => {
  return request(adminApi.delete(`/complaints/${complaintId}`));
};
