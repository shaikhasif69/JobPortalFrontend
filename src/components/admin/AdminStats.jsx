import React from 'react';

function AdminStats({ stats }) {
  return (
    <div className="row g-3">
      {/* Users Statistics */}
      <div className="col-md-6 col-lg-3">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <i className="bi bi-people text-primary fs-4"></i>
              </div>
              <div>
                <h6 className="card-subtitle mb-1 text-muted">Total Users</h6>
                <h2 className="card-title mb-0">{stats.totalUsers}</h2>
                <small className="text-muted">
                  <span className="text-success">
                    <i className="bi bi-person-badge me-1"></i>{stats.totalWorkers}
                  </span> Workers | 
                  <span className="text-info ms-1">
                    <i className="bi bi-person me-1"></i>{stats.totalCustomers}
                  </span> Customers
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-3">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <i className="bi bi-briefcase text-success fs-4"></i>
              </div>
              <div>
                <h6 className="card-subtitle mb-1 text-muted">Active Workers</h6>
                <h2 className="card-title mb-0">{stats.activeWorkers}</h2>
                <small className="text-muted">
                  <span className="text-warning">
                    <i className="bi bi-clock-history me-1"></i>{stats.pendingApprovals}
                  </span> Pending Approvals
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-3">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                <i className="bi bi-calendar-check text-info fs-4"></i>
              </div>
              <div>
                <h6 className="card-subtitle mb-1 text-muted">Total Bookings</h6>
                <h2 className="card-title mb-0">{stats.totalBookings}</h2>
                <small className="text-muted">
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>{stats.completedBookings}
                  </span> Completed | 
                  <span className="text-primary ms-1">
                    <i className="bi bi-hourglass-split me-1"></i>{stats.pendingBookings}
                  </span> Pending
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-3">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                <i className="bi bi-currency-rupee text-warning fs-4"></i>
              </div>
              <div>
                <h6 className="card-subtitle mb-1 text-muted">Total Revenue</h6>
                <h2 className="card-title mb-0">₹{(stats.totalRevenue/1000).toFixed(1)}K</h2>
                <small className="text-muted">
                  <span className="text-success">
                    <i className="bi bi-graph-up me-1"></i>₹{(stats.commissionEarned/1000).toFixed(1)}K
                  </span> Commission
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;