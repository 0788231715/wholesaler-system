import api from './axios';

export const authAPI = {
  login: (credentials) => api.post('/v1/auth/login', credentials),
  register: (userData) => api.post('/v1/auth/register', userData),
  getMe: () => api.get('/v1/auth/me'),
  updateDetails: (userData) => api.put('/v1/auth/updatedetails', userData),
};

export const userAPI = {
  getUsers: (params) => api.get('/v1/users', { params }),
  getUser: (id) => api.get(`/v1/users/${id}`),
  createUser: (userData) => api.post('/v1/users', userData),
  updateUser: (id, userData) => api.put(`/v1/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/v1/users/${id}`),
  getUsersByRole: (role) => api.get(`/v1/users/role/${role}`),
};

export const productAPI = {
  getProducts: (params) => api.get('/v1/products', { params }),
  getProduct: (id) => api.get(`/v1/products/${id}`),
  createProduct: (productData) => api.post('/v1/products', productData),
  updateProduct: (id, productData) => api.put(`/v1/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/v1/products/${id}`),
  updateStock: (id, stockData) => api.patch(`/v1/products/${id}/stock`, stockData),
};

export const orderAPI = {
  getOrders: (params) => api.get('/v1/orders', { params }),
  getOrder: (id) => api.get(`/v1/orders/${id}`),
  createOrder: (orderData) => api.post('/v1/orders', orderData),
  updateOrderStatus: (id, statusData) => api.patch(`/v1/orders/${id}/status`, statusData),
  assignOrder: (id, assignData) => api.patch(`/v1/orders/${id}/assign`, assignData),
  cancelOrder: (id) => api.patch(`/v1/orders/${id}/cancel`),
};

export const chatAPI = {
  getChats: () => api.get('/v1/chat'),
  getOrCreateChat: (participantId) => api.post('/v1/chat', { participantId }),
  getChatMessages: (chatId) => api.get(`/v1/chat/${chatId}/messages`),
  sendMessage: (chatId, messageData) => api.post(`/v1/chat/${chatId}/messages`, messageData),
  markAsRead: (chatId) => api.patch(`/v1/chat/${id}/read`),
};

export const invoiceAPI = {
  getInvoices: (params) => api.get('/v1/invoices', { params }),
  getInvoice: (id) => api.get(`/v1/invoices/${id}`),
  downloadInvoice: (id) => api.get(`/v1/invoices/${id}/download`, { responseType: 'blob' }),
  generateInvoice: (orderId) => api.post(`/v1/invoices/generate/${orderId}`),
  updateInvoiceStatus: (id, statusData) => api.patch(`/v1/invoices/${id}/status`, statusData),
};

export const reportAPI = {
  getDashboard: () => api.get('/v1/reports/dashboard'),
  getSalesReport: (params) => api.get('/v1/reports/sales', { params }),
  getProductPerformance: (params) => api.get('/v1/reports/products/performance', { params }),
  getStockReport: () => api.get('/v1/reports/stock'),
  getCustomerReport: () => api.get('/v1/reports/customers'),
  getProducerPerformance: () => api.get('/v1/reports/producers/performance'),
  getFinancialSummary: () => api.get('/v1/reports/financial/summary'),
  getMonthlyRevenue: (year) => api.get('/v1/reports/revenue/monthly', { params: { year } }),
};