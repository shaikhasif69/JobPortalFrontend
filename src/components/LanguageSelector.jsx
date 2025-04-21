// src/components/LanguageSelector.jsx
import React from 'react';
import { useTranslation } from '../context/TranslationContext';

const LanguageSelector = ({ className = '', variant = 'dropdown' }) => {
  const { currentLanguage, languages, changeLanguage, tSync } = useTranslation();
  
  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`language-selector ${className}`}>
        <select 
          className="form-select" 
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label="Select language"
        >
          {Object.entries(languages).map(([code, language]) => (
            <option key={code} value={code}>
              {language.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  // Button group variant
  if (variant === 'buttons') {
    // Display the top 6 most common languages as buttons
    const topLanguages = ['en', 'hi', 'bn', 'te', 'ta', 'mr'];
    const otherLanguages = Object.keys(languages).filter(code => !topLanguages.includes(code));
    
    return (
      <div className={`language-selector ${className}`}>
        <div className="btn-group mb-2" role="group" aria-label="Language selection">
          {topLanguages.map(code => (
            <button
              key={code}
              type="button"
              className={`btn ${currentLanguage === code ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => changeLanguage(code)}
            >
              {languages[code].name}
            </button>
          ))}
        </div>
        
        {otherLanguages.length > 0 && (
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              id="moreLanguagesDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              {tSync('More languages')}
            </button>
            <ul className="dropdown-menu" aria-labelledby="moreLanguagesDropdown">
              {otherLanguages.map(code => (
                <li key={code}>
                  <button 
                    className="dropdown-item" 
                    type="button"
                    onClick={() => changeLanguage(code)}
                  >
                    {languages[code].name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Icon variant (minimal UI)
  return (
    <div className={`language-selector ${className}`}>
      <div className="dropdown">
        <button 
          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
          type="button" 
          id="languageDropdown" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <i className="bi bi-globe me-1"></i>
          {languages[currentLanguage].name}
        </button>
        <ul className="dropdown-menu" aria-labelledby="languageDropdown" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {Object.entries(languages).map(([code, language]) => (
            <li key={code}>
              <button 
                className={`dropdown-item ${currentLanguage === code ? 'active' : ''}`}
                type="button"
                onClick={() => changeLanguage(code)}
              >
                {language.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageSelector;