import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://blue-collar-job-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      
      // Check if we're not already on the login page to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Worker API calls
export const workerAPI = {
  getAllWorkers: (params) => api.get('/workers', { params }),
  getWorkerById: (id) => api.get(`/workers/${id}`),
  getWorkerProfile: () => api.get('/workers/profile/me'),
  updateWorkerProfile: (data) => api.patch('/workers/profile', data),
  getWorkerBookings: () => api.get('/workers/bookings/me'),
  updateBookingStatus: (id, status) => api.patch(`/workers/bookings/${id}`, { status }),
  getWorkerEarnings: () => api.get('/workers/earnings/me')
};

// Customer API calls
export const customerAPI = {
  getCustomerProfile: () => api.get('/customers/profile'),
  updateCustomerProfile: (data) => api.patch('/customers/profile', data),
  // Address management
  addAddress: (address) => api.post('/customers/address', address),
  updateAddress: (id, address) => api.patch(`/customers/address/${id}`, address),
  deleteAddress: (id) => api.delete(`/customers/address/${id}`),
  // Booking management
  getCustomerBookings: () => api.get('/customers/bookings'),
  createBooking: (bookingData) => api.post('/customers/bookings', bookingData),
  cancelBooking: (id, reason) => api.post(`/customers/bookings/${id}/cancel`, { cancellationReason: reason })
};

// Admin API calls
export const adminAPI = {
    // Dashboard
    getDashboardStats: () => api.get('/admin/dashboard'),
    
    // User management
    getAllUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.patch(`/users/${id}`, data),
    
    // Worker verification
    verifyWorker: (id) => {
        console.log(`Making API call to verify worker with ID: ${id}`);
        return api.patch(`/admin/workers/${id}/verify`, { isVerified: true });
      },
    
    // Profession management - Using the exact routes from your list
    getAllProfessions: () => api.get('/admin/professions'),
    createProfession: (data) => api.post('/admin/professions', data),
    updateProfession: (id, data) => api.patch(`/admin/professions/${id}`, data),
    deleteProfession: (id) => api.delete(`/admin/professions/${id}`),
    
    // Commission management - Using the exact routes from your list
    getAllCommissions: () => api.get('/admin/commissions'),
    updateCommissionRate: (id, rate) => api.patch(`/admin/commissions/${id}`, { rate }),
    
    // Admin user creation - Using the exact route from your list
    createAdminUser: (data) => api.post('/admin/create-admin', data),
    
    // Commission earnings - Using the exact route from your list
    getCommissionEarnings: () => api.get('/admin/earnings')
  };

// Booking API calls (for common booking operations)
export const bookingAPI = {
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: (params) => api.get('/bookings', { params }),
  updateBooking: (id, data) => api.patch(`/bookings/${id}`, data),
  getBookingStats: () => api.get('/bookings/stats/all')
};

// Payment API calls
export const paymentAPI = {
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  getAllPayments: (params) => api.get('/payments', { params }),
  updatePaymentStatus: (id, status) => api.patch(`/payments/${id}`, { status })
};

// Common API for shared operations
export const commonAPI = {
  updateUserProfile: (data) => api.patch('/users/profile', data),
  updatePassword: (data) => api.patch('/auth/update-password', data)
};

export default api;