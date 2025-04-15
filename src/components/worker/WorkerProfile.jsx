import React, { useState, useEffect } from 'react';
import WorkerService from '../../services/workerService';
import AuthService from '../../services/AuthService';

function WorkerProfile() {
  const [workerData, setWorkerData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    experience: 0,
    hourlyRate: 0,
    skills: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      setLoading(true);
      try {
        const response = await WorkerService.getWorkerProfile();
        const { worker, stats } = response;
        
        setWorkerData({
          ...worker,
          stats
        });
        
        // Initialize form data with worker data
        setFormData({
          name: worker.user.name || '',
          phone: worker.user.phone || '',
          email: worker.user.email || '',
          address: '',  // API doesn't return address
          experience: worker.experience || 0,
          hourlyRate: worker.hourlyRate || 0,
          skills: worker.skills || []
        });
      } catch (err) {
        console.error('Error fetching worker profile:', err);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'skills') {
      // Convert comma-separated string to array
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
      setFormData(prev => ({
        ...prev,
        skills: skillsArray
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      // Prepare update data
      const updateData = {
        experience: parseInt(formData.experience),
        hourlyRate: parseInt(formData.hourlyRate),
        skills: formData.skills
      };
      
      // Update worker profile
      await WorkerService.updateWorkerProfile(updateData);
      
      // Update basic user data
      await AuthService.updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      
      // Fetch updated worker profile
      const updatedResponse = await WorkerService.getWorkerProfile();
      setWorkerData({
        ...updatedResponse.worker,
        stats: updatedResponse.stats
      });
      
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating worker profile:', err);
      setError('Failed to update your profile. Please try again.');
    } finally {
      setLoading(false);
      
      // Clear success message after 3 seconds
      if (updateSuccess) {
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    }
  };

  if (loading && !workerData) {
    return (
      <div className="card shadow-sm">
        <div className="card-body p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !workerData) {
    return (
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="alert alert-danger mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!workerData) {
    return (
      <div className="card shadow-sm">
        <div className="card-body p-4 text-center">
          <i className="bi bi-person-x fs-1 text-muted"></i>
          <p className="mt-2">Profile not found. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="card-title mb-0">Profile Information</h4>
          
          {!isEditing && (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <i className="bi bi-pencil me-1"></i> Edit Profile
            </button>
          )}
        </div>
        
        {updateSuccess && (
          <div className="alert alert-success mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="profession" className="form-label">Profession</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="profession" 
                  value={workerData.profession?.name || 'Not specified'}
                  disabled
                />
                <small className="form-text text-muted">To change your profession, please contact support.</small>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="experience" className="form-label">Years of Experience</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="experience" 
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="hourlyRate" className="form-label">Hourly Rate (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="hourlyRate" 
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-12">
                <label htmlFor="skills" className="form-label">Skills (comma-separated)</label>
                <textarea 
                  className="form-control" 
                  id="skills" 
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="col-12 d-flex gap-2 justify-content-end mt-4">
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
            </div>
          </form>
        ) : (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mb-4">
                <h6 className="text-muted mb-1">Full Name</h6>
                <p className="fs-5">{workerData.user?.name || 'Not specified'}</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-1">Profession</h6>
                <p className="fs-5">
                  <span className="badge bg-primary">{workerData.profession?.name || 'Not specified'}</span>
                </p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-1">Experience</h6>
                <p className="fs-5">{workerData.experience || 0} years</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-1">Hourly Rate</h6>
                <p className="fs-5">₹{workerData.hourlyRate || 0}/hour</p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-4">
                <h6 className="text-muted mb-1">Contact Information</h6>
                <p className="mb-1">
                  <i className="bi bi-telephone me-2"></i> {workerData.user?.phone || 'Not specified'}
                </p>
                <p className="mb-1">
                  <i className="bi bi-envelope me-2"></i> {workerData.user?.email || 'Not specified'}
                </p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-1">Stats</h6>
                <div className="d-flex flex-wrap gap-4">
                  <div>
                    <p className="fs-5 mb-0">{workerData.stats?.totalCompletedJobs || 0}</p>
                    <small className="text-muted">Jobs Completed</small>
                  </div>
                  <div>
                    <p className="fs-5 mb-0">{workerData.avgRating?.toFixed(1) || '0.0'}</p>
                    <small className="text-muted">Rating</small>
                  </div>
                  <div>
                    <p className="fs-5 mb-0">{workerData.stats?.totalEarnings?.toLocaleString() || 0}</p>
                    <small className="text-muted">Total Earnings (₹)</small>
                  </div>
                </div>
              </div>
              
              <div>
                <h6 className="text-muted mb-2">Skills</h6>
                <div>
                  {workerData.skills && workerData.skills.length > 0 ? (
                    workerData.skills.map((skill, index) => (
                      <span key={index} className="badge bg-light text-dark me-2 mb-2 p-2">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">No skills specified</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-12 mt-3">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className={`bi ${workerData.isVerified ? 'bi-shield-check text-success' : 'bi-shield text-warning'} me-2`}></i>
                    Verification Status
                  </h6>
                  <p className="card-text mb-0">
                    {workerData.isVerified ? 
                      'Your profile has been verified. Customers can see your verification badge.' : 
                      'Your profile is pending verification. This may take 1-2 business days.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerProfile;