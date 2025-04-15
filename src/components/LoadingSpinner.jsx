import React from 'react';

/**
 * LoadingSpinner component for displaying loading states consistently
 * 
 * @param {Object} props
 * @param {string} props.size - Size of spinner (sm, md, lg) (default: md)
 * @param {string} props.color - Color of spinner (primary, secondary, success, danger, warning, info) (default: primary)
 * @param {string} props.text - Optional text to display below spinner
 * @param {boolean} props.fullPage - Whether to center spinner in full page (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text,
  fullPage = false,
  className = ''
}) => {
  // Map size to Bootstrap spinner sizes
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : '';
  
  // Base component
  const spinner = (
    <div className={`text-center ${className}`}>
      <div className={`spinner-border text-${color} ${spinnerSize}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2">{text}</p>}
    </div>
  );
  
  // If fullPage is true, center the spinner in the viewport
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner;