import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { TranslatedText, TranslatedApiContent } from '../components/TranslatedText';
import LanguageSelector from '../components/LanguageSelector';

const serviceIcons = {
  Plumbing: "bi bi-droplet", 
  Electrical: "bi-lightning-charge", 
  Carpentry: "bi-hammer", 
  Painting: "bi-palette", 
  Cleaning: "bi-bucket", 
  Gardening: "bi-tree"
};

function Landing() {
  const { preloadTranslations } = useTranslation();
  
  useEffect(() => {
    // Preload translations specific to this page
    preloadTranslations([
      'Find Skilled Workers Near You',
      'Connect with trusted blue-collar professionals for all your home service needs.',
      'Get Started',
      'Login',
      'Our Services',
      'How It Works',
      'Search Services',
      'Book Appointment',
      'Get Service',
      'Find the right professional for your needs from our verified workers.',
      'Schedule a service at your preferred date and time.',
      'Receive quality service from skilled professionals.',
      'Ready to Get Started?',
      'Join thousands of satisfied customers and skilled professionals on our platform.',
      'Hire a Professional',
      'Join as Worker',
      'What Our Users Say',
      'I found a great plumber through this platform. The service was prompt and professional. Will definitely use again!',
      'This platform has helped me find consistent work as an electrician. The booking system is very straightforward.',
      'Finding a good carpenter was so easy with this app. The work was completed on time and within budget.',
      'Customer',
      'Electrician',
      'Choose Your Language',
      'Years Exp.'
    ]);
  }, [preloadTranslations]);

  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold">
                <TranslatedText 
                  text="Find Skilled Workers Near You"
                  component="span"
                />
              </h1>
              <p className="lead mb-4">
                <TranslatedText 
                  text="Connect with trusted blue-collar professionals for all your home service needs."
                  component="span"
                />
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/register" className="btn btn-light btn-lg">
                  <TranslatedText text="Get Started" />
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  <TranslatedText text="Login" />
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/construction-workers-work-together-to-build-a-building-illustration-download-in-svg-png-gif-file-formats--labour-day-happy-labor-progress-pack-people-illustrations-6647162.png?f=webp" alt="Workers" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Language Selector */}
      <div className="container mt-3 mb-4">
        <div className="d-flex justify-content-end">
          <LanguageSelector variant="icon" />
        </div>
      </div>

      {/* Services Section */}
      <div className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">
            <TranslatedText text="Our Services" />
          </h2>
          <div className="row g-4">
            {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Gardening'].map((service, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-2">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                        style={{ width: '80px', height: '80px' }}>
                      <i className={`bi ${serviceIcons[service]} fs-3`}></i>
                    </div>
                    <h5 className="card-title">
                      <TranslatedText text={service} />
                    </h5>
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
          <h2 className="text-center mb-5">
            <TranslatedText text="How It Works" />
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">1</span>
                  </div>
                  <h4><TranslatedText text="Search Services" /></h4>
                  <p className="text-muted">
                    <TranslatedText text="Find the right professional for your needs from our verified workers." />
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">2</span>
                  </div>
                  <h4><TranslatedText text="Book Appointment" /></h4>
                  <p className="text-muted">
                    <TranslatedText text="Schedule a service at your preferred date and time." />
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">3</span>
                  </div>
                  <h4><TranslatedText text="Get Service" /></h4>
                  <p className="text-muted">
                    <TranslatedText text="Receive quality service from skilled professionals." />
                  </p>
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
              <h2 className="mb-3">
                <TranslatedText text="Ready to Get Started?" />
              </h2>
              <p className="lead mb-4">
                <TranslatedText text="Join thousands of satisfied customers and skilled professionals on our platform." />
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register?type=customer" className="btn btn-primary btn-lg">
                  <TranslatedText text="Hire a Professional" />
                </Link>
                <Link to="/register?type=worker" className="btn btn-outline-primary btn-lg">
                  <TranslatedText text="Join as Worker" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-5">
            <TranslatedText text="What Our Users Say" />
          </h2>
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
                  <p className="card-text">
                    <TranslatedText text="I found a great plumber through this platform. The service was prompt and professional. Will definitely use again!" />
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Priya Sharma</h6>
                      <small className="text-muted">
                        <TranslatedText text="Customer" />
                      </small>
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
                  <p className="card-text">
                    <TranslatedText text="This platform has helped me find consistent work as an electrician. The booking system is very straightforward." />
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Rajesh Kumar</h6>
                      <small className="text-muted">
                        <TranslatedText text="Electrician" />
                      </small>
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
                  <p className="card-text">
                    <TranslatedText text="Finding a good carpenter was so easy with this app. The work was completed on time and within budget." />
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
                    <div>
                      <h6 className="mb-0">Amit Patel</h6>
                      <small className="text-muted">
                        <TranslatedText text="Customer" />
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Workers Section */}
      <div className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">
            <TranslatedText text="Top Professionals" />
          </h2>
          <TranslatedApiContent
            data={[
              {
                id: 1,
                name: "Vikram Mehta",
                profession: "Plumber",
                rating: 4.8,
                experience: 5,
                isAvailableNow: true
              },
              {
                id: 2,
                name: "Priya Joshi",
                profession: "Electrician",
                rating: 4.9,
                experience: 7,
                isAvailableNow: false
              },
              {
                id: 3,
                name: "Sandeep Patel",
                profession: "Carpenter",
                rating: 4.7,
                experience: 3,
                isAvailableNow: true
              }
            ]}
            renderFn={(workers) => (
              <div className="row">
                {workers.map(worker => (
                  <div key={worker.id} className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-primary text-white p-3 me-3 d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                            <i className={`bi ${serviceIcons[worker.profession] || 'bi-person-workspace'} fs-3`}></i>
                          </div>
                          <div>
                            <h5 className="mb-0">{worker.name}</h5>
                            <p className="mb-0 text-muted">
                              <TranslatedText text={worker.profession} />
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3 d-flex justify-content-between">
                          <div>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <span>{worker.rating}</span>
                          </div>
                          <div>
                            <TranslatedText text="Years Exp." />: {worker.experience}
                          </div>
                        </div>
                        
                        {worker.isAvailableNow && (
                          <div className="mb-3">
                            <span className="badge bg-success">
                              <TranslatedText text="Available Now" />
                            </span>
                          </div>
                        )}
                        
                        <Link to={`/worker/${worker.id}`} className="btn btn-primary w-100">
                          <TranslatedText text="View Profile" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
          <div className="text-center mt-4">
            <Link to="/search" className="btn btn-outline-primary">
              <TranslatedText text="View All Professionals" /> <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile App Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center mb-4 mb-md-0">
              <img src="/api/placeholder/300/600" alt="Mobile App" className="img-fluid rounded shadow" style={{ maxHeight: '400px' }} />
            </div>
            <div className="col-md-6">
              <h2>
                <TranslatedText text="Get Our Mobile App" />
              </h2>
              <p className="lead">
                <TranslatedText text="Find and book services on the go with our mobile application." />
              </p>
              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-light">
                  <i className="bi bi-google-play me-2"></i> 
                  <TranslatedText text="Google Play" />
                </button>
                <button className="btn btn-light">
                  <i className="bi bi-apple me-2"></i> 
                  <TranslatedText text="App Store" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">
            <TranslatedText text="Frequently Asked Questions" />
          </h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                {[
                  {
                    id: 'faq1',
                    question: 'How do I book a service?',
                    answer: 'To book a service, first search for the type of professional you need. Browse through available workers, view their profiles, and choose one that matches your requirements. Click "Book Now" and follow the instructions to schedule your service.'
                  },
                  {
                    id: 'faq2',
                    question: 'How do payments work?',
                    answer: 'We offer secure online payments through the platform. You can pay using credit/debit cards or other supported payment methods. Payment is made after the service is completed and you are satisfied with the work.'
                  },
                  {
                    id: 'faq3',
                    question: 'How can I become a service provider?',
                    answer: 'To join as a service provider, click on "Join as Worker" and complete the registration process. You\'ll need to provide your professional details, skills, and undergo a verification process before you can start accepting jobs.'
                  }
                ].map((faq, index) => (
                  <div className="accordion-item" key={faq.id}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button 
                        className={`accordion-button ${index > 0 ? 'collapsed' : ''}`} 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${index}`} 
                        aria-expanded={index === 0 ? 'true' : 'false'} 
                        aria-controls={`collapse${index}`}
                      >
                        <TranslatedText text={faq.question} />
                      </button>
                    </h2>
                    <div 
                      id={`collapse${index}`} 
                      className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                      aria-labelledby={`heading${index}`} 
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        <TranslatedText text={faq.answer} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector in Footer */}
      <div className="py-4 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <h5 className="text-center mb-3">
                <TranslatedText text="Choose Your Language" />
              </h5>
              <LanguageSelector 
                variant="buttons" 
                className="d-flex justify-content-center flex-wrap"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h4>
                <TranslatedText text="Stay Updated" />
              </h4>
              <p>
                <TranslatedText text="Subscribe to our newsletter for the latest updates and offers." />
              </p>
              <div className="input-group mb-3 mt-3">
                <input type="email" className="form-control" placeholder="Email address" />
                <button className="btn btn-primary" type="button">
                  <TranslatedText text="Subscribe" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;