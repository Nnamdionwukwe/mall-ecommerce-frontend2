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

    console.log("📤 API Request:", {
      method: config.method.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : "No token",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in localStorage!");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      method: response.config.method.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      success: response.data?.success,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error Response:", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
    });

    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized - Clearing token and redirecting to login");
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/me", data),
  changePassword: (data) => api.put("/auth/password", data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => {
    console.log("📦 Fetching all products with params:", params);
    return api.get("/products", { params });
  },
  getById: (id) => {
    console.log("📦 Fetching product by ID:", id);
    return api.get(`/products/${id}`);
  },
  create: (data) => {
    console.log("➕ Creating new product:", data);
    return api.post("/products", data);
  },
  update: (id, data) => {
    console.log("✏️ Updating product:", { id, data });
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => {
    console.log("\n========================================");
    console.log("🗑️ DELETE API CALL");
    console.log("========================================");
    console.log("Product ID:", id);
    console.log("Delete URL:", `/products/${id}`);
    console.log("Full URL:", `${API_URL}/products/${id}`);
    console.log("Token in localStorage:", !!localStorage.getItem("token"));
    console.log("========================================\n");

    return api.delete(`/products/${id}`);
  },
  updateStock: (id, data) => {
    console.log("📊 Updating stock:", { id, data });
    return api.patch(`/products/${id}/stock`, data);
  },
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
