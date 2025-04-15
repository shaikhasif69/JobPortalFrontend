import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          // Try to get stored user data first for quick loading
          const storedUserData = AuthService.getStoredUserData();
          if (storedUserData) {
            setUser(storedUserData);
          }
          
          // Then fetch fresh user data from API
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Auth initialization error:', err);
          AuthService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
      
      // Navigate based on user role
      switch (response.user.role) {
        case 'worker':
          navigate('/worker');
          break;
        case 'customer':
          navigate('/customer');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
      
      return response.user.role;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.register(userData);
      setUser(response.user);
      
      // Navigate based on user role
      switch (userData.role) {
        case 'worker':
          navigate('/worker');
          break;
        case 'customer':
          navigate('/customer');
          break;
        default:
          navigate('/');
      }
      
      return userData.role;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update user data in context
  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        logout, 
        updateUser,
        isAuthenticated: AuthService.isAuthenticated,
        getUserRole: AuthService.getUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;