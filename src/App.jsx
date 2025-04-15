import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/Authcontext';
import ProtectedRoute from './context/ProtectedRoutes';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;