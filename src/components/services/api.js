import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/api/register", data),
  login: (data) => api.post("/api/login", data),
  getProfile: () => api.get("/api/me"),
  updateProfile: (data) => api.put("/api/me", data),
  changePassword: (data) => api.put("/api/password", data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addItem: (data) => api.post("/cart/add", data),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  updateQuantity: (productId, data) =>
    api.patch(`/cart/update/${productId}`, data),
  clearCart: () => api.delete("/cart/clear"),
  getCartSummary: () => api.get("/cart/summary"),
};

// Order APIs
export const orderAPI = {
  verifyPayment: (data) => api.post("/orders/verify-payment", data),
  getOrders: () => api.get("/orders"),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

// Support APIs
export const supportAPI = {
  createTicket: (data) => api.post("/support", data),
  getMyTickets: () => api.get("/support/my-tickets"),
  getTicket: (id) => api.get(`/support/${id}`),
  // Admin only
  getAllTickets: (params) => api.get("/support/admin/all", { params }),
  updateTicketStatus: (id, data) => api.put(`/support/${id}/status`, data),
  addResponse: (id, data) => api.post(`/support/${id}/response`, data),
  deleteTicket: (id) => api.delete(`/support/${id}`),
};

// Checkout APIs
export const checkoutAPI = {
  processCheckout: (data) => api.post("/checkout", data),
};

export default api;
