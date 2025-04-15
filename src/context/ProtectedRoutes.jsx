import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './Authcontext';
import AuthService from '../services/AuthService';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  
  // This effect will verify the token with the server
  useEffect(() => {
    const verifyToken = async () => {
      if (isAuthenticated()) {
        try {
          // Make a request to verify the token
          await AuthService.getCurrentUser();
          setTokenValid(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          // If token is invalid, redirect to login
          AuthService.logout();
          setTokenValid(false);
        } finally {
          setVerifyingToken(false);
        }
      } else {
        setVerifyingToken(false);
      }
    };
    
    verifyToken();
  }, [isAuthenticated]);

  // Show loading spinner while checking auth status
  if (loading || verifyingToken) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or token is invalid, redirect to login
  if (!isAuthenticated() || !tokenValid) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();

  // If authenticated but not authorized for this route, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    switch (userRole) {
      case 'worker':
        return <Navigate to="/worker" replace />;
      case 'customer':
        return <Navigate to="/customer" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;