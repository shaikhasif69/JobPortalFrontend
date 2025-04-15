import React, { useState } from 'react';
import BookingService from '../../services/BookingService';
import PaymentSettlementService from '../../services/PaymentSettlementService';
import LoadingSpinner from '../LoadingSpinner';
import ErrorHandler from '../ErrorHandler';

const JobConfirmationForm = ({ booking, onConfirm, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('review'); // 'review', 'payment', 'success'
  const [paymentResult, setPaymentResult] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare review data
      const reviewData = {
        rating,
        comment: review
      };
      
      // Call API to confirm job completion
      const confirmedBooking = await BookingService.confirmBookingCompletion(
        booking._id,
        reviewData
      );
      
      // Move to payment step
      setCurrentStep('payment');
      
      // Process payment automatically
      await processPayment(confirmedBooking._id);
    } catch (err) {
      console.error('Error confirming job completion:', err);
      setError(err.message || 'Failed to confirm job completion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (bookingId) => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Process payment for the booking
      const payment = await PaymentSettlementService.processPaymentForCompletedBooking(bookingId);
      
      // Set payment result for display
      setPaymentResult(payment);
      
      // Move to success step
      setCurrentStep('success');
      
      // Notify parent component
      if (onConfirm) {
        onConfirm(payment);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
      
      // Go back to review step on error
      setCurrentStep('review');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Render star rating component
  const renderStarRating = () => {
    return (
      <div className="mb-3">
        <label className="form-label">Rating*</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
              role="button"
            >
              <i className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} fs-3 text-warning`}></i>
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Review Step
  const renderReviewStep = () => {
    return (
      <form onSubmit={handleSubmitReview}>
        <div className="mb-3">
          <label className="form-label">Job Details</label>
          <div className="card bg-light mb-3">
            <div className="card-body">
              <p className="mb-1"><strong>Worker:</strong> {booking.workerName}</p>
              <p className="mb-1"><strong>Service:</strong> {booking.service}</p>
              <p className="mb-1"><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p className="mb-0"><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
            </div>
          </div>
        </div>
        
        {renderStarRating()}
        
        <div className="mb-3">
          <label htmlFor="reviewComment" className="form-label">Review (Optional)</label>
          <textarea
            id="reviewComment"
            className="form-control"
            rows="3"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with the service..."
          ></textarea>
        </div>
        
        <div className="alert alert-info">
          <i className="bi bi-info-circle-fill me-2"></i>
          By confirming job completion, you agree that the work has been completed satisfactorily and authorize payment to be processed.
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
                Confirm Completion & Process Payment
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Payment Processing Step
  const renderPaymentStep = () => {
    return (
      <div className="text-center py-4">
        <div className="mb-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Processing payment...</span>
          </div>
        </div>
        <h4>Processing Payment</h4>
        <p className="text-muted">Please wait while we process your payment...</p>
      </div>
    );
  };

  // Success Step
  const renderSuccessStep = () => {
    return (
      <div className="text-center py-4">
        <div className="bg-success text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
          <i className="bi bi-check-lg fs-1"></i>
        </div>
        
        <h4 className="mb-4">Payment Successful!</h4>
        
        <div className="card mb-4">
          <div className="card-body">
            <div className="row text-start">
              <div className="col-md-6">
                <p className="mb-1"><strong>Transaction ID:</strong></p>
                <p className="mb-3">{paymentResult?.paymentId || 'N/A'}</p>
                
                <p className="mb-1"><strong>Service:</strong></p>
                <p className="mb-3">{booking.service}</p>
                
                <p className="mb-1"><strong>Worker:</strong></p>
                <p className="mb-0">{booking.workerName}</p>
              </div>
              
              <div className="col-md-6">
                <p className="mb-1"><strong>Amount Paid:</strong></p>
                <p className="mb-3">₹{paymentResult?.amount || booking.totalAmount || 0}</p>
                
                <p className="mb-1"><strong>Payment Date:</strong></p>
                <p className="mb-3">{new Date().toLocaleDateString()}</p>
                
                <p className="mb-1"><strong>Status:</strong></p>
                <p className="mb-0">
                  <span className="badge bg-success">Completed</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-muted mb-4">
          Thank you for using our service! A receipt has been sent to your email.
        </p>
        
        <button 
          className="btn btn-primary" 
          onClick={onCancel}
        >
          Back to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          {currentStep === 'review' && 'Confirm Job Completion'}
          {currentStep === 'payment' && 'Processing Payment'}
          {currentStep === 'success' && 'Payment Successful'}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <ErrorHandler 
            error={error} 
            showRetry={false}
            className="mb-3"
          />
        )}
        
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};

export default JobConfirmationForm;