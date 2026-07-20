import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="inline-flex items-center bg-secondary-dark p-1 rounded-btn border border-dark/10 select-none shadow-xs">
            <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-btn transition-all duration-150 ${
                    language === 'en'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-dark-light hover:text-dark hover:bg-white/50'
                }`}
            >
                English
            </button>
            <button
                type="button"
                onClick={() => changeLanguage('gu')}
                className={`px-3 py-1 text-xs font-bold rounded-btn transition-all duration-150 ${
                    language === 'gu'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-dark-light hover:text-dark hover:bg-white/50'
                }`}
            >
                ગુજરાતી
            </button>
        </div>
    );
};

export default LanguageSwitcher;
