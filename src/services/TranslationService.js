// src/services/TranslationService.js
import axios from 'axios';

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// List of supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: "English", code: "en" },
  hi: { name: "हिन्दी", code: "hi" },
  bn: { name: "বাংলা", code: "bn" },
  te: { name: "తెలుగు", code: "te" },
  mr: { name: "मराठी", code: "mr" },
  ta: { name: "தமிழ்", code: "ta" },
  ur: { name: "اردو", code: "ur" },
  gu: { name: "ગુજરાતી", code: "gu" },
  kn: { name: "ಕನ್ನಡ", code: "kn" },
  ml: { name: "മലയാളം", code: "ml" },
  pa: { name: "ਪੰਜਾਬੀ", code: "pa" },
  as: { name: "অসমীয়া", code: "as" },
  or: { name: "ଓଡ଼ିଆ", code: "or" },
  sa: { name: "संस्कृतम्", code: "sa" },
  si: { name: "සිංහල", code: "si" },
  ne: { name: "नेपाली", code: "ne" },
  sd: { name: "سنڌي", code: "sd" },
  ks: { name: "कॉशुर", code: "ks" },
  doi: { name: "डोगरी", code: "doi" },
  kok: { name: "कोंकणी", code: "kok" },
  mai: { name: "मैथिली", code: "mai" },
  mni: { name: "মৈতৈলোন্", code: "mni" },
  sat: { name: "संताली", code: "sat" },
  bho: { name: "भोजपुरी", code: "bho" },
  raj: { name: "राजस्थानी", code: "raj" }
};

// Cache to store translations
const translationCache = {};

/**
 * Get a unique cache key for a translation
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {string} Cache key
 */
const getCacheKey = (text, targetLang) => {
  return `${targetLang}:${text}`;
};

/**
 * Translate text using Gemini API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
const translateWithGemini = async (text, targetLang) => {
  try {
    const cacheKey = getCacheKey(text, targetLang);
    
    // Check if translation is already in cache
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    // Get language name for clearer instructions to Gemini
    const targetLanguageName = SUPPORTED_LANGUAGES[targetLang]?.name || targetLang;
    
    const response = await axios.post(
      GEMINI_API_ENDPOINT,
      {
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to ${targetLanguageName}. Preserve any formatting, placeholders, or special characters. Only return the translated text without any explanations or notes.`
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );

    // Extract translated text from response
    const translatedText = response.data.choices[0].message.content.trim();
    
    // Save to cache
    translationCache[cacheKey] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Batch translate multiple texts at once to reduce API calls
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<Array<string>>} Array of translated texts
 */
const batchTranslate = async (texts, targetLang) => {
  try {
    // Filter out texts that are already in cache
    const textsToTranslate = texts.filter(
      text => !translationCache[getCacheKey(text, targetLang)]
    );
    
    if (textsToTranslate.length === 0) {
      // All texts are already in cache
      return texts.map(text => translationCache[getCacheKey(text, targetLang)]);
    }
    
    // Get language name for clearer instructions to Gemini
    const targetLanguageName = SUPPORTED_LANGUAGES[targetLang]?.name || targetLang;
    
    // Combine texts with a special separator that won't appear in normal text
    const uniqueSeparator = "||TRANSLATION_SEPARATOR||";
    const combinedText = textsToTranslate.join(uniqueSeparator);
    
    const response = await axios.post(
      GEMINI_API_ENDPOINT,
      {
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate each text segment to ${targetLanguageName}. Each segment is separated by ${uniqueSeparator}. Preserve the separators exactly as is, and maintain the same number of segments. Only translate the text, not the separators.`
          },
          {
            role: "user",
            content: combinedText
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );

    // Extract translated text and split back into array
    const translatedCombined = response.data.choices[0].message.content.trim();
    const translatedArray = translatedCombined.split(uniqueSeparator);
    
    // Cache individual translations
    textsToTranslate.forEach((text, index) => {
      translationCache[getCacheKey(text, targetLang)] = translatedArray[index];
    });
    
    // Return all translations (both from cache and newly translated)
    return texts.map(text => {
      const cacheKey = getCacheKey(text, targetLang);
      return translationCache[cacheKey] || text;
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts if translation fails
    return texts;
  }
};

/**
 * Translate an object's string values recursively
 * @param {Object} obj - Object with string values to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Object with translated string values
 */
const translateObject = async (obj, targetLang) => {
  // Skip translation if target language is English (source language)
  if (targetLang === 'en') return obj;
  
  // Collect all string values that need translation
  const stringsToTranslate = [];
  const stringPaths = [];
  
  const collectStrings = (object, path = []) => {
    if (!object || typeof object !== 'object') return;
    
    Object.entries(object).forEach(([key, value]) => {
      const currentPath = [...path, key];
      
      if (typeof value === 'string' && value.trim()) {
        stringsToTranslate.push(value);
        stringPaths.push(currentPath);
      } else if (typeof value === 'object' && value !== null) {
        collectStrings(value, currentPath);
      }
    });
  };
  
  collectStrings(obj);
  
  // Translate all strings at once
  const translatedStrings = await batchTranslate(stringsToTranslate, targetLang);
  
  // Create a deep copy of the original object
  const translatedObj = JSON.parse(JSON.stringify(obj));
  
  // Replace strings in the copied object with translations
  stringPaths.forEach((path, index) => {
    let current = translatedObj;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = translatedStrings[index];
  });
  
  return translatedObj;
};

const TranslationService = {
  translateText: translateWithGemini,
  batchTranslateTexts: batchTranslate,
  translateObject,
  SUPPORTED_LANGUAGES
};

export default TranslationService;