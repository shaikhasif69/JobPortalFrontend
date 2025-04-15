import React, { useState } from 'react';

function BookingsList({ bookings }) {
  const [filter, setFilter] = useState('all');
  
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === filter.toLowerCase());

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'scheduled':
        return 'bg-info';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'in progress':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
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
              className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('scheduled')}
            >
              Scheduled
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
        
        {filteredBookings.length === 0 ? (
          <div className="text-center p-4">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="mt-2">No bookings found for the selected filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Professional</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.service}</td>
                    <td>{booking.worker}</td>
                    <td>{new Date(booking.date).toLocaleDateString()} at {booking.time}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-info-circle"></i>
                        </button>
                        {booking.status === 'Scheduled' && (
                          <button className="btn btn-outline-danger">
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                        {booking.status === 'Completed' && (
                          <button className="btn btn-outline-success">
                            <i className="bi bi-star"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsList;