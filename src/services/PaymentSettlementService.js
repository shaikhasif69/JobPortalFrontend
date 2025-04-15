// src/services/PaymentSettlementService.js
import api from './api';

const PaymentSettlementService = {
  /**
   * Process payment for a completed booking
   * @param {string} bookingId - ID of the completed booking
   * @returns {Promise} Promise object with payment result
   */
  processPaymentForCompletedBooking: async (bookingId) => {
    try {
      const response = await api.post('/payments/process', { bookingId });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process payment');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error processing payment for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get payment status for a booking
   * @param {string} bookingId - ID of the booking
   * @returns {Promise} Promise object with payment status
   */
  getPaymentStatus: async (bookingId) => {
    try {
      const response = await api.get(`/payments/status/${bookingId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get payment status');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error getting payment status for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Confirm job completion by customer
   * @param {string} bookingId - ID of the booking
   * @param {Object} reviewData - Optional review data (rating, comment)
   * @returns {Promise} Promise object with confirmation result
   */
  confirmJobCompletion: async (bookingId, reviewData = null) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm-completion`, reviewData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to confirm job completion');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error confirming job completion for booking ${bookingId}:`, error);
      throw error;
    }
  }
};

export default PaymentSettlementService;