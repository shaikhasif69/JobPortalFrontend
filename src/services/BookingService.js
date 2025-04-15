// src/services/BookingService.js
import { bookingAPI, paymentAPI } from './api';

export const BookingService = {
  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Promise object with booking data
   */
  getBookingById: async (bookingId) => {
    try {
      const response = await bookingAPI.getBookingById(bookingId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch booking');
      }
      
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error fetching booking with ID ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Update booking
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise} Promise object with updated booking
   */
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await bookingAPI.updateBooking(bookingId, bookingData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update booking');
      }
      
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error updating booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Mark booking as completed by worker
   * @param {string} bookingId - Booking ID
   * @param {Object} completionData - Optional completion details
   * @returns {Promise} Promise object with updated booking
   */
  markBookingCompleted: async (bookingId, completionData = {}) => {
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, 'completed', completionData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark booking as completed');
      }
      
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error marking booking ${bookingId} as completed:`, error);
      throw error;
    }
  },

  /**
   * Confirm booking completion by customer and leave review
   * @param {string} bookingId - Booking ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise} Promise object with updated booking
   */
  confirmBookingCompletion: async (bookingId, reviewData) => {
    try {
      const response = await bookingAPI.confirmBookingCompletion(bookingId, reviewData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to confirm booking completion');
      }
      
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error confirming booking ${bookingId} completion:`, error);
      throw error;
    }
  },

  /**
   * Process payment for a completed booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Promise object with payment details
   */
  processPaymentForBooking: async (bookingId) => {
    try {
      const response = await paymentAPI.processPayment(bookingId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process payment');
      }
      
      return response.data.data.payment;
    } catch (error) {
      console.error(`Error processing payment for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Calculate booking cost based on worker hourly rate and duration
   * @param {number} hourlyRate - Worker's hourly rate
   * @param {string} startTime - Booking start time (HH:MM format)
   * @param {string} endTime - Booking end time (HH:MM format)
   * @returns {Object} Object containing totalAmount, duration, and commission
   */
  calculateBookingCost: (hourlyRate, startTime, endTime) => {
    // Convert times to Date objects for calculation
    const start = new Date(`2025-01-01T${startTime}`);
    const end = new Date(`2025-01-01T${endTime}`);
    
    // Calculate duration in hours
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate total amount
    const totalAmount = hourlyRate * durationHours;
    
    // Assume 10% commission (in a real app, this would come from API)
    const commissionRate = 0.1;
    const commission = totalAmount * commissionRate;
    
    return {
      totalAmount: Math.round(totalAmount),
      workerAmount: Math.round(totalAmount - commission),
      commission: Math.round(commission),
      duration: durationHours
    };
  }
};

export default BookingService;