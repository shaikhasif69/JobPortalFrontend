import React, { useState, useEffect } from 'react';
import AdminService from '../../services/AdminService';

function UserManagement({ stats }) {
  const [activeTab, setActiveTab] = useState('all');
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    workers: true,
    customers: true,
    action: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    if (activeTab === 'customers') {
      await fetchCustomers();
    } else {
      await fetchWorkers();
    }
  };

  const fetchWorkers = async () => {
    setLoading(prev => ({ ...prev, workers: true }));
    setError(null);
    
    try {
      // Prepare filters based on activeTab
      const filters = { role: 'worker' };
      
      if (activeTab === 'pending') {
        filters.isVerified = false;
      } else if (activeTab === 'active') {
        filters.isVerified = true;
      }
      
      // Fetch workers
      const workersData = await AdminService.getAllUsers(filters);
      
      // Format worker data
      const formattedWorkers = workersData.map(worker => ({
        id: worker._id,
        name: worker.name || 'Unknown',
        profession: worker.workerProfile?.profession?.name || 'Unknown',
        rating: worker.workerProfile?.avgRating || 0,
        jobs: worker.workerProfile?.totalCompletedJobs || 0,
        status: worker.workerProfile?.isVerified ? 'Active' : 'Pending',
        registeredOn: new Date(worker.createdAt).toLocaleDateString(),
        email: worker.email,
        phone: worker.phone,
        isActive: worker.isActive,
        workerProfile: worker.workerProfile
      }));
      
      setWorkers(formattedWorkers);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Failed to load worker data. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, workers: false }));
    }
  };

  const fetchCustomers = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    setError(null);
    
    try {
      // Fetch customers
      const customersData = await AdminService.getAllUsers({ role: 'customer' });
      
      // Format customer data
      const formattedCustomers = customersData.map(customer => ({
        id: customer._id,
        name: customer.name || 'Unknown',
        email: customer.email,
        phone: customer.phone,
        bookings: customer.customerProfile?.totalBookings || 0,
        lastActive: customer.lastActive ? new Date(customer.lastActive).toLocaleDateString() : 'Unknown',
        status: customer.isActive ? 'Active' : 'Blocked',
        registeredOn: new Date(customer.createdAt).toLocaleDateString()
      }));
      
      setCustomers(formattedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer data. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleApproveWorker = async (workerId) => {
    setLoading(prev => ({ ...prev, action: workerId }));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Verify worker
      await AdminService.verifyWorker(workerId);
      
      // Update worker status in state
      const updatedWorkers = workers.map(worker => 
        worker.id === workerId ? { ...worker, status: 'Active' } : worker
      );
      setWorkers(updatedWorkers);
      
      setSuccessMessage('Worker approved successfully.');
      
      // Refresh worker data
      setTimeout(() => {
        fetchWorkers();
      }, 2000);
    } catch (err) {
      console.error(`Error approving worker ${workerId}:`, err);
      setError('Failed to approve worker. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  const handleRejectWorker = async (workerId) => {
    setLoading(prev => ({ ...prev, action: workerId }));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Update worker status to rejected
      await AdminService.updateUser(workerId, { 
        workerProfile: { isRejected: true }
      });
      
      // Remove worker from list
      const updatedWorkers = workers.filter(worker => worker.id !== workerId);
      setWorkers(updatedWorkers);
      
      setSuccessMessage('Worker rejected successfully.');
    } catch (err) {
      console.error(`Error rejecting worker ${workerId}:`, err);
      setError('Failed to reject worker. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  const handleBlockUser = async (userId, userType) => {
    setLoading(prev => ({ ...prev, action: userId }));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Update user to inactive/blocked
      await AdminService.updateUser(userId, { isActive: false });
      
      // Update user status in state
      if (userType === 'worker') {
        const updatedWorkers = workers.map(worker => 
          worker.id === userId ? { ...worker, status: 'Blocked' } : worker
        );
        setWorkers(updatedWorkers);
      } else {
        const updatedCustomers = customers.map(customer => 
          customer.id === userId ? { ...customer, status: 'Blocked' } : customer
        );
        setCustomers(updatedCustomers);
      }
      
      setSuccessMessage('User blocked successfully.');
    } catch (err) {
      console.error(`Error blocking user ${userId}:`, err);
      setError('Failed to block user. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (worker.email && worker.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isLoading = loading.workers || loading.customers;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">User Management</h4>
        
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
          </div>
        )}
        
        <div className="row mb-4">
          <div className="col-md-8">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => handleTabChange('all')}
                >
                  All Workers
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => handleTabChange('pending')}
                >
                  Pending Approval
                  {stats && stats.pendingApprovals > 0 && (
                    <span className="badge bg-danger rounded-pill ms-2">{stats.pendingApprovals}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => handleTabChange('active')}
                >
                  Active Workers
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('customers')}
                >
                  Customers
                </button>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading user data...</p>
          </div>
        ) : (
          <>
            {activeTab !== 'customers' ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Profession</th>
                      <th>Rating</th>
                      <th>Jobs</th>
                      <th>Status</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="bi bi-search fs-4 text-muted d-block mb-2"></i>
                          No workers found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredWorkers.map(worker => (
                        <tr key={worker.id}>
                          <td>{worker.name}</td>
                          <td>{worker.profession}</td>
                          <td>
                            {worker.rating > 0 ? (
                              <div>
                                <i className="bi bi-star-fill text-warning me-1"></i>
                                {worker.rating.toFixed(1)}
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>{worker.jobs}</td>
                          <td>
                            <span className={`badge ${
                              worker.status === 'Active' ? 'bg-success' : 
                              worker.status === 'Pending' ? 'bg-warning' : 
                              'bg-danger'
                            }`}>
                              {worker.status}
                            </span>
                          </td>
                          <td>{worker.registeredOn}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => alert(`View profile for ${worker.name}`)}
                                title="View Profile"
                                disabled={loading.action === worker.id}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              
                              {worker.status === 'Pending' && (
                                <>
                                  <button 
                                    className="btn btn-outline-success"
                                    onClick={() => handleApproveWorker(worker.id)}
                                    title="Approve"
                                    disabled={loading.action === worker.id}
                                  >
                                    {loading.action === worker.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                      <i className="bi bi-check-lg"></i>
                                    )}
                                  </button>
                                  <button 
                                    className="btn btn-outline-danger"
                                    onClick={() => handleRejectWorker(worker.id)}
                                    title="Reject"
                                    disabled={loading.action === worker.id}
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </>
                              )}
                              
                              {worker.status === 'Active' && (
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleBlockUser(worker.id, 'worker')}
                                  title="Block"
                                  disabled={loading.action === worker.id}
                                >
                                  {loading.action === worker.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  ) : (
                                    <i className="bi bi-slash-circle"></i>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Bookings</th>
                      <th>Last Active</th>
                      <th>Status</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="bi bi-search fs-4 text-muted d-block mb-2"></i>
                          No customers found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td>{customer.name}</td>
                          <td>{customer.email || 'N/A'}</td>
                          <td>{customer.bookings}</td>
                          <td>{customer.lastActive}</td>
                          <td>
                            <span className={`badge ${
                              customer.status === 'Active' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                          <td>{customer.registeredOn}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => alert(`View profile for ${customer.name}`)}
                                title="View Profile"
                                disabled={loading.action === customer.id}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {customer.status === 'Active' && (
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleBlockUser(customer.id, 'customer')}
                                  title="Block"
                                  disabled={loading.action === customer.id}
                                >
                                  {loading.action === customer.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  ) : (
                                    <i className="bi bi-slash-circle"></i>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        <div className="mt-3 d-flex justify-content-between">
          <div>
            <button className="btn btn-outline-primary me-2">
              <i className="bi bi-download me-1"></i> Export Data
            </button>
          </div>
          <div>
            <span className="me-2">Showing {activeTab === 'customers' ? filteredCustomers.length : filteredWorkers.length} entries</span>
            <button className="btn btn-sm btn-outline-secondary me-1" disabled>&lt;</button>
            <button className="btn btn-sm btn-primary me-1">1</button>
            <button className="btn btn-sm btn-outline-secondary" disabled>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;