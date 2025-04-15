import React, { useState } from 'react';
import WorkerService from '../../services/workerService';

function JobsList({ jobs, onAccept, onDecline, onMarkComplete, type, refreshJobs }) {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  
  // Only apply filter if this is the "all jobs" view
  const filteredJobs = type === 'all' && filter !== 'all' 
    ? jobs.filter(job => job.status.toLowerCase() === filter.toLowerCase())
    : jobs;

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'upcoming':
      case 'scheduled':
      case 'pending':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'rejected':
      case 'cancelled':
        return 'bg-danger';
      case 'in progress':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const handleAcceptJob = async (jobId) => {
    setLoading(prev => ({ ...prev, [jobId]: 'accept' }));
    setError(null);
    
    try {
      await WorkerService.updateBookingStatus(jobId, 'accepted');
      
      if (onAccept) {
        onAccept(jobId);
      }
      
      if (refreshJobs) {
        refreshJobs();
      }
    } catch (err) {
      console.error(`Error accepting job ${jobId}:`, err);
      setError('Failed to accept job. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleDeclineJob = async (jobId) => {
    setLoading(prev => ({ ...prev, [jobId]: 'decline' }));
    setError(null);
    
    try {
      await WorkerService.updateBookingStatus(jobId, 'rejected');
      
      if (onDecline) {
        onDecline(jobId);
      }
      
      if (refreshJobs) {
        refreshJobs();
      }
    } catch (err) {
      console.error(`Error declining job ${jobId}:`, err);
      setError('Failed to decline job. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleMarkComplete = async (jobId) => {
    setLoading(prev => ({ ...prev, [jobId]: 'complete' }));
    setError(null);
    
    try {
      await WorkerService.updateBookingStatus(jobId, 'completed');
      
      if (onMarkComplete) {
        onMarkComplete(jobId);
      }
      
      if (refreshJobs) {
        refreshJobs();
      }
    } catch (err) {
      console.error(`Error marking job ${jobId} as complete:`, err);
      setError('Failed to mark job as complete. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {type === 'all' && (
          <div className="mb-3">
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        )}
        
        {filteredJobs.length === 0 ? (
          <div className="text-center p-4">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="mt-2">No jobs found.</p>
          </div>
        ) : (
          <div className="list-group">
            {filteredJobs.map(job => (
              <div key={job.id || job._id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between mb-2">
                  <h5 className="mb-1">{job.service || job.profession?.name}</h5>
                  <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <p className="mb-1">{job.description || job.jobDescription}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-person me-1"></i> {job.customer || job.customerProfile?.user?.name}
                  </small>
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i> {job.address?.addressLine1 ? 
                      `${job.address.addressLine1}, ${job.address.city}` : 
                      job.address}
                  </small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    <i className="bi bi-calendar me-1"></i> {new Date(job.date).toLocaleDateString()} at {job.time || `${job.startTime} - ${job.endTime}`}
                  </small>
                  
                  {type === 'requests' && (
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-success" 
                        onClick={() => handleAcceptJob(job.id || job._id)}
                        disabled={loading[job.id || job._id]}
                      >
                        {loading[job.id || job._id] === 'accept' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1"></i> Accept
                          </>
                        )}
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDeclineJob(job.id || job._id)}
                        disabled={loading[job.id || job._id]}
                      >
                        {loading[job.id || job._id] === 'decline' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-x-lg me-1"></i> Decline
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {(job.status === 'Upcoming' || job.status === 'pending' || job.status.toLowerCase() === 'scheduled') && type === 'all' && (
                    <button 
                      className="btn btn-sm btn-outline-success" 
                      onClick={() => handleMarkComplete(job.id || job._id)}
                      disabled={loading[job.id || job._id]}
                    >
                      {loading[job.id || job._id] === 'complete' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i> Mark Complete
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsList;