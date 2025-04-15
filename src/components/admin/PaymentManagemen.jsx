import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/AdminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorHandler from '../../components/ErrorHandler';

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [dateRange, setDateRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    payments: true,
    payouts: true,
    commissions: true,
    earnings: true
  });
  const [error, setError] = useState({
    payments: null,
    payouts: null,
    commissions: null,
    earnings: null
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commissionRates, setCommissionRates] = useState({});
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch payments when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchPayments();
    } else if (activeTab === 'payouts') {
      fetchPendingPayouts();
    } else if (activeTab === 'settings') {
      fetchCommissions();
    }
  }, [activeTab, dateRange, page]);

  // Also fetch earnings data on component mount
  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchPayments = async () => {
    setLoading(prev => ({ ...prev, payments: true }));
    setError(prev => ({ ...prev, payments: null }));
    
    try {
      // Prepare filter parameters
      const params = {
        page,
        limit: 10
      };
      
      // Add date range filter
      if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
      } else if (dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.startDate = monthAgo.toISOString().split('T')[0];
      }
      
      // Fetch payments from API
      const response = await AdminService.getAllPayments(params);
      
      if (!response || response.length === 0) {
        setPayments([]);
        setTotalPages(1);
      } else {
        // Format payments data for display
        const formattedPayments = response.map(payment => ({
          id: payment._id,
          paymentId: payment.paymentId || `PAY-${payment._id.substring(0, 6)}`,
          customerName: payment.customerProfile?.user?.name || 'Unknown Customer',
          workerName: payment.workerProfile?.user?.name || 'Unknown Worker',
          service: payment.booking?.profession?.name || payment.service || 'Service',
          date: new Date(payment.createdAt || payment.date).toLocaleDateString(),
          amount: payment.amount || 0,
          commission: payment.commissionAmount || Math.round(payment.amount * 0.1) || 0,
          status: payment.status || 'pending',
          booking: payment.booking?._id || payment.bookingId || null
        }));
        
        setPayments(formattedPayments);
        
        // Set total pages
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        } else {
          setTotalPages(Math.ceil(response.length / 10) || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(prev => ({ 
        ...prev, 
        payments: 'Failed to load payment transactions. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const fetchPendingPayouts = async () => {
    setLoading(prev => ({ ...prev, payouts: true }));
    setError(prev => ({ ...prev, payouts: null }));
    
    try {
      // In a real app, you would make an API call to get pending payouts
      // Since there's no direct endpoint for this, we'll simulate it with earnings data
      // and active workers data
      
      // Get workers with completed bookings awaiting payment
      const activeWorkers = await AdminService.getAllUsers({ 
        role: 'worker',
        isVerified: true,
        hasPendingPayouts: true
      });
      
      if (!activeWorkers || activeWorkers.length === 0) {
        setPendingPayouts([]);
        return;
      }
      
      // Format for the UI
      const formattedPayouts = activeWorkers.map(worker => {
        // Calculate totals from worker stats
        const completedJobs = worker.workerProfile?.totalCompletedJobs || 0;
        const totalEarnings = worker.workerProfile?.totalEarnings || 0;
        const pendingEarnings = worker.workerProfile?.pendingEarnings || 0;
        
        // Estimate commission at 10% (would be more precise in a real app)
        const commission = Math.round(pendingEarnings * 0.1);
        
        return {
          id: worker._id,
          workerId: worker.workerProfile?._id || worker._id,
          workerName: worker.name || 'Unknown Worker',
          pendingJobs: completedJobs,
          totalAmount: pendingEarnings,
          commission: commission,
          workerAmount: pendingEarnings - commission,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next week
        };
      });
      
      setPendingPayouts(formattedPayouts);
    } catch (err) {
      console.error('Error fetching pending payouts:', err);
      setError(prev => ({ 
        ...prev, 
        payouts: 'Failed to load pending payouts. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  const fetchCommissions = async () => {
    setLoading(prev => ({ ...prev, commissions: true }));
    setError(prev => ({ ...prev, commissions: null }));
    
    try {
      // Fetch commissions from API
      const commissionsData = await AdminService.getAllCommissions();
      
      if (!commissionsData) {
        throw new Error('Failed to fetch commissions');
      }
      
      setCommissions(commissionsData);
      
      // Create a map of profession ID to commission rate for the form
      const rateMap = {};
      commissionsData.forEach(commission => {
        if (commission.profession && commission.profession._id) {
          rateMap[commission.profession._id] = commission.rate;
        }
      });
      
      setCommissionRates(rateMap);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError(prev => ({ 
        ...prev, 
        commissions: 'Failed to load commission settings. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, commissions: false }));
    }
  };

  const fetchEarningsData = async () => {
    setLoading(prev => ({ ...prev, earnings: true }));
    setError(prev => ({ ...prev, earnings: null }));
    
    try {
      // Fetch earnings data from API
      const earnings = await AdminService.getCommissionEarnings();
      
      if (!earnings) {
        throw new Error('Failed to fetch earnings data');
      }
      
      setEarningsData(earnings);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError(prev => ({ 
        ...prev, 
        earnings: 'Failed to load earnings data. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, earnings: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setPage(1); // Reset to first page when changing date range
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleProcessPayouts = async () => {
    // In a real app, this would make an API call to process all pending payouts
    setLoading(prev => ({ ...prev, payouts: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage('All payouts have been processed successfully!');
      
      // Clear pending payouts
      setPendingPayouts([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error processing payouts:', err);
      setError(prev => ({ 
        ...prev, 
        payouts: 'Failed to process payouts. Please try again.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  const handleProcessSinglePayout = async (workerId, workerName) => {
    // In a real app, this would make an API call to process a specific payout
    setLoading(prev => ({ ...prev, payouts: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success message
      setSuccessMessage(`Payout for ${workerName} has been processed successfully!`);
      
      // Remove this payout from the list
      setPendingPayouts(pendingPayouts.filter(p => p.workerId !== workerId));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error(`Error processing payout for ${workerName}:`, err);
      setError(prev => ({ 
        ...prev, 
        payouts: `Failed to process payout for ${workerName}. Please try again.` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  const handleCommissionRateChange = (professionId, rate) => {
    setCommissionRates(prev => ({
      ...prev,
      [professionId]: rate
    }));
  };

  const handleSaveCommissionSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingCommission(true);
    setError(prev => ({ ...prev, commissions: null }));
    
    try {
      // Update each changed commission rate
      const updatePromises = commissions.map(async (commission) => {
        const professionId = commission.profession._id;
        const newRate = commissionRates[professionId];
        const currentRate = commission.rate;
        
        // Only update if rate has changed
        if (newRate !== currentRate) {
          return AdminService.updateCommissionRate(commission._id, newRate);
        }
        
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      // Show success message
      setSuccessMessage('Commission settings updated successfully!');
      
      // Refetch commissions
      await fetchCommissions();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating commission settings:', err);
      setError(prev => ({ 
        ...prev, 
        commissions: 'Failed to update commission settings. Please try again.' 
      }));
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  // Filter payments by search term client-side
  const filteredPayments = payments.filter(payment => 
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = () => {
    // In a real app, this would generate and download a CSV/Excel report
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Payment Management</h4>
        
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setSuccessMessage(null)}
            ></button>
          </div>
        )}
        
        <div className="row mb-4">
          <div className="col-md-7 mb-3 mb-md-0">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => handleTabChange('transactions')}
                >
                  Transactions
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'payouts' ? 'active' : ''}`}
                  onClick={() => handleTabChange('payouts')}
                >
                  Pending Payouts
                  {pendingPayouts.length > 0 && (
                    <span className="badge bg-warning rounded-pill ms-2">{pendingPayouts.length}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('settings')}
                >
                  Commission Settings
                </button>
              </li>
            </ul>
          </div>
          
          {activeTab === 'transactions' && (
            <div className="col-md-5 d-flex">
              <div className="btn-group me-2">
                <button 
                  className={`btn ${dateRange === 'week' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => handleDateRangeChange('week')}
                >
                  Week
                </button>
                <button 
                  className={`btn ${dateRange === 'month' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => handleDateRangeChange('month')}
                >
                  Month
                </button>
                <button 
                  className={`btn ${dateRange === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => handleDateRangeChange('all')}
                >
                  All
                </button>
              </div>
              
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {error.payments && (
              <ErrorHandler 
                error={error.payments} 
                onRetry={fetchPayments} 
                showRetry={true} 
                className="mb-4"
              />
            )}
            
            {loading.payments ? (
              <LoadingSpinner text="Loading payment transactions..." />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Worker</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <i className="bi bi-cash-coin fs-4 text-muted d-block mb-2"></i>
                            No transactions found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map(payment => (
                          <tr key={payment.id}>
                            <td>#{payment.paymentId}</td>
                            <td>{payment.customerName}</td>
                            <td>{payment.workerName}</td>
                            <td>{payment.service}</td>
                            <td>{payment.date}</td>
                            <td>₹{payment.amount}</td>
                            <td>₹{payment.commission}</td>
                            <td>
                              <span className={`badge ${
                                payment.status === 'completed' || payment.status === 'successful' ? 'bg-success' : 
                                payment.status === 'pending' ? 'bg-warning' :
                                payment.status === 'refunded' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => alert(`View details for transaction #${payment.paymentId}`)}
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => alert(`Print receipt for transaction #${payment.paymentId}`)}
                                  title="Print Receipt"
                                >
                                  <i className="bi bi-printer"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3 d-flex justify-content-between">
                  <div>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleExportReport}
                    >
                      <i className="bi bi-download me-1"></i> Export Report
                    </button>
                  </div>
                  <div>
                    <span className="me-2">Showing {filteredPayments.length} entries</span>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1" 
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      &lt;
                    </button>
                    <button className="btn btn-sm btn-primary me-1">{page}</button>
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Pending Payouts Tab */}
        {activeTab === 'payouts' && (
          <>
            {error.payouts && (
              <ErrorHandler 
                error={error.payouts} 
                onRetry={fetchPendingPayouts} 
                showRetry={true} 
                className="mb-4"
              />
            )}
            
            {loading.payouts ? (
              <LoadingSpinner text="Loading pending payouts..." />
            ) : (
              <>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Payout Summary</h5>
                        <div className="row mt-3">
                          <div className="col-6">
                            <h6 className="text-muted">Total Amount</h6>
                            <h3>₹{pendingPayouts.reduce((sum, payout) => sum + payout.totalAmount, 0)}</h3>
                          </div>
                          <div className="col-6">
                            <h6 className="text-muted">Workers</h6>
                            <h3>{pendingPayouts.length}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Scheduled Payout</h5>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <h6 className="text-muted">Next Payout Date</h6>
                            <h3>{pendingPayouts.length > 0 ? new Date(pendingPayouts[0].dueDate).toLocaleDateString() : 'N/A'}</h3>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={handleProcessPayouts}
                            disabled={pendingPayouts.length === 0 || loading.payouts}
                          >
                            {loading.payouts ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2-circle me-1"></i> Process All Payouts
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="table-responsive mt-4">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Completed Jobs</th>
                        <th>Total Amount</th>
                        <th>Platform Commission</th>
                        <th>Worker Payout</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayouts.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <i className="bi bi-check-circle fs-4 text-success d-block mb-2"></i>
                            No pending payouts at this time.
                          </td>
                        </tr>
                      ) : (
                        pendingPayouts.map(payout => (
                          <tr key={payout.id}>
                            <td>{payout.workerName}</td>
                            <td>{payout.pendingJobs}</td>
                            <td>₹{payout.totalAmount}</td>
                            <td>₹{payout.commission}</td>
                            <td>₹{payout.workerAmount}</td>
                            <td>{new Date(payout.dueDate).toLocaleDateString()}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => alert(`View details for ${payout.workerName}'s payout`)}
                                  title="View Details"
                                  disabled={loading.payouts}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-success"
                                  onClick={() => handleProcessSinglePayout(payout.workerId, payout.workerName)}
                                  title="Process Payout"
                                  disabled={loading.payouts}
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Commission Settings Tab */}
        {activeTab === 'settings' && (
          <>
            {error.commissions && (
              <ErrorHandler 
                error={error.commissions} 
                onRetry={fetchCommissions} 
                showRetry={true} 
                className="mb-4"
              />
            )}
            
            {loading.commissions ? (
              <LoadingSpinner text="Loading commission settings..." />
            ) : (
              <div className="row">
                <div className="col-md-6 mx-auto">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Platform Commission Settings</h5>
                      
                      <form onSubmit={handleSaveCommissionSettings}>
                        <div className="mb-4">
                          <label className="form-label">Default Commission Rate (%)</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              className="form-control" 
                              value="10" 
                              disabled 
                              min="0" 
                              max="30" 
                            />
                            <span className="input-group-text">%</span>
                          </div>
                          <small className="text-muted">Applied to all services unless specified below</small>
                        </div>
                        
                        <h6 className="mb-3">Service-Specific Commission Rates</h6>
                         
                         {commissions.map(commission => (
                           <div className="mb-3" key={commission._id}>
                             <label className="form-label">{commission.profession?.name || 'Unknown Service'}</label>
                             <div className="input-group">
                               <input 
                                 type="number" 
                                 className="form-control" 
                                 value={commissionRates[commission.profession?._id] || commission.rate} 
                                 onChange={(e) => handleCommissionRateChange(
                                   commission.profession?._id,
                                   parseInt(e.target.value)
                                 )}
                                 min="0" 
                                 max="30" 
                               />
                               <span className="input-group-text">%</span>
                             </div>
                           </div>
                         ))}
                         
                         <div className="d-grid">
                           <button 
                             type="submit" 
                             className="btn btn-primary"
                             disabled={isUpdatingCommission}
                           >
                             {isUpdatingCommission ? (
                               <>
                                 <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                 Saving...
                               </>
                             ) : (
                               <>
                                 <i className="bi bi-save me-1"></i> Save Commission Settings
                               </>
                             )}
                           </button>
                         </div>
                       </form>
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentManagement;