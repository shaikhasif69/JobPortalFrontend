import React from 'react';
import { Link } from 'react-router-dom';

function QuickActions() {
  const actions = [
    { id: 1, title: 'Book Emergency Service', icon: 'bi-exclamation-triangle', link: '/emergency', color: 'danger' },
    { id: 2, title: 'Schedule Maintenance', icon: 'bi-calendar-check', link: '/schedule', color: 'primary' },
    { id: 3, title: 'View Recent Workers', icon: 'bi-people', link: '/recent-workers', color: 'success' },
    { id: 4, title: 'Help & Support', icon: 'bi-question-circle', link: '/support', color: 'info' }
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="list-group">
          {actions.map(action => (
            <Link 
              key={action.id} 
              to={action.link} 
              className="list-group-item list-group-item-action d-flex align-items-center p-3"
            >
              <div className={`rounded-circle bg-${action.color} bg-opacity-10 p-2 me-3`}>
                <i className={`bi ${action.icon} text-${action.color}`}></i>
              </div>
              <span>{action.title}</span>
              <i className="bi bi-chevron-right ms-auto"></i>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;