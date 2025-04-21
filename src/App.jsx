import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react'; // Added React and useEffect import
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/Authcontext';
import { TranslationProvider, useTranslation } from './context/TranslationContext'; // Added useTranslation import
import ProtectedRoute from './context/ProtectedRoutes';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Common UI text to preload translations
const commonUITexts = [
  // Navigation
  'Home', 'Dashboard', 'Profile', 'Settings', 'Logout', 'Login', 'Register',
  
  // Worker pages
  'My Jobs', 'Earnings', 'Upcoming Jobs', 'Job Requests', 'Availability',
  'Total Jobs', 'Completed', 'Requests', 'Rating',
  
  // Customer pages
  'Find Services', 'Service Categories', 'Nearby Professionals', 'My Bookings',
  'Book Now', 'Booking Confirmed', 'View All Workers',
  
  // Common
  'Save Changes', 'Cancel', 'Submit', 'Next', 'Back', 'Done',
  'Loading...', 'Error', 'Success', 'Warning', 'Info',
  
  // Form labels
  'Full Name', 'Email', 'Phone', 'Password', 'Confirm Password', 
  'Address', 'City', 'State', 'Pincode',
  
  // Status labels
  'Pending', 'Completed', 'Cancelled', 'Scheduled', 'In Progress'
];

function App() {
  return (
    <TranslationProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </TranslationProvider>
  );
}

// Separated component to use translation hook
function AppContent() {
  const { preloadTranslations } = useTranslation();
  
  // Preload translations for common UI elements
  useEffect(() => {
    preloadTranslations(commonUITexts);
  }, [preloadTranslations]);
  
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected worker routes */}
          <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
            <Route path="/worker/*" element={<WorkerDashboard />} />
          </Route>
          
          {/* Protected customer routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/customer/*" element={<CustomerDashboard />} />
          </Route>
          
          {/* Protected admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;