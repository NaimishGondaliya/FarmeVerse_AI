import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiStar, FiAward, FiActivity, FiMapPin,
    FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiUser, FiGlobe,
    FiChevronRight, FiList, FiAlertCircle, FiMessageSquare, FiMenu
} from 'react-icons/fi'
import { expertAPI, consultationAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'

// Premium Animated Counter Component
const AnimatedCounter = ({ value, duration = 800, prefix = '', suffix = '', decimals = 0 }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const end = parseFloat(value)
        if (isNaN(end) || end === 0) {
            setCount(value)
            return
        }
        
        const totalMiliseconds = duration
        const steps = 50
        const incrementTime = totalMiliseconds / steps
        const stepValue = end / steps
        let currentStep = 0
        
        const timer = setInterval(() => {
            currentStep++
            if (currentStep >= steps) {
                clearInterval(timer)
                setCount(end)
            } else {
                setCount(stepValue * currentStep)
            }
        }, incrementTime)

        return () => clearInterval(timer)
    }, [value, duration])

    return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>
}

const T = {
    ENG: {
        title: "Expert Dashboard Hub",
        subtitle: "Review farmer queries, monitor schedules, and update your profile settings.",
        totalConsults: "Total Consultations",
        pendingConsults: "Pending Consultations",
        completedConsults: "Completed Consultations",
        avgRating: "Average Rating",
        experience: "Experience",
        availStatus: "Availability Status",
        recentInquiries: "Recent Consultation Requests",
        todaysSchedule: "Today's Schedule",
        profileSummary: "Profile Summary",
        farmer: "Farmer Name",
        subject: "Subject / Issue",
        time: "Time Received",
        status: "Status",
        action: "Action",
        quickView: "Quick View",
        active: "Available / Online",
        inactive: "Offline / Busy",
        years: "Years",
        outOf: "out of 5",
        loading: "Loading expert dashboard...",
        error: "Failed to load dashboard data.",
        noConsultations: "No consultation requests yet.",
        noConsultationsDesc: "When farmers submit inquiries, they will appear here.",
        noSchedule: "No slots scheduled for today.",
        languages: "Languages",
        qualification: "Qualification",
        specialization: "Specialization",
        district: "District"
    },
    GUJ: {
        title: "નિષ્ણાત ડેશબોર્ડ હબ",
        subtitle: "ખેડૂતના પ્રશ્નોની સમીક્ષા કરી સલાહ આપો અને વિગતો તપાસો.",
        totalConsults: "કુલ પરામર્શ",
        pendingConsults: "બાકી પરામર્શ",
        completedConsults: "પૂર્ણ પરામર્શ",
        avgRating: "સરેરાશ રેટિંગ",
        experience: "અનુભવ",
        availStatus: "ઉપલબ્ધતા સ્થિતિ",
        recentInquiries: "તાજેતરના પરામર્શ વિનંતીઓ",
        todaysSchedule: "આજનું શેડ્યૂલ",
        profileSummary: "પ્રોફાઇલ વિગતો",
        farmer: "ખેડૂતનું નામ",
        subject: "સમસ્યા / વિષય",
        time: "મોકલ્યા તારીખ",
        status: "સ્થિતિ",
        action: "કાર્ય",
        quickView: "વાતચીત જુઓ",
        active: "કન્સલ્ટિંગ ચાલુ / હાજર",
        inactive: "હાજર નથી / વ્યસ્ત",
        years: "વર્ષનો",
        outOf: "૫ માંથી",
        loading: "ડેશબોર્ડ લોડ થઈ રહ્યું છે...",
        error: "ડેશબોર્ડ ડેટા મેળવવામાં નિષ્ફળતા.",
        noConsultations: "હજી સુધી કોઈ પરામર્શ વિનંતીઓ મળી નથી.",
        noConsultationsDesc: "જ્યારે ખેડૂતો પ્રશ્નો સબમિટ કરશે ત્યારે તે અહીં દેખાશે.",
        noSchedule: "આજે કોઈ મુલાકાત શેડ્યૂલ થયેલ નથી.",
        languages: "ભાષાઓ",
        qualification: "લાયકાત",
        specialization: "વિશેષતા",
        district: "જિલ્લો"
    }
}

export const ExpertDashboard = () => {
    const { language, changeLanguage } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [consultations, setConsultations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    const t = T[lang]

    const fetchData = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            // Fetch expert details
            const dashRes = await expertAPI.getDashboard()
            setProfile(dashRes.profile)

            // Sync primary language if set
            if (dashRes.profile.language === 'GUJ' || dashRes.profile.language === 'ENG') {
                const targetLang = dashRes.profile.language === 'ENG' ? 'en' : 'gu'
                if (language !== targetLang) {
                    changeLanguage(targetLang)
                }
            }

            // Fetch expert consultations info
            const consultData = await consultationAPI.getExpertList()
            setConsultations(consultData)

            // Calculate state metrics from list
            const total = consultData.length
            const pending = consultData.filter(c => c.status === 'Pending').length
            const completed = consultData.filter(c => c.status === 'Closed' || c.status === 'Replied').length

            setStats({
                rating: dashRes.stats.rating || 0,
                total_consultations: total,
                pending_consultations: pending,
                completed_consultations: completed,
                experience_years: dashRes.profile.experience || 0,
                active_status: dashRes.profile.active_status
            })
        } catch (err) {
            console.error("Dashboard loaded error", err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const toggleOnlineStatus = async () => {
        if (!profile) return
        try {
            const nextStatus = !profile.active_status
            const updated = await expertAPI.update(profile.id, { active_status: nextStatus })
            setProfile(prev => ({
                ...prev,
                active_status: updated.active_status
            }))
            setStats(prev => ({
                ...prev,
                active_status: updated.active_status
            }))
        } catch (err) {
            console.error("Failed to toggle online status", err)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{t.loading}</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-12 bg-white rounded-card shadow-md border border-red-100 text-center max-w-xl mx-auto mt-12 animate-fadeIn">
                <FiXCircle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-dark">{t.error}</h3>
                <Button onClick={fetchData} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold max-w-[120px] mx-auto">Retry</Button>
            </div>
        )
    }

    // Filter consultations created today for Today's Schedule
    const today = new Date().toDateString()
    const todaysSchedule = consultations.filter(c => new Date(c.created_date).toDateString() === today)

    return (
        <div className="space-y-8 animate-fadeIn pb-12 max-w-7xl mx-auto w-full font-sans text-dark">
            {/* Header / Welcome Hero Banner */}
            <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-700 text-white p-6 md:p-10 shadow-lg border border-emerald-800/20">
                <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none select-none translate-x-4 translate-y-4 hidden md:block">
                    <span className="text-[220px]">🚜</span>
                </div>
                <div className="absolute left-[-50px] top-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                <div className="max-w-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 w-full">
                    <div className="space-y-3.5">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-accent border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            નિષ્ણાત સત્ર • Expert Live Portal
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            આવકાર, {profile?.name || 'કૃષિ નિષ્ણાત'}!
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Online Switch Button in Welcome Card */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 w-full md:w-auto min-w-[200px] flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span>પોસ્ટ સ્ટેટસ (Status)</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${stats.active_status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {stats.active_status ? 'Available' : 'Offline'}
                            </span>
                        </div>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-btn text-xs font-extrabold shadow-sm transition-all duration-200 select-none ${stats.active_status 
                                ? 'bg-accent text-dark hover:bg-yellow-500' 
                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {stats.active_status ? <FiXCircle size={15} /> : <FiCheckCircle size={15} />}
                            <span>{stats.active_status ? 'સ્થિતિ વ્યસ્ત કરો' : 'સેવા ચાલુ કરો'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Redesigned 6 Metrics Summary Cards with Equal Heights */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 items-stretch">
                {/* Total Consultations */}
                <Card className="border-l-4 border-l-emerald-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-emerald-650 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.totalConsults}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            <AnimatedCounter value={stats.total_consultations} />
                        </h3>
                    </div>
                    <div className="self-end text-emerald-600 bg-emerald-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiList size={18} />
                    </div>
                </Card>

                {/* Pending Consultations */}
                <Card className="border-l-4 border-l-amber-500 p-5 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-amber-550 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.pendingConsults}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            <AnimatedCounter value={stats.pending_consultations} />
                        </h3>
                    </div>
                    <div className="self-end text-amber-550 bg-amber-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiClock size={18} />
                    </div>
                </Card>

                {/* Completed Consultations */}
                <Card className="border-l-4 border-l-blue-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-blue-650 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.completedConsults}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            <AnimatedCounter value={stats.completed_consultations} />
                        </h3>
                    </div>
                    <div className="self-end text-blue-600 bg-blue-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiCheckCircle size={18} />
                    </div>
                </Card>

                {/* Average Rating */}
                <Card className="border-l-4 border-l-yellow-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-yellow-650 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.avgRating}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight flex items-baseline gap-1">
                            <AnimatedCounter value={stats.rating} decimals={1} />
                            <span className="text-[10px] font-bold text-dark-light/75">/{t.outOf.split(' ')[0]}</span>
                        </h3>
                    </div>
                    <div className="self-end text-yellow-600 bg-yellow-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiStar size={18} className="fill-yellow-500 text-yellow-500" />
                    </div>
                </Card>

                {/* Experience */}
                <Card className="border-l-4 border-l-purple-500 p-5 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-purple-650 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.experience}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            <AnimatedCounter value={stats.experience_years} />
                            <span className="text-xs font-bold text-dark-light/80 ml-1">{t.years}</span>
                        </h3>
                    </div>
                    <div className="self-end text-purple-600 bg-purple-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiAward size={18} />
                    </div>
                </Card>

                {/* Toggle online status metrics widget */}
                <Card
                    onClick={toggleOnlineStatus}
                    className={`border-l-4 p-5 flex flex-col justify-between cursor-pointer transition shadow-md hover:shadow-lg duration-300 ${stats.active_status ? 'border-l-green-500 bg-green-50/15' : 'border-l-rose-500 bg-rose-50/15'}`}
                >
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{t.availStatus}</p>
                        <span className={`inline-block mt-4 px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider shadow-xs ${stats.active_status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                            {stats.active_status ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-dark/5 text-[9px] font-bold text-dark-light">
                        <span>ચાલુ/બંધ કરો</span>
                        {stats.active_status ? <FiCheckCircle size={14} className="text-green-500" /> : <FiXCircle size={14} className="text-rose-500" />}
                    </div>
                </Card>
            </div>

            {/* Inner Dashboard Layout Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* COLUMN 1: Profile Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 space-y-6 flex flex-col justify-between shadow-sm">
                        <div>
                            <span className="text-xs font-bold text-dark-light uppercase tracking-widest block pb-2 border-b border-dark/5 mb-4">{t.profileSummary}</span>

                            <div className="flex flex-col items-center text-center pb-6 border-b border-dark/5">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 border border-emerald-100 overflow-hidden shadow-inner relative">
                                    {profile?.photo ? (
                                        <img
                                            src={profile.photo}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = ''
                                            }}
                                        />
                                    ) : (
                                        <span>{profile?.name ? profile.name.slice(0, 1).toUpperCase() : 'E'}</span>
                                    )}
                                </div>
                                <h2 className="text-lg font-black text-dark leading-tight">{profile?.name}</h2>
                                <span className="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full border border-emerald-150 mt-2.5 select-none">
                                    {profile?.specialization || 'Agriculture Expert'}
                                </span>
                            </div>

                            <div className="py-6 space-y-4 text-xs font-medium">
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiAward size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{t.qualification}</p>
                                        <p className="font-semibold mt-1">{profile?.qualification || 'Degree in Agriculture'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiUser size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{t.specialization}</p>
                                        <p className="font-semibold mt-1">{profile?.specialization || 'Crops & Soils Science'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiActivity size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{t.experience}</p>
                                        <p className="font-semibold mt-1">{profile?.experience} {t.years}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiMapPin size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{t.district}</p>
                                        <p className="font-semibold mt-1">{profile?.district}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiGlobe size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{t.languages}</p>
                                        <p className="font-semibold mt-1">{profile?.languages || 'Gujarati, English'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/expert/profile" className="block w-full">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2">
                                <FiUser size={15} /> <span>પ્રોફાઇલ સંચાલન (Manage Profile)</span>
                            </Button>
                        </Link>
                    </Card>
                </div>

                {/* COLUMN 2 & 3: TODAY'S SCHEDULE & RECENT REQUESTS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* TODAY'S SCHEDULE PANEL */}
                    <Card className="p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-dark/5">
                            <span className="text-xs font-bold text-dark-light uppercase tracking-widest flex items-center gap-2.5 select-none">
                                <FiCalendar className="text-emerald-600" />
                                {t.todaysSchedule}
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black">{todaysSchedule.length}</span>
                        </div>

                        {todaysSchedule.length === 0 ? (
                            <div className="py-10 bg-[#fbfcfd] rounded-xl border border-dashed border-dark/15 flex flex-col items-center justify-center text-center p-6 text-dark-light animate-fadeIn">
                                <FiCalendar size={28} className="mb-2.5 text-dark-light/60" />
                                <p className="text-xs font-bold text-dark/75">{t.noSchedule}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-1">
                                {todaysSchedule.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f9fa] p-4 rounded-xl border border-dark/5 hover:border-emerald-500/10 hover:shadow-xs transition duration-200">
                                        <div className="space-y-1">
                                            <p className="text-xs font-extrabold text-dark">{item.farmer_name}</p>
                                            <p className="text-[11px] font-semibold text-dark-light truncate max-w-sm">{item.subject}</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-start gap-4">
                                            <span className="text-[10px] font-bold text-dark-light flex items-center gap-1">
                                                <FiClock size={12} className="text-emerald-600" />
                                                {new Date(item.created_date).toLocaleTimeString(lang === 'GUJ' ? 'gu-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <Link
                                                to={`/expert/consultation/${item.id}`}
                                                className="text-[10px] font-extrabold text-emerald-650 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                {t.quickView} <FiChevronRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* RECENT CONSULTATION REQUESTS */}
                    <Card className="p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center pb-3 border-b border-dark/5">
                            <span className="text-xs font-bold text-dark-light uppercase tracking-widest flex items-center gap-2.5 select-none">
                                <FiActivity className="text-emerald-600" />
                                {t.recentInquiries}
                            </span>
                            <Link to="/expert/consultation" className="text-[10px] font-bold text-primary hover:underline">
                                View Inbox →
                            </Link>
                        </div>

                        {consultations.length === 0 ? (
                            <div className="py-12 text-center text-dark-light max-w-md mx-auto animate-fadeIn">
                                <FiAlertCircle size={36} className="mx-auto mb-3 text-dark-light/60" />
                                <h4 className="text-sm font-bold text-dark-dark">{t.noConsultations}</h4>
                                <p className="text-xs text-dark-light mt-1">{t.noConsultationsDesc}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto pt-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] border-b border-dark/5 text-[10px] font-bold text-dark-light select-none">
                                            <th className="p-3 font-extrabold">{t.farmer}</th>
                                            <th className="p-3 font-extrabold">{t.subject}</th>
                                            <th className="p-3 font-extrabold">{t.time}</th>
                                            <th className="p-3 font-extrabold">{t.status}</th>
                                            <th className="p-3 font-extrabold text-right">{t.action}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark/5">
                                        {consultations.slice(0, 4).map((q) => (
                                            <tr key={q.id} className="hover:bg-primary-light/20 transition text-xs font-medium text-dark/90">
                                                <td className="p-3 font-bold select-none">{q.farmer_name}</td>
                                                <td className="p-3">
                                                    <div className="font-bold truncate max-w-[155px] sm:max-w-xs">{q.subject}</div>
                                                    <div className="text-[10px] text-dark-light truncate max-w-[155px] sm:max-w-xs mt-0.5">{q.message}</div>
                                                </td>
                                                <td className="p-3 text-[10px] text-dark-light whitespace-nowrap">
                                                    {new Date(q.created_date).toLocaleDateString(lang === 'GUJ' ? 'gu-IN' : 'en-US')}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${q.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-150' :
                                                        q.status === 'Replied' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                                                            'bg-slate-50 text-slate-700 border border-slate-200'
                                                        }`}>
                                                        {q.status === 'Pending' ? (lang === 'GUJ' ? 'જવાબ બાકી' : 'Pending') :
                                                            q.status === 'Replied' ? (lang === 'GUJ' ? 'જવાબ આપેલ' : 'Replied') :
                                                                (lang === 'GUJ' ? 'બંધ કરેલ' : 'Closed')}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Link
                                                        to={`/expert/consultation/${q.id}`}
                                                        className="inline-flex items-center gap-0.5 text-emerald-650 hover:text-emerald-700 font-extrabold text-[10px] transition"
                                                    >
                                                        <span>{t.quickView}</span>
                                                        <FiChevronRight size={13} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ExpertDashboard
