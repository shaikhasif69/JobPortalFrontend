// src/context/TranslationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import TranslationService, { SUPPORTED_LANGUAGES } from '../services/TranslationService';

// Create the context
const TranslationContext = createContext();

// Custom hook for accessing translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  // Get saved language from localStorage or default to English
  const savedLanguage = localStorage.getItem('language') || 'en';
  const [currentLanguage, setCurrentLanguage] = useState(savedLanguage);
  const [isLoading, setIsLoading] = useState(false);
  
  // Translation functions
  const [translations, setTranslations] = useState({});
  
  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);
  
  /**
   * Change the current language
   * @param {string} languageCode - Language code to change to
   */
  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
    } else {
      console.error(`Language ${languageCode} is not supported`);
    }
  };
  
  /**
   * Translate a text string
   * @param {string} text - Text to translate
   * @param {Object} options - Options for translation
   * @returns {string} Translated text or original if not yet translated
   */
  const t = async (text, options = {}) => {
    // If language is English (source language) or empty text, return original text
    if (currentLanguage === 'en' || !text?.trim()) {
      return text;
    }
    
    // Create a unique key for this translation
    const key = `${currentLanguage}:${text}`;
    
    // Return from cache if available
    if (translations[key]) {
      return translations[key];
    }
    
    try {
      setIsLoading(true);
      const translatedText = await TranslationService.translateText(text, currentLanguage);
      
      // Update translations state with new translation
      setTranslations(prev => ({
        ...prev,
        [key]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Synchronous version that returns cached translation or original text
   * while async translation happens in background
   */
  const tSync = (text) => {
    if (currentLanguage === 'en' || !text?.trim()) {
      return text;
    }
    
    const key = `${currentLanguage}:${text}`;
    
    // Return cached translation if available
    if (translations[key]) {
      return translations[key];
    }
    
    // Otherwise, start translation in background and return original text for now
    t(text);
    return text;
  };
  
  /**
   * Translate an API response object
   * @param {Object} data - API response data
   * @returns {Promise<Object>} Translated data object
   */
  const translateApiResponse = async (data) => {
    if (currentLanguage === 'en' || !data) return data;
    
    try {
      setIsLoading(true);
      const translatedData = await TranslationService.translateObject(data, currentLanguage);
      return translatedData;
    } catch (error) {
      console.error('API translation error:', error);
      return data; // Return original data on error
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Pre-load translations for common UI elements
   * @param {Array<string>} texts - Array of texts to pre-translate
   */
  const preloadTranslations = async (texts) => {
    if (currentLanguage === 'en' || !texts?.length) return;
    
    try {
      setIsLoading(true);
      const translatedTexts = await TranslationService.batchTranslateTexts(texts, currentLanguage);
      
      // Update translations state with new translations
      const newTranslations = {};
      texts.forEach((text, index) => {
        newTranslations[`${currentLanguage}:${text}`] = translatedTexts[index];
      });
      
      setTranslations(prev => ({
        ...prev,
        ...newTranslations
      }));
    } catch (error) {
      console.error('Preload translations error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Context value
  const value = {
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    tSync,
    translateApiResponse,
    preloadTranslations,
    isLoading
  };
  
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;