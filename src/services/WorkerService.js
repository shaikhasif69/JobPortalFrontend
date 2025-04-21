// src/services/WorkerService.js
import { workerAPI } from './api';
import TranslationService from './TranslationService';

// Get current language from localStorage
const getCurrentLanguage = () => localStorage.getItem('language') || 'en';

/**
 * Helper function to translate API responses if needed
 * @param {Object} data - API response data
 * @returns {Promise<Object>} - Translated data if needed
 */
const translateIfNeeded = async (data) => {
  const currentLanguage = getCurrentLanguage();
  
  // Skip translation if language is English (source language)
  if (currentLanguage === 'en') {
    return data;
  }
  
  try {
    return await TranslationService.translateObject(data, currentLanguage);
  } catch (error) {
    console.error('Translation error:', error);
    return data; // Return original data if translation fails
  }
};

export const WorkerService = {
  /**
   * Get all workers with optional filters
   * @param {Object} filters - Optional filters such as profession, rating, etc.
   * @returns {Promise} Promise object with workers data
   */
  getAllWorkers: async (filters = {}) => {
    try {
      const response = await workerAPI.getAllWorkers(filters);
      // API response is already translated by the axios interceptor
      return response.data.data.workers;
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw error;
    }
  },

  /**
   * Get worker by ID
   * @param {string} id - Worker ID
   * @returns {Promise} Promise object with worker data
   */
  getWorkerById: async (id) => {
    try {
      const response = await workerAPI.getWorkerById(id);
      return response.data.data.worker;
    } catch (error) {
      console.error(`Error fetching worker with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get current worker profile (for worker accounts)
   * @returns {Promise} Promise object with worker profile data
   */
  getWorkerProfile: async () => {
    try {
      const response = await workerAPI.getWorkerProfile();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      throw error;
    }
  },

  /**
   * Update worker profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Promise object with updated worker data
   */
  updateWorkerProfile: async (profileData) => {
    try {
      const response = await workerAPI.updateWorkerProfile(profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating worker profile:', error);
      throw error;
    }
  },

  /**
   * Get worker bookings
   * @returns {Promise} Promise object with worker bookings
   */
  getWorkerBookings: async () => {
    try {
      const response = await workerAPI.getWorkerBookings();
      return response.data.data.bookings;
    } catch (error) {
      console.error('Error fetching worker bookings:', error);
      throw error;
    }
  },

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (accepted, rejected, completed)
   * @returns {Promise} Promise object with updated booking
   */
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await workerAPI.updateBookingStatus(bookingId, status);
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status:`, error);
      throw error;
    }
  },

  /**
   * Get worker earnings
   * @returns {Promise} Promise object with worker earnings data
   */
  getWorkerEarnings: async () => {
    try {
      const response = await workerAPI.getWorkerEarnings();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching worker earnings:', error);
      throw error;
    }
  },

  /**
   * Manually translate worker data if automatic translation failed or is needed
   * This is a utility function for components that need to translate data locally
   * @param {Object} workerData - Worker data to translate
   * @returns {Promise<Object>} Translated worker data
   */
  translateWorkerData: async (workerData) => {
    if (!workerData) return workerData;
    return await translateIfNeeded(workerData);
  },

  /**
   * Get nearby workers with translation support
   * @param {Object} filters - Location filters
   * @returns {Promise<Array>} Array of nearby workers with translated data
   */
  getNearbyWorkers: async (filters = {}) => {
    try {
      const response = await workerAPI.getAllWorkers({
        ...filters,
        nearby: true
      });
      
      return response.data.data.workers;
    } catch (error) {
      console.error('Error fetching nearby workers:', error);
      throw error;
    }
  },

  /**
   * Search workers by skills or profession with translation support
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching workers with translated data
   */
  searchWorkers: async (query) => {
    try {
      const response = await workerAPI.getAllWorkers({ search: query });
      return response.data.data.workers;
    } catch (error) {
      console.error('Error searching workers:', error);
      throw error;
    }
  }
};

export default WorkerService;