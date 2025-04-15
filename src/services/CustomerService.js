// src/services/CustomerService.js
import { customerAPI } from './api';

export const CustomerService = {
  /**
   * Get customer profile
   * @returns {Promise} Promise object with customer profile data
   */
  getCustomerProfile: async () => {
    try {
      const response = await customerAPI.getCustomerProfile();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw error;
    }
  },

  /**
   * Update customer profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Promise object with updated customer data
   */
  updateCustomerProfile: async (profileData) => {
    try {
      const response = await customerAPI.updateCustomerProfile(profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating customer profile:', error);
      throw error;
    }
  },

  /**
   * Add a new address
   * @param {Object} address - Address data to add
   * @returns {Promise} Promise object with updated addresses list
   */
  addAddress: async (address) => {
    try {
      const response = await customerAPI.addAddress(address);
      return response.data.data.addresses;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  /**
   * Update an existing address
   * @param {string} addressId - Address ID
   * @param {Object} address - Updated address data
   * @returns {Promise} Promise object with updated addresses list
   */
  updateAddress: async (addressId, address) => {
    try {
      const response = await customerAPI.updateAddress(addressId, address);
      return response.data.data.addresses;
    } catch (error) {
      console.error(`Error updating address ${addressId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an address
   * @param {string} addressId - Address ID to delete
   * @returns {Promise} Promise object with updated addresses list
   */
  deleteAddress: async (addressId) => {
    try {
      const response = await customerAPI.deleteAddress(addressId);
      return response.data.data.addresses;
    } catch (error) {
      console.error(`Error deleting address ${addressId}:`, error);
      throw error;
    }
  },

  /**
   * Get customer bookings
   * @returns {Promise} Promise object with customer bookings
   */
  getCustomerBookings: async () => {
    try {
      const response = await customerAPI.getCustomerBookings();
      return response.data.data.bookings;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  },

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise} Promise object with created booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await customerAPI.createBooking(bookingData);
      return response.data.data.booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID to cancel
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Promise object with updated booking
   */
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await customerAPI.cancelBooking(bookingId, reason);
      return response.data.data.booking;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  }
};

export default CustomerService;