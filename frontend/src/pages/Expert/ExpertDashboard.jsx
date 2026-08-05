import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import {
    FiStar, FiAward, FiActivity, FiMapPin,
    FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiUser, FiGlobe,
    FiChevronRight, FiList, FiAlertCircle, FiMessageSquare, FiMenu
} from 'react-icons/fi'
import { expertAPI, consultationAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
    formatGujaratiNumber,
    formatGujaratiDate,
    formatGujaratiTime,
    toGujaratiDigits
} from '../../utils/gujaratiFormat'

// Premium Animated Counter Component — displays raw count (Gujarati formatting done at render)
const AnimatedCounter = ({ value, duration = 800, decimals = 0 }) => {
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

    return <span>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}</span>
}

export const ExpertDashboard = () => {
    const { language, changeLanguage } = useLanguage()
    const { t } = useTranslation()
    const lang = language === 'en' ? 'en' : 'gu'
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [consultations, setConsultations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    // Shorthand for expert locale section
    const te = (key) => t(`expert.${key}`)

    const fetchData = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const dashRes = await expertAPI.getDashboard()
            setProfile(dashRes.profile)

            if (dashRes.profile.language === 'GUJ' || dashRes.profile.language === 'ENG') {
                const targetLang = dashRes.profile.language === 'ENG' ? 'en' : 'gu'
                if (language !== targetLang) {
                    changeLanguage(targetLang)
                }
            }

            const consultData = await consultationAPI.getExpertList()
            setConsultations(consultData)

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
            console.error('Dashboard loaded error', err)
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
            setProfile(prev => ({ ...prev, active_status: updated.active_status }))
            setStats(prev => ({ ...prev, active_status: updated.active_status }))
        } catch (err) {
            console.error('Failed to toggle online status', err)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{te('loading')}</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-12 bg-white rounded-card shadow-md border border-red-100 text-center max-w-xl mx-auto mt-12 animate-fadeIn">
                <FiXCircle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-dark">{te('errorDash')}</h3>
                <Button onClick={fetchData} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold max-w-[180px] mx-auto">
                    {te('retry')}
                </Button>
            </div>
        )
    }

    const today = new Date().toDateString()
    const todaysSchedule = consultations.filter(c => new Date(c.created_date).toDateString() === today)

    // Helper to format numbers for display
    const fNum = (val, decimals = 0) => formatGujaratiNumber(val, lang, decimals)

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
                            {te('sessionBadge')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            {te('welcomeGreeting')} {profile?.name || (lang === 'gu' ? 'કૃષિ નિષ્ણાત' : 'Expert')}!
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
                            {te('dashSubtitle')}
                        </p>
                    </div>

                    {/* Online Switch Button in Welcome Card */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 w-full md:w-auto min-w-[200px] flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span>{te('postStatus')}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${stats.active_status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {stats.active_status ? te('onlineBadge') : te('offlineBadge')}
                            </span>
                        </div>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-btn text-xs font-extrabold shadow-sm transition-all duration-200 select-none ${stats.active_status
                                ? 'bg-accent text-dark hover:bg-yellow-500'
                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {stats.active_status ? <FiXCircle size={15} /> : <FiCheckCircle size={15} />}
                            <span>{stats.active_status ? te('goOffline') : te('goOnline')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 6 Metrics Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 items-stretch">
                {/* Total Consultations */}
                <Card className="border-l-4 border-l-emerald-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('totalConsults')}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            {lang === 'gu'
                                ? toGujaratiDigits(stats.total_consultations)
                                : <AnimatedCounter value={stats.total_consultations} />
                            }
                        </h3>
                    </div>
                    <div className="self-end text-emerald-600 bg-emerald-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiList size={18} />
                    </div>
                </Card>

                {/* Pending Consultations */}
                <Card className="border-l-4 border-l-amber-500 p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('pendingConsults')}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            {lang === 'gu'
                                ? toGujaratiDigits(stats.pending_consultations)
                                : <AnimatedCounter value={stats.pending_consultations} />
                            }
                        </h3>
                    </div>
                    <div className="self-end text-amber-550 bg-amber-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiClock size={18} />
                    </div>
                </Card>

                {/* Completed Consultations */}
                <Card className="border-l-4 border-l-blue-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('completedConsults')}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            {lang === 'gu'
                                ? toGujaratiDigits(stats.completed_consultations)
                                : <AnimatedCounter value={stats.completed_consultations} />
                            }
                        </h3>
                    </div>
                    <div className="self-end text-blue-600 bg-blue-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiCheckCircle size={18} />
                    </div>
                </Card>

                {/* Average Rating */}
                <Card className="border-l-4 border-l-yellow-600 p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('avgRating')}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight flex items-baseline gap-1">
                            {lang === 'gu'
                                ? toGujaratiDigits(parseFloat(stats.rating).toFixed(1))
                                : <AnimatedCounter value={stats.rating} decimals={1} />
                            }
                            <span className="text-[10px] font-bold text-dark-light/75">/{lang === 'gu' ? '૫' : '5'}</span>
                        </h3>
                    </div>
                    <div className="self-end text-yellow-600 bg-yellow-50 p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center">
                        <FiStar size={18} className="fill-yellow-500 text-yellow-500" />
                    </div>
                </Card>

                {/* Experience */}
                <Card className="border-l-4 border-l-purple-500 p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('experience')}</p>
                        <h3 className="text-3xl font-black text-dark mt-3.5 tracking-tight">
                            {lang === 'gu'
                                ? toGujaratiDigits(stats.experience_years)
                                : <AnimatedCounter value={stats.experience_years} />
                            }
                            <span className="text-xs font-bold text-dark-light/80 ml-1">{te('years')}</span>
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
                        <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider leading-none">{te('availStatus')}</p>
                        <span className={`inline-block mt-4 px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider shadow-xs ${stats.active_status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                            {stats.active_status ? te('liveBadge') : te('offlineLiveBadge')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-dark/5 text-[9px] font-bold text-dark-light">
                        <span>{te('toggleOnOff')}</span>
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
                            <span className="text-xs font-bold text-dark-light uppercase tracking-widest block pb-2 border-b border-dark/5 mb-4">{te('profileSummary')}</span>

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
                                    {profile?.specialization || (lang === 'gu' ? 'કૃષિ નિષ્ણાત' : 'Agriculture Expert')}
                                </span>
                            </div>

                            <div className="py-6 space-y-4 text-xs font-medium">
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiAward size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{te('qualification')}</p>
                                        <p className="font-semibold mt-1">{profile?.qualification || (lang === 'gu' ? 'ડિગ્રી ઇન એગ્રિકલ્ચર' : 'Degree in Agriculture')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiUser size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{te('specialization')}</p>
                                        <p className="font-semibold mt-1">{profile?.specialization || (lang === 'gu' ? 'પાક અને માટી વિજ્ઞાન' : 'Crops & Soils Science')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiActivity size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{te('experience')}</p>
                                        <p className="font-semibold mt-1">
                                            {lang === 'gu' ? toGujaratiDigits(profile?.experience || 0) : profile?.experience} {te('years')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiMapPin size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{te('district')}</p>
                                        <p className="font-semibold mt-1">{profile?.district}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-dark/85">
                                    <div className="p-2 bg-[#f8f9fa] rounded-lg text-emerald-600 flex-shrink-0 flex items-center justify-center"><FiGlobe size={15} /></div>
                                    <div>
                                        <p className="text-[9px] text-dark-light font-bold uppercase select-none leading-none">{te('languages')}</p>
                                        <p className="font-semibold mt-1">{profile?.languages || (lang === 'gu' ? 'ગુજરાતી, અંગ્રેજી' : 'Gujarati, English')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/expert/profile" className="block w-full">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2">
                                <FiUser size={15} /> <span>{te('manageProfile')}</span>
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
                                {te('todaysSchedule')}
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black">
                                {lang === 'gu' ? toGujaratiDigits(todaysSchedule.length) : todaysSchedule.length}
                            </span>
                        </div>

                        {todaysSchedule.length === 0 ? (
                            <div className="py-10 bg-[#fbfcfd] rounded-xl border border-dashed border-dark/15 flex flex-col items-center justify-center text-center p-6 text-dark-light animate-fadeIn">
                                <FiCalendar size={28} className="mb-2.5 text-dark-light/60" />
                                <p className="text-xs font-bold text-dark/75">{te('noSchedule')}</p>
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
                                                {formatGujaratiTime(
                                                    `${String(new Date(item.created_date).getHours()).padStart(2, '0')}:${String(new Date(item.created_date).getMinutes()).padStart(2, '0')}`,
                                                    lang
                                                )}
                                            </span>
                                            <Link
                                                to={`/expert/consultation/${item.id}`}
                                                className="text-[10px] font-extrabold text-emerald-650 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                {te('quickView')} <FiChevronRight size={13} />
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
                                {te('recentInquiries')}
                            </span>
                            <Link to="/expert/consultation" className="text-[10px] font-bold text-primary hover:underline">
                                {te('viewInbox')}
                            </Link>
                        </div>

                        {consultations.length === 0 ? (
                            <div className="py-12 text-center text-dark-light max-w-md mx-auto animate-fadeIn">
                                <FiAlertCircle size={36} className="mx-auto mb-3 text-dark-light/60" />
                                <h4 className="text-sm font-bold text-dark-dark">{te('noConsultations')}</h4>
                                <p className="text-xs text-dark-light mt-1">{te('noConsultationsDesc')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto pt-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] border-b border-dark/5 text-[10px] font-bold text-dark-light select-none">
                                            <th className="p-3 font-extrabold">{te('farmerName')}</th>
                                            <th className="p-3 font-extrabold">{te('subject')}</th>
                                            <th className="p-3 font-extrabold">{te('timeReceived')}</th>
                                            <th className="p-3 font-extrabold">{te('status')}</th>
                                            <th className="p-3 font-extrabold text-right">{te('action')}</th>
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
                                                    {formatGujaratiDate(q.created_date, lang)}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${q.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-150' :
                                                        q.status === 'Replied' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                                                            'bg-slate-50 text-slate-700 border border-slate-200'
                                                        }`}>
                                                        {q.status === 'Pending' ? te('statusPending') :
                                                            q.status === 'Replied' ? te('statusReplied') :
                                                                te('statusClosed')}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Link
                                                        to={`/expert/consultation/${q.id}`}
                                                        className="inline-flex items-center gap-0.5 text-emerald-650 hover:text-emerald-700 font-extrabold text-[10px] transition"
                                                    >
                                                        <span>{te('quickView')}</span>
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
