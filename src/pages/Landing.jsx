import React from 'react';
import { Link } from 'react-router-dom';


const serviceIcons = {
  Plumbing: "bi bi-droplet", 
  Electrical: "bi-lightning-charge", 
  Carpentry: "bi-hammer", 
  Painting: "bi-palette", 
  Cleaning: "bi-bucket", 
  Gardening: "bi-tree"
};

function Landing() {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold">Find Skilled Workers Near You</h1>
              <p className="lead mb-4">Connect with trusted blue-collar professionals for all your home service needs.</p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/register" className="btn btn-light btn-lg">Get Started</Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">Login</Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/construction-workers-work-together-to-build-a-building-illustration-download-in-svg-png-gif-file-formats--labour-day-happy-labor-progress-pack-people-illustrations-6647162.png?f=webp" alt="Workers" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </div>
      

      {/* Services Section */}
      <div className="py-5">
  <div className="container">
    <h2 className="text-center mb-5">Our Services</h2>
    <div className="row g-4">
      {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Gardening'].map((service, index) => (
        <div key={index} className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                   style={{ width: '80px', height: '80px' }}>
                <i className={`bi ${serviceIcons[service]} fs-3`}></i>
              </div>
              <h5 className="card-title">{service}</h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* How It Works */}
      <div className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">1</span>
                  </div>
                  <h4>Search Services</h4>
                  <p className="text-muted">Find the right professional for your needs from our verified workers.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">2</span>
                  </div>
                  <h4>Book Appointment</h4>
                  <p className="text-muted">Schedule a service at your preferred date and time.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">3</span>
                  </div>
                  <h4>Get Service</h4>
                  <p className="text-muted">Receive quality service from skilled professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">

              <h2 className="mb-3">Ready to Get Started?</h2>
              <p className="lead mb-4">Join thousands of satisfied customers and skilled professionals on our platform.</p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register?type=customer" className="btn btn-primary btn-lg">Hire a Professional</Link>
                <Link to="/register?type=worker" className="btn btn-outline-primary btn-lg">Join as Worker</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-5">What Our Users Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="card-text">"I found a great plumber through this platform. The service was prompt and professional. Will definitely use again!"</p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Priya Sharma</h6>
                      <small className="text-muted">Customer</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-half text-warning"></i>
                  </div>
                  <p className="card-text">"This platform has helped me find consistent work as an electrician. The booking system is very straightforward."</p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Rajesh Kumar</h6>
                      <small className="text-muted">Electrician</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="card-text">"Finding a good carpenter was so easy with this app. The work was completed on time and within budget."</p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Amit Patel</h6>
                      <small className="text-muted">Customer</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="py-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-4">
              <div className="d-flex justify-content-center">
                <select className="form-select w-50 mx-auto">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
