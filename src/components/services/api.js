import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout (increased for file uploads)
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
      contentType: config.headers["Content-Type"],
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
  // Create ticket without media
  createTicket: (data) => {
    console.log("📧 Creating support ticket:", data);
    return api.post("/support", data);
  },

  // ✅ NEW: Create ticket with media (FormData)
  createTicketWithMedia: (formData) => {
    console.log("📧📎 Creating support ticket with media");
    return axios.post(`${API_URL}/support/with-media`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for file upload
    });
  },

  // ✅ NEW: Upload files only
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    console.log("📎 Uploading files:", files.length);
    return axios.post(`${API_URL}/support/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
  },

  // Get user's tickets
  getMyTickets: () => {
    console.log("📋 Fetching my support tickets");
    return api.get("/support/my-tickets");
  },

  // Get single ticket
  getTicket: (id) => {
    console.log("📋 Fetching support ticket:", id);
    return api.get(`/support/${id}`);
  },

  // ============================================
  // ADMIN ONLY METHODS
  // ============================================

  // Get all tickets (admin)
  getAllTickets: (params) => {
    console.log("📋 Admin: Fetching all tickets with params:", params);
    return api.get("/support/admin/all", { params });
  },

  // Update ticket status (admin)
  updateTicketStatus: (id, data) => {
    console.log("✏️ Admin: Updating ticket status:", { id, data });
    return api.patch(`/support/admin/${id}/status`, data);
  },

  // Add response to ticket (admin)
  addResponse: (id, message, files = []) => {
    const formData = new FormData();
    formData.append("message", message);

    files.forEach((file) => {
      formData.append("files", file);
    });

    console.log("💬 Admin: Adding response to ticket:", id);
    return axios.post(`${API_URL}/support/admin/${id}/response`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
  },

  // Delete ticket (admin)
  deleteTicket: (id) => {
    console.log("🗑️ Admin: Deleting ticket:", id);
    return api.delete(`/support/admin/${id}`);
  },
};

// Chat APIs
export const chatAPI = {
  getMyChat: () => api.get("/chat/my-chat"),
  sendMessage: (data) => api.post("/chat/send-message", data),
  markAsRead: (chatId) => api.patch(`/chat/${chatId}/read`),
  closeChat: (chatId) => api.patch(`/chat/${chatId}/close`),

  // Admin
  getAllChats: (params) => api.get("/chat/admin/all", { params }),
  getChat: (chatId) => api.get(`/chat/${chatId}`),
  assignChat: (chatId) => api.patch(`/chat/${chatId}/assign`),
};

// Checkout APIs
export const checkoutAPI = {
  processCheckout: (data) => api.post("/checkout", data),
};

export default api;
