// In components/worker/WorkerAvailability.jsx

import React, { useState } from 'react';
import axios from 'axios';

function WorkerAvailability({ availability, worker, setWorker }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    availableDays: availability?.availableDays || [],
    availableTimeStart: availability?.availableTimeStart || '09:00',
    availableTimeEnd: availability?.availableTimeEnd || '18:00'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day) => {
    const currentDays = [...formData.availableDays];
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        availableDays: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        availableDays: [...currentDays, day]
      });
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.patch(
        'https://blue-collar-job-backend.vercel.app/api/workers/profile',
        {
          availability: formData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        // Update worker state with new availability
        setWorker({
          ...worker,
          availability: formData
        });
        
        setIsEditing(false);
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {!isEditing ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Your Availability</h5>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil me-1"></i> Edit
              </button>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Available Days</h6>
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {daysOfWeek.map((day) => (
                    <span 
                      key={day} 
                      className={`badge ${availability.availableDays.includes(day) ? 'bg-success' : 'bg-light text-dark'} p-2`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <h6>Available Hours</h6>
                <p className="mb-0">
                  {availability.availableTimeStart} - {availability.availableTimeEnd}
                </p>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Available Days</label>
              <div className="d-flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`day-${day}`}
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                    <label className="form-check-label" htmlFor={`day-${day}`}>
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="availableTimeStart"
                  value={formData.availableTimeStart}
                  onChange={handleTimeChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="availableTimeEnd"
                  value={formData.availableTimeEnd}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default WorkerAvailability;