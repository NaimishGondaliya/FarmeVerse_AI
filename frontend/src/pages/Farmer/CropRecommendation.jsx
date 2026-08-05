import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
    FiCompass,
    FiSun,
    FiDroplet,
    FiCheckCircle,
    FiAlertCircle,
    FiBookmark,
    FiMapPin,
    FiActivity,
    FiAward,
    FiSearch,
    FiX
} from 'react-icons/fi'
import { weatherAPI, cropRecommendationAPI, farmAPI } from '../../services/api'

// English/Gujarati translations dictionary
const gujaratCities = [
    { name: 'Rajkot', labelGuj: 'રાજકોટ (Rajkot)', labelEng: 'Rajkot' },
    { name: 'Ahmedabad', labelGuj: 'અમદાવાદ (Ahmedabad)', labelEng: 'Ahmedabad' },
    { name: 'Surat', labelGuj: 'સુરત (Surat)', labelEng: 'Surat' },
    { name: 'Vadodara', labelGuj: 'વડોદરા (Vadodara)', labelEng: 'Vadodara' },
    { name: 'Bhavnagar', labelGuj: 'ભાવનગર (Bhavnagar)', labelEng: 'Bhavnagar' },
    { name: 'Junagadh', labelGuj: 'જૂનાગઢ (Junagadh)', labelEng: 'Junagadh' },
    { name: 'Jamnagar', labelGuj: 'જામનગર (Jamnagar)', labelEng: 'Jamnagar' },
    { name: 'Morbi', labelGuj: 'મોરબી (Morbi)', labelEng: 'Morbi' },
    { name: 'Amreli', labelGuj: 'અમરેલી (Amreli)', labelEng: 'Amreli' },
    { name: 'Gandhinagar', labelGuj: 'ગાંધીનગર (Gandhinagar)', labelEng: 'Gandhinagar' },
    { name: 'Nadiad', labelGuj: 'નડિયાદ (Nadiad)', labelEng: 'Nadiad' },
    { name: 'Anand', labelGuj: 'આણંદ (Anand)', labelEng: 'Anand' },
    { name: 'Mehsana', labelGuj: 'મહેસાણા (Mehsana)', labelEng: 'Mehsana' },
    { name: 'Surendranagar', labelGuj: 'સુરેન્દ્રનગર (Surendranagar)', labelEng: 'Surendranagar' },
    { name: 'Bharuch', labelGuj: 'ભરૂચ (Bharuch)', labelEng: 'Bharuch' },
    { name: 'Navsari', labelGuj: 'નવસારી (Navsari)', labelEng: 'Navsari' },
    { name: 'Veraval', labelGuj: 'વેરાવળ (Veraval)', labelEng: 'Veraval' },
    { name: 'Porbandar', labelGuj: 'પોરબંદર (Porbandar)', labelEng: 'Porbandar' },
    { name: 'Godhra', labelGuj: 'ગોધરા (Godhra)', labelEng: 'Godhra' },
    { name: 'Bhuj', labelGuj: 'ભુજ (Bhuj)', labelEng: 'Bhuj' },
    { name: 'Ankleshwar', labelGuj: 'અંકલેશ્વર (Ankleshwar)', labelEng: 'Ankleshwar' },
    { name: 'Patan', labelGuj: 'પાટણ (Patan)', labelEng: 'Patan' },
    { name: 'Palanpur', labelGuj: 'પાલનપુર (Palanpur)', labelEng: 'Palanpur' },
    { name: 'Dahod', labelGuj: 'દાહોદ (Dahod)', labelEng: 'Dahod' },
    { name: 'Valsad', labelGuj: 'વલસાડ (Valsad)', labelEng: 'Valsad' },
    { name: 'Vapi', labelGuj: 'વાપી (Vapi)', labelEng: 'Vapi' },
    { name: 'Gondal', labelGuj: 'ગોંડલ (Gondal)', labelEng: 'Gondal' },
    { name: 'Jetpur', labelGuj: 'જેતપુર (Jetpur)', labelEng: 'Jetpur' },
    { name: 'Deesa', labelGuj: 'ડીસા (Deesa)', labelEng: 'Deesa' },
    { name: 'Mahuva', labelGuj: 'મહુવા (Mahuva)', labelEng: 'Mahuva' },
    { name: 'Botad', labelGuj: 'બોટાદ (Botad)', labelEng: 'Botad' },
    { name: 'Adipur', labelGuj: 'આદિપુર (Adipur)', labelEng: 'Adipur' },
    { name: 'Gandhidham', labelGuj: 'ગાંધીધામ (Gandhidham)', labelEng: 'Gandhidham' },
    { name: 'Himmatnagar', labelGuj: 'હિંમતનગર (Himmatnagar)', labelEng: 'Himmatnagar' },
    { name: 'Sidhpur', labelGuj: 'સિદ્ધપુર (Sidhpur)', labelEng: 'Sidhpur' },
    { name: 'Una', labelGuj: 'ઉના (Una)', labelEng: 'Una' },
    { name: 'Visnagar', labelGuj: 'વિસનગર (Visnagar)', labelEng: 'Visnagar' },
    { name: 'Keshod', labelGuj: 'કેશોદ (Keshod)', labelEng: 'Keshod' },
    { name: 'Dhrangadhra', labelGuj: 'ધ્રાંગધ્રા (Dhrangadhra)', labelEng: 'Dhrangadhra' },
    { name: 'Anjar', labelGuj: 'અંજાર (Anjar)', labelEng: 'Anjar' },
    { name: 'Dakor', labelGuj: 'ડાકોર (Dakor)', labelEng: 'Dakor' },
    { name: 'Savarkundla', labelGuj: 'સાવરકુંડલા (Savarkundla)', labelEng: 'Savarkundla' },
    { name: 'Kadi', labelGuj: 'કડી (Kadi)', labelEng: 'Kadi' },
    { name: 'Vyara', labelGuj: 'વ્યારા (Vyara)', labelEng: 'Vyara' },
    { name: 'Upleta', labelGuj: 'ઉપલેટા (Upleta)', labelEng: 'Upleta' },
    { name: 'Bardoli', labelGuj: 'બારડોલી (Bardoli)', labelEng: 'Bardoli' },
    { name: 'Khambhat', labelGuj: 'ખંભાત (Khambhat)', labelEng: 'Khambhat' },
    { name: 'Borsad', labelGuj: 'બોરસદ (Borsad)', labelEng: 'Borsad' },
    { name: 'Petlad', labelGuj: 'પેટલાદ (Petlad)', labelEng: 'Petlad' },
    { name: 'Dholka', labelGuj: 'ધોળકા (Dholka)', labelEng: 'Dholka' },
    { name: 'Viramgam', labelGuj: 'વિરમગામ (Viramgam)', labelEng: 'Viramgam' },
    { name: 'Kapadvanj', labelGuj: 'કપડવંજ (Kapadvanj)', labelEng: 'Kapadvanj' },
    { name: 'Bilimora', labelGuj: 'બીલીમોરા (Bilimora)', labelEng: 'Bilimora' },
    { name: 'Radhanpur', labelGuj: 'રાધનપુર (Radhanpur)', labelEng: 'Radhanpur' },
    { name: 'Limbdi', labelGuj: 'લીંમડી (Limbdi)', labelEng: 'Limbdi' },
    { name: 'Mansa', labelGuj: 'માણસા (Mansa)', labelEng: 'Mansa' },
    { name: 'Sanand', labelGuj: 'સાણંદ (Sanand)', labelEng: 'Sanand' },
    { name: 'Halol', labelGuj: 'હાલોલ (Halol)', labelEng: 'Halol' },
    { name: 'Idar', labelGuj: 'ઈડર (Idar)', labelEng: 'Idar' },
    { name: 'Chhota Udepur', labelGuj: 'છોટા ઉદેપુર (Chhota Udepur)', labelEng: 'Chhota Udepur' },
    { name: 'Lunawada', labelGuj: 'લુણાવાડા (Lunawada)', labelEng: 'Lunawada' },
    { name: 'Jasdan', labelGuj: 'જસદણ (Jasdan)', labelEng: 'Jasdan' },
    { name: 'Devgadh Baria', labelGuj: 'દેવગઢ બારિયા (Devgadh Baria)', labelEng: 'Devgadh Baria' },
    { name: 'Dharampur', labelGuj: 'ધરમપુર (Dharampur)', labelEng: 'Dharampur' },
    { name: 'Rajula', labelGuj: 'રાજુલા (Rajula)', labelEng: 'Rajula' },
    { name: 'Sihor', labelGuj: 'સિહોર (Sihor)', labelEng: 'Sihor' },
    { name: 'Thangadh', labelGuj: 'થાણગઢ (Thangadh)', labelEng: 'Thangadh' },
    { name: 'Wankaner', labelGuj: 'વાંકાનેર (Wankaner)', labelEng: 'Wankaner' },
    { name: 'Vadnagar', labelGuj: 'વડનગર (Vadnagar)', labelEng: 'Vadnagar' },
    { name: 'Khedbrahma', labelGuj: 'ખેડબ્રહ્મા (Khedbrahma)', labelEng: 'Khedbrahma' },
    { name: 'Padra', labelGuj: 'પાદરા (Padra)', labelEng: 'Padra' },
    { name: 'Karjan', labelGuj: 'કરજણ (Karjan)', labelEng: 'Karjan' },
    { name: 'Umreth', labelGuj: 'ઉમરેઠ (Umreth)', labelEng: 'Umreth' },
    { name: 'Bagasara', labelGuj: 'બગસરા (Bagasara)', labelEng: 'Bagasara' },
    { name: 'Bhanvad', labelGuj: 'ભાણવડ (Bhanvad)', labelEng: 'Bhanvad' },
    { name: 'Lathi', labelGuj: 'લાઠી (Lathi)', labelEng: 'Lathi' },
    { name: 'Manavadar', labelGuj: 'માણાવદર (Manavadar)', labelEng: 'Manavadar' },
    { name: 'Okha', labelGuj: 'ઓખા (Okha)', labelEng: 'Okha' },
    { name: 'Dwarka', labelGuj: 'દ્વારકા (Dwarka)', labelEng: 'Dwarka' },
    { name: 'Tharad', labelGuj: 'થરાદ (Tharad)', labelEng: 'Tharad' },
    { name: 'Talod', labelGuj: 'તલોદ (Talod)', labelEng: 'Talod' },
    { name: 'Modasa', labelGuj: 'મોડાસા (Modasa)', labelEng: 'Modasa' },
    { name: 'Songadh', labelGuj: 'સોનગઢ (Songadh)', labelEng: 'Songadh' },
    { name: 'Mundra', labelGuj: 'મુન્દ્રા (Mundra)', labelEng: 'Mundra' },
    { name: 'Sojitra', labelGuj: 'સોજિત્રા (Sojitra)', labelEng: 'Sojitra' },
    { name: 'Chikhli', labelGuj: 'ચીખલી (Chikhli)', labelEng: 'Chikhli' },
    { name: 'Kodinar', labelGuj: 'કોડિનાર (Kodinar)', labelEng: 'Kodinar' },
    { name: 'Mithapur', labelGuj: 'મીઠાપુર (Mithapur)', labelEng: 'Mithapur' },
    { name: 'Sayan', labelGuj: 'સાયણ (Sayan)', labelEng: 'Sayan' },
    { name: 'Umbergaon', labelGuj: 'ઉમરગામ (Umbergaon)', labelEng: 'Umbergaon' },
    { name: 'Vallabh Vidyanagar', labelGuj: 'વલ્લભ વિદ્યાનગર (Vallabh Vidyanagar)', labelEng: 'Vallabh Vidyanagar' },
    { name: 'Wadhwan', labelGuj: 'વઢવાણ (Wadhwan)', labelEng: 'Wadhwan' },
    { name: 'Zalod', labelGuj: 'ઝાલોદ (Zalod)', labelEng: 'Zalod' },
    { name: 'Daji', labelGuj: 'દાજી (Daji)', labelEng: 'Daji' },
    { name: 'Vagra', labelGuj: 'વાગરા (Vagra)', labelEng: 'Vagra' },
    { name: 'Valod', labelGuj: 'વાલોડ (Valod)', labelEng: 'Valod' },
    { name: 'Vansda', labelGuj: 'વાંસદા (Vansda)', labelEng: 'Vansda' },
    { name: 'Mandvi', labelGuj: 'માંડવી (Mandvi)', labelEng: 'Mandvi' },
    { name: 'Talaja', labelGuj: 'તળાજા (Talaja)', labelEng: 'Talaja' },
    { name: 'Lalpur', labelGuj: 'લાલપુર (Lalpur)', labelEng: 'Lalpur' },
    { name: 'Dhrol', labelGuj: 'ધ્રોલ (Dhrol)', labelEng: 'Dhrol' },
    { name: 'Kalavad', labelGuj: 'કાલાવડ (Kalavad)', labelEng: 'Kalavad' },
    { name: 'Jodiya', labelGuj: 'જોડિયા (Jodiya)', labelEng: 'Jodiya' },
    { name: 'Maliya', labelGuj: 'માળિયા (Maliya)', labelEng: 'Maliya' },
    { name: 'Halvad', labelGuj: 'હળવદ (Halvad)', labelEng: 'Halvad' },
    { name: 'Dhoraji', labelGuj: 'ધોરાજી (Dhoraji)', labelEng: 'Dhoraji' },
    { name: 'Kutiyana', labelGuj: 'કુતિયાણા (Kutiyana)', labelEng: 'Kutiyana' },
    { name: 'Ranavav', labelGuj: 'રાણાવાવ (Ranavav)', labelEng: 'Ranavav' },
    { name: 'Vanthali', labelGuj: 'વંથલી (Vanthali)', labelEng: 'Vanthali' },
    { name: 'Mangrol', labelGuj: 'માણગ્રોલ (Mangrol)', labelEng: 'Mangrol' }
]

const CROP_TRANSLATIONS = {
    'Rice': 'ચોખા',
    'Maize': 'મકાઈ',
    'Chickpea': 'ચણા',
    'Kidney Beans': 'રાજમા',
    'Pigeon Peas': 'તુવેર',
    'Moth Beans': 'મોથ',
    'Mung Bean': 'મગ',
    'Black Gram': 'અડદ',
    'Lentil': 'મસૂર',
    'Pomegranate': 'દાડમ',
    'Banana': 'કેળું',
    'Mango': 'કેરી',
    'Grapes': 'દ્રાક્ષ',
    'Watermelon': 'તરબૂચ',
    'Muskmelon': 'શકરટેટી',
    'Apple': 'સફરજન',
    'Orange': 'નારંગી',
    'Papaya': 'પપૈયું',
    'Coconut': 'નાળિયેર',
    'Cotton': 'કપાસ',
    'Jute': 'શણ',
    'Coffee': 'કોફી'
};

const getLocalizedCropName = (cropName, language) => {
    if (!cropName) return '';
    if (language !== 'gu') return cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();

    // Normalize format to Title Case
    const normalized = cropName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    return CROP_TRANSLATIONS[normalized] || CROP_TRANSLATIONS[cropName] || normalized;
};

const toGujaratiDigits = (str, lang) => {
    if (lang !== 'gu') return str;
    const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/\d/g, d => gujDigits[d]);
};

export const CropRecommendation = () => {
    const { formatNumber } = useLanguage()
    const { language, t } = useTranslation()

    const [selectedCity, setSelectedCity] = useState('Rajkot')

    // Location Mode State
    const [locationMode, setLocationMode] = useState('city') // 'city' or 'farm'
    const [myFarms, setMyFarms] = useState([])
    const [selectedFarmId, setSelectedFarmId] = useState('')

    // Soil Parameters State variables
    const [nVal, setNVal] = useState('90')
    const [pVal, setPVal] = useState('42')
    const [kVal, setKVal] = useState('43')
    const [phVal, setPhVal] = useState('6.5')
    const [rainfallVal, setRainfallVal] = useState('180')

    // Weather Parameters State variables (read-only, auto fetched)
    const [tempVal, setTempVal] = useState(28.0)
    const [humidityVal, setHumidityVal] = useState(70.0)
    const [rainProbVal, setRainProbVal] = useState(0)

    // UI Status State variables
    const [isWeatherSyncing, setIsWeatherSyncing] = useState(false)
    const [isRecommending, setIsRecommending] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [predictionResult, setPredictionResult] = useState(null)

    // Autocomplete state variables
    const [searchTerm, setSearchTerm] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [keyboardIndex, setKeyboardIndex] = useState(-1)
    const autocompleteRef = useRef(null)



    // Sync input field value when city or language updates
    useEffect(() => {
        const cityObj = gujaratCities.find(c => c.name === selectedCity)
        if (cityObj) {
            setSearchTerm(language === 'gu' ? cityObj.labelGuj : cityObj.labelEng)
        }
    }, [language, selectedCity])

    // Click outside autocomplete to close dropdown hook
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const res = await farmAPI.getAll()
                if (res.success && res.data) {
                    setMyFarms(res.data)
                    if (res.data.length > 0) {
                        setSelectedFarmId(res.data[0].id)
                    }
                }
            } catch (err) {
                console.error("Error fetching farms:", err)
            }
        }
        fetchFarms()
    }, [])

    useEffect(() => {
        if (locationMode === 'city') {
            autoSyncWeather(selectedCity, null, null)
        } else if (locationMode === 'farm' && selectedFarmId) {
            const farm = myFarms.find(f => f.id === selectedFarmId)
            if (farm && farm.latitude && farm.longitude) {
                autoSyncWeather(null, farm.latitude, farm.longitude)
            } else {
                setAlertMessage('Selected farm does not have saved GPS coordinates.')
            }
        }
    }, [selectedCity, locationMode, selectedFarmId, myFarms])

    const autoSyncWeather = async (city, lat, lon) => {
        setIsWeatherSyncing(true)
        setAlertMessage('')
        try {
            const data = await weatherAPI.getCurrent(city, lat, lon)
            if (data && data.temperature !== undefined) {
                setTempVal(data.temperature)
                setHumidityVal(data.humidity ?? 65.0)
                setRainProbVal(data.pop !== undefined ? data.pop * 100 : (data.clouds || 0))
                setSuccessMessage(t('cropRecommendation.weatherSyncSuccess'))
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setAlertMessage(t('cropRecommendation.weatherSyncFail'))
            }
        } catch (err) {
            console.error('Failed to sync weather:', err)
            setAlertMessage(t('cropRecommendation.weatherSyncFail'))
        } finally {
            setIsWeatherSyncing(false)
        }
    }

    // Filter matching cities based on search terms
    const filteredCities = gujaratCities.filter(city => {
        const search = (searchTerm || '').toLowerCase()
        return (
            city.name.toLowerCase().includes(search) ||
            city.labelEng.toLowerCase().includes(search) ||
            city.labelGuj.toLowerCase().includes(search)
        )
    })

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setIsDropdownOpen(true)
        setKeyboardIndex(-1)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setIsDropdownOpen(true)
        setKeyboardIndex(-1)
    }

    const handleSelectCity = (city) => {
        setSelectedCity(city.name)
        setSearchTerm(language === 'gu' ? city.labelGuj : city.labelEng)
        setIsDropdownOpen(false)
        setKeyboardIndex(-1)
    }

    const handleKeyDown = (e) => {
        if (!isDropdownOpen) {
            if (e.key === 'ArrowDown') {
                setIsDropdownOpen(true)
            }
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setKeyboardIndex(prev => (prev + 1) % filteredCities.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setKeyboardIndex(prev => (prev - 1 + filteredCities.length) % filteredCities.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (keyboardIndex >= 0 && keyboardIndex < filteredCities.length) {
                handleSelectCity(filteredCities[keyboardIndex])
            }
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false)
        }
    }

    const handlePredictSubmit = async (e) => {
        e.preventDefault()
        setAlertMessage('')
        setPredictionResult(null)

        // 10. Form validations
        if (!nVal || !pVal || !kVal || !phVal || !rainfallVal) {
            setAlertMessage(t('cropRecommendation.errorEmpty'))
            return
        }

        const n = parseFloat(nVal)
        const p = parseFloat(pVal)
        const k = parseFloat(kVal)
        const ph = parseFloat(phVal)
        const rainfall = parseFloat(rainfallVal)

        if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph) || isNaN(rainfall) ||
            n < 0 || p < 0 || k < 0 || ph < 0 || ph > 14 || rainfall < 0) {
            setAlertMessage(t('cropRecommendation.errorInvalidRange'))
            return
        }

        setIsRecommending(true)
        try {
            let predictionCity = selectedCity;
            if (locationMode === 'farm' && selectedFarmId) {
                const farm = myFarms.find(f => f.id === selectedFarmId)
                if (farm) {
                    predictionCity = farm.district || farm.village || 'Rajkot'
                }
            }
            const payload = {
                N: n,
                P: p,
                K: k,
                temperature: parseFloat(tempVal),
                humidity: parseFloat(humidityVal),
                ph: ph,
                rainfall: rainfall,
                city: predictionCity
            }
            const result = await cropRecommendationAPI.predict(payload)
            if (result && result.success) {
                setPredictionResult(result)
            } else {
                setAlertMessage(result?.error || t('cropRecommendation.predictionError'))
            }
        } catch (err) {
            console.error('Predict error:', err)
            const detailError = err.response?.data?.details;
            if (detailError) {
                const firstKey = Object.keys(detailError)[0];
                setAlertMessage(`${firstKey}: ${detailError[firstKey][0]}`);
            } else {
                setAlertMessage(t('cropRecommendation.predictionError'))
            }
        } finally {
            setIsRecommending(false)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12">

            {/* Header section with Language Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-card border border-dark/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                        {t('cropRecommendation.title')}
                    </h1>
                    <p className="text-xs text-dark-light select-none font-semibold">
                        {t('cropRecommendation.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">

                </div>
            </div>

            {/* Alert Notifications */}
            {alertMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-card flex items-center gap-3 animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-red-650" size={18} />
                    <span className="text-xs font-bold">{alertMessage}</span>
                </div>
            )}

            {/* Success Notifications */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-card flex items-center gap-3 animate-fadeIn">
                    <FiCheckCircle className="shrink-0 text-emerald-600" size={18} />
                    <span className="text-xs font-bold">{successMessage}</span>
                </div>
            )}

            {/* Main Interactive Form Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Inputs area */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handlePredictSubmit} className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-6">

                        <div className="border-b border-dark/5 pb-3">
                            <h3 className="text-sm font-extrabold text-primary select-none flex items-center gap-2">
                                <FiActivity />
                                {t('cropRecommendation.titleInputs')}
                            </h3>
                        </div>

                        {/* Location Mode Toggle */}
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-btn border border-slate-200 w-full mb-4">
                            <button
                                type="button"
                                className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${locationMode === 'farm' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setLocationMode('farm')}
                            >
                                {t('cropRecommendation.useMyFarm')}
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${locationMode === 'city' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setLocationMode('city')}
                            >
                                {t('cropRecommendation.selectCityMode')}
                            </button>
                        </div>

                        {/* City / Farm select representing auto weather sync */}
                        <div className="flex flex-col relative" ref={locationMode === 'city' ? autocompleteRef : null}>
                            {locationMode === 'city' ? (
                                <>
                                    <label className="block text-xs font-bold text-dark-light mb-1.5 font-sans select-none">
                                        {t('cropRecommendation.citySelect')}
                                    </label>
                                    <div className="relative w-full">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        <input
                                            type="text"
                                            placeholder={t('cropRecommendation.searchCityPh')}
                                            className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onKeyDown={handleKeyDown}
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={handleClearSearch}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full animate-fadeIn"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Suggestions List */}
                                    {isDropdownOpen && filteredCities.length > 0 && (
                                        <ul className="absolute z-50 left-0 right-0 top-[68px] max-h-60 overflow-y-auto bg-white border border-dark/10 rounded-btn shadow-lg py-1 text-xs">
                                            {filteredCities.map((city, idx) => (
                                                <li
                                                    key={`${city.name}-${idx}`}
                                                    onClick={() => handleSelectCity(city)}
                                                    onMouseEnter={() => setKeyboardIndex(idx)}
                                                    className={`px-4 py-2 cursor-pointer flex justify-between items-center transition-colors ${keyboardIndex === idx ? 'bg-primary/10 text-primary font-bold' : 'text-dark font-medium'
                                                        }`}
                                                >
                                                    <span>{language === 'gu' ? city.labelGuj : city.labelEng}</span>
                                                    {selectedCity === city.name && (
                                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black">Active</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <>
                                    <label className="block text-xs font-bold text-dark-light mb-1.5 font-sans select-none">
                                        {t('cropRecommendation.selectFarmGps')}
                                    </label>
                                    <select
                                        className="w-full h-12 rounded-xl border border-slate-300 px-4 text-sm leading-normal focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={selectedFarmId}
                                        onChange={(e) => setSelectedFarmId(e.target.value)}
                                    >
                                        {myFarms.length === 0 ? (
                                            <option value="" disabled>{t('cropRecommendation.noFarmsGps')}</option>
                                        ) : (
                                            myFarms.map(farm => (
                                                <option key={farm.id} value={farm.id}>
                                                    {farm.farm_name} ({farm.village})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </>
                            )}
                            {isWeatherSyncing && (
                                <span className="text-[10px] text-primary font-bold mt-1 select-none animate-pulse">
                                    ⏳ {t('cropRecommendation.weatherLoading')}
                                </span>
                            )}
                        </div>

                        {/* 16 Parameters attributes setup grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Nitrogen N */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-dark-light">{t('cropRecommendation.nLabel')}</label>
                                <input
                                    type="number"
                                    placeholder={t('cropRecommendation.nHelp')}
                                    className="w-full bg-secondary-dark border border-dark/10 focus:border-primary outline-none px-4 py-2.5 text-xs rounded-btn font-bold text-dark"
                                    value={nVal}
                                    onChange={(e) => setNVal(e.target.value)}
                                />
                            </div>

                            {/* Phosphorus P */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-dark-light">{t('cropRecommendation.pLabel')}</label>
                                <input
                                    type="number"
                                    placeholder={t('cropRecommendation.pHelp')}
                                    className="w-full bg-secondary-dark border border-dark/10 focus:border-primary outline-none px-4 py-2.5 text-xs rounded-btn font-bold text-dark"
                                    value={pVal}
                                    onChange={(e) => setPVal(e.target.value)}
                                />
                            </div>

                            {/* Potassium K */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-dark-light">{t('cropRecommendation.kLabel')}</label>
                                <input
                                    type="number"
                                    placeholder={t('cropRecommendation.kHelp')}
                                    className="w-full bg-secondary-dark border border-dark/10 focus:border-primary outline-none px-4 py-2.5 text-xs rounded-btn font-bold text-dark"
                                    value={kVal}
                                    onChange={(e) => setKVal(e.target.value)}
                                />
                            </div>

                            {/* pH Level */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-dark-light">{t('cropRecommendation.phLabel')}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder={t('cropRecommendation.phHelp')}
                                    className="w-full bg-secondary-dark border border-dark/10 focus:border-primary outline-none px-4 py-2.5 text-xs rounded-btn font-bold text-dark"
                                    value={phVal}
                                    onChange={(e) => setPhVal(e.target.value)}
                                />
                            </div>

                            {/* Rainfall */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-dark-light">{t('cropRecommendation.rainfallLabel')}</label>
                                <input
                                    type="number"
                                    placeholder={t('cropRecommendation.rainfallHelp')}
                                    className="w-full bg-secondary-dark border border-dark/10 focus:border-primary outline-none px-4 py-2.5 text-xs rounded-btn font-bold text-dark"
                                    value={rainfallVal}
                                    onChange={(e) => setRainfallVal(e.target.value)}
                                />
                            </div>

                            {/* Temperature (auto, read-only) */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-emerald-600">{t('cropRecommendation.tempLabel')}</label>
                                <div className="flex bg-emerald-50 border border-emerald-200 text-emerald-950 px-4 py-2.5 text-xs rounded-btn font-bold">
                                    <FiSun className="mr-2 text-amber-500 self-center" />
                                    <span>{tempVal !== null ? `${toGujaratiDigits(tempVal.toFixed(1), language)} °C` : '-'}</span>
                                </div>
                            </div>

                            {/* Humidity (auto, read-only) */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="block text-xs font-bold text-emerald-600">{t('cropRecommendation.humidityLabel')}</label>
                                <div className="flex bg-emerald-50 border border-emerald-250 text-emerald-950 px-4 py-2.5 text-xs rounded-btn font-bold">
                                    <FiDroplet className="mr-2 text-indigo-500 self-center" />
                                    <span>{humidityVal !== null ? `${toGujaratiDigits(humidityVal.toFixed(1), language)} %` : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Predict Submission Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isRecommending || isWeatherSyncing}
                                variant="primary"
                                className="w-full py-3 font-extrabold text-xs md:text-sm text-white bg-primary hover:bg-primary-dark rounded-btn shadow-sm select-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isRecommending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t('cropRecommendation.recommending')}</span>
                                    </>
                                ) : (
                                    <span>{t('cropRecommendation.recommendBtn')}</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Prediction Result Display Column */}
                <div className="lg:col-span-1">
                    {predictionResult ? (
                        /* Beautiful Gradient Result card representation matching Weather top header card */
                        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-card p-6 shadow-md border border-emerald-500 space-y-6 animate-fadeIn relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-6 translate-y-6 select-none pointer-events-none">
                                <FiAward size={180} />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="border-b border-white/20 pb-3 flex items-center gap-2">
                                    <FiBookmark className="text-accent" />
                                    <h3 className="text-sm font-black tracking-wider uppercase select-none">{t('cropRecommendation.resultsTitle')}</h3>
                                </div>

                                <div className="text-center py-6 bg-white/10 rounded-card border border-white/10 shadow-inner">
                                    <span className="text-[10px] text-emerald-100 font-extrabold uppercase select-none">{t('cropRecommendation.recommendedCrop')}</span>
                                    <h2 className="text-3xl font-black capitalize tracking-wide text-accent mt-1 drop-shadow-sm">
                                        {getLocalizedCropName(predictionResult.recommended_crop, language)}
                                    </h2>
                                    <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/25 border border-accent/20 px-3 py-1 rounded-btn text-accent font-sans font-black text-xs">
                                        <span>{t('cropRecommendation.confidence')}</span>
                                        <span>{toGujaratiDigits(predictionResult.confidence || 95, language)}%</span>
                                    </div>
                                </div>

                                {/* Phase 3 - Crop Suitability Score */}
                                {(() => {
                                    let tempScore = 0;
                                    let humScore = 0;
                                    let rScore = 0;
                                    let sScore = 20;

                                    if (tempVal >= 20 && tempVal <= 32) tempScore = 30;
                                    else if (tempVal > 10 && tempVal < 40) tempScore = 20;

                                    if (humidityVal >= 50 && humidityVal <= 80) humScore = 20;
                                    else if (humidityVal >= 30 && humidityVal <= 90) humScore = 10;

                                    if (rainProbVal >= 40 && rainProbVal <= 80) rScore = 30;
                                    else if (rainProbVal > 10 && rainProbVal < 90) rScore = 20;

                                    const totalScore = tempScore + humScore + rScore + sScore;

                                    let badgeLabel = t('cropRecommendation.badgeNotRecommended');
                                    let badgeColor = 'bg-red-500 text-white';
                                    if (totalScore >= 80) { badgeLabel = t('cropRecommendation.badgeExcellent'); badgeColor = 'bg-emerald-500 text-white'; }
                                    else if (totalScore >= 60) { badgeLabel = t('cropRecommendation.badgeGood'); badgeColor = 'bg-blue-500 text-white'; }
                                    else if (totalScore >= 40) { badgeLabel = t('cropRecommendation.badgeModerate'); badgeColor = 'bg-amber-500 text-white'; }

                                    return (
                                        <div className="bg-white text-dark p-4 rounded-card border shadow-inner space-y-3">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h4 className="font-black text-xs uppercase tracking-wider">{t('cropRecommendation.suitabilityTitle')}</h4>
                                                <span className={`px-2 py-1 rounded text-xs font-black select-none ${badgeColor}`}>
                                                    {toGujaratiDigits(totalScore, language)}% - {badgeLabel}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-dark-light">
                                                <div className="flex items-center gap-1.5"><FiCheckCircle className={tempScore > 0 ? "text-emerald-500" : "text-slate-300"} size={14} /> <span>{t('cropRecommendation.suLabelTemp')}</span></div>
                                                <div className="flex items-center gap-1.5"><FiCheckCircle className={rScore > 0 ? "text-emerald-500" : "text-slate-300"} size={14} /> <span>{t('cropRecommendation.suLabelRain')}</span></div>
                                                <div className="flex items-center gap-1.5"><FiCheckCircle className={humScore > 0 ? "text-emerald-500" : "text-slate-300"} size={14} /> <span>{t('cropRecommendation.suLabelHum')}</span></div>
                                                <div className="flex items-center gap-1.5"><FiCheckCircle className={sScore > 0 ? "text-emerald-500" : "text-slate-300"} size={14} /> <span>{t('cropRecommendation.suLabelSeason')}</span></div>
                                            </div>

                                            <p className="text-xs font-semibold leading-relaxed pt-1 text-emerald-800">
                                                {t('cropRecommendation.suRecSentence')}
                                            </p>
                                        </div>
                                    )
                                })()}

                                {/* Summary variables list cards parameters */}
                                <div className="space-y-3.5">
                                    <h4 className="text-[10px] text-emerald-100 font-black uppercase tracking-wider select-none">{t('cropRecommendation.inputSummary')}</h4>

                                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                                        <div className="bg-white/10 p-2 rounded-btn border border-white/10 flex flex-col">
                                            <span className="text-[9px] opacity-75">N-P-K</span>
                                            <span className="font-mono text-accent">{toGujaratiDigits(nVal, language)}-{toGujaratiDigits(pVal, language)}-{toGujaratiDigits(kVal, language)}</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-btn border border-white/10 flex flex-col">
                                            <span className="text-[9px] opacity-75">pH Level</span>
                                            <span className="font-mono text-accent">{toGujaratiDigits(phVal, language)}</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-btn border border-white/10 flex flex-col">
                                            <span className="text-[9px] opacity-75">Rainfall</span>
                                            <span className="font-mono text-accent">{toGujaratiDigits(rainfallVal, language)} mm</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-btn border border-white/10 flex flex-col">
                                            <span className="text-[9px] opacity-75">City</span>
                                            <span className="font-mono text-accent truncate">{selectedCity}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setPredictionResult(null)}
                                        className="w-full bg-white select-none text-emerald-800 text-xs font-bold py-2 rounded-btn hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-center gap-1 border border-transparent"
                                    >
                                        {t('cropRecommendation.backToInputs')}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="bg-white p-6 rounded-card border border-dark/5 shadow-sm text-center py-16 flex flex-col items-center justify-center select-none">
                            <div className="w-16 h-16 bg-secondary-dark rounded-full flex items-center justify-center text-dark-light/50 mb-4 border border-dark/5">
                                <FiCompass size={32} className="animate-spin-slow" />
                            </div>
                            <h4 className="text-sm font-bold text-dark">
                                {language === 'gu' ? 'આગાહી પરિણામ ખાલી છે.' : 'No Recommendation Loaded.'}
                            </h4>
                            <p className="text-xs text-dark-light mt-1 max-w-xs leading-relaxed">
                                {language === 'gu'
                                    ? 'જમીનના મૂલ્યો દાખલ કરીને શોધો બટન દબાવો જેથી પાકની ગણતરી કરી શકાય.'
                                    : 'Please insert the soil attributes and click recommend crop button to query predictions.'}
                            </p>
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}

export default CropRecommendation;
