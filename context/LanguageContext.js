import React, {
  createContext, useContext,
  useState, useEffect } from
'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslation, languages } from '../localization/translations';

const LanguageContext = createContext(null);
export const useLanguage = () => useContext(LanguageContext);

const SUPPORTED_LANGUAGES = languages.map((lang) => ({
  code: lang.code,
  label: lang.name,
  nativeLabel: lang.nativeName,
  nativeName: lang.nativeName
}));

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLanguageSelected, setIsLanguageSelected] = useState(true);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('app_language');

        // A language no longer offered (partial translations) falls back to English
        if (saved && languages.some((lang) => lang.code === saved)) {
          setLanguage(saved);
        } else {
          await AsyncStorage.setItem('app_language', 'en');
        }
        setIsLanguageSelected(true);
      } catch (err) {

      } finally {
        setIsLanguageLoading(false);
      }
    };
    load();
  }, []);

  const selectLanguage = async (code) => {

    setLanguage(code);
    setIsLanguageSelected(true);
    await AsyncStorage.setItem('app_language', code);
    // Navigator auto-shows LoginScreen
  };

  // Translation function
  const t = (key) => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      isLanguageSelected,
      isLanguageLoading,
      selectLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES
    }}>
      {children}
    </LanguageContext.Provider>);

};
