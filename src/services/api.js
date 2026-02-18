import axios from "axios";

// ============================================
// AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR (JWT)
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);

    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

// ============================================
// AUTH
// ============================================
export const loginUser = (data) =>
  api.post("/api/auth/login", data);

export const registerUser = (data) =>
  api.post("/api/users/register", data);

// ============================================
// PRODUCTS
// ============================================
export const getProducts = () =>
  api.get("/api/products");

// ============================================
// CART
// ============================================
export const getCart = () =>
  api.get("/api/cart");

export const addToCart = (productId, quantity) =>
  api.post(`/api/cart/add/${productId}/quantity/${quantity}`);

export const updateCartQuantity = (cartItemId, quantity) =>
  api.put(`/api/cart/update/${cartItemId}/quantity/${quantity}`);

export const removeCartItem = (cartItemId) =>
  api.delete(`/api/cart/remove/${cartItemId}`);

// ============================================
// ORDERS
// ============================================
export const placeOrder = (data) =>
  api.post("/api/orders/checkout", data);

// 🔥 OLD (kept safe – do not remove)
export const getMyOrders = () =>
  api.get("/api/orders");

// 🔥 NEW – PAGINATED USER ORDERS (SAFE ADDITION)
export const getMyOrdersPaged = (page = 0, size = 5) =>
  api.get(`/api/orders/paged?page=${page}&size=${size}`);

export const cancelOrder = (orderId) =>
  api.put(`/api/orders/${orderId}/cancel`);

// ============================================
// ADMIN ORDERS
// ============================================
export const getAllAdminOrders = (page = 0, size = 60) =>
  api.get(`/api/admin/orders?page=${page}&size=${size}`);

export const shipOrder = (orderId) =>
  api.put(`/api/admin/orders/${orderId}/ship`);

export const deliverOrder = (orderId) =>
  api.put(`/api/admin/orders/${orderId}/deliver`);

export const adminCancelOrder = (orderId) =>
  api.put(`/api/admin/orders/${orderId}/cancel`);

export const updateAdminOrderStatus = (orderId, status) =>
  api.put(`/api/admin/orders/${orderId}/status/${status}`);

// ============================================
// REFUNDS
// ============================================
export const requestRefund = (orderId) =>
  api.post(`/api/refunds/${orderId}/request`);

export const getAllRefunds = () =>
  api.get("/api/admin/refunds");

export const completeRefund = (refundId) =>
  api.put(`/api/admin/refunds/${refundId}/complete`);

// ============================================
// RETURNS
// ============================================

// ADMIN → Get all return / replacement requests
export const getAllReturns = () =>
  api.get("/api/admin/returns");

// ADMIN → Process return / replacement
export const processReturnRequest = (requestId) =>
  api.put(`/api/admin/returns/${requestId}/process`);

// USER → Request return / replacement
export const requestReturn = (orderId, type, reason) =>
  api.post("/api/admin/returns/request", null, {
    params: { orderId, type, reason },
  });

// ============================================
// PAYMENTS
// ============================================
export const makePayment = (data) =>
  api.post("/api/payments/pay", data);

// ============================================
// ADMIN STOCK
// ============================================
export const updateProductStock = (productId, quantity) =>
  api.put(`/api/products/${productId}/stock?quantity=${quantity}`);

export default api;
