import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import DashboardHeader from '../components/DashboardHeader';
import QuickActions from '../components/QuickActions';
import ServiceCategories from '../components/ServiceCategories';
import NearbyWorkers from '../components/NearbyWorkers';
import BookingsList from '../components/BookingsList';

// Mock data for demonstration
const mockBookings = [
  { id: 1, service: 'Plumbing', worker: 'Rajesh Kumar', date: '2025-04-01', time: '10:00 AM', status: 'Scheduled' },
  { id: 2, service: 'Electrical', worker: 'Sunil Verma', date: '2025-03-30', time: '02:00 PM', status: 'Completed' },
  { id: 3, service: 'Carpentry', worker: 'Amit Singh', date: '2025-03-28', time: '11:30 AM', status: 'Cancelled' }
];

const mockNearbyWorkers = [
  { id: 101, name: 'Vikram Mehta', profession: 'Plumber', rating: 4.8, distance: '2.3 km' },
  { id: 102, name: 'Priya Joshi', profession: 'Electrician', rating: 4.9, distance: '3.5 km' },
  { id: 103, name: 'Sandeep Patel', profession: 'Carpenter', rating: 4.7, distance: '1.8 km' }
];

function CustomerDashboard() {
  const [customerProfile, setCustomerProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [workerFilter, setWorkerFilter] = useState({
    profession: '',
    page: 1,
    limit: 10
  });

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
  const [bookingStep, setBookingStep] = useState('view'); // 'view', 'book', 'success', 'error'
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
  
  const handleCreateBooking = async () => {
    if (!selectedWorker) return;
    
    // Basic validation
    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime || 
        !bookingData.address.addressLine1 || !bookingData.address.city || 
        !bookingData.address.state || !bookingData.address.pincode || 
        !bookingData.jobDescription) {
      setBookingError('Please fill in all required fields');
      return;
    }
    
    setBookingLoading(true);
    setBookingError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        workerId: selectedWorker.id,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        address: bookingData.address,
        jobDescription: bookingData.jobDescription,
        notes: bookingData.notes
      };
      
      const response = await axios.post(
        'https://blue-collar-job-backend.vercel.app/api/customers/bookings',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const booking = response.data.data.booking;
        setBookingResult({
          bookingId: booking.bookingId,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalAmount: booking.totalAmount,
          status: booking.status
        });
        setBookingStep('success');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.response?.data?.message || 'Failed to create booking. Please try again.');
      setBookingStep('error');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateEstimatedCost = () => {
    if (!bookingData.startTime || !bookingData.endTime || !selectedWorker) return 0;
    
    const start = new Date(`2025-01-01T${bookingData.startTime}`);
    const end = new Date(`2025-01-01T${bookingData.endTime}`);
    const diff = (end - start) / (1000 * 60 * 60);
    return (diff * (selectedWorker.hourlyRate || 0)).toFixed(0);
  };
  
  const handleBookWorker = (workerId) => {
    if (addresses.length > 0) {
      const firstAddress = addresses[0];
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
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    setBookingData(prev => ({
      ...prev,
      date: formattedDate,
      startTime: '10:00',
      endTime: '12:00',
    }));
    
    setBookingStep('book');
  };
  
  const resetBookingModal = () => {
    setBookingStep('view');
    setBookingError('');
    setBookingResult(null);
  };
  
  const cancelBooking = async (bookingId) => {
    if (!cancellationReason) {
      alert('Please provide a cancellation reason');
      return;
    }

    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://blue-collar-job-backend.vercel.app/api/customers/bookings/${bookingId}/cancel`,
        { cancellationReason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchBookings();
        setCancellingBookingId(null);
        setCancellationReason('');
        alert('Booking cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [editingAddress, setEditingAddress] = useState(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    language: 'english',
    notifications: {
      email: true,
      sms: true,
      app: true
    }
  });

  // Worker Detail Modal State
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [isLoadingWorker, setIsLoadingWorker] = useState(false);
  
  // View All Workers State
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allWorkersLoading, setAllWorkersLoading] = useState(false);
  const [workersPage, setWorkersPage] = useState(1);
  const [hasMoreWorkers, setHasMoreWorkers] = useState(true);

  const { user, logout } = useAuth();

  // Fetch Data on Component Mount
  useEffect(() => {
    fetchCustomerProfile();
    fetchBookings();
    fetchNearbyWorkers();
    fetchAddresses();
  }, []);

  // Fetch Customer Profile
  const fetchCustomerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://blue-collar-job-backend.vercel.app/api/customers/profile', 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { customer, stats } = response.data.data;
        setCustomerProfile({ ...customer, stats });
        
        setFormData({
          name: customer.user.name,
          email: customer.user.email,
          phone: customer.user.phone,
          address: customer.addresses.length > 0 ? customer.addresses[0] : '',
          language: customer.preferences.language,
          notifications: customer.preferences.notifications
        });
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://blue-collar-job-backend.vercel.app/api/customers/bookings',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const formattedBookings = response.data.data.bookings.map(booking => ({
          id: booking._id,
          bookingId: booking.bookingId,
          service: booking.profession?.name || 'Service',
          worker: booking.workerProfile?.user?.name || 'Worker',
          date: new Date(booking.date).toISOString().split('T')[0],
          time: `${booking.startTime} - ${booking.endTime}`,
          status: booking.status,
          totalAmount: booking.totalAmount,
          paymentStatus: booking.paymentStatus,
          jobDescription: booking.jobDescription,
          address: booking.address,
          cancellationReason: booking.cancellationReason
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings(mockBookings);
    }
  };

  // Fetch Nearby Workers
  const fetchNearbyWorkers = () => {
    setNearbyWorkers(mockNearbyWorkers);
  };

  // Fetch All Workers (paginated)
  const fetchAllWorkers = async (resetList = false) => {
    setAllWorkersLoading(true);
    const pageToFetch = resetList ? 1 : workersPage;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://blue-collar-job-backend.vercel.app/api/workers', 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            page: pageToFetch,
            limit: 10,
            ...(workerFilter.profession && { profession: workerFilter.profession })
          }
        }
      );

      if (response.data.success) {
        const workers = response.data.data.workers.map(worker => ({
          id: worker._id,
          _id: worker._id,
          name: worker.user?.name || 'Unknown',
          profession: worker.profession?.name || 'General',
          rating: worker.avgRating || 0,
          distance: 'Variable',
          phone: worker.user?.phone || '',
          hourlyRate: worker.hourlyRate || worker.profession?.defaultHourlyRate || 0,
          experience: worker.experience || 0,
          isAvailableNow: worker.isAvailableNow || false,
          availability: worker.availability,
          user: worker.user,
          skills: worker.skills || []
        }));
        
        if (resetList) {
          setAllWorkers(workers);
          setWorkersPage(2);
        } else {
          setAllWorkers(prev => [...prev, ...workers]);
          setWorkersPage(prev => prev + 1);
        }
        
        setHasMoreWorkers(workers.length === 10);
      }
    } catch (error) {
      console.error('Error fetching all workers:', error);
      if (resetList) {
        setAllWorkers(mockNearbyWorkers);
      }
    } finally {
      setAllWorkersLoading(false);
    }
  };

  // Fetch Single Worker Details
  const fetchWorkerDetails = async (workerId) => {
    setIsLoadingWorker(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://blue-collar-job-backend.vercel.app/api/workers/${workerId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const worker = response.data.data.worker;
        const formattedWorker = {
          id: worker._id,
          _id: worker._id,
          user: worker.user,
          profession: worker.profession || { name: 'General' },
          experience: worker.experience || 0,
          avgRating: worker.avgRating || 0,
          totalJobs: worker.totalCompletedJobs || 0,
          hourlyRate: worker.hourlyRate || (worker.profession?.defaultHourlyRate || 0),
          skills: worker.skills || [],
          description: worker.profession?.description || 'Experienced professional with attention to detail.',
          availability: worker.availability,
          isAvailableNow: worker.isAvailableNow,
          isVerified: worker.isVerified
        };
        
        setSelectedWorker(formattedWorker);
        setShowWorkerModal(true);
        return formattedWorker;
      }
    } catch (error) {
      console.error('Error fetching worker details:', error);
      const fallbackWorker = {
        id: workerId,
        user: { name: 'Worker Name', phone: '1234567890', email: 'worker@example.com' },
        profession: { name: 'Profession' },
        experience: 5,
        avgRating: 4.5,
        totalJobs: 42,
        hourlyRate: 500,
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
        description: 'Experienced professional with attention to detail.',
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeStart: '09:00',
          availableTimeEnd: '18:00'
        }
      };
      setSelectedWorker(fallbackWorker);
      setShowWorkerModal(true);
    } finally {
      setIsLoadingWorker(false);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://blue-collar-job-backend.vercel.app/api/customers/address', 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Add New Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://blue-collar-job-backend.vercel.app/api/customers/address', 
        newAddress,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        setNewAddress({
          type: 'home',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: ''
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  // Update Address
  const handleUpdateAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `https://blue-collar-job-backend.vercel.app/api/customers/address/${addressId}`, 
        editingAddress,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        setEditingAddress(null);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `https://blue-collar-job-backend.vercel.app/api/customers/address/${addressId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  // Profile Update Handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'https://blue-collar-job-backend.vercel.app/api/customers/profile', 
        {
          user: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          addresses: formData.address ? [formData.address] : [],
          preferences: {
            language: formData.language,
            notifications: formData.notifications
          }
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        alert('Profile updated successfully!');
        fetchCustomerProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
      alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    }
  };

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationType]: type === 'checkbox' ? checked : value
        }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Tab Change Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'workers' && allWorkers.length === 0) {
      fetchAllWorkers(true);
    }
  };

  // View All Workers Handler
  const handleViewAllWorkers = () => {
    setShowAllWorkers(true);
    if (allWorkers.length === 0) {
      fetchAllWorkers(true);
    }
  };

  // Filter Workers by Profession
  const handleWorkerFilter = (profession) => {
    setWorkerFilter(prev => ({
      ...prev,
      profession: profession === prev.profession ? '' : profession,
      page: 1
    }));
    
    if (activeTab === 'workers') {
      fetchAllWorkers(true);
    } else {
      fetchNearbyWorkers();
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <DashboardHeader 
        customerName={customerProfile?.user?.name || 'Customer'} 
      />
      
      {/* Tabs Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} 
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'workers' ? 'active' : ''}`} 
                onClick={() => handleTabChange('workers')}
              >
                All Workers
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('bookings')}
              >
                My Bookings
                {customerProfile?.stats?.totalBookings > 0 && (
                  <span className="badge bg-primary ms-2">
                    {customerProfile.stats.totalBookings}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('settings')}
              >
                Profile Settings
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Home Tab */}
      {activeTab === 'home' && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title">Find Services</h5>
                  <div className="input-group mb-3">
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      placeholder="Search for services..." 
                    />
                    <button className="btn btn-primary" type="button">
                      <i className="bi bi-search"></i> Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <h4>Services</h4>
              <ServiceCategories />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Nearby Professionals</h4>
                <div className="btn-group">
                  <button 
                    className={`btn ${workerFilter.profession === '' ? 'btn-primary' : 'btn-outline-primary'}`} 
                    onClick={() => handleWorkerFilter('')}
                  >
                    All
                  </button>
                  <button 
                    className={`btn ${workerFilter.profession === 'Plumber' ? 'btn-primary' : 'btn-outline-primary'}`} 
                    onClick={() => handleWorkerFilter('Plumber')}
                  >
                    Plumbers
                  </button>
                  <button 
                    className={`btn ${workerFilter.profession === 'Electrician' ? 'btn-primary' : 'btn-outline-primary'}`} 
                    onClick={() => handleWorkerFilter('Electrician')}
                  >
                    Electricians
                  </button>
                </div>
              </div>
              <NearbyWorkers workers={nearbyWorkers} />
              
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => handleTabChange('workers')}
                >
                  View All Workers <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4">
              <h4>Quick Actions</h4>
              <QuickActions />
            </div>
          </div>
        </>
      )}
      
      {/* All Workers Tab */}
      {activeTab === 'workers' && (
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Available Professionals</h4>
                  <div className="btn-group">
                    <button 
                      className={`btn ${workerFilter.profession === '' ? 'btn-primary' : 'btn-outline-primary'}`} 
                      onClick={() => handleWorkerFilter('')}
                    >
                      All
                    </button>
                    <button 
                      className={`btn ${workerFilter.profession === 'Plumber' ? 'btn-primary' : 'btn-outline-primary'}`} 
                      onClick={() => handleWorkerFilter('Plumber')}
                    >
                      Plumbers
                    </button>
                    <button 
                      className={`btn ${workerFilter.profession === 'Electrician' ? 'btn-primary' : 'btn-outline-primary'}`} 
                      onClick={() => handleWorkerFilter('Electrician')}
                    >
                      Electricians
                    </button>
                    <button 
                      className={`btn ${workerFilter.profession === 'Carpenter' ? 'btn-primary' : 'btn-outline-primary'}`} 
                      onClick={() => handleWorkerFilter('Carpenter')}
                    >
                      Carpenters
                    </button>
                  </div>
                </div>

                <div className="row g-3">
                  {allWorkersLoading && allWorkers.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading workers...</p>
                    </div>
                  ) : allWorkers.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <i className="bi bi-search fs-1 text-muted"></i>
                      <p className="mt-2">No workers found matching your criteria.</p>
                    </div>
                  ) : (
                    allWorkers.map(worker => (
                      <div key={worker.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <div className={`rounded-circle bg-light p-3 me-3 text-center`} style={{width: '60px', height: '60px'}}>
                                <i className={`bi ${
                                  worker.profession === 'Plumber' ? 'bi-droplet' : 
                                  worker.profession === 'Electrician' ? 'bi-lightning-charge' : 
                                  worker.profession === 'Carpenter' ? 'bi-hammer' : 
                                  'bi-person-workspace'} fs-4`}></i>
                              </div>
                              <div>
                                <h5 className="mb-0">{worker.name}</h5>
                                <p className="text-muted mb-0">{worker.profession}</p>
                                {worker.isVerified && (
                                  <span className="badge bg-success badge-sm">
                                    <i className="bi bi-check-circle-fill me-1"></i> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <span className="badge bg-primary rounded-pill me-2">
                                  <i className="bi bi-star-fill me-1"></i>
                                  {worker.rating.toFixed(1)}
                                </span>
                                <small className="text-muted">{worker.experience} yrs exp</small>
                              </div>
                              <div>
                                <span className="badge bg-light text-dark">
                                  ₹{worker.hourlyRate}/hr
                                </span>
                              </div>
                            </div>
                            
                            {worker.isAvailableNow && (
                              <div className="mb-3">
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i> Available Now
                                </span>
                              </div>
                            )}
                            
                            <button 
                              className="btn btn-primary w-100" 
                              onClick={() => fetchWorkerDetails(worker.id)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {hasMoreWorkers && (
                  <div className="text-center mt-4">
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => fetchAllWorkers()}
                      disabled={allWorkersLoading}
                    >
                      {allWorkersLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        'Load More Workers'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="row">
          <div className="col-12">
            <h4>My Bookings</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Service</th>
                    <th>Worker</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.bookingId || `BK${booking.id}`}</td>
                      <td>{booking.service}</td>
                      <td>{booking.worker}</td>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td>₹{booking.totalAmount || calculateEstimatedCost()}</td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'completed' ? 'bg-success' :
                          booking.status === 'cancelled' ? 'bg-danger' :
                          booking.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setCancellingBookingId(booking.id)}
                            disabled={isCancelling}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cancellation Modal */}
            {cancellingBookingId && (
              <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Cancel Booking</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => {
                          setCancellingBookingId(null);
                          setCancellationReason('');
                        }}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Reason for Cancellation</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="Please provide a reason for cancellation"
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setCancellingBookingId(null);
                          setCancellationReason('');
                        }}
                      >
                        Close
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger"
                        onClick={() => cancelBooking(cancellingBookingId)}
                        disabled={isCancelling || !cancellationReason}
                      >
                        {isCancelling ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Cancelling...
                          </>
                        ) : 'Confirm Cancellation'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-md-8 col-lg-6 mx-auto">
            {/* Addresses Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="card-title mb-4">Addresses</h4>
                
                {/* Add New Address Form */}
                <form onSubmit={handleAddAddress} className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <select 
                        className="form-select" 
                        value={newAddress.type}
                        onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Address Line 1"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Address Line 2"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-plus me-2"></i>Add Address
                      </button>
                    </div>
                  </div>
                </form>

                {/* Addresses List */}
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Saved Addresses</h5>
                    {addresses.length === 0 ? (
                      <p className="text-muted">No addresses saved yet.</p>
                    ) : (
                      addresses.map((address) => (
                        <div key={address.id} className="card mb-2">
                          <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1 text-capitalize">{address.type} Address</h6>
                              <p className="mb-0">
                                {address.addressLine1}, {address.addressLine2}<br />
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setEditingAddress(address)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Settings Form */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title mb-4">Profile Settings</h4>
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preferred Language</label>
                    <select 
                      className="form-select" 
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="marathi">Marathi</option>
                      <option value="tamil">Tamil</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Notification Preferences</h6>
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="emailNotif"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="emailNotif">
                        Email Notifications
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="smsNotif"
                        name="notifications.sms"
                        checked={formData.notifications.sms}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="smsNotif">
                        SMS Notifications
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="appNotif"
                        name="notifications.app"
                        checked={formData.notifications.app}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="appNotif">
                        App Notifications
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Change Password</label>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Current Password"
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="New Password"
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Confirm New Password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          logout();
                        }
                      }}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Account
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      <i className="bi bi-save me-2"></i>Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {showWorkerModal && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {bookingStep === 'view' && 'Worker Profile'}
                  {bookingStep === 'book' && 'Book Service'}
                  {bookingStep === 'success' && 'Booking Confirmed'}
                  {bookingStep === 'error' && 'Booking Error'}
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowWorkerModal(false);
                  resetBookingModal();
                }}></button>
              </div>
              
              <div className="modal-body">
                {isLoadingWorker ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading worker details...</p>
                  </div>
                ) : selectedWorker ? (
                  <>
                    {/* View Worker Profile */}
                    {bookingStep === 'view' && (
                      <div className="row">
                        <div className="col-md-4 mb-4 mb-md-0">
                          <div className="text-center">
                            <div className="rounded-circle bg-light p-4 mx-auto mb-3" style={{width: '120px', height: '120px'}}>
                              <i className={`bi ${
                                selectedWorker.profession.name === 'Plumber' ? 'bi-droplet' : 
                                selectedWorker.profession.name === 'Electrician' ? 'bi-lightning-charge' : 
                                selectedWorker.profession.name === 'Carpenter' ? 'bi-hammer' : 
                                'bi-person-workspace'} fs-1`}></i>
                            </div>
                            <h4>{selectedWorker.user.name}</h4>
                            <p className="badge bg-primary">{selectedWorker.profession.name}</p>
                            
                            <div className="d-flex justify-content-center mb-3">
                              <div className="me-3">
                                <span className="d-block fs-4">{selectedWorker.experience || 0}</span>
                                <small className="text-muted">Years Exp.</small>
                              </div>
                              <div className="me-3">
                                <span className="d-block fs-4">{selectedWorker.totalJobs || 0}</span>
                                <small className="text-muted">Jobs</small>
                              </div>
                              <div>
                                <span className="d-block fs-4">{selectedWorker.avgRating ? selectedWorker.avgRating.toFixed(1) : '0.0'}</span>
                                <small className="text-muted">Rating</small>
                              </div>
                            </div>
                            
                            <div className="d-grid gap-2">
                              <button className="btn btn-primary" onClick={() => handleBookWorker(selectedWorker.id)}>
                                <i className="bi bi-calendar-plus me-1"></i> Book Now
                              </button>
                              <button className="btn btn-outline-primary">
                                <i className="bi bi-chat me-1"></i> Contact
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-8">
                          <div className="mb-4">
                            <h5>About</h5>
                            <p>{selectedWorker.description || 'Experienced professional available for quality service.'}</p>
                          </div>
                          
                          <div className="mb-4">
                            <h5>Skills</h5>
                            <div>
                              {selectedWorker.skills && selectedWorker.skills.length > 0 ? (
                                selectedWorker.skills.map((skill, index) => (
                                  <span key={index} className="badge bg-light text-dark me-2 mb-2 p-2">
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-muted">No specific skills listed.</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5>Contact Information</h5>
                            <p className="mb-1">
                              <i className="bi bi-telephone me-2"></i> {selectedWorker.user.phone}
                            </p>
                            <p className="mb-1">
                              <i className="bi bi-envelope me-2"></i> {selectedWorker.user.email}
                            </p>
                          </div>
                          
                          <div>
                            <h5>Pricing</h5>
                            <div className="card bg-light">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>Hourly Rate:</span>
                                  <span className="fw-bold">₹{selectedWorker.hourlyRate || '500-800'}/hour</span>
                                </div>
                              </div>
                            </div>
                            <small className="text-muted">
                              * Final price may vary based on job complexity and materials required.
                            </small>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Booking Form */}
                    {bookingStep === 'book' && (
                      <div className="booking-form">
                        <h5 className="mb-4">Book {selectedWorker.user.name} for {selectedWorker.profession.name} Service</h5>
                        
                        {bookingError && (
                          <div className="alert alert-danger" role="alert">
                            {bookingError}
                          </div>
                        )}
                        
                        <form>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <label className="form-label">Service Date*</label>
                              <input 
                                type="date" 
                                className="form-control"
                                name="date"
                                value={bookingData.date}
                                onChange={handleBookingInputChange}
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
                          
                          {addresses.length > 0 ? (
                            <div className="mb-3">
                              <label className="form-label">Select an address</label>
                              <select 
                                className="form-select"
                                onChange={(e) => {
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
                                    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                                    if (selectedAddress) {
                                      setBookingData(prev => ({
                                        ...prev,
                                        address: {
                                          addressLine1: selectedAddress.addressLine1,
                                          addressLine2: selectedAddress.addressLine2,
                                          city: selectedAddress.city,
                                          state: selectedAddress.state,
                                          pincode: selectedAddress.pincode
                                        }
                                      }));
                                    }
                                  }
                                }}
                              >
                                <option value="">-- Select address --</option>
                                {addresses.map(address => (
                                  <option key={address.id} value={address.id}>
                                    {address.type}: {address.addressLine1}, {address.city}
                                  </option>
                                ))}
                                <option value="new">Add a new address</option>
                              </select>
                            </div>
                          ) : null}
                          
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
                              placeholder="Any special instructions or gate codes"
                              name="notes"
                              value={bookingData.notes}
                              onChange={handleBookingInputChange}
                            ></textarea>
                          </div>
                          
                          <div className="card mb-3">
                            <div className="card-header">Price Estimate</div>
                            <div className="card-body">
                              <div className="d-flex justify-content-between mb-2">
                                <span>Hourly Rate:</span>
                                <span>₹{selectedWorker.hourlyRate || 0}/hr</span>
                              </div>
                              
                              {bookingData.startTime && bookingData.endTime && (
                                <>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span>Duration:</span>
                                    <span>
                                      {(() => {
                                        const start = new Date(`2025-01-01T${bookingData.startTime}`);
                                        const end = new Date(`2025-01-01T${bookingData.endTime}`);
                                        const diff = (end - start) / (1000 * 60 * 60);
                                        return `${diff} hours`;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span>Estimated Total:</span>
                                    <span className="fw-bold">
                                      ₹{(() => {
                                        const start = new Date(`2025-01-01T${bookingData.startTime}`);
                                        const end = new Date(`2025-01-01T${bookingData.endTime}`);
                                        const diff = (end - start) / (1000 * 60 * 60);
                                        return (diff * (selectedWorker.hourlyRate || 0)).toFixed(0);
                                      })()}
                                    </span>
                                  </div>
                                </>
                              )}
                              
                              <div className="small text-muted mt-2">
                                * Final amount may vary based on actual time spent and materials required.
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {/* Booking Success */}
                    {bookingStep === 'success' && bookingResult && (
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
                                <p className="mb-3">{bookingResult.bookingId}</p>
                                
                                <p className="mb-1"><strong>Service:</strong></p>
                                <p className="mb-3">{selectedWorker.profession.name}</p>
                                
                                <p className="mb-1"><strong>Professional:</strong></p>
                                <p className="mb-0">{selectedWorker.user.name}</p>
                              </div>
                              
                              <div className="col-md-6">
                                <p className="mb-1"><strong>Date & Time:</strong></p>
                                <p className="mb-3">
                                  {new Date(bookingResult.date).toLocaleDateString()} at {bookingResult.startTime} - {bookingResult.endTime}
                                </p>
                                
                                <p className="mb-1"><strong>Total Amount:</strong></p>
                                <p className="mb-3">₹{bookingResult.totalAmount}</p>
                                
                                <p className="mb-1"><strong>Status:</strong></p>
                                <p className="mb-0">
                                  <span className="badge bg-warning">Pending</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-muted mb-4">
                          We've notified the professional about your booking. 
                          You'll receive an update once they confirm.
                        </p>
                        
                        <div className="d-flex justify-content-center gap-3">
                          <button 
                            className="btn btn-primary" 
                            onClick={() => {
                              setShowWorkerModal(false); 
                              resetBookingModal();
                              setActiveTab('bookings');
                            }}
                          >
                            View All Bookings
                          </button>
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => {
                              setShowWorkerModal(false);
                              resetBookingModal();
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Booking Error */}
                    {bookingStep === 'error' && (
                      <div className="text-center py-4">
                        <div className="bg-danger text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                          <i className="bi bi-x-lg fs-1"></i>
                        </div>
                        
                        <h4 className="mb-3">Booking Failed</h4>
                        <p className="text-danger mb-4">{bookingError}</p>
                        
                        <div className="d-flex justify-content-center gap-3">
                          <button 
                            className="btn btn-primary" 
                            onClick={() => setBookingStep('book')}
                          >
                            Try Again
                          </button>
                          <button 
                            className="btn btn-outline-secondary" 
                            onClick={() => {
                              setShowWorkerModal(false);
                              resetBookingModal();
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                    <p className="mt-2">Failed to load worker details. Please try again.</p>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {bookingStep === 'view' && (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowWorkerModal(false)}>
                      Close
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => handleBookWorker(selectedWorker.id)}
                    >
                      Book This Worker
                    </button>
                  </>
                )}
                
                {bookingStep === 'book' && (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setBookingStep('view')}
                    >
                      Back to Profile
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleCreateBooking}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </>
                )}
                
                {(bookingStep === 'success' || bookingStep === 'error') && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowWorkerModal(false);
                      resetBookingModal();
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;