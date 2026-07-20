import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
    FiSearch,
    FiRefreshCw,
    FiSun,
    FiWind,
    FiDroplet,
    FiCompass,
    FiEye,
    FiAlertCircle,
    FiClock,
    FiMapPin,
    FiGlobe,
    FiCloud
} from 'react-icons/fi'
import { weatherAPI } from '../../services/api'

// English/Gujarati weather descriptions translation dictionary
const weatherTranslations = {
    'clear sky': 'સ્વચ્છ આકાશ (Clear Sky)',
    'few clouds': 'થોડા વાદળો (Few Clouds)',
    'scattered clouds': 'છૂટાછવાયા વાદળો (Scattered Clouds)',
    'broken clouds': 'ખંડિત વાદળો (Broken Clouds)',
    'shower rain': 'વરસાદી ઝાપટાં (Shower Rain)',
    'rain': 'વરસાદ (Rain)',
    'light rain': 'હળવો વરસાદ (Light Rain)',
    'moderate rain': 'મધ્યમ વરસાદ (Moderate Rain)',
    'heavy intensity rain': 'ભારે વરસાદ (Heavy Rain)',
    'thunderstorm': 'ગાજવીજ સાથે વાવાઝોડું (Thunderstorm)',
    'snow': 'બરફ (Snow)',
    'mist': 'ઝાંખું ધુમ્મસ (Mist)',
    'smoke': 'ધુમાડો (Smoke)',
    'haze': 'ધુમ્મસ (Haze)',
    'dust': 'ધૂળની ડમરી (Dust)',
    'fog': 'ગાઢ ધુમ્મસ (Fog)',
    'overcast clouds': 'વાદળછાયું (Overcast Clouds)'
}

const translateDescription = (description, lang) => {
    if (!description) return '-'
    if (lang === 'ENG') return description
    const descLower = description.toLowerCase()
    return weatherTranslations[descLower] || description
}

// Translations vocabulary for Bilingual support
const dictionary = {
    GUJ: {
        title: "🌤 હવામાન વિભાગ (Live Weather)",
        subtitle: "ગુજરાત ખેતીવાડી હવામાન માહિતી અને લાઈવ અપડેટ્સ",
        searchPlaceholder: "શહેરનું નામ અંગ્રેજીમાં લખો (દા.ત. Rajkot)",
        selectCity: "અહીંથી શહેર પસંદ કરો (Quick Select):",
        searchBtn: "શોધો",
        refreshBtn: "તાજું કરો (Refresh)",
        refreshing: "તાજું થઈ રહ્યું છે...",
        lastUpdated: "છેલ્લે અપડેટ",
        loading: "લાઈવ હવામાન વિગતો મેળવી રહ્યા છીએ...",
        weatherTitle: "વર્તમાન હવામાન વિગતો",

        // Cards
        feelsLike: "શારીરિક અનુભવ (Feels Like)",
        humidity: "ભેજ (Humidity)",
        pressure: "હવાનું દબાણ (Pressure)",
        windSpeed: "પવનની ગતિ (Wind Speed)",
        windDirection: "પવનની દિશા (Wind Dir)",
        visibility: "દ્રશ્યતા (Visibility)",
        cloudCover: "વાદળાંનું પ્રમાણ (Clouds)",
        sunrise: "સૂર્યોદય (Sunrise)",
        sunset: "સૂર્યાસ્ત (Sunset)",
        coords: "અક્ષાંશ / રેખાંશ (Coord)",
        country: "દેશ (Country)",
        timestamp: "નોંધાયેલ સમય (Timestamp)",

        // Error headings & descriptions
        errorTitle: "હવામાન ચેતવણી (Weather Alert)",
        errorInvalidCity: "અમાન્ય શહેર! શહેર મળ્યું નથી, કૃપા કરીને ઇંગ્લિશ સ્પેલિંગ તપાસો. (Invalid City)",
        errorApiOffline: "હવામાન સર્વિસ પ્રોવાઇડર બંધ છે અથવા API ચાવી પૂર્વનિર્ધારિત નથી. (API Offline)",
        errorBackendOffline: "FarmVerse વેધર સર્વર કનેક્ટીવટી ડાઉન છે. (Backend Offline)",
        errorNetwork: "નેટવર્ક ભૂલ! કૃપા કરીને ઇન્ટરનેટ જોડાણ તપાસો. (Network Error)"
    },
    ENG: {
        title: "🌤 Weather Bulletin",
        subtitle: "Gujarat Regional Weather Insights & Live Forecasts",
        searchPlaceholder: "Type city name... (e.g. Rajkot)",
        selectCity: "Quick Select:",
        searchBtn: "Search",
        refreshBtn: "Refresh Weather",
        refreshing: "Refreshing...",
        lastUpdated: "Last Refreshed",
        loading: "Fetching live weather data...",
        weatherTitle: "Current Weather Conditions",

        // Cards
        feelsLike: "Feels Like",
        humidity: "Humidity",
        pressure: "Pressure",
        windSpeed: "Wind Speed",
        windDirection: "Wind Direction",
        visibility: "Visibility",
        cloudCover: "Cloud %",
        sunrise: "Sunrise",
        sunset: "Sunset",
        coords: "Coordinates",
        country: "Country",
        timestamp: "Observation Time",

        // Error headings & descriptions
        errorTitle: "Weather System Alert",
        errorInvalidCity: "Invalid City. Please check spelling & write in English.",
        errorApiOffline: "Weather API provider is currently offline or API key is unconfigured. (API Offline)",
        errorBackendOffline: "FarmVerse weather backend server is offline/down. (Backend Offline)",
        errorNetwork: "Network Error. Please check your internet connectivity. (Network Error)"
    }
}

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
    { name: 'Gandhinagar', labelGuj: 'ગાંધીનગર (Gandhinagar)', labelEng: 'Gandhinagar' }
]

export const Weather = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [cityInput, setCityInput] = useState('Rajkot')
    const [selectedDropdownCity, setSelectedDropdownCity] = useState('Rajkot')
    const [weather, setWeather] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [errorType, setErrorType] = useState('') // 'invalid_city', 'api_offline', 'backend_offline', 'network'

    const t = dictionary[lang]

    useEffect(() => {
        fetchWeather('Rajkot', false)
    }, [])

    const fetchWeather = async (targetCity, isManualRefresh = false) => {
        if (!targetCity.trim()) return

        if (isManualRefresh) {
            setRefreshing(true)
        } else {
            setIsLoading(true)
        }
        setErrorType('')

        try {
            const data = await weatherAPI.getCurrent(targetCity)
            setWeather(data)
        } catch (err) {
            console.error('Error fetching weather data:', err)
            if (err.response) {
                const status = err.response.status
                const errDetail = err.response.data?.error || ''
                if (status === 404) {
                    setErrorType('invalid_city')
                } else if (status === 500 && (errDetail.includes('API key') || errDetail.includes('disabled'))) {
                    setErrorType('api_offline')
                } else {
                    setErrorType('backend_offline')
                }
            } else if (err.request) {
                // Determine if user has local connection issues or backend is shut down
                if (navigator.onLine) {
                    setErrorType('backend_offline')
                } else {
                    setErrorType('network')
                }
            } else {
                setErrorType('network')
            }
            setWeather(null)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        fetchWeather(cityInput, false)
    }

    const handleDropdownSelect = (e) => {
        const val = e.target.value
        setSelectedDropdownCity(val)
        setCityInput(val)
        fetchWeather(val, false)
    }

    const handleManualRefresh = () => {
        fetchWeather(cityInput || 'Rajkot', true)
    }

    // Helper functions for parameter formats
    const formatUnixTime = (timestamp) => {
        if (!timestamp) return '-'
        try {
            const date = new Date(timestamp * 1000)
            return date.toLocaleTimeString(lang === 'GUJ' ? 'gu-IN' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        } catch {
            return '-'
        }
    }

    const formatWindSpeed = (speed) => {
        if (speed === undefined || speed === null) return '-'
        const kmh = speed * 3.6
        return lang === 'GUJ'
            ? `${speed.toFixed(1)} મી/સે (${kmh.toFixed(1)} કિમી/કલાક)`
            : `${speed.toFixed(1)} m/s (${kmh.toFixed(1)} km/h)`
    }

    const getWindDirectionName = (deg) => {
        if (deg === undefined || deg === null) return '-'
        const directionsEng = ['North (N)', 'Northeast (NE)', 'East (E)', 'Southeast (SE)', 'South (S)', 'Southwest (SW)', 'West (W)', 'Northwest (NW)']
        const directionsGuj = ['ઉત્તર (N)', 'ઉત્તર-પૂર્વ (NE)', 'પૂર્વ (E)', 'દક્ષિણ-પૂર્વ (SE)', 'દક્ષિણ (S)', 'દક્ષિણ-પશ્ચિમ (SW)', 'પશ્ચિમ (W)', 'ઉત્તર-પશ્ચિમ (NW)']
        const idx = Math.round(((deg % 360) / 45)) % 8
        return lang === 'GUJ' ? directionsGuj[idx] : directionsEng[idx]
    }

    const formatVisibility = (meters) => {
        if (meters === undefined || meters === null) return '-'
        const km = meters / 1000
        return lang === 'GUJ'
            ? `${km.toFixed(1)} કિલોમીટર (${meters} મીટર)`
            : `${km.toFixed(1)} km (${meters} m)`
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12">

            {/* Header Title Section block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-card border border-dark/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                        {t.title}
                    </h1>
                    <p className="text-xs text-dark-light select-none font-semibold">
                        {t.subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    

                    <Button
                        disabled={refreshing || isLoading}
                        onClick={handleManualRefresh}
                        variant="primary"
                        className="flex items-center gap-2 text-xs md:text-sm font-bold py-2 px-4 rounded-btn transition-all active:scale-95 bg-primary text-white shadow-sm disabled:opacity-50"
                    >
                        <FiRefreshCw size={14} className={`${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? t.refreshing : t.refreshBtn}</span>
                    </Button>
                </div>
            </div>

            {/* Error Widget cards rendering */}
            {errorType && (
                <div className={`p-6 rounded-card border shadow-sm flex flex-col md:flex-row items-center gap-4 animate-fadeIn ${errorType === 'invalid_city' ? 'bg-amber-50 border-amber-250 text-amber-900' :
                        errorType === 'api_offline' ? 'bg-orange-50 border-orange-250 text-orange-900' :
                            'bg-red-50 border-red-250 text-red-900'
                    }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${errorType === 'invalid_city' ? 'bg-amber-100 text-amber-600' :
                            errorType === 'api_offline' ? 'bg-orange-100 text-orange-600' :
                                'bg-red-100 text-red-600'
                        }`}>
                        <FiAlertCircle size={24} />
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h4 className="font-extrabold text-sm select-none">
                            {t.errorTitle}
                        </h4>
                        <p className="text-xs mt-1 font-semibold opacity-90 leading-relaxed">
                            {errorType === 'invalid_city' && t.errorInvalidCity}
                            {errorType === 'api_offline' && t.errorApiOffline}
                            {errorType === 'backend_offline' && t.errorBackendOffline}
                            {errorType === 'network' && t.errorNetwork}
                        </p>
                    </div>
                </div>
            )}

            {/* Controls panel for dropdown and search bar */}
            <div className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Predefined selection dropdown for Gujarat cities */}
                    <div className="flex flex-col justify-end">
                        <label className="block text-xs font-bold text-dark-light mb-1.5">
                            {t.selectCity}
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-secondary-dark border border-dark/10 outline-none px-4 py-2.5 text-xs rounded-btn focus:border-primary font-bold text-dark cursor-pointer appearance-none"
                                value={selectedDropdownCity}
                                onChange={handleDropdownSelect}
                            >
                                {gujaratCities.map(city => (
                                    <option key={city.name} value={city.name}>
                                        {lang === 'GUJ' ? city.labelGuj : city.labelEng}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-4 top-3.5 text-dark-light flex items-center text-[10px]">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Custom search text box */}
                    <div>
                        <form onSubmit={handleSearchSubmit} className="flex flex-col h-full justify-end">
                            <label className="block text-xs font-bold text-dark-light mb-1.5">
                                {lang === 'GUJ' ? 'શહેર જાતે શોધો (Search Manually):' : 'Search Custom City:'}
                            </label>
                            <div className="flex items-center gap-2">
                               <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    className="flex-1 border rounded-lg px-4 py-3 text-sm outline-none"
                                    value={cityInput}
                                    onChange={(e) => setCityInput(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    className="px-6 py-3"
                                >
                                    <FiSearch />
                                    {t.searchBtn}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Weather Main Content Section */}
            {isLoading ? (
                /* Beautiful Loading Animation spin loop */
                <div className="flex flex-col items-center justify-center p-24 bg-white rounded-card border border-dark/5 shadow-sm space-y-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <FiSun size={24} className="text-primary animate-pulse" />
                    </div>
                    <span className="text-xs text-dark-light font-extrabold select-none animate-pulse">{t.loading}</span>
                </div>
            ) : weather ? (
                <div className="space-y-6 animate-fadeIn">

                    {/* Top Header Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-card p-6 md:p-8 shadow-md border border-emerald-500 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 select-none pointer-events-none">
                            <FiSun size={260} className="animate-spin-slow" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left space-y-3">
                                <div className="flex items-center justify-center md:justify-start gap-2.5">
                                    <FiMapPin className="text-accent text-xl" />
                                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                        {weather.city}
                                    </h2>
                                    <span className="bg-white/20 select-none text-[11px] font-black px-2 py-0.5 rounded border border-white/30 uppercase tracking-wider">
                                        {weather.country}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-emerald-100 font-bold select-none font-sans">
                                    {lang === 'GUJ'
                                        ? `ગુજરાત ઝોન હાઈલાઈટ્સ • જીવંત હવામાન`
                                        : `Gujarat Zone • Operational Region Weather Live`}
                                </p>
                                <div className="bg-white/10 p-2.5 rounded-btn text-xs font-semibold border border-white/10 flex items-center justify-center md:justify-start gap-2">
                                    <FiClock className="text-accent" />
                                    <span>
                                        {t.lastUpdated}: {formatUnixTime(weather.timestamp) || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Temperature and description info grid */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/10 p-6 rounded-card border border-white/10 min-w-[300px] justify-center shadow-inner">
                                {weather.weather_icon ? (
                                    <img
                                        src={`https://openweathermap.org/img/wn/${weather.weather_icon}@4x.png`}
                                        alt={weather.weather_main}
                                        className="w-24 h-24 bg-white/10 rounded-full select-none shadow-xs border border-white/20"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-accent shadow-xs border border-white/20">
                                        <FiSun size={48} className="animate-spin-slow" />
                                    </div>
                                )}
                                <div className="text-center sm:text-left space-y-1">
                                    <h3 className="text-4xl md:text-5xl font-black font-sans tracking-tight leading-none">
                                        {weather.temperature !== null ? `${Math.round(weather.temperature)}°C` : '-'}
                                    </h3>
                                    <h4 className="text-sm font-extrabold text-accent capitalize">
                                        {weather.weather_main}
                                    </h4>
                                    <p className="text-xs text-white/90 font-bold leading-normal truncate max-w-[200px]">
                                        {translateDescription(weather.weather_description, lang)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Attributes grid */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-dark-light uppercase select-none tracking-wider font-sans">
                            {t.weatherTitle} ({weather.city})
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Feels Like temp */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-primary flex items-center justify-center flex-shrink-0">
                                    <FiSun size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.feelsLike}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {weather.feels_like !== null ? `${weather.feels_like.toFixed(1)}°C` : '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Humidity */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <FiDroplet size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.humidity}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {weather.humidity !== null ? `${weather.humidity}%` : '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Pressure */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                    <FiCompass size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.pressure}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {weather.pressure !== null ? `${weather.pressure} hPa` : '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Wind Speed */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                                    <FiWind size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.windSpeed}</span>
                                    <h4 className="text-xs font-bold text-dark font-sans pt-1">
                                        {formatWindSpeed(weather.wind_speed)}
                                    </h4>
                                </div>
                            </Card>

                            {/* Wind Direction */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                                    <FiCompass size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.windDirection}</span>
                                    <h4 className="text-xs font-bold text-dark font-sans pt-1 leading-snug">
                                        {getWindDirectionName(weather.wind_direction)}
                                    </h4>
                                    <span className="text-[10px] font-bold text-dark-light/75 font-mono">({weather.wind_direction}°)</span>
                                </div>
                            </Card>

                            {/* Visibility */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                                    <FiEye size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.visibility}</span>
                                    <h4 className="text-xs font-bold text-dark font-sans pt-1 leading-snug">
                                        {formatVisibility(weather.visibility)}
                                    </h4>
                                </div>
                            </Card>

                            {/* Clouds Cover */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-650 flex items-center justify-center flex-shrink-0">
                                    <FiCloud size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.cloudCover}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {weather.clouds !== null ? `${weather.clouds}%` : '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Country */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <FiGlobe size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.country}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {weather.country || '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Coords Location */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                                    <FiMapPin size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.coords}</span>
                                    <h4 className="text-xs font-mono font-bold text-dark pt-1">
                                        Lat: {weather.latitude !== null ? weather.latitude.toFixed(4) : '-'}
                                    </h4>
                                    <h4 className="text-xs font-mono font-bold text-dark">
                                        Lon: {weather.longitude !== null ? weather.longitude.toFixed(4) : '-'}
                                    </h4>
                                </div>
                            </Card>

                            {/* Sunrise */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                    <FiSun size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.sunrise}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {formatUnixTime(weather.sunrise)}
                                    </h4>
                                </div>
                            </Card>

                            {/* Sunset */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                                    <FiSun size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.sunset}</span>
                                    <h4 className="text-lg font-black text-dark font-sans">
                                        {formatUnixTime(weather.sunset)}
                                    </h4>
                                </div>
                            </Card>

                            {/* Last Updated observation timestamp */}
                            <Card className="p-4 bg-white border border-dark/5 shadow-xs rounded-card hover:shadow-sm leading-normal flex items-start gap-4 transition-all hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center flex-shrink-0">
                                    <FiClock size={20} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-dark-light font-black uppercase">{t.timestamp}</span>
                                    <h4 className="text-xs font-mono font-bold text-dark pt-1 leading-snug">
                                        {weather.timestamp || '-'}
                                    </h4>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-card border border-dark/5 shadow-sm select-none">
                    <div className="w-16 h-16 bg-secondary-dark rounded-full flex items-center justify-center text-dark-light/50 mb-4 border border-dark/5">
                        <FiSun size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-dark">
                        {lang === 'GUJ' ? 'કોઈ હવામાન ડેટા ઉપલબ્ધ નથીં.' : 'No weather information loaded.'}
                    </h4>
                    <p className="text-xs text-dark-light mt-1 max-w-sm">
                        {lang === 'GUJ'
                            ? 'શહેરોની યાદીમાંથી કોઈ એક શહેર પસંદ કરો અથવા કસ્ટમ સર્ચ દ્વારા હવામાન મેળવો.'
                            : 'Select a city from the list or type in a city name above to view weather data.'}
                    </p>
                </div>
            )}

        </div>
    )
}

export default Weather;
