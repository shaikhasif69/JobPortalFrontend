import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WorkerService from '../services/workerService';

function NearbyWorkers({ onWorkerSelect, profession = '', maxDistance = 10 }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        // Create filter object based on props
        const filters = {};
        if (profession) {
          filters.profession = profession;
        }
        
        // Add other potential filters like maxDistance, etc.
        if (maxDistance) {
          filters.distance = maxDistance;
        }
        
        // Fetch workers with filters
        const workersData = await WorkerService.getAllWorkers(filters);
        
        // Format the worker data for display
        const formattedWorkers = workersData.map(worker => ({
          id: worker._id,
          name: worker.user?.name || 'Unknown',
          profession: worker.profession?.name || 'General',
          rating: worker.avgRating || 0,
          distance: worker.distance ? `${worker.distance.toFixed(1)} km` : 'Nearby',
          isAvailableNow: worker.isAvailableNow || false,
          hourlyRate: worker.hourlyRate || 0
        }));
        
        setWorkers(formattedWorkers);
      } catch (err) {
        console.error('Error fetching nearby workers:', err);
        setError('Failed to load nearby workers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [profession, maxDistance]);

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading nearby professionals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <div className="alert alert-danger mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {workers.length === 0 ? (
          <div className="text-center p-4">
            <i className="bi bi-geo-alt fs-1 text-muted"></i>
            <p className="mt-2">No professionals found nearby.</p>
          </div>
        ) : (
          <div className="list-group">
            {workers.map(worker => (
              <div key={worker.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-light p-2 me-3">
                      <i className={`bi ${worker.profession === 'Plumber' ? 'bi-droplet' : 
                                         worker.profession === 'Electrician' ? 'bi-lightning-charge' : 
                                         worker.profession === 'Carpenter' ? 'bi-hammer' : 
                                         'bi-person-workspace'} fs-4`}></i>
                    </div>
                    <div>
                      <h5 className="mb-1">{worker.name}</h5>
                      <p className="mb-1 text-muted">{worker.profession}</p>
                      {worker.isAvailableNow && (
                        <span className="badge bg-success">Available Now</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <div className="mb-1">
                    <span className="badge bg-primary rounded-pill me-2">
                      <i className="bi bi-star-fill me-1"></i>
                      {worker.rating.toFixed(1)}
                    </span>
                    <small className="text-muted">{worker.distance}</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => onWorkerSelect && onWorkerSelect(worker.id)} 
                      className="btn btn-outline-primary btn-sm"
                    >
                      View Details
                    </button>
                    <Link to={`/customer/book/${worker.id}`} className="btn btn-primary btn-sm">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-3">
          <Link to="/customer/workers" className="btn btn-link">View all professionals</Link>
        </div>
      </div>
    </div>
  );
}

export default NearbyWorkers;