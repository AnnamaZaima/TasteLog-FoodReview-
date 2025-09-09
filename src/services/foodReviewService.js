// src/services/foodReviewService.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/foodreviews`;

/* ---------- Stable per-browser uid (used by backend ownership checks) ---------- */
function ensureUid() {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("uid", uid);
  }
  return uid;
}

/* ---------- Axios instance ---------- */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: false, // keep false unless you truly use cookies
});

// Always attach our uid + don’t overwrite existing headers
api.interceptors.request.use((config) => {
  config.headers = { ...(config.headers || {}) };
  config.headers["X-User-Id"] = ensureUid();
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

/* ---------- Helpers ---------- */
function normalizeFilters(filters = {}) {
  // Drop empty strings/null/undefined; keep 0/false
  const out = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== "" && x != null);
      if (arr.length) out[k] = arr;
    } else if (v !== "" && v != null) {
      out[k] = v;
    }
  });
  return out;
}

async function request(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    // Re-throw with server message if present so UI toasts are accurate
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Request failed";
    const e = new Error(msg);
    e.response = err?.response;
    throw e;
  }
}

/* ---------- CRUD ---------- */
export const getAllReviews = async (filters) =>
  request(api.get("/", { params: normalizeFilters(filters) }));

export const getReviewById = async (id) =>
  request(api.get(`/${id}`));

// Alias for backward compatibility
export const getFoodReviewById = async (id) =>
  request(api.get(`/${id}`));

export const createReview = async (reviewData) =>
  request(api.post("/", reviewData));

export const updateReview = async (id, updateData) =>
  request(api.patch(`/${id}`, updateData));

export const deleteReview = async (id) =>
  request(api.delete(`/${id}`));

/* ---------- Reactions (mutually exclusive) ---------- */
export const toggleLike = async (id) =>
  request(api.post(`/${id}/like`)); // { liked, likesCount, disliked, dislikesCount }

export const toggleDislike = async (id) =>
  request(api.post(`/${id}/dislike`)); // { disliked, dislikesCount, liked, likesCount }

/* ---------- Reports ---------- */
export const reportReview = async (id, reason) =>
  request(api.post(`/${id}/report`, { reason })); // { reportsCount, removed }

/* ---------- Comments ---------- */
export const listComments = async (id) =>
  request(api.get(`/${id}/comments`)); // Comment[]

/**
 * Add a comment to a review.
 * @param {string} id       Review ID
 * @param {string} text     Comment text
 * @param {string} [name]   Optional display name to store as authorName
 */
export const addComment = async (id, text, name) => {
  const payload = name ? { text, name } : { text };
  return request(api.post(`/${id}/comments`, payload)); // created comment
};

export const deleteComment = async (id, commentId) =>
  request(api.delete(`/${id}/comments/${commentId}`)); // { ok: true }
