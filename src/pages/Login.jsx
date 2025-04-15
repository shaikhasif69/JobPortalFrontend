import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    loginCredential: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.loginCredential || !formData.password) {
      setError('Please enter both email/phone and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Determine if input is email or phone
      const isEmail = formData.loginCredential.includes('@');
      
      const loginData = {
        password: formData.password
      };
      
      // Add either email or phone based on input
      if (isEmail) {
        loginData.email = formData.loginCredential;
      } else {
        loginData.phone = formData.loginCredential;
      }

      const response = await axios.post(
        'https://blue-collar-job-backend.vercel.app/api/auth/login',
        loginData
      );

      if (response.data && response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.data.user.role);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        // Redirect based on user role
        switch (response.data.data.user.role) {
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
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Log In</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="loginCredential" className="form-label">Email or Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="loginCredential"
                  name="loginCredential"
                  value={formData.loginCredential}
                  onChange={handleChange}
                  placeholder="Enter email or phone number" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password" 
                  required 
                />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Log In'}
              </button>
              <div className="text-center mt-3">
                <Link to="#" className="text-decoration-none">Forgot Password?</Link>
              </div>
            </form>
            <hr className="my-4" />
            <div className="text-center">
              <p className="mb-0">Don't have an account?</p>
              <Link to="/register" className="btn btn-outline-primary mt-2">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;