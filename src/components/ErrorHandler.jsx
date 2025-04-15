import React from 'react';

/**
 * ErrorHandler component for displaying errors consistently across the application
 * 
 * @param {Object} props
 * @param {string|null} props.error - The error message to display
 * @param {function} props.onRetry - Optional callback function when retry button is clicked
 * @param {boolean} props.showRetry - Whether to show retry button (default: true)
 * @param {string} props.variant - Type of alert (success, danger, warning, info) (default: danger)
 * @param {string} props.className - Additional CSS classes
 */
const ErrorHandler = ({ 
  error, 
  onRetry, 
  showRetry = true, 
  variant = 'danger',
  className = ''
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      case 'danger':
      default:
        return 'bi-exclamation-triangle-fill';
    }
  };

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${getIcon()} me-2 fs-5`}></i>
        <div className="flex-grow-1">
          <div>{error}</div>
        </div>
        {showRetry && onRetry && (
          <button 
            type="button" 
            className="btn btn-sm btn-outline-light ms-3"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorHandler;