// src/services/AuthService.js
import { authAPI, commonAPI } from './api';

export const AuthService = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials (email/phone and password)
   * @returns {Promise} Promise object with user data and token
   */
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store token and user data in localStorage
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.data.user.role);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return {
        user: response.data.data.user,
        token: response.data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise object with user data and token
   */
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store token and user data in localStorage
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.data.user.role);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return {
        user: response.data.data.user,
        token: response.data.token
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Get current user data
   * @returns {Promise} Promise object with user data
   */
  getCurrentUser: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password data including currentPassword and newPassword
   * @returns {Promise} Promise object with success status
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await commonAPI.updatePassword(passwordData);
      return response.data.success;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Update user profile (name, email, phone, etc.)
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Promise object with updated user data
   */
  updateUserProfile: async (profileData) => {
    try {
      const response = await commonAPI.updateUserProfile(profileData);
      
      // Update localStorage with new user data
      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...userData, ...response.data.data.user };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Redirect to login page
    window.location.href = '/login';
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user role
   * @returns {string|null} User role or null if not authenticated
   */
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data from localStorage or null if not available
   */
  getStoredUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

export default AuthService;