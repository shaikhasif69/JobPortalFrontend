import React, { useState } from 'react';

function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">System Settings</h4>
        
        <div className="row">
          <div className="col-md-3 mb-4 mb-md-0">
            <div className="list-group">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => handleTabChange('general')}
              >
                <i className="bi bi-gear me-2"></i> General Settings
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => handleTabChange('notifications')}
              >
                <i className="bi bi-bell me-2"></i> Notification Settings
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'verification' ? 'active' : ''}`}
                onClick={() => handleTabChange('verification')}
              >
                <i className="bi bi-shield-check me-2"></i> Verification Settings
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'language' ? 'active' : ''}`}
                onClick={() => handleTabChange('language')}
              >
                <i className="bi bi-translate me-2"></i> Language & Region
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => handleTabChange('backup')}
              >
                <i className="bi bi-cloud-arrow-up me-2"></i> Backup & Recovery
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {activeTab === 'general' && (
              <div>
                <h5 className="mb-4">General Settings</h5>
                <form>
                  <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Platform Name</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" defaultValue="Job Portal for Blue-Collar Workers" />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Admin Email</label>
                    <div className="col-sm-8">
                      <input type="email" className="form-control" defaultValue="admin@jobportal.com" />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Support Phone</label>
                    <div className="col-sm-8">
                      <input type="tel" className="form-control" defaultValue="+91 123-456-7890" />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Maintenance Mode</label>
                    <div className="col-sm-8">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="maintenanceMode" />
                        <label className="form-check-label" htmlFor="maintenanceMode">Enable Maintenance Mode</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Default Radius (km)</label>
                    <div className="col-sm-8">
                      <input type="number" className="form-control" defaultValue="10" min="1" max="50" />
                      <small className="text-muted">For nearby worker searches</small>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-1"></i> Save Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h5 className="mb-4">Notification Settings</h5>
                <form>
                  <h6 className="mb-3">Email Notifications</h6>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="newUserNotif" defaultChecked />
                      <label className="form-check-label" htmlFor="newUserNotif">New User Registration</label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="newBookingNotif" defaultChecked />
                      <label className="form-check-label" htmlFor="newBookingNotif">New Booking</label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="paymentNotif" defaultChecked />
                      <label className="form-check-label" htmlFor="paymentNotif">Payment Received</label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="supportNotif" defaultChecked />
                      <label className="form-check-label" htmlFor="supportNotif">Support Requests</label>
                    </div>
                  </div>
                  
                  <h6 className="mb-3">SMS Notifications</h6>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="smsBooking" defaultChecked />
                      <label className="form-check-label" htmlFor="smsBooking">Booking Confirmations</label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="smsReminder" defaultChecked />
                      <label className="form-check-label" htmlFor="smsReminder">Service Reminders</label>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-1"></i> Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'verification' && (
              <div>
                <h5 className="mb-4">Verification Settings</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Worker Verification Method</label>
                    <select className="form-select">
                      <option value="manual">Manual Verification by Admin</option>
                      <option value="document">Document Verification</option>
                      <option value="both">Both Methods</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Required Documents</label>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="idProof" defaultChecked />
                      <label className="form-check-label" htmlFor="idProof">Government ID Proof</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="addressProof" defaultChecked />
                      <label className="form-check-label" htmlFor="addressProof">Address Proof</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="skillCertificate" defaultChecked />
                      <label className="form-check-label" htmlFor="skillCertificate">Skill Certificate (if applicable)</label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="autoApproveCustomers" defaultChecked />
                      <label className="form-check-label" htmlFor="autoApproveCustomers">Auto-approve Customer Accounts</label>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-1"></i> Save Verification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'language' && (
              <div>
                <h5 className="mb-4">Language & Region Settings</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Default Language</label>
                    <select className="form-select">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Available Languages</label>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="langEn" defaultChecked />
                      <label className="form-check-label" htmlFor="langEn">English</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="langHi" defaultChecked />
                      <label className="form-check-label" htmlFor="langHi">Hindi</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="langMr" defaultChecked />
                      <label className="form-check-label" htmlFor="langMr">Marathi</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="langTa" defaultChecked />
                      <label className="form-check-label" htmlFor="langTa">Tamil</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="langTe" />
                      <label className="form-check-label" htmlFor="langTe">Telugu</label>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Default Currency</label>
                    <select className="form-select">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-1"></i> Save Language Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'backup' && (
              <div>
                <h5 className="mb-4">Backup & Recovery</h5>
                
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title">Last Backup</h6>
                    <p className="card-text">March 25, 2025 at 02:30 AM</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary">
                        <i className="bi bi-cloud-arrow-up me-1"></i> Backup Now
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-download me-1"></i> Download Backup
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h6 className="mb-3">Backup Schedule</h6>
                  <div className="mb-3">
                    <label className="form-label">Automatic Backup Frequency</label>
                    <select className="form-select">
                      <option value="daily">Daily</option>
                      <option value="weekly" selected>Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Backup Time</label>
                    <input type="time" className="form-control" defaultValue="02:30" />
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="notifyBackup" defaultChecked />
                      <label className="form-check-label" htmlFor="notifyBackup">Email notification after backup</label>
                    </div>
                  </div>
                  
                  <h6 className="mb-3">Data Retention</h6>
                  <div className="mb-3">
                    <label className="form-label">Keep backups for</label>
                    <select className="form-select">
                      <option value="7">7 days</option>
                      <option value="30" selected>30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-1"></i> Save Backup Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;