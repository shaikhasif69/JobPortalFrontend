import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerService from '../services/workerService';
import CustomerService from '../services/CustomerService';
import BookingService from '../services/BookingService';

function BookWorker() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState({
    worker: true,
    addresses: true,
    submit: false
  });
  const [error, setError] = useState(null);
  const [bookingStep, setBookingStep] = useState('form'); // form, payment, success
  
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: ''
    },
    jobDescription: '',
    notes: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  
  const [bookingResult, setBookingResult] = useState(null);
  
  // Fetch worker data and customer addresses
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch worker details
        const workerData = await WorkerService.getWorkerById(workerId);
        setWorker(workerData);
        setLoading(prev => ({ ...prev, worker: false }));
        
        // Set default booking times
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate() + 1).padStart(2, '0'); // Tomorrow
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        setBookingData(prev => ({
          ...prev,
          date: formattedDate,
          startTime: '10:00',
          endTime: '12:00',
        }));
        
        // Fetch customer addresses
        const customerData = await CustomerService.getCustomerProfile();
        if (customerData.customer && customerData.customer.addresses) {
          setAddresses(customerData.customer.addresses);
          
          // Set default address if available
          if (customerData.customer.addresses.length > 0) {
            const firstAddress = customerData.customer.addresses[0];
            setBookingData(prev => ({
              ...prev,
              address: {
                addressLine1: firstAddress.addressLine1 || '',
                addressLine2: firstAddress.addressLine2 || '',
                city: firstAddress.city || '',
                state: firstAddress.state || '',
                pincode: firstAddress.pincode || '',
              }
            }));
          }
        }
        setLoading(prev => ({ ...prev, addresses: false }));
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load necessary data. Please try again later.');
        setLoading({
          worker: false,
          addresses: false,
          submit: false
        });
      }
    };
    
    fetchInitialData();
  }, [workerId]);
  
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressSelect = (e) => {
    const selectedAddressId = e.target.value;
    
    if (selectedAddressId === 'new') {
      setBookingData(prev => ({
        ...prev,
        address: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: ''
        }
      }));
    } else {
      const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
      if (selectedAddress) {
        setBookingData(prev => ({
          ...prev,
          address: {
            addressLine1: selectedAddress.addressLine1 || '',
            addressLine2: selectedAddress.addressLine2 || '',
            city: selectedAddress.city || '',
            state: selectedAddress.state || '',
            pincode: selectedAddress.pincode || '',
          }
        }));
      }
    }
  };
  
  const calculateBookingCost = () => {
    if (!bookingData.startTime || !bookingData.endTime || !worker)
      return { totalAmount: 0, duration: 0, workerAmount: 0, commission: 0 };
    
    // Use the BookingService to calculate cost
    return BookingService.calculateBookingCost(
      worker.hourlyRate || 500,
      bookingData.startTime,
      bookingData.endTime
    );
  };
  
  const validateBookingForm = () => {
    const errors = [];
    
    if (!bookingData.date) errors.push('Please select a date');
    if (!bookingData.startTime) errors.push('Please select a start time');
    if (!bookingData.endTime) errors.push('Please select an end time');
    if (bookingData.startTime >= bookingData.endTime) errors.push('End time must be after start time');
    if (!bookingData.address.addressLine1) errors.push('Please enter an address');
    if (!bookingData.address.city) errors.push('Please enter a city');
    if (!bookingData.address.state) errors.push('Please enter a state');
    if (!bookingData.address.pincode) errors.push('Please enter a pincode');
    if (!bookingData.jobDescription) errors.push('Please describe the job');
    
    return errors;
  };
  
  const validatePaymentForm = () => {
    const errors = [];
    
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) 
      errors.push('Please enter a valid card number');
    if (!paymentData.cardName) errors.push('Please enter the name on card');
    if (!paymentData.expiry || !/^\d{2}\/\d{2}$/.test(paymentData.expiry)) 
      errors.push('Please enter a valid expiry date (MM/YY)');
    if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) 
      errors.push('Please enter a valid CVV');
    
    return errors;
  };
  
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateBookingForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    
    try {
      // Prepare booking data
      const bookingRequestData = {
        workerId: workerId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        address: bookingData.address,
        jobDescription: bookingData.jobDescription,
        notes: bookingData.notes
      };
      
      // Create booking
      const booking = await CustomerService.createBooking(bookingRequestData);
      
      // Move to payment step
      setBookingResult(booking);
      setBookingStep('payment');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validatePaymentForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    
    try {
      // This is a simulation, so we're not making a real payment
      // In a real app, this would integrate with a payment gateway
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process payment (in real app, this would call a payment gateway)
      const paymentResult = await BookingService.processPayment({
        bookingId: bookingResult._id,
        amount: calculateBookingCost().totalAmount,
        paymentMethod: 'card',
        // Note: In a real app, you would never send full card details to your backend
        // Instead, you'd use a payment gateway token
        cardDetails: {
          // Only store last 4 digits for reference
          lastFour: paymentData.cardNumber.slice(-4)
        }
      });
      
      // Move to success step
      setBookingStep('success');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  if (loading.worker) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading worker details...</p>
      </div>
    );
  }
  
  if (!worker) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p>Worker not found. Please try again or select another worker.</p>
          <hr />
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/customer')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const { totalAmount, duration, workerAmount, commission } = calculateBookingCost();
  
  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            {bookingStep === 'form' && 'Book a Service'}
            {bookingStep === 'payment' && 'Payment Details'}
            {bookingStep === 'success' && 'Booking Confirmed'}
          </h3>
        </div>
        
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          
          {/* Worker information */}
          {bookingStep === 'form' && (
            <div className="row mb-4">
              <div className="col-md-8">
                <h4>{worker.user?.name || 'Worker'}</h4>
                <p className="mb-1">
                  <span className="badge bg-primary me-2">{worker.profession?.name || 'Service Provider'}</span>
                  <span className="badge bg-light text-dark me-2">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {worker.avgRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="badge bg-light text-dark">
                    ₹{worker.hourlyRate || '500'}/hr
                  </span>
                </p>
                <p className="text-muted mb-0">{worker.profession?.description || 'Professional service provider.'}</p>
              </div>
              <div className="col-md-4 text-md-end">
                {worker.isVerified && (
                  <div className="mb-2">
                    <span className="badge bg-success">
                      <i className="bi bi-patch-check-fill me-1"></i> Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Booking Form */}
          {bookingStep === 'form' && (
            <form onSubmit={handleSubmitBooking}>
              <h5 className="mb-3">Service Details</h5>
              
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Service Date*</label>
                  <input 
                    type="date" 
                    className="form-control"
                    name="date"
                    value={bookingData.date}
                    onChange={handleBookingInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Start Time*</label>
                  <input 
                    type="time" 
                    className="form-control"
                    name="startTime"
                    value={bookingData.startTime}
                    onChange={handleBookingInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Time*</label>
                  <input 
                    type="time" 
                    className="form-control"
                    name="endTime"
                    value={bookingData.endTime}
                    onChange={handleBookingInputChange}
                    required
                  />
                </div>
              </div>
              
              {addresses.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Select an address</label>
                  <select 
                    className="form-select"
                    onChange={handleAddressSelect}
                  >
                    <option value="">-- Select address --</option>
                    {addresses.map(address => (
                      <option key={address._id} value={address._id}>
                        {address.type}: {address.addressLine1}, {address.city}
                      </option>
                    ))}
                    <option value="new">Add a new address</option>
                  </select>
                </div>
              )}
              
              <div className="card mb-3">
                <div className="card-header">Service Address*</div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Address Line 1*"
                        name="address.addressLine1"
                        value={bookingData.address.addressLine1}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Address Line 2"
                        name="address.addressLine2"
                        value={bookingData.address.addressLine2}
                        onChange={handleBookingInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="City*"
                        name="address.city"
                        value={bookingData.address.city}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="State*"
                        name="address.state"
                        value={bookingData.address.state}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Pincode*"
                        name="address.pincode"
                        value={bookingData.address.pincode}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Job Description*</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Describe what you need help with"
                  name="jobDescription"
                  value={bookingData.jobDescription}
                  onChange={handleBookingInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Additional Notes</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  placeholder="Any special instructions or information"
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                ></textarea>
              </div>
              
              <div className="card mb-4">
                <div className="card-header">Price Estimate</div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Hourly Rate:</span>
                    <span>₹{worker.hourlyRate || 500}/hr</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Duration:</span>
                    <span>{duration.toFixed(1)} hours</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Estimated Total:</span>
                    <span className="fw-bold">₹{totalAmount}</span>
                  </div>
                  
                  <div className="small text-muted mt-2">
                    * Final amount may vary based on actual time spent and materials required.
                  </div>
                </div>
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/customer')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading.submit}
                >
                  {loading.submit ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : 'Continue to Payment'}
                </button>
              </div>
            </form>
          )}
          
          {/* Payment Form */}
          {bookingStep === 'payment' && (
            <form onSubmit={handleSubmitPayment}>
              <div className="row mb-4">
                <div className="col-md-8">
                  <h5>Booking Summary</h5>
                  <p className="mb-1">
                    <strong>Service:</strong> {worker.profession?.name || 'Service'}
                  </p>
                  <p className="mb-1">
                    <strong>Worker:</strong> {worker.user?.name || 'Worker'}
                  </p>
                  <p className="mb-1">
                    <strong>Date & Time:</strong> {new Date(bookingData.date).toLocaleDateString()} at {bookingData.startTime} - {bookingData.endTime}
                  </p>
                  <p className="mb-0">
                    <strong>Address:</strong> {bookingData.address.addressLine1}, {bookingData.address.city}, {bookingData.address.state} - {bookingData.address.pincode}
                  </p>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">Payment Amount</h6>
                      <h4 className="card-text mb-0">₹{totalAmount}</h4>
                    </div>
                  </div>
                </div>
              </div>
              
              <h5 className="mb-3">Payment Information</h5>
              
              <div className="mb-3">
                <label className="form-label">Card Number*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="1234 5678 9012 3456"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentInputChange}
                  maxLength="16"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Name on Card*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe"
                  name="cardName"
                  value={paymentData.cardName}
                  onChange={handlePaymentInputChange}
                  required
                />
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Expiry Date (MM/YY)*</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="MM/YY"
                    name="expiry"
                    value={paymentData.expiry}
                    onChange={handlePaymentInputChange}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">CVV*</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="123"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentInputChange}
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle-fill me-2"></i>
                This is a simulation. No actual payment will be processed and any card details entered will not be stored.
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setBookingStep('form')}
                  disabled={loading.submit}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading.submit}
                >
                  {loading.submit ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing Payment...
                    </>
                  ) : `Pay ₹${totalAmount}`}
                </button>
              </div>
            </form>
          )}
          
          {/* Success Page */}
          {bookingStep === 'success' && (
            <div className="text-center py-4">
              <div className="bg-success text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              
              <h4 className="mb-4">Booking Confirmed!</h4>
              
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Booking ID:</strong></p>
                      <p className="mb-3">{bookingResult?.bookingId || bookingResult?._id || 'TMP-12345'}</p>
                      
                      <p className="mb-1"><strong>Service:</strong></p>
                      <p className="mb-3">{worker.profession?.name || 'Service'}</p>
                      
                      <p className="mb-1"><strong>Professional:</strong></p>
                      <p className="mb-0">{worker.user?.name || 'Worker'}</p>
                    </div>
                    
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Date & Time:</strong></p>
                      <p className="mb-3">
                        {new Date(bookingData.date).toLocaleDateString()} at {bookingData.startTime} - {bookingData.endTime}
                      </p>
                      
                      <p className="mb-1"><strong>Total Amount:</strong></p>
                      <p className="mb-3">₹{totalAmount}</p>
                      
                      <p className="mb-1"><strong>Status:</strong></p>
                      <p className="mb-0">
                        <span className="badge bg-warning">Pending Worker Confirmation</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-muted mb-4">
                We've notified the worker about your booking. 
                You'll receive an update once they confirm.
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/customer/bookings')}
                >
                  View My Bookings
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => navigate('/customer')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookWorker;