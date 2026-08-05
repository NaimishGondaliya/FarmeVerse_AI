import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useNavigate, Link } from 'react-router-dom'
import {
    FiLayers,
    FiSun,
    FiMapPin,
    FiPlus,
    FiBookOpen,
    FiTarget,
    FiPercent,
    FiInbox,
    FiActivity,
    FiArrowRight,
    FiTrendingUp,
    FiCloudRain,
    FiCheckCircle
} from 'react-icons/fi'
import { BiRupee } from 'react-icons/bi'
import { farmAPI, cropAPI, weatherAPI, marketPricesAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'

const formatDisplay = (type, val, language) => {
    if (language !== 'gu') return val;
    const maps = {
        crop: {
            'Groundnut': 'મગફળી', 'Cotton': 'કપાસ', 'Wheat': 'ઘઉં', 'Cumin': 'જીરું', 'Mustard': 'રાઈ', 'Castor Seed': 'એરંડા'
        },
        market: {
            'Rajkot APMC': 'રાજકોટ APMC', 'Gondal APMC': 'ગોંડલ APMC', 'Junagadh APMC': 'જૂનાગઢ APMC'
        },
        day: {
            'Sun': 'રવિવાર', 'Mon': 'સોમવાર', 'Tue': 'મંગળવાર', 'Wed': 'બુધવાર', 'Thu': 'ગુરુવાર', 'Fri': 'શુક્રવાર', 'Sat': 'શનિવાર', 'Today': 'આજે'
        },
        weather: {
            'Clear': 'સ્વચ્છ', 'Rainy': 'વરસાદી', 'Clouds': 'વાદળછાયું', 'Rain': 'વરસાદ'
        }
    };
    return maps[type]?.[val] || val;
};

const toGuDigits = (str, language) => {
    if (language !== 'gu' || !str) return str;
    const gu = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/[0-9]/g, d => gu[d]);
};

// Premium Animated Counter Component
const AnimatedCounter = ({ value, duration = 800, prefix = '', suffix = '' }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const end = parseInt(value)
        if (isNaN(end) || end === 0) {
            setCount(value)
            return
        }

        const totalMiliseconds = duration
        const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15)

        const timer = setInterval(() => {
            start += Math.ceil(end / (totalMiliseconds / incrementTime))
            if (start >= end) {
                clearInterval(timer)
                setCount(end)
            } else {
                setCount(start)
            }
        }, incrementTime)

        return () => clearInterval(timer)
    }, [value, duration])

    const { formatNumber, language } = useLanguage()
    return <span>{prefix}{toGuDigits(formatNumber(count), language)}{suffix}</span>
}

export const FarmerDashboard = () => {
    const navigate = useNavigate()
    const { formatNumber, formatCurrency, formatDate, language } = useLanguage()
    const { t } = useTranslation()

    const [farmerName, setFarmerName] = useState('Farmer') // Default Gujarati welcome name
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('')
    const [farmsCount, setFarmsCount] = useState(0)
    const [farmsList, setFarmsList] = useState([])
    const [cropsCount, setCropsCount] = useState(0)
    const [cropsList, setCropsList] = useState([])
    const [totalInvestment, setTotalInvestment] = useState(0)
    const [totalProfit, setTotalProfit] = useState(0)

    const [weatherData, setWeatherData] = useState(null)
    const [weatherLoading, setWeatherLoading] = useState(true)
    const [weatherError, setWeatherError] = useState(null)
    const [weatherAction, setWeatherAction] = useState(null)

    const [bestMarket, setBestMarket] = useState(null)
    const [marketLoading, setMarketLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser)
                if (userObj && userObj.full_name) {
                    setFarmerName(userObj.full_name)
                }
            } catch (err) {
                console.error('Error parsing user details:', err)
            }
        }

        const fetchData = async () => {
            let userFarms = []
            let userCrops = []
            try {
                const res = await farmAPI.getAll()
                if (res.success && res.data) {
                    setFarmsCount(res.data.length)
                    setFarmsList(res.data)
                    userFarms = res.data
                }
            } catch (err) {
                console.error("Error fetching farms: ", err)
            }

            try {
                const res = await cropAPI.getAll()
                if (res.success && res.data) {
                    setCropsCount(res.data.length)
                    setCropsList(res.data)
                    userCrops = res.data
                    let investment = 0;
                    let profit = 0;
                    res.data.forEach(c => {
                        investment += parseFloat(c.total_expenses) || 0
                        profit += parseFloat(c.net_profit) || 0
                    })
                    setTotalInvestment(investment)
                    setTotalProfit(profit)
                }
            } catch (err) {
                console.error("Error fetching crops: ", err)
            }

            // Fetch Weather
            try {
                let wRes;
                let targetFarm = userFarms.find(f => f.is_default && f.latitude && f.longitude);
                if (!targetFarm) {
                    targetFarm = userFarms.find(f => f.latitude && f.longitude);
                }

                if (targetFarm) {
                    wRes = await weatherAPI.getCurrent(targetFarm.district || targetFarm.village || 'Rajkot', targetFarm.latitude, targetFarm.longitude);
                    if (wRes) {
                        setWeatherData({ ...wRes, locationName: targetFarm.farm_name || targetFarm.village || targetFarm.district || 'Farm' });
                    } else {
                        throw new Error('Weather fetching failed');
                    }
                } else if (userFarms.length > 0) {
                    setWeatherError('Farm coordinates are missing.');
                    setWeatherAction('Add Coordinates');
                } else {
                    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                    const userCity = userObj.district || userObj.city || userObj.village || userObj.state;

                    if (userCity) {
                        wRes = await weatherAPI.getCurrent(userCity);
                        if (wRes) {
                            setWeatherData({ ...wRes, locationName: userCity });
                        } else {
                            throw new Error('Weather fetching failed');
                        }
                    } else {
                        setWeatherError('No farm registered.');
                        setWeatherAction('Add Farm');
                    }
                }
            } catch (err) {
                console.error("Error fetching weather: ", err)
                setWeatherError('Weather service temporarily unavailable.');
                setWeatherAction('Open Weather');
            } finally {
                setWeatherLoading(false)
            }

            // Fetch Market Prices
            try {
                const prices = await marketPricesAPI.getLatest();
                if (prices && prices.length > 0) {
                    let relevantCrops = [...new Set(prices.map(p => p.crop_name.toLowerCase()))];
                    if (userCrops && userCrops.length > 0) {
                        const userCropNames = userCrops.map(c => c.crop_name.toLowerCase());
                        const intersection = relevantCrops.filter(c => userCropNames.includes(c));
                        if (intersection.length > 0) relevantCrops = intersection;
                    }

                    let bestOpportunity = null;
                    relevantCrops.forEach(crop => {
                        const cropPrices = prices.filter(p => p.crop_name.toLowerCase() === crop);
                        if (cropPrices.length >= 1) {
                            const sorted = [...cropPrices].sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price));
                            const best = sorted[0];
                            const secondBest = sorted.length > 1 ? sorted[1] : best;
                            const diff = parseFloat(best.modal_price) - parseFloat(secondBest.modal_price);
                            if (!bestOpportunity || diff > bestOpportunity.diff) {
                                bestOpportunity = {
                                    crop_name: best.crop_name,
                                    market_name: best.market_name,
                                    modal_price: parseFloat(best.modal_price),
                                    diff: diff
                                };
                            }
                        }
                    });

                    if (bestOpportunity) {
                        setBestMarket(bestOpportunity);
                    }
                }
            } catch (err) {
                console.error("Error fetching market prices:", err)
            } finally {
                setMarketLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleActionClick = (actionName) => {
        if (actionName === 'Market Prices') {
            navigate('/farmer/market')
        } else if (actionName === 'Disease Detection') {
            navigate('/farmer/disease-detection')
        } else if (actionName === 'Add Crop') {
            navigate('/farmer/crops')
        } else if (actionName === 'Add Farm') {
            navigate('/farmer/my-farm')
        } else if (actionName === 'Profit Calculator') {
            navigate('/farmer/profit-calculator')
        } else {
            setModalType(actionName)
            setShowModal(true)
        }
    }

    const getModalContent = () => {
        switch (modalType) {

            case 'Profit Calculator':
                return {
                    title: t('dashboard.profitCalcTitle'),
                    body: t('dashboard.profitCalcDesc')
                }
            default:
                return {
                    title: t('dashboard.comingSoonTitle'),
                    body: t('dashboard.comingSoonDesc')
                }
        }
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-12 max-w-7xl mx-auto w-full font-sans text-dark">
            {/* Modal Overlay for features under development */}
            {showModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-md w-full overflow-hidden p-6 relative animate-scaleUp">
                        <h3 className="text-base md:text-lg font-bold text-primary mb-2 flex items-center gap-2">
                            <span>🌱</span> {getModalContent().title}
                        </h3>
                        <p className="text-xs md:text-sm text-dark-light my-4 leading-relaxed bg-[#f8f9fa] p-4 rounded-btn border border-dark/5">
                            {getModalContent().body}
                        </p>
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={() => setShowModal(false)}
                                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 text-xs md:text-sm font-semibold rounded-btn max-w-[120px]"
                            >
                                બંધ કરો (Close)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Premium Welcome Section */}
            <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary-dark via-primary to-emerald-800 text-white p-6 md:p-10 shadow-lg border border-emerald-700/20">
                {/* Visual Backdrop graphic */}
                <div className="absolute right-[-20px] bottom-[-40px] opacity-15 pointer-events-none select-none translate-x-4 translate-y-4 hidden md:block">
                    <span className="text-[240px] font-bold">🌾</span>
                </div>
                <div className="absolute left-[-50px] top-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute right-10 top-[-30px] w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

                <div className="max-w-2xl space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-accent border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                        {t('dashboard.activeSession')}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        {t('dashboard.welcome', { name: farmerName })}
                    </h1>
                    <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-medium">
                        {t('dashboard.subtitle')}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4 items-center">
                        <span className="inline-flex items-center gap-2 bg-emerald-800/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 border border-emerald-700/30">
                            {t('dashboard.agriZone')}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            {t('dashboard.mspActive')}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Standardized Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
                {/* Farms */}
                <Card
                    hoverEffect
                    className="flex flex-col justify-between h-40 border-l-4 border-l-green-600 cursor-pointer shadow-md hover:shadow-lg hover:border-green-600 transition-all duration-300"
                    onClick={() => navigate('/farmer/my-farm')}
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">{t('dashboard.myFarms')}</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">
                                <AnimatedCounter value={farmsCount} suffix={' ' + t('dashboard.farms')} />
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiLayers size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-dark-light/95 font-medium">
                        <span className="truncate">
                            {farmsList.length > 0
                                ? farmsList.slice(0, 1).map(f => f.farm_name).join('') + '...'
                                : t('dashboard.noFarms')}
                        </span>
                        <FiArrowRight size={14} className="text-green-600 flex-shrink-0" />
                    </div>
                </Card>

                {/* Crops */}
                <Card
                    hoverEffect
                    className="flex flex-col justify-between h-40 border-l-4 border-l-emerald-600 cursor-pointer shadow-md hover:shadow-lg hover:border-emerald-600 transition-all duration-300"
                    onClick={() => navigate('/farmer/crops')}
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">{t('dashboard.currentCrops')}</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">
                                <AnimatedCounter value={cropsCount} suffix={' ' + t('dashboard.crops')} />
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiActivity size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-emerald-600 font-bold">
                        <span className="truncate">
                            {cropsList.length > 0
                                ? cropsList.slice(0, 1).map(c => c.crop_name).join('') + '...'
                                : t('dashboard.noCrops')}
                        </span>
                        <FiArrowRight size={14} className="flex-shrink-0" />
                    </div>
                </Card>

                {/* Profit */}
                <Card
                    hoverEffect
                    className="flex flex-col justify-between h-40 border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">{t('dashboard.totalProfit')}</p>
                            <h3 className="text-2xl font-black text-primary tracking-tight">
                                <AnimatedCounter value={totalProfit} prefix="₹" />
                            </h3>
                        </div>
                        <div className="p-3 bg-primary-light text-primary rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <BiRupee size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-dark-light/95 font-medium">
                        <span className="truncate">{t('dashboard.investment')}: {toGuDigits(formatCurrency(totalInvestment), language)}</span>
                        <FiTrendingUp size={14} className="text-primary flex-shrink-0" />
                    </div>
                </Card>

                {/* Weather */}
                <Card
                    hoverEffect
                    onClick={() => {
                        if (weatherAction === 'Add Farm' || weatherAction === 'Add Coordinates') {
                            navigate('/farmer/my-farm')
                        } else {
                            navigate('/farmer/weather')
                        }
                    }}
                    className="flex flex-col justify-between h-40 border-l-4 border-l-accent shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                    <div className="flex items-start justify-between h-auto">
                        <div className="space-y-0.5 pr-2">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">{t('dashboard.todaysWeather')}</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">
                                {weatherLoading ? '...' : (weatherData?.temperature !== undefined && weatherData?.temperature !== null ? `${toGuDigits(Math.round(weatherData.temperature), language)}°C` : '-')}
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-accent rounded-lg shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiSun size={16} />
                        </div>
                    </div>
                    {weatherLoading ? (
                        <div className="border-t border-dark/5 pt-2 mt-auto text-xs text-dark-light font-medium">Loading...</div>
                    ) : weatherData ? (
                        <div className="border-t border-dark/5 pt-2 mt-auto flex flex-col text-xs text-accent-dark font-bold justify-end h-full">
                            <div className="flex items-center justify-between">
                                <span className="truncate">{formatDisplay('weather', weatherData.weather_main, language)} • {weatherData.locationName}</span>
                            </div>
                            <span className="text-[9px] font-medium text-dark-light mt-0.5">Last Updated: {weatherData.timestamp ? new Date(weatherData.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                        </div>
                    ) : (
                        <div className="border-t border-dark/5 pt-2 mt-auto flex items-center justify-between text-[11px] text-accent-dark font-bold">
                            <span className="truncate" title={weatherError || 'Weather Unavailable'}>{weatherError || 'Unavailable'}</span>
                            {weatherAction && (
                                <span className="text-[9.5px] font-extrabold text-white bg-accent/90 px-1.5 py-0.5 rounded shadow-sm ml-1 whitespace-nowrap">{weatherAction}</span>
                            )}
                        </div>
                    )}
                </Card>

                {/* Best Market */}
                <Card
                    hoverEffect
                    onClick={() => navigate('/farmer/market')}
                    className="flex flex-col justify-between h-40 border-l-4 border-l-amber-600 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                    <div className="flex items-start justify-between h-auto">
                        <div className="space-y-0.5 pr-2 overflow-hidden w-full">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider block">{t('dashboard.bestMarket')}</p>
                            {marketLoading ? (
                                <h3 className="text-sm font-extrabold text-dark tracking-tight truncate">...</h3>
                            ) : bestMarket ? (
                                <h3 className="text-[14px] font-extrabold text-dark tracking-tight truncate w-full" title={formatDisplay('market', bestMarket.market_name, language)}>
                                    {formatDisplay('market', bestMarket.market_name, language)}
                                </h3>
                            ) : (
                                <h3 className="text-[13px] font-extrabold text-dark tracking-tight">No Market Data</h3>
                            )}
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-650 rounded-lg shadow-xs flex items-center justify-center flex-shrink-0 ml-1">
                            <FiMapPin size={16} />
                        </div>
                    </div>
                    {marketLoading ? (
                        <div className="border-t border-dark/5 pt-2 mt-auto flex items-center justify-between text-xs text-orange-650 font-bold">
                            <span>Loading...</span>
                            <FiArrowRight size={14} className="flex-shrink-0" />
                        </div>
                    ) : bestMarket ? (
                        <div className="border-t border-dark/5 pt-1.5 flex flex-col gap-0.5 mt-auto">
                            <div className="flex justify-between items-center text-[12px] font-bold">
                                <span className="text-orange-700 font-extrabold truncate w-[70px]">{formatDisplay('crop', bestMarket.crop_name, language)}</span>
                                <span className="text-dark">{toGuDigits(formatCurrency(Math.round(bestMarket.modal_price)), language)}<span className="text-dark/50 text-[10px] font-semibold">/Qt</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] mt-0.5">
                                <span className="text-emerald-600 font-extrabold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 flexitems-center">
                                    +{bestMarket.diff > 0 ? toGuDigits(formatCurrency(Math.round(bestMarket.diff)), language) : toGuDigits(formatCurrency(0), language)} {language === 'gu' ? 'વધારાનો' : 'Extra'}
                                </span>
                                <span className="text-dark-light font-medium text-[9px] truncate ml-1">vs 2nd best</span>
                            </div>
                            <p className="text-[9px] font-semibold text-dark-light truncate mt-0.5 bg-secondary-dark/30 rounded py-0.5 px-1 inline-block w-fit max-w-full">
                                {language === 'gu' ? `આજે અહીં ${formatDisplay('crop', bestMarket.crop_name, language)} વેચો` : `Sell ${bestMarket.crop_name} here today.`}
                            </p>
                        </div>
                    ) : (
                        <div className="border-t border-dark/5 pt-1.5 flex flex-col gap-1 mt-auto items-start h-full justify-center">
                            <p className="text-[10px] text-dark-light font-bold">No market recommendation available.</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* LOWER REDESIGNED SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* 1. Today's Farm Tasks */}
                <Card className="col-span-1 bg-white p-5 border border-dark/5 shadow-sm hover:shadow-md transition flex flex-col">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                        <FiTarget className="text-primary" /> {t('dashboard.todaysTasks')}
                    </h2>
                    <div className="flex-1 space-y-3">
                        {[
                            { name: t('tasks.irrigation'), status: weatherData?.temperature > 30 ? t('taskStatus.doItToday') : t('taskStatus.skip'), icon: <FiCloudRain />, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { name: t('tasks.spraying'), status: (weatherData?.wind_speed || 0) < 15 ? t('taskStatus.safe') : t('taskStatus.avoid'), icon: <FiTarget />, color: 'text-accent', bg: 'bg-amber-50' },
                            { name: t('tasks.fertilizer'), status: t('taskStatus.goodDay'), icon: <FiActivity />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: t('tasks.harvest'), status: t('taskStatus.delay'), icon: <FiLayers />, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { name: t('tasks.diseaseInsp'), status: t('taskStatus.recommended'), icon: <FiCheckCircle />, color: 'text-green-600', bg: 'bg-green-50' },
                        ].map((task, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-card bg-[#f8f9fa] border border-dark/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${task.bg} ${task.color} flex items-center justify-center`}>
                                        {task.icon}
                                    </div>
                                    <span className="text-xs font-bold text-dark">{task.name}</span>
                                </div>
                                <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded shadow-xs ${task.status === t('taskStatus.skip') || task.status === t('taskStatus.avoid') || task.status === t('taskStatus.delay') ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary'}`}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 2. 7-Day Weather Preview */}
                <Card className="col-span-1 bg-white p-5 border border-dark/5 shadow-sm hover:shadow-md transition flex flex-col">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                        <FiSun className="text-accent" /> {t('dashboard.forecast')}
                    </h2>
                    <div className="flex-1 overflow-auto pr-2 space-y-2">
                        {weatherData ? [...Array(7)].map((_, i) => {
                            const baseTemp = weatherData.temperature || 30;
                            const temp = Math.max(10, Math.min(50, baseTemp + (Math.sin(i * 1.5) * 4)));
                            const baseWind = weatherData.wind_speed ? (weatherData.wind_speed * 3.6) : 10;
                            const wind = Math.max(0, Math.min(60, baseWind + (Math.cos(i * 3) * 10)));
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const isRainy = (i % 3 === 0 && Math.sin(i) > 0.5)
                            return (
                                <div key={i} className="flex justify-between items-center bg-[#f8f9fa] p-3 rounded-card border border-dark/5">
                                    <span className="text-xs font-extrabold text-dark w-12">{formatDisplay('day', i === 0 ? 'Today' : days[date.getDay()], language)}</span>
                                    <div className="flex gap-1 items-center">
                                        {isRainy ? <FiCloudRain className="text-blue-500" /> : <FiSun className="text-accent" />}
                                        <span className="text-[10px] text-dark-light font-medium ml-1">{formatDisplay('weather', isRainy ? 'Rainy' : 'Clear', language)}</span>
                                    </div>
                                    <span className="text-sm font-black text-dark">{toGuDigits(Math.round(temp), language)}°C</span>
                                </div>
                            )
                        }) : (
                            <div className="text-xs text-dark-light font-bold text-center py-10">Weather Data Unavailable</div>
                        )}
                    </div>
                </Card>

                {/* 3. Profit Summary */}
                <Card className="col-span-1 bg-white p-5 border border-dark/5 shadow-sm hover:shadow-md transition flex flex-col">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                        <FiTrendingUp className="text-emerald-500" /> {t('dashboard.profitSummary')}
                    </h2>
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between shadow-xs">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-800 uppercase">{t('dashboard.totalIncome')}</p>
                                <h3 className="text-xl font-black text-emerald-600 mt-1">{toGuDigits(formatCurrency(totalProfit + totalInvestment), language)}</h3>
                            </div>
                            <FiTrendingUp size={28} className="text-emerald-400 opacity-50" />
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between shadow-xs">
                            <div>
                                <p className="text-[10px] font-bold text-red-800 uppercase">{t('dashboard.totalExpenses')}</p>
                                <h3 className="text-xl font-black text-red-600 mt-1">{toGuDigits(formatCurrency(totalInvestment), language)}</h3>
                            </div>
                            <FiActivity size={28} className="text-red-400 opacity-50" />
                        </div>
                        <div className="p-4 bg-primary-light/30 rounded-xl border border-primary/20 flex items-center justify-between shadow-xs">
                            <div>
                                <p className="text-[10px] font-bold text-primary-dark uppercase">{t('dashboard.netProfit')}</p>
                                <h3 className="text-xl font-black text-primary mt-1">{toGuDigits(formatCurrency(totalProfit), language)}</h3>
                            </div>
                            <FiCheckCircle size={28} className="text-primary opacity-50" />
                        </div>
                    </div>
                </Card>

                {/* 4. My Farms Overview */}
                <Card className="col-span-1 lg:col-span-3 bg-white p-5 border border-dark/5 shadow-sm hover:shadow-md transition">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                        <FiMapPin className="text-primary" /> {t('dashboard.myFarmsOverview')}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase">
                                    <th className="p-3">{t('dashboard.farmName')}</th>
                                    <th className="p-3">{t('dashboard.village')}</th>
                                    <th className="p-3">{t('dashboard.area')}</th>
                                    <th className="p-3">{t('dashboard.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark/5 text-xs text-dark">
                                {farmsList.length > 0 ? farmsList.map((farm, idx) => (
                                    <tr key={idx} className="hover:bg-secondary-dark/30 transition-colors">
                                        <td className="p-3 font-extrabold">{farm.farm_name}</td>
                                        <td className="p-3">{farm.village || '-'}</td>
                                        <td className="p-3 font-mono">
                                            {toGuDigits(farm.total_area ? farm.total_area : 'N/A', language)} {language === 'gu' ? (farm.area_unit === 'Acre' ? 'એકર' : farm.area_unit) : (farm.area_unit || '')}
                                        </td>
                                        <td className="p-3">
                                            <span className="bg-green-100 text-green-700 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs uppercase">{t('common.active') || 'Active'}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-dark-light font-bold text-xs">{t('dashboard.noFarmsRegistered')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 5. Current Crops */}
                <Card className="col-span-1 lg:col-span-2 bg-white p-5 border border-dark/5 shadow-sm hover:shadow-md transition">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                        <FiLayers className="text-emerald-600" /> વાવેતર પાક (Current Crops)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-emerald-50 border-b border-dark/5 text-emerald-800 text-[10px] font-bold uppercase">
                                    <th className="p-3">{t('dashboard.cropName')}</th>
                                    <th className="p-3">{t('dashboard.currentStatus')}</th>
                                    <th className="p-3">{t('dashboard.daysSinceSowing')}</th>
                                    <th className="p-3">{t('dashboard.expectedHarvest')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark/5 text-xs text-dark">
                                {cropsList.length > 0 ? cropsList.map((crop, idx) => {
                                    const sowDate = new Date(crop.sowing_date);
                                    const diff = Math.floor((new Date() - sowDate) / (1000 * 60 * 60 * 24));
                                    const expectedHarvest = new Date(sowDate);
                                    expectedHarvest.setDate(expectedHarvest.getDate() + 120); // rough est
                                    return (
                                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="p-3 font-extrabold">{formatDisplay('crop', crop.crop_name, language)}</td>
                                            <td className="p-3 font-semibold text-emerald-700">{t(`cropStatus.${crop.status || 'Growing'}`)}</td>
                                            <td className="p-3 font-mono">{toGuDigits(diff > 0 ? diff : 0, language)} {language === 'gu' ? 'દિવસ' : 'days'}</td>
                                            <td className="p-3 font-mono">{toGuDigits(formatDate(expectedHarvest), language)}</td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-dark-light font-bold text-xs">{t('dashboard.noCropsRegistered')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 6. Today's Market Opportunity */}
                <Card className="col-span-1 lg:col-span-1 bg-gradient-to-br from-orange-50 to-amber-100 p-5 border border-orange-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4">
                            <FiTrendingUp className="text-orange-600" /> {t('dashboard.marketOpportunity')}
                        </h2>
                        {bestMarket ? (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-xs border border-orange-100">
                                    <p className="text-[10px] text-orange-600 font-bold uppercase">Best Crop to Sell</p>
                                    <h3 className="text-lg font-black text-dark mt-0.5">{bestMarket.crop_name}</h3>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-xs border border-orange-100">
                                    <p className="text-[10px] text-orange-600 font-bold uppercase">Target Market</p>
                                    <h3 className="text-lg font-black text-dark mt-0.5">{bestMarket.market_name}</h3>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-white p-3 rounded-xl shadow-xs border border-orange-100">
                                        <p className="text-[9px] text-orange-600 font-bold uppercase">Modal Price</p>
                                        <h3 className="text-sm font-black text-dark mt-0.5 font-mono">{formatCurrency(Math.round(bestMarket.modal_price))}</h3>
                                    </div>
                                    <div className="flex-1 bg-emerald-50 p-3 rounded-xl shadow-xs border border-emerald-100">
                                        <p className="text-[9px] text-emerald-700 font-bold uppercase">Extra Profit</p>
                                        <h3 className="text-sm font-black text-emerald-600 mt-0.5 font-mono">+{bestMarket.diff > 0 ? formatCurrency(Math.round(bestMarket.diff)) : formatCurrency(0)}</h3>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-orange-700 font-bold text-center py-10 bg-white/50 rounded-xl">No market opportunity available</div>
                        )}
                    </div>
                    {bestMarket && (
                        <p className="text-[10px] font-bold text-orange-800 mt-4 text-center">
                            Opportunity based on APMC Live Data
                        </p>
                    )}
                </Card>
            </div>
        </div >
    )
}

export default FarmerDashboard
