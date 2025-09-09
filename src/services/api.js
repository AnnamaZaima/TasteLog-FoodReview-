import axios from "axios";

const RAW_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE = RAW_BASE.replace(/\/$/, "");

function ensureUid() {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() :
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("uid", uid);
  }
  return uid;
}

export const api = axios.create({
  baseURL: API_BASE,
});

// attach uid to all requests
api.interceptors.request.use((config) => {
  config.headers["X-User-Id"] = ensureUid();
  return config;
});

// Complaint functions
export const fetchComplaints = async (params = {}) => {
  const response = await api.get('/api/complaints', { params });
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await api.post('/api/complaints', complaintData);
  return response.data;
};

export const updateComplaintStatus = async (complaintId, status) => {
  const response = await api.put(`/api/complaints/${complaintId}`, { status });
  return response.data;
};

export default API_BASE;
