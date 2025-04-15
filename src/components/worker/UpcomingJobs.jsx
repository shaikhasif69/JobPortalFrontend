import React from 'react';

function UpcomingJobs({ jobs, onMarkComplete }) {
  // Sort jobs by date and time
  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {sortedJobs.length === 0 ? (
          <div className="text-center p-4">
            <i className="bi bi-calendar-check fs-1 text-muted"></i>
            <p className="mt-2">No upcoming jobs scheduled.</p>
          </div>
        ) : (
          <div className="list-group">
            {sortedJobs.map(job => (
              <div key={job.id} className="list-group-item border-0 border-bottom">
                <div className="d-flex w-100 justify-content-between mb-2 align-items-center">
                  <h5 className="mb-1">{job.service}</h5>
                  <small className="text-primary">
                    <i className="bi bi-clock me-1"></i> {job.time}
                  </small>
                </div>
                <p className="mb-1">{job.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-person me-1"></i> {job.customer}
                  </small>
                  <small className="text-muted">
                    <i className="bi bi-calendar me-1"></i> {new Date(job.date).toLocaleDateString()}
                  </small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i> {job.address}
                  </small>
                  <button 
                    className="btn btn-sm btn-outline-success" 
                    onClick={() => onMarkComplete(job.id)}
                  >
                    <i className="bi bi-check-circle me-1"></i> Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingJobs;