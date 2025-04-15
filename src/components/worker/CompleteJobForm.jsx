import React, { useState } from 'react';
import BookingService from '../../services/BookingService';
import LoadingSpinner from '../LoadingSpinner';
import ErrorHandler from '../ErrorHandler';

const CompleteJobForm = ({ booking, onComplete, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(
    booking.estimatedHours || 
    calculateHours(booking.startTime, booking.endTime)
  );

  // Calculate hours between start and end time
  function calculateHours(startTime, endTime) {
    if (!startTime || !endTime) return 2; // Default value
    
    const start = new Date(`2023-01-01T${startTime}`);
    const end = new Date(`2023-01-01T${endTime}`);
    
    // Calculate duration in hours
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.max(1, Math.round(durationHours));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare completion data
      const completionData = {
        notes,
        actualHours: hours
      };
      
      // Call API to mark booking as completed
      const updatedBooking = await BookingService.markBookingCompleted(
        booking._id,
        completionData
      );
      
      // Notify parent component
      if (onComplete) {
        onComplete(updatedBooking);
      }
    } catch (err) {
      console.error('Error completing job:', err);
      setError(err.message || 'Failed to mark job as complete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">Complete Job</h5>
      </div>
      <div className="card-body">
        {error && (
          <ErrorHandler 
            error={error} 
            showRetry={false}
            className="mb-3"
          />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Job Details</label>
            <div className="card bg-light mb-3">
              <div className="card-body">
                <p className="mb-1"><strong>Customer:</strong> {booking.customerName}</p>
                <p className="mb-1"><strong>Service:</strong> {booking.service}</p>
                <p className="mb-1"><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p className="mb-0"><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="actualHours" className="form-label">Actual Hours Worked*</label>
            <input
              type="number"
              id="actualHours"
              className="form-control"
              value={hours}
              onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              step="0.5"
              required
            />
            <div className="form-text">Enter the actual number of hours worked (min: 1 hour)</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="completionNotes" className="form-label">Completion Notes</label>
            <textarea
              id="completionNotes"
              className="form-control"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work completed (optional)"
            ></textarea>
          </div>
          
          <div className="alert alert-info">
            <i className="bi bi-info-circle-fill me-2"></i>
            After marking this job as complete, the customer will be notified to confirm completion and process payment.
          </div>
          
          <div className="d-flex justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Mark Job Complete
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteJobForm;