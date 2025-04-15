import React, { useState, useEffect } from 'react';
import AdminStats from '../components/admin/AdminStats';
import UserManagement from '../components/admin/UserManagement';
import PaymentManagement from '../components/admin/PaymentManagemen';
import SystemSettings from '../components/admin/SystemSettings';
import BookingsOverview from '../components/admin/BookingsOverview';
import AdminService from '../services/AdminService';
import ErrorHandler from '../components/ErrorHandler';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentWorkers, setRecentWorkers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard stats using AdminService
        const dashboardData = await AdminService.getDashboardStats();
        
        if (!dashboardData) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        // Format stats from the API response
        setStats({
          totalUsers: dashboardData.userStats?.totalUsers || 0,
          totalWorkers: dashboardData.userStats?.totalWorkers || 0,
          totalCustomers: dashboardData.userStats?.totalCustomers || 0,
          activeWorkers: dashboardData.userStats?.activeWorkers || 0,
          pendingApprovals: dashboardData.userStats?.pendingVerificationWorkers || 0,
          totalBookings: dashboardData.bookingStats?.totalBookings || 0,
          completedBookings: dashboardData.bookingStats?.completedBookings || 0,
          pendingBookings: dashboardData.bookingStats?.pendingBookings || 0,
          totalRevenue: dashboardData.financialStats?.totalRevenue || 0,
          commissionEarned: dashboardData.financialStats?.totalCommission || 0
        });
        
        // Set recent workers from API data
        if (dashboardData.recentWorkers && dashboardData.recentWorkers.length > 0) {
          const formattedWorkers = dashboardData.recentWorkers.map(worker => ({
            id: worker._id,
            name: worker.user?.name || 'Unknown',
            profession: worker.profession?.name || 'Unknown',
            date: new Date(worker.createdAt).toLocaleDateString(),
            status: worker.isVerified ? 'Approved' : 'Pending'
          }));
          
          setRecentWorkers(formattedWorkers);
        }
        
        // Set recent bookings from API data
        if (dashboardData.recentBookings && dashboardData.recentBookings.length > 0) {
          const formattedBookings = dashboardData.recentBookings.map(booking => ({
            id: booking._id,
            customer: booking.customerProfile?.user?.name || 'Unknown',
            worker: booking.workerProfile?.user?.name || 'Unknown',
            service: booking.profession?.name || 'Service',
            date: new Date(booking.date).toLocaleDateString(),
            time: `${booking.startTime}`,
            status: booking.status || 'pending'
          }));
          
          setRecentBookings(formattedBookings);
        }
        
        // Get pending approvals count for notifications
        const pendingCount = dashboardData.userStats?.pendingVerificationWorkers || 0;
        
        // Set notifications with real pending approval count
        setNotifications([
          {
            id: 1,
            title: 'Worker Verification Required',
            message: `${pendingCount} workers awaiting verification. Please review their profiles.`,
            date: 'Today'
          },
          {
            id: 2,
            title: 'Payment Disbursement Ready',
            message: 'Monthly payment to workers is ready for review and processing.',
            date: 'Yesterday'
          },
          {
            id: 3,
            title: 'Customer Support Issues',
            message: '3 unresolved customer complaints need attention.',
            date: '2 days ago'
          }
        ]);
        
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    // Reset error and trigger data fetch again
    setError(null);
    fetchDashboardData();
  };

  if (loading && !stats) {
    return <LoadingSpinner fullPage text="Loading admin dashboard..." />;
  }

  return (
    <div className="container my-4">
      {/* Display error message if there's an error */}
      {error && (
        <ErrorHandler 
          error={error} 
          onRetry={handleRetry} 
          showRetry={true} 
          className="mb-4"
        />
      )}
      
      {/* Admin Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-dark text-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title">Admin Dashboard</h2>
                  <p className="card-text mb-0">
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </p>
                </div>
                <div className="d-none d-md-block">
                  <i className="bi bi-shield-lock-fill" style={{ fontSize: '3rem' }}></i>
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
                <i className="bi bi-house-door me-1"></i> Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-1"></i> Users
                {stats && stats.pendingApprovals > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2">{stats.pendingApprovals}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('bookings')}
              >
                <i className="bi bi-calendar-check me-1"></i> Bookings
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`} 
                onClick={() => setActiveTab('payments')}
              >
                <i className="bi bi-cash-coin me-1"></i> Payments
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear me-1"></i> Settings
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
              <AdminStats stats={stats} />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Recent Worker Registrations</h5>
                  {recentWorkers.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="bi bi-people fs-1 text-muted"></i>
                      <p className="mt-2">No recent worker registrations.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Profession</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentWorkers.map(worker => (
                            <tr key={worker.id}>
                              <td>{worker.name}</td>
                              <td>{worker.profession}</td>
                              <td>{worker.date}</td>
                              <td>
                                <span className={`badge ${worker.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                                  {worker.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Latest Bookings</h5>
                  {recentBookings.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="bi bi-calendar fs-1 text-muted"></i>
                      <p className="mt-2">No recent bookings.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Worker</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>{booking.customer}</td>
                              <td>{booking.service}</td>
                              <td>{booking.worker}</td>
                              <td>
                                <span className={`badge 
                                  ${booking.status === 'completed' ? 'bg-success' : 
                                    booking.status === 'pending' ? 'bg-warning' : 
                                    booking.status === 'scheduled' ? 'bg-primary' : 
                                    'bg-secondary'}`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">System Notifications</h5>
                  <div className="list-group">
                    {notifications.map(notification => (
                      <div key={notification.id} className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{notification.title}</h6>
                          <small className="text-muted">{notification.date}</small>
                        </div>
                        <p className="mb-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="row">
          <div className="col-12">
            <UserManagement stats={stats} />
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="row">
          <div className="col-12">
            <BookingsOverview />
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="row">
          <div className="col-12">
            <PaymentManagement />
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-12">
            <SystemSettings />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;