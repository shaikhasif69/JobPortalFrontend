// src/services/AdminService.js
import { adminAPI, bookingAPI, paymentAPI } from './api';

export const AdminService = {
  /**
   * Get dashboard statistics from the admin dashboard endpoint
   * @returns {Promise} Promise object with dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get all users with optional filters
   * @param {Object} filters - Optional filters such as role, status, etc.
   * @returns {Promise} Promise object with users data
   */
  getAllUsers: async (filters = {}) => {
    try {
      const response = await adminAPI.getAllUsers(filters);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} Promise object with user data
   */
  getUserById: async (userId) => {
    try {
      const response = await adminAPI.getUserById(userId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Promise object with updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await adminAPI.updateUser(userId, userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

/**
 * Verify worker account
 * @param {string} workerId - Worker Profile ID to verify
 * @returns {Promise} Promise object with verified worker data
 */
verifyWorker: async (workerId) => {
    try {
      console.log(`Verifying worker with ID: ${workerId}`);
      
      if (!workerId) {
        throw new Error('Worker ID is required for verification');
      }
      
      const response = await adminAPI.verifyWorker(workerId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to verify worker');
      }
      
      return response.data.data.worker;
    } catch (error) {
      console.error(`Error verifying worker ${workerId}:`, error);
      throw error;
    }
  },

  /**
   * Get all professions
   * @returns {Promise} Promise object with professions data
   */
  getAllProfessions: async () => {
    try {
      const response = await adminAPI.getAllProfessions();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch professions');
      }
      
      return response.data.data.professions;
    } catch (error) {
      console.error('Error fetching professions:', error);
      throw error;
    }
  },

  /**
   * Create a new profession
   * @param {Object} professionData - Profession data
   * @returns {Promise} Promise object with created profession
   */
  createProfession: async (professionData) => {
    try {
      const response = await adminAPI.createProfession(professionData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create profession');
      }
      
      return response.data.data.profession;
    } catch (error) {
      console.error('Error creating profession:', error);
      throw error;
    }
  },

  /**
   * Update a profession
   * @param {string} professionId - Profession ID
   * @param {Object} professionData - Updated profession data
   * @returns {Promise} Promise object with updated profession
   */
  updateProfession: async (professionId, professionData) => {
    try {
      const response = await adminAPI.updateProfession(professionId, professionData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profession');
      }
      
      return response.data.data.profession;
    } catch (error) {
      console.error(`Error updating profession ${professionId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a profession
   * @param {string} professionId - Profession ID to delete
   * @returns {Promise} Promise with deleted status
   */
  deleteProfession: async (professionId) => {
    try {
      const response = await adminAPI.deleteProfession(professionId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete profession');
      }
      
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting profession ${professionId}:`, error);
      throw error;
    }
  },

  /**
   * Get all commissions
   * @returns {Promise} Promise object with commission data
   */
  getAllCommissions: async () => {
    try {
      const response = await adminAPI.getAllCommissions();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch commissions');
      }
      
      return response.data.data.commissions;
    } catch (error) {
      console.error('Error fetching commissions:', error);
      throw error;
    }
  },

  /**
   * Get commission earnings
   * @returns {Promise} Promise object with commission earnings data
   */
  getCommissionEarnings: async () => {
    try {
      const response = await adminAPI.getCommissionEarnings();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch commission earnings');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching commission earnings:', error);
      throw error;
    }
  },

  /**
   * Update commission rate
   * @param {string} commissionId - Commission ID
   * @param {number} rate - New commission rate
   * @returns {Promise} Promise object with updated commission
   */
  updateCommissionRate: async (commissionId, rate) => {
    try {
      const response = await adminAPI.updateCommissionRate(commissionId, rate);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update commission rate');
      }
      
      return response.data.data.commission;
    } catch (error) {
      console.error(`Error updating commission rate ${commissionId}:`, error);
      throw error;
    }
  },

  /**
   * Get all bookings with optional filters
   * @param {Object} filters - Optional filters such as status, date range, etc.
   * @returns {Promise} Promise object with bookings data
   */
  getAllBookings: async (filters = {}) => {
    try {
      const response = await bookingAPI.getAllBookings(filters);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch bookings');
      }
      
      return response.data.data.bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  /**
   * Get booking statistics
   * @returns {Promise} Promise object with booking stats
   */
  getBookingStats: async () => {
    try {
      const response = await bookingAPI.getBookingStats();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch booking stats');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  /**
   * Get all payments with optional filters
   * @param {Object} filters - Optional filters such as status, date range, etc.
   * @returns {Promise} Promise object with payments data
   */
  getAllPayments: async (filters = {}) => {
    try {
      const response = await paymentAPI.getAllPayments(filters);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch payments');
      }
      
      return response.data.data.payments;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },
  
  /**
   * Create admin user (special privilege function)
   * @param {Object} userData - Admin user data
   * @returns {Promise} Promise object with created admin user
   */
  createAdminUser: async (userData) => {
    try {
      const response = await adminAPI.createAdminUser(userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create admin user');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
};

export default AdminService;