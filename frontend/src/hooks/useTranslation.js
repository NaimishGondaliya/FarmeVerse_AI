import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import en from '../locales/en';
import gu from '../locales/gu';

const translations = { en, gu };

export const useTranslation = () => {
    const { language, changeLanguage } = useContext(LanguageContext);

    const t = (key, params = {}) => {
        const langDict = translations[language] || translations['en'];
        const keys = key.split('.');

        let value = langDict;
        for (const k of keys) {
            if (value !== undefined && value !== null && value.hasOwnProperty(k)) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        // Simple string replacement if params exist (e.g. {count})
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            let result = value;
            for (const [pKey, pVal] of Object.entries(params)) {
                result = result.replace(new RegExp(`{${pKey}}`, 'g'), pVal);
            }
            return result;
        }

        return typeof value === 'string' ? value : key;
    };

    return { t, language, changeLanguage };
};
