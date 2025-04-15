import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Determine if user is logged in and get user name
  useEffect(() => {
    const loggedInPaths = ['/worker', '/customer', '/admin'];
    const isUserLoggedIn = loggedInPaths.some(path => location.pathname.startsWith(path));
    setIsLoggedIn(isUserLoggedIn);
    
    // Get user name from auth context or localStorage as fallback
    if (user && user.name) {
      setUserName(user.name);
    } else {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.name || 'User');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserName('User');
      }
    }
  }, [location, user]);

  // Logout handler
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-tools me-2"></i>
          <span>Job Portal</span>
        </NavLink>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn ? (
              <>
                {/* Show these links when logged in */}
                {location.pathname.startsWith('/worker') && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/worker">Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/worker/jobs">My Jobs</NavLink>
                    </li>
                  </>
                )}
                
                {location.pathname.startsWith('/customer') && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/customer">Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/customer/bookings">My Bookings</NavLink>
                    </li>
                  </>
                )}
                
                {location.pathname.startsWith('/admin') && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin">Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/users">Manage Users</NavLink>
                    </li>
                  </>
                )}
                
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-person-circle me-1"></i> {userName}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><NavLink className="dropdown-item" to="/profile">Profile</NavLink></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Show these links when not logged in */}
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">Sign Up</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;