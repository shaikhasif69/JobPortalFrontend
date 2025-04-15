import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import WorkerService from '../services/workerService';

// Import components
import WorkerStats from '../components/worker/WorkerStats';
import JobsList from '../components/worker/JobsList';
import UpcomingJobs from '../components/worker/UpcomingJobs';
import WorkerAvailability from '../components/worker/WorkerAvailability';
import EarningsSummary from '../components/worker/EarningsSummary';
import WorkerProfile from '../components/worker/WorkerProfile';

function WorkerDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  
  const [worker, setWorker] = useState({
    name: '',
    profession: '',
    experience: 0,
    phone: '',
    email: '',
    address: '',
    skills: [],
    availability: {
      availableDays: [],
      availableTimeStart: '09:00',
      availableTimeEnd: '18:00'
    }
  });

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch worker profile
      const workerProfileData = await WorkerService.getWorkerProfile();
      const { worker: workerData, stats: workerStats } = workerProfileData;
      
      // Update worker state with API data
      setWorker({
        name: workerData.user.name || '',
        profession: workerData.profession ? workerData.profession.name : '',
        experience: workerData.experience || 0,
        phone: workerData.user.phone || '',
        email: workerData.user.email || '',
        address: '',  // API doesn't return address
        skills: workerData.skills || [],
        availability: workerData.availability || {
          availableDays: [],
          availableTimeStart: '09:00',
          availableTimeEnd: '18:00'
        },
        hourlyRate: workerData.hourlyRate || 0,
        isVerified: workerData.isVerified || false,
        avgRating: workerData.avgRating || 0,
        totalRatings: workerData.totalRatings || 0
      });
      
      // Update stats state with API data
      setStats({
        totalJobs: workerData.totalCompletedJobs || 0,
        completedJobs: workerData.totalCompletedJobs || 0,
        pendingRequests: 0, // Will be updated when we fetch bookings
        rating: workerData.avgRating || 0,
        earnings: {
          total: workerStats.totalEarnings || 0,
          thisMonth: workerStats.monthlyEarnings || 0,
          pending: workerStats.pendingEarnings || 0
        }
      });
      
      // Fetch worker bookings
      const bookingsData = await WorkerService.getWorkerBookings();
      
      // Split bookings into jobs and requests
      const jobsList = [];
      const requestsList = [];
      
      bookingsData.forEach(booking => {
        const formattedBooking = {
          id: booking._id,
          customer: booking.customerProfile?.user?.name || 'Customer',
          service: booking.profession?.name || 'Service',
          description: booking.jobDescription || '',
          address: booking.address ? `${booking.address.addressLine1}, ${booking.address.city}` : 'Address not provided',
          date: new Date(booking.date).toISOString().split('T')[0],
          time: `${booking.startTime} - ${booking.endTime}`,
          status: booking.status,
          amount: booking.totalAmount,
          customerProfile: booking.customerProfile,
          profession: booking.profession,
          addressObj: booking.address
        };
        
        if (booking.status.toLowerCase() === 'pending') {
          requestsList.push(formattedBooking);
        } else {
          jobsList.push(formattedBooking);
        }
      });
      
      setJobs(jobsList);
      setRequests(requestsList);
      
      // Update pending requests count in stats
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsList.length
      }));
      
    } catch (err) {
      console.error('Error fetching worker data:', err);
      setError('Failed to load your dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptJob = async (jobId) => {
    try {
      await WorkerService.updateBookingStatus(jobId, 'accepted');
      
      // Find the job in requests
      const acceptedJobIndex = requests.findIndex(req => req.id === jobId);
      if (acceptedJobIndex !== -1) {
        const acceptedJob = requests[acceptedJobIndex];
        
        // Update job status
        const updatedJob = { ...acceptedJob, status: 'Upcoming' };
        
        // Add to jobs array
        setJobs([...jobs, updatedJob]);
        
        // Remove from requests
        const updatedRequests = [...requests];
        updatedRequests.splice(acceptedJobIndex, 1);
        setRequests(updatedRequests);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pendingRequests: prev.pendingRequests - 1,
          totalJobs: prev.totalJobs + 1
        }));
      }
    } catch (err) {
      console.error(`Error accepting job ${jobId}:`, err);
      alert('Failed to accept job. Please try again.');
    }
  };

  const handleDeclineJob = async (jobId) => {
    try {
      await WorkerService.updateBookingStatus(jobId, 'rejected');
      
      // Remove from requests
      const updatedRequests = requests.filter(req => req.id !== jobId);
      setRequests(updatedRequests);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1
      }));
    } catch (err) {
      console.error(`Error declining job ${jobId}:`, err);
      alert('Failed to decline job. Please try again.');
    }
  };

  const handleMarkComplete = async (jobId) => {
    try {
      await WorkerService.updateBookingStatus(jobId, 'completed');
      
      // Find the job
      const jobIndex = jobs.findIndex(job => job.id === jobId);
      if (jobIndex !== -1) {
        // Update job status
        const updatedJobs = [...jobs];
        updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], status: 'Completed' };
        setJobs(updatedJobs);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          completedJobs: prev.completedJobs + 1
        }));
      }
    } catch (err) {
      console.error(`Error marking job ${jobId} as complete:`, err);
      alert('Failed to mark job as complete. Please try again.');
    }
  };

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

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Worker Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title">Welcome, {worker.name}!</h2>
                  <p className="card-text mb-0">
                    {worker.profession && (
                      <span className="badge bg-light text-primary me-2">{worker.profession}</span>
                    )}
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </p>
                </div>
                <div className="d-none d-md-block">
                  <i className="bi bi-person-circle" style={{ fontSize: '3rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-house-door me-1"></i> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`} 
                onClick={() => setActiveTab('jobs')}
              >
                <i className="bi bi-briefcase me-1"></i> My Jobs
                {stats && stats.pendingRequests > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2">{stats.pendingRequests}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'earnings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('earnings')}
              >
                <i className="bi bi-cash-coin me-1"></i> Earnings
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person me-1"></i> Profile
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <WorkerStats stats={stats} />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6 mb-4 mb-md-0">
              <h4><i className="bi bi-clock me-2"></i>Upcoming Jobs</h4>
              <UpcomingJobs 
                jobs={jobs.filter(job => job.status === 'Upcoming' || job.status === 'scheduled')} 
                onMarkComplete={handleMarkComplete} 
                refreshJobs={fetchData}
              />
            </div>
            <div className="col-md-6">
              <h4><i className="bi bi-calendar-check me-2"></i>Job Requests</h4>
              <JobsList 
                jobs={requests} 
                onAccept={handleAcceptJob} 
                onDecline={handleDeclineJob} 
                type="requests" 
                refreshJobs={fetchData}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h4><i className="bi bi-calendar me-2"></i>Availability</h4>
              <WorkerAvailability 
                availability={worker.availability}
                worker={worker}
                setWorker={setWorker}
              />
            </div>
          </div>
        </>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-body p-3">
                <h4 className="card-title">Job Requests</h4>
                <JobsList 
                  jobs={requests} 
                  onAccept={handleAcceptJob} 
                  onDecline={handleDeclineJob} 
                  type="requests" 
                  refreshJobs={fetchData}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-3">
                <h4 className="card-title">All Jobs</h4>
                <JobsList 
                  jobs={jobs} 
                  onMarkComplete={handleMarkComplete} 
                  type="all" 
                  refreshJobs={fetchData}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="row">
          <div className="col-12">
            <EarningsSummary 
              earnings={stats?.earnings || {total: 0, thisMonth: 0, pending: 0}} 
              completedJobs={stats?.completedJobs || 0} 
            />
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="row">
          <div className="col-12">
            <WorkerProfile worker={worker} setWorker={setWorker} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;