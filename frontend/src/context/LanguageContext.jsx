import React, { createContext, useState, useEffect, useContext } from 'react';

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    // Check localStorage or default to 'en'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'en';
    });

    // Update localStorage when language changes
    useEffect(() => {
        localStorage.setItem('appLanguage', language);

        // Also set a document attribute for global CSS font targeting
        if (language === 'gu') {
            document.documentElement.setAttribute('lang', 'gu');
        } else {
            document.documentElement.setAttribute('lang', 'en');
        }
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    const formatNumber = (num) => {
        const value = Number(num) || 0;
        return new Intl.NumberFormat(language === 'en' ? 'en-IN' : 'gu-IN').format(value);
    };

    const formatCurrency = (num) => {
        const value = Number(num) || 0;
        // Format as INR without decimals
        return new Intl.NumberFormat(language === 'en' ? 'en-IN' : 'gu-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr, options = { day: 'numeric', month: 'long', year: 'numeric' }) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'gu-IN', options).format(date);
        } catch {
            return dateStr;
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            changeLanguage,
            formatNumber,
            formatCurrency,
            formatDate
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
