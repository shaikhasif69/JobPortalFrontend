import React from 'react';
import { Link } from 'react-router-dom';

// Service icons and their labels
const services = [
  { id: 1, name: 'Plumbing', icon: 'bi-droplet' },
  { id: 2, name: 'Electrical', icon: 'bi-lightning-charge' },
  { id: 3, name: 'Carpentry', icon: 'bi-hammer' },
  { id: 4, name: 'Painting', icon: 'bi-palette' },
  { id: 5, name: 'Cleaning', icon: 'bi-bucket' },
  { id: 6, name: 'Gardening', icon: 'bi-tree' }
];

function ServiceCategories() {
  return (
    <div className="row g-3">
      {services.map(service => (
        <div key={service.id} className="col-6 col-md-4 col-lg-2">
          <Link to={`/services/${service.name.toLowerCase()}`} className="text-decoration-none">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{ width: '70px', height: '70px' }}>
                  <i className={`bi ${service.icon} fs-3 text-primary`}></i>
                </div>
                <h5 className="card-title">{service.name}</h5>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default ServiceCategories;