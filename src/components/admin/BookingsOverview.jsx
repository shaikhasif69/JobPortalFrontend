import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/AdminService';
import { BookingService } from '../../services/BookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorHandler from '../../components/ErrorHandler';

function BookingsOverview() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBookings();
  }, [filter, dateRange, page]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare filter parameters
      const params = {
        page,
        limit: itemsPerPage
      };
      
      // Add status filter if not 'all'
      if (filter !== 'all') {
        params.status = filter;
      }
      
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
      
      // Fetch bookings from API
      const response = await AdminService.getAllBookings(params);
      
      if (!response) {
        throw new Error('Failed to fetch bookings');
      }
      
      // Format bookings data for display
      const formattedBookings = response.map(booking => ({
        id: booking._id,
        bookingId: booking.bookingId || `BK-${booking._id.substring(0, 6)}`, 
        customer: booking.customerProfile?.user?.name || 'Unknown Customer',
        worker: booking.workerProfile?.user?.name || 'Unknown Worker',
        service: booking.profession?.name || 'Service',
        date: new Date(booking.date).toLocaleDateString(),
        time: booking.startTime ? `${booking.startTime} - ${booking.endTime}` : 'N/A',
        amount: booking.totalAmount || 0,
        status: booking.status || 'pending'
      }));
      
      setBookings(formattedBookings);
      
      // Set total pages based on response metadata (if available)
      // This assumes your API returns pagination metadata
      // If not, you'll need to adjust this part
      setTotalPages(response.totalPages || 1);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filters
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(); // Refetch with current search term
  };

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'scheduled':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  // Filter bookings by search term client-side
  const filteredBookings = bookings.filter(booking => 
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportData = () => {
    // In a real application, this would generate a CSV or Excel file
    alert('Export functionality would be implemented here');
  };

  const handleViewBookingDetails = (bookingId) => {
    // In a real application, this would navigate to a booking details page
    // or open a modal with booking details
    alert(`View details for booking ${bookingId}`);
  };

  const handlePrintInvoice = (bookingId) => {
    // In a real application, this would generate and print an invoice
    alert(`Print invoice for booking ${bookingId}`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Bookings Overview</h4>
        
        {/* Display error if there is one */}
        {error && (
          <ErrorHandler 
            error={error} 
            onRetry={fetchBookings} 
            showRetry={true} 
            className="mb-4"
          />
        )}
        
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="btn-group">
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterChange('scheduled')}
              >
                Scheduled
              </button>
              <button 
                className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterChange('completed')}
              >
                Completed
              </button>
              <button 
                className={`btn ${filter === 'cancelled' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterChange('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          <div className="col-md-3 mb-3 mb-md-0">
            <div className="btn-group">
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
                All Time
              </button>
            </div>
          </div>
          
          <div className="col-md-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner text="Loading bookings..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Worker</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="bi bi-calendar-x fs-4 text-muted d-block mb-2"></i>
                        No bookings found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.bookingId}</td>
                        <td>{booking.customer}</td>
                        <td>{booking.worker}</td>
                        <td>{booking.service}</td>
                        <td>{booking.date} at {booking.time}</td>
                        <td>₹{booking.amount.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleViewBookingDetails(booking.id)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => handlePrintInvoice(booking.id)}
                              title="Print Invoice"
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
                  className="btn btn-outline-primary me-2"
                  onClick={handleExportData}
                >
                  <i className="bi bi-download me-1"></i> Export Data
                </button>
              </div>
              <div>
                <span className="me-2">Showing {filteredBookings.length} entries</span>
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
      </div>
    </div>
  );
}

export default BookingsOverview;