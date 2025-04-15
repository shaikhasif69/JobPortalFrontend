import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WorkerService from '../../services/workerService';
import PaymentSettlementService from '../../services/PaymentSettlementService';
import LoadingSpinner from '../LoadingSpinner';
import ErrorHandler from '../ErrorHandler';

const WorkerEarningsDetail = () => {
  const [earnings, setEarnings] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState({
    earnings: true,
    payments: true
  });
  const [error, setError] = useState({
    earnings: null,
    payments: null
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchEarnings();
    fetchPayments();
  }, [filterPeriod]);

  const fetchEarnings = async () => {
    setLoading(prev => ({ ...prev, earnings: true }));
    setError(prev => ({ ...prev, earnings: null }));
    
    try {
      // Get worker profile with stats
      const response = await WorkerService.getWorkerProfile();
      
      // Format earnings data
      const earningsData = {
        total: response.stats?.totalEarnings || 0,
        thisMonth: response.stats?.monthlyEarnings || 0,
        pending: response.stats?.pendingEarnings || 0,
        completedJobs: response.worker?.totalCompletedJobs || 0
      };
      
      setEarnings(earningsData);
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

  const fetchPayments = async (reset = true) => {
    setLoading(prev => ({ ...prev, payments: true }));
    setError(prev => ({ ...prev, payments: null }));
    
    try {
      // Prepare date range based on filter period
      let params = { page: reset ? 1 : page };
      
      if (filterPeriod === 'custom' && dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.startDate = monthAgo.toISOString().split('T')[0];
      } else if (filterPeriod === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        params.startDate = yearAgo.toISOString().split('T')[0];
      }
      
      // Get payment history
      const paymentsData = await PaymentSettlementService.getWorkerPaymentHistory(params);
      
      // Format payments data
      const formattedPayments = paymentsData.map(payment => ({
        id: payment._id,
        paymentId: payment.paymentId || `P-${payment._id.substring(0, 6)}`,
        bookingId: payment.booking?.bookingId || 'N/A',
        customerName: payment.customerProfile?.user?.name || 'Customer',
        service: payment.booking?.profession?.name || 'Service',
        date: new Date(payment.createdAt || payment.date).toLocaleDateString(),
        totalAmount: payment.amount || 0,
        commission: payment.commissionAmount || Math.round(payment.amount * 0.1) || 0,
        workerAmount: payment.workerAmount || (payment.amount - payment.commissionAmount) || 0,
        status: payment.status || 'pending'
      }));
      
      if (reset) {
        setPayments(formattedPayments);
        setPage(2);
      } else {
        setPayments(prev => [...prev, ...formattedPayments]);
        setPage(prev => prev + 1);
      }
      
      // Check if there are more payments to load
      setHasMore(formattedPayments.length === 10);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(prev => ({ 
        ...prev, 
        payments: 'Failed to load payment history. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (period) => {
    setFilterPeriod(period);
  };

  const handleLoadMore = () => {
    fetchPayments(false);
  };

  const handleApplyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchPayments(true);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'successful':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="worker-earnings-detail">
      {/* Earnings Overview */}
      <div className="row mb-4">
        <div className="col-12">
          {error.earnings ? (
            <ErrorHandler 
              error={error.earnings} 
              onRetry={fetchEarnings} 
              className="mb-3"
            />
          ) : loading.earnings ? (
            <LoadingSpinner text="Loading earnings data..." className="mb-3" />
          ) : earnings && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">Earnings Overview</h4>
                
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <h6 className="text-muted mb-2">Total Earnings</h6>
                      <h3 className="mb-0">₹{earnings.total.toLocaleString()}</h3>
                      <p className="text-muted mb-0">{earnings.completedJobs} completed jobs</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <h6 className="text-muted mb-2">This Month</h6>
                      <h3 className="mb-0">₹{earnings.thisMonth.toLocaleString()}</h3>
                      <p className="text-muted mb-0">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <h6 className="text-muted mb-2">Pending</h6>
                      <h3 className="mb-0">₹{earnings.pending.toLocaleString()}</h3>
                      <p className="text-muted mb-0">To be received</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment History */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">Payment History</h4>
                
                <div className="d-flex gap-2">
                  <div className="btn-group">
                    <button 
                      type="button" 
                      className={`btn ${filterPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleFilterChange('week')}
                    >
                      Week
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${filterPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleFilterChange('month')}
                    >
                      Month
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${filterPeriod === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleFilterChange('year')}
                    >
                      Year
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${filterPeriod === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleFilterChange('custom')}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Custom Date Range */}
              {filterPeriod === 'custom' && (
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button 
                      className="btn btn-primary"
                      onClick={handleApplyDateFilter}
                      disabled={!dateRange.startDate || !dateRange.endDate}
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
              
              {error.payments ? (
                <ErrorHandler 
                  error={error.payments} 
                  onRetry={() => fetchPayments(true)} 
                  className="mb-3"
                />
              ) : loading.payments && payments.length === 0 ? (
                <LoadingSpinner text="Loading payment history..." />
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Payment ID</th>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Worker Amount</th>
                          <th>Commission</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              <i className="bi bi-credit-card fs-1 text-muted"></i>
                              <p className="mt-2">No payment records found for this period.</p>
                            </td>
                          </tr>
                        ) : (
                          payments.map(payment => (
                            <tr key={payment.id}>
                              <td>{payment.paymentId}</td>
                              <td>{payment.bookingId}</td>
                              <td>{payment.customerName}</td>
                              <td>{payment.service}</td>
                              <td>{payment.date}</td>
                              <td className="text-success">₹{payment.workerAmount}</td>
                              <td className="text-muted">₹{payment.commission}</td>
                              <td>₹{payment.totalAmount}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {hasMore && (
                    <div className="text-center mt-4">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handleLoadMore}
                        disabled={loading.payments}
                      >
                        {loading.payments ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Loading...
                          </>
                        ) : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
              
              <div className="text-center mt-4">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-download me-1"></i> Download Earnings Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerEarningsDetail;