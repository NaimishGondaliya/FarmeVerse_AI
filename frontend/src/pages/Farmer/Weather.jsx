import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
    FiCloud,
    FiActivity,
    FiCheckCircle
} from 'react-icons/fi'
import { weatherAPI, farmAPI } from '../../services/api'

// English/Gujarati weather descriptions translation dictionary
const weatherTranslations = {
    'clear': 'સ્વચ્છ',
    'clear sky': 'સ્વચ્છ આકાશ',
    'sunny': 'તડકો',
    'cloudy': 'વાદળછાયું',
    'clouds': 'વાદળછાયું',
    'few clouds': 'વાદળછાયું',
    'scattered clouds': 'વિખરાયેલા વાદળો',
    'broken clouds': 'ખંડિત વાદળો',
    'partly cloudy': 'આંશિક વાદળછાયું',
    'overcast': 'ઘેરાયેલું આકાશ',
    'overcast clouds': 'ઘેરાયેલું આકાશ',
    'shower rain': 'વરસાદી ઝાપટાં',
    'rain': 'વરસાદ',
    'light rain': 'હળવો વરસાદ',
    'moderate rain': 'મધ્યમ વરસાદ',
    'heavy rain': 'ભારે વરસાદ',
    'heavy intensity rain': 'ભારે વરસાદ',
    'drizzle': 'ઝરમર વરસાદ',
    'thunderstorm': 'વાવાઝોડા સાથે વરસાદ',
    'snow': 'બરફ',
    'mist': 'ઝાકળ',
    'smoke': 'ધુમાડો',
    'haze': 'ધુમ્મસ',
    'dust': 'ધૂળની ડમરી',
    'fog': 'ધુમ્મસ'
}

const translateDescription = (description, lang) => {
    if (!description) return '-'
    if (lang === 'ENG') return description
    const descLower = description.toLowerCase()
    return weatherTranslations[descLower] || description
}

const toGujaratiDigits = (str, lang) => {
    if (lang !== 'GUJ') return str;
    const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/\d/g, d => gujDigits[d]);
};

const formatForecastDate = (dateStr, lang) => {
    if (lang !== 'GUJ') return dateStr;
    const months = {
        'Jan': 'જાન્યુઆરી', 'Feb': 'ફેબ્રુઆરી', 'Mar': 'માર્ચ', 'Apr': 'એપ્રિલ',
        'May': 'મે', 'Jun': 'જૂન', 'Jul': 'જુલાઈ', 'Aug': 'ઑગસ્ટ',
        'Sep': 'સપ્ટેમ્બર', 'Oct': 'ઑક્ટોબર', 'Nov': 'નવેમ્બર', 'Dec': 'ડિસેમ્બર'
    };
    const parts = dateStr.split(' ');
    if (parts.length >= 2) {
        return `${toGujaratiDigits(parts[0], lang)} ${months[parts[1]] || parts[1]}`;
    }
    return dateStr;
};

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
        errorNetwork: "નેટવങ്ക് ભૂલ! કૃપા કરીને ઇન્ટરનેટ જોડાણ તપાસો. (Network Error)",
        errorNoCoordsTitle: "📍 Coordinates Required",
        errorNoCoordsEng: "This farm does not have GPS coordinates.\nWeather cannot be fetched.\nPlease edit the farm and add Latitude and Longitude.",
        errorNoCoordsGuj: "આ ફાર્મ માટે Latitude અને Longitude ઉપલબ્ધ નથી.\nતેથી હવામાન બતાવી શકાતું નથી.\nકૃપા કરીને Farm Edit કરીને Coordinates ઉમેરો.",
        editFarmBtn: "Edit Farm",
        selectAnotherBtn: "Select Another Farm",

        // Smart Weather Insights
        insightsTitle: "સ્માર્ટ હવામાન સલાહ (Smart Insights)",
        insightRain: "🌧 24 કલાકમાં વરસાદની શક્યતા છે. આજે પિયત (સિંચાઈ) ટાળો.",
        insightTemp: "🔥 વધુ તાપમાન. સવારે 8 પહેલાં અથવા સાંજે 6 પછી પિયત કરો.",
        insightWind: "💨 ભારે પવન. જંતુનાશક દવાનો છંટકાવ ટાળો.",
        insightHumidity: "⚠ વધુ ભેજ. ફૂગજન્ય રોગો માટે પાકનું નિરીક્ષણ કરો.",
        insightNormal: "✅ હવામાનની સ્થિતિ સામાન્ય ખેતીકામ માટે અનુકૂળ છે.",

        // Smart Irrigation Advisor
        irrigationTitle: "સ્માર્ટ સિંચાઈ સલાહકાર (Irrigation Advisor)",
        irrigStatusReqFalse: "❌ સિંચાઈની જરૂર નથી",
        irrigReasonRain: "ભારે વરસાદની અપેક્ષા છે.",
        irrigStatusReqTrue: "✅ સિંચાઈની ભલામણ છે",
        irrigReasonTemp: "હાઈ ટેમ્પરેચર અને સૂકું હવામાન.",
        irrigTimeTemp: "સવારે 6 - 8 અથવા સાંજે 6 - 8",
        irrigAdviceTemp: "બાષ્પીભવન અટકાવવા ઠંડા કલાકોમાં પિયત કરો.",
        irrigStatusDelay: "⏳ સિંચાઈ મોડી કરો",
        irrigReasonHumid: "હવામાં વધુ ભેજ છે અને વરસાદની શક્યતા છે.",
        irrigStatusWind: "⚠ પવનની ચેતવણી",
        irrigReasonWind: "હવામાનમાં ભારે પવનની ગતિ છે.",
        irrigAdviceWind: "પાણી ઉડી ન જાય તે માટે ફુવારા પદ્ધતિ (સ્પ્રિંકલર) ટાળો.",
        irrigStatusNormal: "✅ સામાન્ય સ્થિતિ",
        irrigReasonNormal: "હવામાન સામાન્ય સિંચાઈ માટે અનુકૂળ છે.",
        irrigAdviceNormal: "તમારા નિયમિત પિયત શેડ્યૂલનું પાલન છો.",
        irrigLabelStatus: "સ્થિતિ",
        irrigLabelReason: "કારણ",
        irrigLabelTime: "પિયતનો સમય",
        irrigLabelAdvice: "સલાહ",

        // Smart Weekly Farm Planner
        plannerTitle: "સ્માર્ટ સાપ્તાહિક ફાર્મ પ્લાનર",
        plannerSubtitle: "આગામી 7 દિવસનું ખેતી આયોજન",
        planActIrrig: "સિંચાઈ શિડ્યુલ",
        planActFert: "ખાતર વાવણી",
        planActSpray: "દવા છંટકાવ",
        planActHarvest: "કાપણી (Harvest)",
        planActSowing: "વાવેતર (Sowing)",

        actIrrigSkip: "સિંચાઈ ટાળો",
        actIrrigRec: "સિંચાઈ કરો",
        actFertSkip: "ખાતર ટાળો",
        actFertRec: "મધ્યમ",
        actSpraySkip: "છંટકાવ ટાળો",
        actSprayRec: "યોગ્ય સમય",
        actHarvSkip: "કાપણી મોડી કરો",
        actHarvRec: "કાપણી શરૂ કરો",
        actSowGood: "યોગ્ય વાતાવરણ",
        actSowBad: "વાવેતર ટાળો",

        planOverallScore: "એકંદર ફાર્મિંગ સ્કોર",
        planAISummary: "AI ફાર્મ સારાંશ",
        planSelectText: "વિગતવાર પ્લાનર જોવા માટે કોઈ એક દિવસ ઉપર ક્લિક કરો.",
        day: "દિવસ",
        airMoisture: "હવામાં ભેજ",
        kmh: "કિમી/કલાક",
        precipExpected: "વરસાદની શક્યતા",
        kmVisibility: "કિમી દૃશ્યતા",
        rainProb: "વરસાદની સંભાવના",
        uvVis: "યુવી / દૃશ્યતા",
        recommendationLbl: "ભલામણ",
        timingLbl: "સમય",
        waterReasonLbl: "પાણીની જરૂરિયાતનું કારણ",
        additionalAnalytics: "વધારાની હવામાન એનાલિટિક્સ",
        noForecast: "આગાહીનો ડેટા ઉપલબ્ધ નથી",
        noWeather: "કોઈ હવામાન ડેટા ઉપલબ્ધ નથીં.",
        noWeatherDesc: "શહેરોની યાદીમાંથી કોઈ એક શહેર પસંદ કરો અથવા કસ્ટમ સર્ચ દ્વારા હવામાન મેળવો.",
        liveWeatherStatus: "જીવંત હવામાન વિગતો"
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
        errorNetwork: "Network Error. Please check your internet connectivity. (Network Error)",
        errorNoCoordsTitle: "📍 Coordinates Required",
        errorNoCoordsEng: "This farm does not have GPS coordinates.\nWeather cannot be fetched.\nPlease edit the farm and add Latitude and Longitude.",
        errorNoCoordsGuj: "આ ફાર્મ માટે Latitude અને Longitude ઉપલબ્ધ નથી.\nતેથી હવામાન બતાવી શકાતું નથી.\nકૃપા કરીને Farm Edit કરીને Coordinates ઉમેરો.",
        editFarmBtn: "Edit Farm",
        selectAnotherBtn: "Select Another Farm",

        // Smart Weather Insights
        insightsTitle: "Smart Weather Insights",
        insightRain: "🌧 Rain expected within 24 hours. Avoid irrigation today.",
        insightTemp: "🔥 High temperature. Irrigate before 8 AM or after 6 PM.",
        insightWind: "💨 Strong wind. Avoid pesticide spraying.",
        insightHumidity: "⚠ High humidity. Monitor crops for fungal diseases.",
        insightNormal: "✅ Weather conditions are suitable for normal farming activities.",

        // Smart Irrigation Advisor
        irrigationTitle: "Smart Irrigation Advisor",
        irrigStatusReqFalse: "❌ Irrigation Not Required",
        irrigReasonRain: "Heavy rainfall expected.",
        irrigStatusReqTrue: "✅ Irrigation Recommended",
        irrigReasonTemp: "High temperature and dry conditions.",
        irrigTimeTemp: "6 AM – 8 AM or 6 PM – 8 PM",
        irrigAdviceTemp: "Irrigate in cooler hours to prevent evaporation.",
        irrigStatusDelay: "⏳ Delay irrigation",
        irrigReasonHumid: "High moisture content in air and chance of rain.",
        irrigStatusWind: "⚠ Wind Alert",
        irrigReasonWind: "Strong winds.",
        irrigAdviceWind: "Avoid sprinkler irrigation to prevent water drift.",
        irrigStatusNormal: "✅ Normal Conditions",
        irrigReasonNormal: "Weather is optimal for standard farming tasks.",
        irrigAdviceNormal: "Stick to your regular irrigation schedule.",
        irrigLabelStatus: "Status",
        irrigLabelReason: "Reason",
        irrigLabelTime: "Recommended Time",
        irrigLabelAdvice: "Short Advice",

        // Smart Weekly Farm Planner
        plannerTitle: "Smart Weekly Farm Planner",
        plannerSubtitle: "Next 7 Days Farming Schedule",
        planActIrrig: "Irrigation",
        planActFert: "Fertilizer",
        planActSpray: "Spraying",
        planActHarvest: "Harvesting",
        planActSowing: "Sowing",

        actIrrigSkip: "Skip Irrigation",
        actIrrigRec: "Irrigate",
        actFertSkip: "Avoid Fertilizer",
        actFertRec: "Good Day",
        actSpraySkip: "Avoid Spray",
        actSprayRec: "Safe for Spray",
        actHarvSkip: "Delay Harvest",
        actHarvRec: "Harvest Recommended",
        actSowGood: "Good Day for Sowing",
        actSowBad: "Avoid Sowing",

        planOverallScore: "Overall Farming Score",
        planAISummary: "AI Farm Summary",
        planSelectText: "Click on a day above to view the detailed farm planner.",
        day: "Day",
        airMoisture: "Air Moisture",
        kmh: "km/h",
        precipExpected: "Precipitation Expected",
        kmVisibility: "km Visibility",
        rainProb: "RAIN PROB",
        uvVis: "UV / VIS",
        recommendationLbl: "Recommendation",
        timingLbl: "Timing",
        waterReasonLbl: "Water Requirement Reason",
        additionalAnalytics: "Additional Weather Analytics",
        noForecast: "No forecast data available",
        noWeather: "No weather information loaded.",
        noWeatherDesc: "Select a city from the list or type in a city name above to view weather data.",
        liveWeatherStatus: "Live Weather Status"
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
    const navigate = useNavigate()
    const [cityInput, setCityInput] = useState('Rajkot')
    const [selectedDropdownCity, setSelectedDropdownCity] = useState('Rajkot')
    const [weather, setWeather] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [errorType, setErrorType] = useState('') // 'invalid_city', 'api_offline', 'backend_offline', 'network'

    // Location Mode State
    const [locationMode, setLocationMode] = useState('city') // 'farm', 'city', 'search'
    const [myFarms, setMyFarms] = useState([])
    const [selectedFarmId, setSelectedFarmId] = useState('')

    // Weekly Planner State
    const [selectedPlannerDayIndex, setSelectedPlannerDayIndex] = useState(0)

    const [isFarmsLoading, setIsFarmsLoading] = useState(true)
    const [farmsError, setFarmsError] = useState('')

    const t = dictionary[lang]

    useEffect(() => {
        const loadFarmsAndWeather = async () => {
            setIsFarmsLoading(true)
            setFarmsError('')
            try {
                const res = await farmAPI.getAll()
                if (res.success && res.data) {
                    setMyFarms(res.data)
                    if (res.data.length > 0) {
                        const firstFarm = res.data[0]
                        setSelectedFarmId(firstFarm.id)
                        setLocationMode('farm')
                        if (firstFarm.latitude && firstFarm.longitude) {
                            fetchWeather(firstFarm.district || firstFarm.village || 'Rajkot', firstFarm.latitude, firstFarm.longitude)
                            setIsFarmsLoading(false)
                            return
                        } else {
                            setWeather(null)
                            setErrorType('no_coords')
                            setIsFarmsLoading(false)
                            return
                        }
                    }
                } else {
                    setFarmsError('Unable to load farms.')
                }
            } catch (err) {
                console.error("Error fetching farms:", err)
                setFarmsError('Unable to load farms.')
            }

            setIsFarmsLoading(false)
            // Fallback if no farms or API error
            fetchWeather('Rajkot', null, null)
        }
        loadFarmsAndWeather()
    }, [])

    const mockForecastData = React.useMemo(() => {
        if (!weather) return [];
        const forecast = [];
        const baseTemp = weather.temperature || 30;
        const baseHum = weather.humidity || 60;
        const baseRain = weather.pop !== undefined ? weather.pop * 100 : (weather.clouds || 0);
        const baseWind = weather.wind_speed ? (weather.wind_speed * 3.6) : 10;

        for (let i = 0; i < 7; i++) {
            const temp = Math.max(10, Math.min(50, baseTemp + (Math.sin(i * 1.5) * 4)));
            const humidity = Math.max(20, Math.min(100, baseHum + (Math.cos(i) * 15)));
            let rain = baseRain;
            if (i > 0) rain = Math.max(0, Math.min(100, (baseRain * 0.7) + (Math.sin(i * 2) * 40)));
            const wind = Math.max(0, Math.min(60, baseWind + (Math.cos(i * 3) * 10)));

            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() + i);
            const isToday = i === 0;

            const daysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const daysGuj = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];

            let score = 100;
            if (rain > 60) score -= 25;
            if (wind > 20) score -= 20;
            if (temp > 38) score -= 20;
            if (humidity > 90) score -= 15;

            let badge = 'Poor';
            if (score >= 80) badge = 'Excellent';
            else if (score >= 60) badge = 'Good';
            else if (score >= 40) badge = 'Moderate';

            forecast.push({
                index: i,
                dayNameEng: isToday ? 'Today' : daysEng[dayDate.getDay()],
                dayNameGuj: isToday ? 'આજે' : daysGuj[dayDate.getDay()],
                dateStr: dayDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                temp: Math.round(temp),
                humidity: Math.round(humidity),
                rainProb: Math.round(rain),
                wind: Math.round(wind),
                score,
                badge
            });
        }
        return forecast;
    }, [weather]);

    const fetchWeather = async (targetCity, lat = null, lon = null, isManualRefresh = false) => {
        if (!targetCity && !lat && !lon) return

        if (isManualRefresh) {
            setRefreshing(true)
        } else {
            setIsLoading(true)
        }
        setErrorType('')

        try {
            const data = await weatherAPI.getCurrent(targetCity, lat, lon)
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
        fetchWeather(cityInput, null, null, false)
    }

    const handleDropdownSelect = (e) => {
        const val = e.target.value
        setSelectedDropdownCity(val)
        fetchWeather(val, null, null, false)
    }

    const handleFarmSelect = (e) => {
        const val = e.target.value
        setSelectedFarmId(val)
        const farm = myFarms.find(f => f.id === val)
        if (farm && farm.latitude && farm.longitude) {
            fetchWeather(farm.district || farm.village || 'Rajkot', farm.latitude, farm.longitude, false)
        } else {
            setWeather(null)
            setErrorType('no_coords')
        }
    }

    const handleManualRefresh = () => {
        if (locationMode === 'farm' && selectedFarmId) {
            const farm = myFarms.find(f => f.id === selectedFarmId)
            if (farm && farm.latitude && farm.longitude) {
                fetchWeather(farm.district || farm.village || 'Rajkot', farm.latitude, farm.longitude, true)
            } else if (farm) {
                setWeather(null)
                setErrorType('no_coords')
            }
        } else if (locationMode === 'city') {
            fetchWeather(selectedDropdownCity, null, null, true)
        } else {
            fetchWeather(cityInput || 'Rajkot', null, null, true)
        }
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
            ? `${toGujaratiDigits(speed.toFixed(1), lang)} મી/સે (${toGujaratiDigits(kmh.toFixed(1), lang)} કિમી/કલાક)`
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
            ? `${toGujaratiDigits(km.toFixed(1), lang)} કિલોમીટર (${toGujaratiDigits(meters, lang)} મીટર)`
            : `${km.toFixed(1)} km (${meters} m)`
    }

    const getInsight = () => {
        if (!weather) return null;

        // Use weather.pop if available, otherwise fallback to weather.clouds as proxy for rain probability
        const rainProbability = weather.pop !== undefined ? weather.pop * 100 : (weather.clouds || 0);

        if (rainProbability > 60) {
            return t.insightRain;
        }
        if (weather.temperature > 35) {
            return t.insightTemp;
        }
        if (weather.wind_speed && (weather.wind_speed * 3.6) > 20) {
            return t.insightWind;
        }
        if (weather.humidity > 85) {
            return t.insightHumidity;
        }

        return t.insightNormal;
    }

    const getIrrigationInsight = () => {
        if (!weather) return null;

        const rainProbability = weather.pop !== undefined ? weather.pop * 100 : (weather.clouds || 0);

        if (rainProbability > 60) {
            return {
                status: t.irrigStatusReqFalse,
                reason: t.irrigReasonRain,
                time: '-',
                advice: t.insightRain
            }
        }
        if (weather.temperature > 35 && rainProbability < 40) {
            return {
                status: t.irrigStatusReqTrue,
                reason: t.irrigReasonTemp,
                time: t.irrigTimeTemp,
                advice: t.irrigAdviceTemp
            }
        }
        if (weather.humidity > 85 && rainProbability > 40) {
            return {
                status: t.irrigStatusDelay,
                reason: t.irrigReasonHumid,
                time: '-',
                advice: t.insightHumidity
            }
        }
        if (weather.wind_speed && (weather.wind_speed * 3.6) > 25) {
            return {
                status: t.irrigStatusWind,
                reason: t.irrigReasonWind,
                time: '-',
                advice: t.irrigAdviceWind
            }
        }

        return {
            status: t.irrigStatusNormal,
            reason: t.irrigReasonNormal,
            time: 'Anytime',
            advice: t.irrigAdviceNormal
        }
    }

    const currentInsight = getInsight();
    const irrigationInsight = getIrrigationInsight();

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
                        errorType === 'no_coords' ? 'bg-rose-50 border-rose-250 text-rose-900' :
                            'bg-red-50 border-red-250 text-red-900'
                    }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${errorType === 'invalid_city' ? 'bg-amber-100 text-amber-600' :
                        errorType === 'api_offline' ? 'bg-orange-100 text-orange-600' :
                            errorType === 'no_coords' ? 'bg-rose-100 text-rose-600' :
                                'bg-red-100 text-red-600'
                        }`}>
                        <FiAlertCircle size={24} />
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h4 className="font-extrabold text-sm select-none whitespace-pre-line">
                            {errorType === 'no_coords' ? t.errorNoCoordsTitle : t.errorTitle}
                        </h4>
                        <p className="text-xs mt-1 font-semibold opacity-90 leading-relaxed whitespace-pre-line">
                            {errorType === 'invalid_city' && t.errorInvalidCity}
                            {errorType === 'api_offline' && t.errorApiOffline}
                            {errorType === 'backend_offline' && t.errorBackendOffline}
                            {errorType === 'network' && t.errorNetwork}
                            {errorType === 'no_coords' && (lang === 'GUJ' ? t.errorNoCoordsGuj : t.errorNoCoordsEng)}
                        </p>
                        {errorType === 'no_coords' && (
                            <div className="flex gap-3 mt-4 justify-center md:justify-start">
                                <Button onClick={() => navigate('/farmer/my-farm')} className="bg-rose-600 hover:bg-rose-700 text-white rounded outline-none py-1.5 px-4 text-xs font-bold flex items-center">
                                    {t.editFarmBtn}
                                </Button>
                                <Button onClick={() => setLocationMode('city')} className="bg-white border-2 border-rose-200 hover:bg-rose-50 text-rose-700 rounded outline-none py-1.5 px-4 text-xs font-bold flex items-center">
                                    {t.selectAnotherBtn}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Location Mode Control Segmented UI */}
            <div className="bg-white p-4 lg:p-6 rounded-card border shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <div className="w-full md:w-1/3 space-y-2">
                        <label className="block text-xs font-bold text-dark-light select-none">
                            {lang === 'GUJ' ? 'લોકેશન મોડ પસંદ કરો:' : 'Select Location Mode:'}
                        </label>
                        <div className="flex  bg-dark/5 p-1 rounded-card border">
                            <button
                                onClick={() => setLocationMode('farm')}
                                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-btn text-xs font-bold transition-all ${locationMode === 'farm' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-dark'
                                    }`}
                            >
                                <FiActivity size={16} />
                                <span className="hidden sm:inline">{lang === 'GUJ' ? 'મારું ફાર્મ' : 'Use My Farm'}</span>
                            </button>
                            <button
                                onClick={() => setLocationMode('city')}
                                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-btn text-xs font-bold transition-all ${locationMode === 'city' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'
                                    }`}
                            >
                                <FiMapPin size={16} />
                                <span className="hidden sm:inline">{lang === 'GUJ' ? 'શહેર પસંદ કરો' : 'Select City'}</span>
                            </button>
                            <button
                                onClick={() => setLocationMode('search')}
                                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-btn text-xs font-bold transition-all ${locationMode === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-dark'
                                    }`}
                            >
                                <FiSearch size={16} />
                                <span className="hidden sm:inline">{lang === 'GUJ' ? 'શોધો' : 'Search City'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        {locationMode === 'farm' && (
                            <div className="flex flex-col justify-end w-full space-y-2 h-full">
                                <label className="block text-xs font-bold text-dark-light">
                                    {lang === 'GUJ' ? 'તમારું નોંધાયેલ ફાર્મ પસંદ કરો:' : 'Select your registered farm:'}
                                </label>
                                {isFarmsLoading ? (
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-500 font-semibold text-sm">
                                        Loading farms...
                                    </div>
                                ) : farmsError ? (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-800 font-semibold text-sm">
                                        <FiAlertCircle className="flex-shrink-0" size={20} />
                                        <span>Unable to load farms.</span>
                                    </div>
                                ) : myFarms.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="w-full bg-secondary border border-dark/10 outline-none px-4 py-3 text-sm rounded-btn focus:border-emerald-500 font-bold text-emerald-800 cursor-pointer appearance-none transition-colors"
                                            value={selectedFarmId}
                                            onChange={handleFarmSelect}
                                        >
                                            {myFarms.map(farm => (
                                                <option key={farm.id} value={farm.id}>
                                                    {farm.farm_name} ({farm.village || farm.district})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-4 text-emerald-600 flex items-center text-xs">
                                            ▼
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3 text-orange-800 font-semibold text-sm">
                                        <FiAlertCircle className="flex-shrink-0" size={20} />
                                        <span>No registered farms found. Please register a farm first.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {locationMode === 'city' && (
                            <div className="flex flex-col justify-end w-full space-y-2 h-full">
                                <label className="block text-xs font-bold text-dark-light">
                                    {t.selectCity}
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-secondary border border-dark/10 outline-none px-4 py-3 text-sm rounded-btn focus:border-primary font-bold text-dark cursor-pointer appearance-none transition-colors"
                                        value={selectedDropdownCity}
                                        onChange={handleDropdownSelect}
                                    >
                                        {gujaratCities.map(city => (
                                            <option key={city.name} value={city.name}>
                                                {lang === 'GUJ' ? city.labelGuj : city.labelEng}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-4 text-dark-light flex items-center text-xs">
                                        ▼
                                    </div>
                                </div>
                            </div>
                        )}

                        {locationMode === 'search' && (
                            <div className="w-full h-full">
                                <form onSubmit={handleSearchSubmit} className="flex flex-col h-full justify-end space-y-2">
                                    <label className="block text-xs font-bold text-dark-light">
                                        {lang === 'GUJ' ? 'શહેર જાતે શોધો (Search Manually):' : 'Search Custom City:'}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={t.searchPlaceholder}
                                            className="flex-1 bg-white border border-dark/10 rounded-btn px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold transition-colors"
                                            value={cityInput}
                                            onChange={(e) => setCityInput(e.target.value)}
                                        />
                                        <Button
                                            type="submit"
                                            className="px-6 py-3 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white rounded-btn shadow-sm"
                                        >
                                            <FiSearch />
                                            {t.searchBtn}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
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

                    {/* Modern Premium Top Section */}
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <FiMapPin className="text-emerald-600" />
                                {lang === 'GUJ'
                                    ? `${weather.city === 'Rajkot' ? 'રાજકોટ' : weather.city === 'Gondal' ? 'ગોંડલ' : weather.city}, ${weather.country === 'IN' ? 'ગુજરાત' : weather.country}`
                                    : `${weather.city === 'રાજકોટ' ? 'Rajkot' : weather.city === 'ગોંડલ' ? 'Gondal' : weather.city}, ${weather.country === 'IN' ? 'Gujarat' : weather.country}`}
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                                <FiClock size={14} /> {t.lastUpdated}: {formatUnixTime(weather.timestamp) || '-'}
                            </p>
                        </div>
                        <div className="bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 font-bold text-sm border border-emerald-100 flex items-center gap-2">
                            <FiSun className="animate-spin-slow" />
                            {t.liveWeatherStatus}
                        </div>
                    </div>

                    {/* Compact Metric Cards (Top Section Requirement 1) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiSun size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.feelsLike}</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{weather.temperature !== null ? `${toGujaratiDigits(Math.round(weather.temperature), lang)}°` : '-'}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 capitalize">{translateDescription(weather.weather_main, lang)}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiDroplet size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.humidity}</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{weather.humidity !== null ? `${toGujaratiDigits(weather.humidity, lang)}%` : '-'}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{t.airMoisture}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiWind size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.windSpeed}</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{toGujaratiDigits(formatWindSpeed(weather.wind_speed).split(' ')[0], lang)}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{t.kmh}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiCloud size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.rainProb}</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{weather.pop !== undefined ? `${toGujaratiDigits(Math.round(weather.pop * 100), lang)}%` : (weather.clouds !== null ? `${toGujaratiDigits(weather.clouds, lang)}%` : '-')}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{t.precipExpected}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiEye size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.uvVis}</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{toGujaratiDigits(formatVisibility(weather.visibility).split(' ')[0], lang)}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{t.kmVisibility}</p>
                        </div>
                    </div>

                    {/* Insights & Irrigation (Requirements 2 & 3: Colored alert boxes, status badge) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Smart Weather Insights */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <FiAlertCircle size={100} />
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiActivity className="text-emerald-500" />
                                {t.insightsTitle}
                            </h3>
                            <div className={`p-5 rounded-xl flex items-start gap-4 h-full border ${currentInsight.includes('🌧') || currentInsight.includes('⚠') || currentInsight.includes('💨') ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${currentInsight.includes('🌧') || currentInsight.includes('⚠') || currentInsight.includes('💨') ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    <FiAlertCircle size={16} />
                                </div>
                                <p className="text-sm font-bold leading-relaxed">{currentInsight}</p>
                            </div>
                        </div>

                        {/* Irrigation Advisor */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <FiDroplet size={100} />
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiDroplet className="text-blue-500" />
                                {t.irrigationTitle}
                            </h3>
                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-1 block">{t.recommendationLbl}</span>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-sm font-bold rounded-lg shadow-xs">
                                            {irrigationInsight?.status}
                                        </div>
                                    </div>
                                    <div className="text-right flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-1 block">{t.timingLbl}</span>
                                        <div className="text-sm font-black text-slate-800">{irrigationInsight?.time !== '-' ? irrigationInsight?.time : 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{t.waterReasonLbl}</div>
                                    <div className="text-xs font-bold text-slate-700">{irrigationInsight?.reason} {irrigationInsight?.advice}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Weekly Farm Planner Section (Requirements 4, 5, 6, 7 & 8) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <FiCompass className="text-primary" />
                                    {t.plannerTitle}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">{t.plannerSubtitle} - {t.planSelectText}</p>
                            </div>
                        </div>

                        {/* Horizontal forecast cards */}
                        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                            {mockForecastData?.map((day) => (
                                <div
                                    key={day.index}
                                    onClick={() => setSelectedPlannerDayIndex(day.index)}
                                    className={`min-w-[120px] p-4 rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${selectedPlannerDayIndex === day.index
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg scale-105'
                                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black uppercase mb-1 tracking-widest ${selectedPlannerDayIndex === day.index ? 'text-emerald-100' : 'text-slate-400'}`}>
                                        {lang === 'GUJ' ? day.dayNameGuj : day.dayNameEng}
                                    </span>
                                    <span className="text-xl font-black tracking-tighter mb-3">{formatForecastDate(day.dateStr, lang)}</span>
                                    <div className="flex w-full justify-between px-1">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <FiSun size={14} className={selectedPlannerDayIndex === day.index ? 'text-amber-200' : 'text-amber-500'} />
                                            <span className="text-xs font-bold">{toGujaratiDigits(day.temp, lang)}°</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <FiDroplet size={14} className={selectedPlannerDayIndex === day.index ? 'text-blue-200' : 'text-blue-500'} />
                                            <span className="text-xs font-bold">{toGujaratiDigits(day.rainProb, lang)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detailed selected day */}
                        {mockForecastData?.length > 0 ? (() => {
                            const d = mockForecastData[selectedPlannerDayIndex];
                            if (!d) return null;

                            // Activity Logics with strict Green/Yellow/Red categorizations
                            // Irrigation
                            let actIrrigBadge = d?.rainProb > 60 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            let actIrrigIcon = d?.rainProb > 60 ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />;
                            let actIrrigLbl = d?.rainProb > 60 ? t.actIrrigSkip : t.actIrrigRec;

                            // Fertilizer
                            let actFertBadge = d?.rainProb > 50 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            let actFertIcon = d?.rainProb > 50 ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />;
                            let actFertLbl = d?.rainProb > 50 ? t.actFertSkip : t.actFertRec;

                            // Spray
                            let actSprayBadge = d?.wind > 20 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            let actSprayIcon = d?.wind > 20 ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />;
                            let actSprayLbl = d?.wind > 20 ? t.actSpraySkip : t.actSprayRec;

                            // Harvest
                            let actHarvBadge = d?.rainProb > 50 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            let actHarvIcon = d?.rainProb > 50 ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />;
                            let actHarvLbl = d?.rainProb > 50 ? t.actHarvSkip : t.actHarvRec;

                            // Sowing
                            const isSowingGood = (d?.temp >= 20 && d?.temp <= 35) && (d?.rainProb >= 20 && d?.rainProb <= 60);
                            let actSowBadge = isSowingGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                            let actSowIcon = isSowingGood ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />;
                            let actSowLbl = isSowingGood ? t.actSowGood : t.actSowBad;

                            // Summary Generation
                            let aiSummary = "";
                            if (d?.score >= 80) aiSummary = lang === 'GUJ' ? "વાતાવરણ ખેતીલાયક ઉત્તમ છે. વાવેતર અને કાપણી માટે યોગ્ય સમય માનવામાં આવે છે." : "Conditions are highly optimal for major farming activities. Ideal for scheduled operations.";
                            else if (d?.score >= 60) aiSummary = lang === 'GUJ' ? "મોટાભાગના કાર્યો માટે અનુકૂળ. પરંતુ પવન કે ભેજ વધવાની સંભાવના હોય તો દવા છંટકાવ ટાળવો." : "Favorable conditions. However, exercise standard caution if spraying or applying fertilizers.";
                            else if (d?.score >= 40) aiSummary = lang === 'GUJ' ? "હવામાન મધ્યમ છે. માત્ર જરૂરી કાર્યો જ પૂરા કરો અને વરસાદ કે પવન અંગે ધ્યાન રાખો." : "Moderate weather. Prioritize essential activities and strictly monitor wind and rain forecasts.";
                            else aiSummary = lang === 'GUJ' ? "હવામાન ખેતી માટે પ્રતિકૂળ હોવાથી બહારના ખેતીકામ બંધ રાખો. પાકને નુકસાન ન થાય તેની તકેદારી લો." : "Severe weather conditions. Avoid sensitive farming activities like irrigation, spraying, and harvesting.";

                            let badgeLabelGuj = 'નબળું (Poor)';
                            let strokeColor = '#fca5a5';
                            if (d?.score >= 80) { strokeColor = '#34d399'; badgeLabelGuj = 'શ્રેષ્ઠ (Excellent)'; }
                            else if (d?.score >= 60) { strokeColor = '#60a5fa'; badgeLabelGuj = 'સારું (Good)'; }
                            else if (d?.score >= 40) { strokeColor = '#fcd34d'; badgeLabelGuj = 'મધ્યમ (Moderate)'; }

                            // Circular Score SVG Math
                            const radius = 36;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (d?.score / 100) * circumference;

                            return (
                                <div className="mt-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner animate-fadeIn">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                        {/* Two-column layout: Left side (Score + Details) */}
                                        <div className="lg:col-span-4 flex flex-col gap-6">
                                            {/* Circular Indicator */}
                                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
                                                <div className="relative w-24 h-24 flex-shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r={radius} className="stroke-slate-100" strokeWidth="8" fill="none" />
                                                        <circle cx="50" cy="50" r={radius} className="transition-all duration-1000 ease-out" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-2xl font-black text-slate-800 leading-none">{toGujaratiDigits(d.score, lang)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{t.planOverallScore}</h4>
                                                    <span className="text-sm font-bold text-slate-700">{lang === 'GUJ' ? badgeLabelGuj : d.badge}</span>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{lang === 'GUJ' ? d.dayNameGuj : d.dayNameEng}, {formatForecastDate(d.dateStr, lang)}</p>
                                                </div>
                                            </div>

                                            {/* AI Summary Gradient Card */}
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-5 rounded-xl border border-emerald-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute right-0 bottom-0 opacity-10 -mr-4 -mb-4">
                                                    <FiActivity size={80} />
                                                </div>
                                                <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2 relative z-10">
                                                    <FiActivity /> {t.planAISummary}
                                                </h5>
                                                <p className="text-xs font-bold text-emerald-950 leading-relaxed relative z-10">
                                                    {aiSummary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right side (Color coded activity cards) */}
                                        <div className="lg:col-span-8">
                                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 h-full">
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${actIrrigBadge}`}>
                                                    <div className="mb-2 opacity-80">{actIrrigIcon}</div>
                                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{t.planActIrrig}</span>
                                                    <span className="text-xs font-bold leading-tight">{actIrrigLbl}</span>
                                                </div>
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${actFertBadge}`}>
                                                    <div className="mb-2 opacity-80">{actFertIcon}</div>
                                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{t.planActFert}</span>
                                                    <span className="text-xs font-bold leading-tight">{actFertLbl}</span>
                                                </div>
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${actSprayBadge}`}>
                                                    <div className="mb-2 opacity-80">{actSprayIcon}</div>
                                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{t.planActSpray}</span>
                                                    <span className="text-xs font-bold leading-tight">{actSprayLbl}</span>
                                                </div>
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${actHarvBadge}`}>
                                                    <div className="mb-2 opacity-80">{actHarvIcon}</div>
                                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{t.planActHarvest}</span>
                                                    <span className="text-xs font-bold leading-tight">{actHarvLbl}</span>
                                                </div>
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${actSowBadge}`}>
                                                    <div className="mb-2 opacity-80">{actSowIcon}</div>
                                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{t.planActSowing}</span>
                                                    <span className="text-xs font-bold leading-tight">{actSowLbl}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="text-center p-8 text-slate-500 font-bold bg-slate-50 rounded-2xl border border-slate-200">
                                {t.noForecast}
                            </div>
                        )}
                    </div>

                    {/* Secondary Attributes grid */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <FiActivity className="text-emerald-500" />
                            {t.additionalAnalytics}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {/* Pressure */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center mb-2">
                                    <FiCompass size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.pressure}</span>
                                <h4 className="text-sm font-black text-slate-700">{weather.pressure !== null ? `${toGujaratiDigits(weather.pressure, lang)} hPa` : '-'}</h4>
                            </div>

                            {/* Wind Direction */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center mb-2">
                                    <FiCompass size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.windDirection}</span>
                                <h4 className="text-sm font-black text-slate-700 leading-none">{getWindDirectionName(weather.wind_direction)}</h4>
                                <span className="text-[10px] font-bold text-slate-400">({toGujaratiDigits(weather.wind_direction, lang)}°)</span>
                            </div>

                            {/* Clouds Cover */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center mb-2">
                                    <FiCloud size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.cloudCover}</span>
                                <h4 className="text-sm font-black text-slate-700">{weather.clouds !== null ? `${toGujaratiDigits(weather.clouds, lang)}%` : '-'}</h4>
                            </div>

                            {/* Sunrise */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
                                    <FiSun size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.sunrise}</span>
                                <h4 className="text-sm font-black text-slate-700">{toGujaratiDigits(formatUnixTime(weather.sunrise), lang)}</h4>
                            </div>

                            {/* Sunset */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                                    <FiSun size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.sunset}</span>
                                <h4 className="text-sm font-black text-slate-700">{toGujaratiDigits(formatUnixTime(weather.sunset), lang)}</h4>
                            </div>

                            {/* Coords Location */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                                    <FiMapPin size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.coords}</span>
                                <h4 className="text-[10px] font-bold text-slate-700">Lat: {weather.latitude !== null ? toGujaratiDigits(weather.latitude.toFixed(3), lang) : '-'}</h4>
                                <h4 className="text-[10px] font-bold text-slate-700">Lon: {weather.longitude !== null ? toGujaratiDigits(weather.longitude.toFixed(3), lang) : '-'}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm animate-fadeIn">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                        <FiSun size={40} />
                    </div>
                    <h4 className="text-lg font-black text-slate-700">
                        {t.noWeather}
                    </h4>
                    <p className="text-sm font-bold text-slate-400 mt-2 max-w-sm">
                        {t.noWeatherDesc}
                    </p>
                </div>
            )}

        </div>
    )
}
export default Weather;