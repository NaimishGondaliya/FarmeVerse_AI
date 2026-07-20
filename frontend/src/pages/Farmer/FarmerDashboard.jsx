import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useNavigate, Link } from 'react-router-dom'
import {
    FiLayers,
    FiSun,
    FiDollarSign,
    FiMapPin,
    FiPlus,
    FiBookOpen,
    FiTarget,
    FiPercent,
    FiInbox,
    FiActivity,
    FiArrowRight,
    FiTrendingUp
} from 'react-icons/fi'
import { farmAPI, cropAPI } from '../../services/api'

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

    return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>
}

export const FarmerDashboard = () => {
    const navigate = useNavigate()
    const [farmerName, setFarmerName] = useState('ગુજરાત ખેડૂત મિત્ર') // Default Gujarati welcome name
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('')
    const [farmsCount, setFarmsCount] = useState(0)
    const [farmsList, setFarmsList] = useState([])
    const [cropsCount, setCropsCount] = useState(0)
    const [cropsList, setCropsList] = useState([])
    const [totalInvestment, setTotalInvestment] = useState(0)
    const [totalProfit, setTotalProfit] = useState(0)

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

        const fetchFarms = async () => {
            try {
                const res = await farmAPI.getAll()
                if (res.success && res.data) {
                    setFarmsCount(res.data.length)
                    setFarmsList(res.data)
                }
            } catch (err) {
                console.error("Error fetching farms count for dashboard:", err)
            }
        }

        const fetchCrops = async () => {
            try {
                const res = await cropAPI.getAll()
                if (res.success && res.data) {
                    setCropsCount(res.data.length)
                    setCropsList(res.data)
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
                console.error("Error fetching crops count for dashboard:", err)
            }
        }

        fetchFarms()
        fetchCrops()
    }, [])

    const handleActionClick = (actionName) => {
        if (actionName === 'Market Prices') {
            navigate('/farmer/market')
        } else if (actionName === 'Disease Detection') {
            navigate('/farmer/disease-detection')
        } else if (actionName === 'Add Crop') {
            navigate('/farmer/crops')
        } else if (actionName === 'Profit Calculator') {
            navigate('/farmer/profit-calculator')
        } else {
            setModalType(actionName)
            setShowModal(true)
        }
    }

    const getModalContent = () => {
        switch (modalType) {
            case 'Add Farm':
                return {
                    title: 'નવી ખેતી શારૂ કરો (Add New Farm)',
                    body: 'આ સુવિધા આગામી ચરણ (Phase 2) માં ઉપલબ્ધ થશે. અહીં તમે તમારી જમીનના રેકોર્ડ અને ફોટો જોડી શકશો.'
                }
            case 'Profit Calculator':
                return {
                    title: 'નફાની ગણતરી કરો (Profit Calculator)',
                    body: 'Phase 2 રોકાણ વ્યવસ્થાપક સાધન. જેના દ્વારા ખેડૂત તેના રોકાણ અને આવકની સરખામણી કરી નફો ગણી શકશે.'
                }
            default:
                return {
                    title: 'ફીચર ટૂંક સમયમાં શરૂ થશે',
                    body: 'ભવિષ્યના અપડેટમાં આ આખી સુવિધા ઉપલબ્ધ બનશે.'
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
                        ખેડૂત લાઈવ સત્ર • Active Session
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        આવકાર, {farmerName}!
                    </h1>
                    <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-medium">
                        આ રહ્યું તમારું ફાર્મવર્સ એઆઈ (FarmVerse AI) ડેશબોર્ડ. ગુજરાતના ખેડૂતો માટે બનાવવામાં આવેલ અદ્યતન સ્માર્ટ કૃષિ નિર્ણય સહાયક સાધનો.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4 items-center">
                        <span className="inline-flex items-center gap-2 bg-emerald-800/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 border border-emerald-700/30">
                            📍 ગુજરાત કૃષિ ક્ષેત્ર
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            સરકારી ટેકાના ભાવ ચાલુ છે
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
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">મારા ખેતરો</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">
                                <AnimatedCounter value={farmsCount} suffix=" ખેતરો" />
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
                                : 'કોઈ ખેતર નથી'}
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
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">વાવેતર પાક</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">
                                <AnimatedCounter value={cropsCount} suffix=" પાક" />
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
                                : 'કોઈ પાક નથી'}
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
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">કુલ નફો</p>
                            <h3 className="text-2xl font-black text-primary tracking-tight">
                                <AnimatedCounter value={totalProfit} prefix="₹" />
                            </h3>
                        </div>
                        <div className="p-3 bg-primary-light text-primary rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiDollarSign size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-dark-light/95 font-medium">
                        <span className="truncate">રોકાણ: ₹{totalInvestment.toLocaleString('en-IN')}</span>
                        <FiTrendingUp size={14} className="text-primary flex-shrink-0" />
                    </div>
                </Card>

                {/* Weather */}
                <Card 
                    hoverEffect 
                    onClick={() => navigate('/farmer/weather')}
                    className="flex flex-col justify-between h-40 border-l-4 border-l-accent shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">આજનું હવામાન</p>
                            <h3 className="text-2xl font-black text-dark tracking-tight">૩૨°C</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-accent rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiSun size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-accent-dark font-bold">
                        <span>સન્ની અને સૂકી હવા</span>
                        <FiArrowRight size={14} className="flex-shrink-0" />
                    </div>
                </Card>

                {/* Best Market */}
                <Card 
                    hoverEffect 
                    onClick={() => navigate('/farmer/market')}
                    className="flex flex-col justify-between h-40 border-l-4 border-l-amber-600 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">શ્રેષ્ઠ બજાર</p>
                            <h3 className="text-lg font-extrabold text-dark tracking-tight mt-1 truncate">ગોંડલ APMC</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-650 rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
                            <FiMapPin size={20} />
                        </div>
                    </div>
                    <div className="border-t border-dark/5 pt-2.5 mt-2 flex items-center justify-between text-xs text-orange-650 font-bold">
                        <span>કપાસના ઉંચા ભાવો</span>
                        <FiArrowRight size={14} className="flex-shrink-0" />
                    </div>
                </Card>
            </div>

            {/* 3. Redesigned Quick Actions */}
            <div className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-5">
                <h2 className="text-sm md:text-base font-bold text-dark flex items-center gap-2.5">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    ઝડપી મદદ અને કૃષિ સાધનો (Quick Actions)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Add Farm */}
                    <button
                        onClick={() => handleActionClick('Add Farm')}
                        className="group flex flex-col items-center justify-center p-5 bg-[#f8f9fa] rounded-card border border-dark/5 hover:border-primary/20 hover:bg-primary-light/25 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 shadow-xs duration-200">
                            <FiPlus size={22} />
                        </div>
                        <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors text-center">નવું ખેતર ઉમેરો</span>
                        <span className="text-[9px] font-semibold text-dark-light/80 mt-1 uppercase tracking-wider">Add Farm</span>
                    </button>

                    {/* Add Crop */}
                    <button
                        onClick={() => handleActionClick('Add Crop')}
                        className="group flex flex-col items-center justify-center p-5 bg-[#f8f9fa] rounded-card border border-dark/5 hover:border-primary/20 hover:bg-primary-light/25 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 shadow-xs duration-200">
                            <FiPlus size={22} />
                        </div>
                        <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors text-center">નવો પાક ઉમેરો</span>
                        <span className="text-[9px] font-semibold text-dark-light/80 mt-1 uppercase tracking-wider">Add Crop</span>
                    </button>

                    {/* Market Prices */}
                    <button
                        onClick={() => handleActionClick('Market Prices')}
                        className="group flex flex-col items-center justify-center p-5 bg-[#f8f9fa] rounded-card border border-dark/5 hover:border-primary/20 hover:bg-primary-light/25 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3 group-hover:scale-110 shadow-xs duration-200">
                            <FiBookOpen size={22} />
                        </div>
                        <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors text-center">બજાર ભાવો</span>
                        <span className="text-[9px] font-semibold text-dark-light/80 mt-1 uppercase tracking-wider">Market Prices</span>
                    </button>

                    {/* Disease Detection */}
                    <button
                        onClick={() => handleActionClick('Disease Detection')}
                        className="group flex flex-col items-center justify-center p-5 bg-[#f8f9fa] rounded-card border border-dark/5 hover:border-accent/30 hover:bg-accent-light/20 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-accent-light text-accent-dark flex items-center justify-center mb-3 group-hover:scale-110 shadow-xs duration-200">
                            <FiTarget size={22} />
                        </div>
                        <span className="text-xs font-bold text-dark group-hover:text-accent-dark transition-colors text-center">રોગ નિદાન</span>
                        <span className="text-[9px] font-semibold text-dark-light/80 mt-1 uppercase tracking-wider">AI Disease</span>
                    </button>

                    {/* Profit Calculator */}
                    <button
                        onClick={() => handleActionClick('Profit Calculator')}
                        className="group flex flex-col items-center justify-center p-5 bg-[#f8f9fa] rounded-card border border-dark/5 hover:border-primary/20 hover:bg-primary-light/25 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center mb-3 group-hover:scale-110 shadow-xs duration-200">
                            <FiPercent size={22} />
                        </div>
                        <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors text-center">નફા કેલ્ક્યુલેટર</span>
                        <span className="text-[9px] font-semibold text-dark-light/80 mt-1 uppercase tracking-wider">Calculator</span>
                    </button>
                </div>
            </div>

            {/* 4. Recent Activities Section with Empty State */}
            <div className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm md:text-base font-bold text-dark flex items-center gap-2.5">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        હાલની હલચલ (Recent Activities)
                    </h2>
                    <span className="text-xs text-primary font-bold hover:underline cursor-pointer transition">
                        બધા જુઓ (View All)
                    </span>
                </div>

                {/* Styled Professional Empty State Card */}
                <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-dark/15 rounded-card bg-[#fcfdfe] animate-fadeIn">
                    <div className="w-16 h-16 bg-white border border-dark/5 rounded-full flex items-center justify-center text-dark-light/45 shadow-sm mb-4 animate-pulse">
                        <FiInbox size={26} />
                    </div>
                    <h4 className="text-sm md:text-base font-extrabold text-dark-dark mb-1.5">આ ખેતરમાં હજી કોઈ પ્રવૃત્તિ નોંધાઈ નથી</h4>
                    <p className="text-xs text-dark-light max-w-sm leading-relaxed mb-6 font-medium">
                        નવી પ્રવૃત્તિ શરૂ કરવા માટે ઉપર આપેલા બટનોનો ઉપયોગ કરીને ખેતર અથવા નવા પાક ઉમેરો.
                    </p>
                    <div className="flex gap-3 max-w-xs w-full">
                        <button
                            onClick={() => handleActionClick('Add Farm')}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-btn shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            ખેતર ઉમેરો
                        </button>
                        <button
                            onClick={() => handleActionClick('Add Crop')}
                            className="flex-1 bg-white hover:bg-slate-50 text-dark border border-dark/15 text-xs font-bold px-4 py-2.5 rounded-btn shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            પાક વાવો
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FarmerDashboard
