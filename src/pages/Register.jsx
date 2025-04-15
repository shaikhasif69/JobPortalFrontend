import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type');
  
  const [userType, setUserType] = useState(typeFromQuery || 'customer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professions, setProfessions] = useState([]);

  useEffect(() => {
    // Fetch professions when component mounts
    const fetchProfessions = async () => {
      try {
        const response = await axios.get('https://blue-collar-job-backend.vercel.app/api/professions');
        if (response.data && response.data.data) {
          setProfessions(response.data.data.professions);
        }
      } catch (err) {
        console.error('Error fetching professions:', err);
        // Set default professions if API fails
        setProfessions([
          { _id: '67e546b4062bdb543a8dfe8b', name: 'Plumber' },
          { _id: '67e546c3062bdb543a8dfe8e', name: 'Electrician' },
          { _id: '67e546cd062bdb543a8dfe91', name: 'Carpenter' },
          { _id: '67e546d9062bdb543a8dfe94', name: 'Painter' },
          { _id: '67e546e3062bdb543a8dfe97', name: 'Mechanic' }
        ]);
      }
    };

    fetchProfessions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (formData.phone.length < 10) return 'Enter a valid phone number';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Enter a valid email address';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (userType === 'worker' && !formData.profession) return 'Please select your profession';
    if (!formData.termsAccepted) return 'You must accept the Terms and Conditions';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType
      };

      // Add profession if user is a worker
      if (userType === 'worker') {
        userData.profession = formData.profession;
      }

      const response = await axios.post(
        'https://blue-collar-job-backend.vercel.app/api/auth/register',
        userData
      );

      if (response.data && response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', userType);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        // Redirect based on user type
        if (userType === 'worker') {
          navigate('/worker');
        } else {
          navigate('/customer');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-4">Create Account</h2>
            
            <div className="btn-group w-100 mb-4">
              <button 
                type="button" 
                className={`btn ${userType === 'worker' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setUserType('worker')}
              >
                I'm a Worker
              </button>
              <button 
                type="button" 
                className={`btn ${userType === 'customer' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setUserType('customer')}
              >
                I'm a Customer
              </button>
            </div>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <input 
                  type="tel" 
                  className="form-control" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (10 digits)" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <input 
                  type="password" 
                  className="form-control" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <input 
                  type="password" 
                  className="form-control" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password" 
                  required 
                />
              </div>
              
              {userType === 'worker' && (
                <div className="mb-3">
                  <select 
                    className="form-select" 
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Your Profession</option>
                    {professions.map(profession => (
                      <option key={profession._id} value={profession._id}>
                        {profession.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-3 form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="termsCheck" 
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required 
                />
                <label className="form-check-label" htmlFor="termsCheck">
                  I agree to the <a href="#">Terms and Conditions</a>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
            
            <div className="text-center mt-3">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;