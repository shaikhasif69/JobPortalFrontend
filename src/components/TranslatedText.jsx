// src/components/TranslatedText.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';

/**
 * Component for displaying translated text
 * @param {Object} props
 * @param {string} props.text - Text to translate
 * @param {Object} props.options - Translation options
 * @param {React.Component} props.component - Component to render (default: span)
 * @param {Object} props.componentProps - Props to pass to the component
 */
const TranslatedText = ({ 
  text, 
  options = {}, 
  component: Component = 'span', 
  componentProps = {} 
}) => {
  const { t, tSync } = useTranslation();
  const [translatedText, setTranslatedText] = useState(tSync(text));
  
  useEffect(() => {
    // Update with async translation when available
    let mounted = true;
    
    const updateTranslation = async () => {
      const translation = await t(text, options);
      if (mounted) {
        setTranslatedText(translation);
      }
    };
    
    updateTranslation();
    
    return () => {
      mounted = false;
    };
  }, [text, t, options]);
  
  return <Component {...componentProps}>{translatedText}</Component>;
};

/**
 * Translate an API response and render its content
 * @param {Object} props
 * @param {Object} props.data - API response data
 * @param {Function} props.renderFn - Function to render the translated data
 */
const TranslatedApiContent = ({ data, renderFn, loadingComponent = null }) => {
  const { translateApiResponse, isLoading } = useTranslation();
  const [translatedData, setTranslatedData] = useState(data);
  
  useEffect(() => {
    let mounted = true;
    
    const updateTranslation = async () => {
      const translated = await translateApiResponse(data);
      if (mounted) {
        setTranslatedData(translated);
      }
    };
    
    updateTranslation();
    
    return () => {
      mounted = false;
    };
  }, [data, translateApiResponse]);
  
  if (isLoading && loadingComponent) {
    return loadingComponent;
  }
  
  return renderFn(translatedData);
};

export { TranslatedText, TranslatedApiContent };