import React, { useState } from 'react';

function EarningsSummary({ earnings, completedJobs }) {
  const [period, setPeriod] = useState('month');
  
  // Mock transaction data
  const transactions = [
    { id: 1, date: '2025-03-25', customer: 'Rajesh Kumar', service: 'Water heater maintenance', amount: 1200, status: 'Paid' },
    { id: 2, date: '2025-03-20', customer: 'Meera Shah', service: 'Bathroom remodel', amount: 3500, status: 'Paid' },
    { id: 3, date: '2025-03-15', customer: 'Vijay Singh', service: 'Pipe replacement', amount: 2200, status: 'Paid' },
    { id: 4, date: '2025-03-10', customer: 'Anjali Patel', service: 'Sink installation', amount: 1500, status: 'Paid' },
    { id: 5, date: '2025-03-05', customer: 'Rahul Verma', service: 'Toilet repair', amount: 800, status: 'Paid' },
  ];

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title">Earnings Overview</h4>
            
            <div className="row g-4 mt-2">
              <div className="col-md-4">
                <div className="border rounded p-3 text-center h-100">
                  <h6 className="text-muted mb-2">Total Earnings</h6>
                  <h3 className="mb-0">₹{earnings.total.toLocaleString()}</h3>
                  <p className="text-muted mb-0">{completedJobs} completed jobs</p>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="border rounded p-3 text-center h-100">
                  <h6 className="text-muted mb-2">This Month</h6>
                  <h3 className="mb-0">₹{earnings.thisMonth.toLocaleString()}</h3>
                  <p className="text-muted mb-0">March 2025</p>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="border rounded p-3 text-center h-100">
                  <h6 className="text-muted mb-2">Pending</h6>
                  <h3 className="mb-0">₹{earnings.pending.toLocaleString()}</h3>
                  <p className="text-muted mb-0">To be paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Earnings History</h4>
              
              <div className="btn-group">
                <button 
                  type="button" 
                  className={`btn ${period === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPeriod('week')}
                >
                  Weekly
                </button>
                <button 
                  type="button" 
                  className={`btn ${period === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPeriod('month')}
                >
                  Monthly
                </button>
                <button 
                  type="button" 
                  className={`btn ${period === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPeriod('year')}
                >
                  Yearly
                </button>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.customer}</td>
                      <td>{transaction.service}</td>
                      <td>₹{transaction.amount.toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${transaction.status === 'Paid' ? 'success' : 'warning'}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-center mt-3">
              <button className="btn btn-outline-primary">
                <i className="bi bi-download me-1"></i> Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarningsSummary;