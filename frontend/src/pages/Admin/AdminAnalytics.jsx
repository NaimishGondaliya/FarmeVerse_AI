import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiTrendingUp, FiCloudRain, FiAlertTriangle, FiUsers, FiAward,
    FiMessageSquare, FiBookOpen, FiDownload, FiRefreshCw,
    FiList, FiPieChart, FiBarChart2, FiActivity, FiX, FiCheck
} from 'react-icons/fi'
import { adminAnalyticsAPI } from '../../services/api'

const T = {
    ENG: {
        title: 'System Telemetry & Analytics',
        subtitle: 'Real-time performance monitoring, query telemetry, and system-wide activity logs',
        exportCsv: 'Export CSV',
        exportPdf: 'Export PDF Summary',
        recentActivity: 'Recent System Activities',
        farmersByDistrict: 'Farmers Registration by District',
        cropRecommendations: 'Crop Recommendations Distribution',
        diseaseDistribution: 'Disease Detections Breakdown',
        totalFarmers: 'Total Farmers',
        totalExperts: 'Total Experts',
        totalConsultations: 'Consultations',
        totalSchemes: 'Govt Schemes',
        weatherQueries: 'Weather Queries',
        recommendations: 'Crop Recommendations',
        diseaseDetections: 'Disease Detections',
        loading: 'Generating dashboard analytics...',
        errorLoad: 'Failed to retrieve telemetry dashboard analytics',
        retry: 'Retry',
        successExport: 'Report successfully downloaded',
        errorExport: 'Failed to generate report export',
        activeSession: 'Telemetry Session: Active',
        refresh: 'Refresh Metric Stats'
    },
    GUJ: {
        title: 'સિસ્ટમ ટેલિમેટ્રી અને એનાલિટિક્સ',
        subtitle: 'રીઅલ-ટાઇમ પ્રદર્શન મોનિટરિંગ, ક્વેરી ટેલિમેટ્રી અને સિસ્ટમ-વ્યાપી પ્રવૃત્તિ લૉગ્સ',
        exportCsv: 'CSV નિકાસ કરો',
        exportPdf: 'PDF સારાંશ નિકાસ',
        recentActivity: 'તાજેતરની સિસ્ટમ પ્રવૃત્તિઓ',
        farmersByDistrict: 'જિલ્લાવાર નોંધાયેલા ખેડૂતો',
        cropRecommendations: 'ભલામણ કરેલ પાકોનું વિતરણ',
        diseaseDistribution: 'રોગ નિદાન વિતરણ',
        totalFarmers: 'કુલ ખેડૂતો',
        totalExperts: 'કુલ નિષ્ણાતો',
        totalConsultations: 'પ્રશ્નોત્તરી (મુલાકાતો)',
        totalSchemes: 'સરકારી યોજનાઓ',
        weatherQueries: 'હવામાન પૂછપરછ',
        recommendations: 'પાક ભલામણો',
        diseaseDetections: 'રોગ નિદાન લૉગ્સ',
        loading: 'એનાલિટિક્સ ડેટા લોડ થઈ રહ્યો છે...',
        errorLoad: 'ટેલિમેટ્રી ડેટા લોડ કરવામાં નિષ્ફળ',
        retry: 'ફરીથી પ્રયત્ન કરો',
        successExport: 'રિપોર્ટ સફળતાપૂર્વક ડાઉનલોડ થયો છે',
        errorExport: 'રિપોર્ટ નિકાસ કરવામાં નિષ્ફળતા',
        activeSession: 'ટેલિમેટ્રી સત્ર: સક્રિય',
        refresh: 'ડેટા તાજો કરો'
    }
}

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
    return (
        <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-slide-down`}>
            {type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-75"><FiX size={16} /></button>
        </div>
    )
}

export default function AdminAnalytics() {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const t = T[lang]

    // States
    const [dashboard, setDashboard] = useState(null)
    const [charts, setCharts] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [toast, setToast] = useState(null)
    const [exporting, setExporting] = useState(false)

    const triggerToast = (msg, type = 'success') => {
        setToast({ message: msg, type })
    }

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const [dashRes, chartsRes] = await Promise.all([
                adminAnalyticsAPI.getDashboard(),
                adminAnalyticsAPI.getCharts()
            ])
            setDashboard(dashRes)
            setCharts(chartsRes)
        } catch (err) {
            console.error('Analytics load error', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Handling Downloads
    const handleExport = async (format) => {
        setExporting(true)
        try {
            const blob = await adminAnalyticsAPI.exportData(format)
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `farmverse_telemetry_report_${new Date().toISOString().split('T')[0]}.${format}`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
            triggerToast(t.successExport, 'success')
        } catch (err) {
            console.error(err)
            triggerToast(t.errorExport, 'error')
        } finally {
            setExporting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="bg-slate-50 p-24 rounded-2xl border text-center shadow-sm max-w-5xl mx-auto my-12">
                <div className="spinner-border animate-spin inline-block w-10 h-10 border-4 border-t-emerald-600 rounded-full text-emerald-600 mb-6" role="status"></div>
                <p className="text-slate-500 text-sm font-semibold">{t.loading}</p>
            </div>
        )
    }

    if (isError || !dashboard || !charts) {
        return (
            <div className="bg-white p-20 rounded-2xl border text-center shadow-sm max-w-3xl mx-auto my-12">
                <FiAlertTriangle className="text-rose-500 mx-auto mb-5 animate-bounce" size={48} />
                <h3 className="text-slate-800 font-bold text-lg">{t.errorLoad}</h3>
                <button onClick={fetchData} className="mt-5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition">
                    <FiRefreshCw className="inline mr-2" /> {t.retry}
                </button>
            </div>
        )
    }

    // Process charts data for SVG drawing safely
    const districts = charts?.farmers_by_district || []
    const districtMax = districts.length > 0 ? Math.max(...districts.map(d => d.count || 0), 1) : 1

    const crops = charts?.crop_recommendations || []
    const cropTotal = crops.length > 0 ? crops.reduce((sum, c) => sum + (c.count || 0), 0) : 0

    const diseases = charts?.disease_predictions || charts?.disease_status || []
    const diseaseTotal = diseases.length > 0 ? diseases.reduce((sum, d) => sum + (d.count || 0), 0) : 0

    // Color palettes
    const palette = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e']

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto w-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Title / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-card border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <FiActivity className="text-emerald-600 animate-pulse" />
                        {t.title}
                    </h1>
                    <p className="text-slate-400 text-xs mt-1.5 font-medium max-w-2xl">{t.subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">

                    <button
                        onClick={fetchData}
                        className="bg-slate-50 border text-slate-650 font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition text-xs flex items-center gap-1.5"
                        title={t.refresh}
                    >
                        <FiRefreshCw size={14} />
                    </button>
                    <button
                        disabled={exporting}
                        onClick={() => handleExport('csv')}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold px-4 py-2 rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm"
                    >
                        <FiDownload size={14} /> {t.exportCsv}
                    </button>
                    <button
                        disabled={exporting}
                        onClick={() => handleExport('pdf')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition text-xs flex items-center gap-1.5 shadow-md shadow-emerald-50"
                    >
                        <FiDownload size={14} /> {t.exportPdf}
                    </button>
                </div>
            </div>

            {/* Live active tag info bar */}
            <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    {t.activeSession}
                </span>
                <span className="text-emerald-600 font-normal">Connected via Superuser Telemetry Logs</span>
            </div>

            {/* Metrics Widgets Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: t.totalFarmers, val: dashboard?.data?.total_farmers || 0, icon: FiUsers, col: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { label: t.totalExperts, val: dashboard?.data?.total_experts || 0, icon: FiAward, col: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: t.totalConsultations, val: dashboard?.data?.total_consultations || 0, icon: FiMessageSquare, col: 'bg-purple-50 text-purple-600 border-purple-100' },
                    { label: t.totalSchemes, val: dashboard?.data?.total_government_schemes || 0, icon: FiBookOpen, col: 'bg-amber-50 text-amber-600 border-amber-100' }
                ].map((card, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:scale-[1.02] transform transition-transform duration-200">
                        <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{card.val}</h3>
                        </div>
                        <div className={`p-3.5 rounded-2xl border ${card.col}`}>
                            <card.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Telemetry log widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: t.weatherQueries, val: dashboard?.data?.weather_requests || 0, icon: FiCloudRain, col: 'border-l-4 border-l-cyan-500' },
                    { label: t.recommendations, val: dashboard?.data?.crop_recommendations || 0, icon: FiTrendingUp, col: 'border-l-4 border-l-teal-500' },
                    { label: t.diseaseDetections, val: dashboard?.data?.disease_predictions || 0, icon: FiAlertTriangle, col: 'border-l-4 border-l-rose-500' }
                ].map((card, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 ${card.col}`}>
                        <div className="p-3 rounded-xl bg-slate-50 text-slate-600">
                            <card.icon size={20} />
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                            <h4 className="text-xl font-black text-slate-700 mt-0.5">{card.val}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* SVG Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Bar Chart: Farmers by District */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FiBarChart2 className="text-slate-500" />
                            {t.farmersByDistrict}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Aggregated farmer registration metrics</p>
                    </div>

                    <div className="mt-8 flex items-end justify-between h-56 pt-6 border-b border-l pb-1 pl-1 bg-slate-50/50 rounded-lg pr-4 border-slate-200">
                        {districts.length === 0 ? (
                            <div className="w-full flex items-center justify-center text-slate-400 text-xs italic py-10">No registrations found</div>
                        ) : (
                            districts.map((d, index) => {
                                const heightPercent = Math.min((d.count / districtMax) * 100, 100)
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 group relative">
                                        {/* Hover Tooltip tooltip */}
                                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-200 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-25">
                                            {d.count} farmers
                                        </span>
                                        {/* Bar graphic */}
                                        <div
                                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                            className="w-8 bg-emerald-500 group-hover:bg-emerald-600 rounded-t transition-all duration-500 ease-out shadow-xs"
                                        ></div>
                                        {/* District title */}
                                        <span className="text-[10px] text-slate-500 font-semibold mt-2 truncate w-14 text-center" title={d.district}>
                                            {d.district}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 2. Donut/Pie Chart: Crop Recommendation Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FiPieChart className="text-slate-500" />
                            {t.cropRecommendations}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Distribution of model predictive answers</p>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
                        {crops.length === 0 ? (
                            <div className="w-full text-center text-slate-400 text-xs italic py-10">No predictions logged yet</div>
                        ) : (
                            <>
                                {/* SVG Donut graphic */}
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                        {cropTotal > 0 && (() => {
                                            let accumulatedPercent = 0
                                            return crops.map((c, i) => {
                                                const countVal = c.count || 0
                                                const percent = (countVal / cropTotal) * 100
                                                const strokeDash = `${percent} ${100 - percent}`
                                                const strokeOffset = 100 - accumulatedPercent
                                                accumulatedPercent += percent
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx="18"
                                                        cy="18"
                                                        r="15.915"
                                                        fill="none"
                                                        stroke={palette[i % palette.length]}
                                                        strokeWidth="3.2"
                                                        strokeDasharray={strokeDash}
                                                        strokeDashoffset={strokeOffset}
                                                    />
                                                )
                                            })
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-slate-800">{cropTotal}</span>
                                        <span className="text-[10px] text-slate-450 uppercase font-bold">Total Calls</span>
                                    </div>
                                </div>

                                {/* Legend lists */}
                                <div className="flex-1 space-y-1.5 w-full">
                                    {crops.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 text-slate-650">
                                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: palette[i % palette.length] }}></span>
                                                <span className="font-semibold">{c.recommended_crop}</span>
                                            </div>
                                            <span className="text-slate-450 font-bold">{c.count} ({Math.round((c.count / cropTotal) * 100)}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Bar Chart: Disease distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FiActivity className="text-slate-500" />
                            {t.diseaseDistribution}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Classification rates for diagnostic requests</p>
                    </div>

                    <div className="mt-8 flex flex-col justify-center space-y-3.5">
                        {diseaseTotal === 0 ? (
                            <div className="w-full text-center text-slate-400 text-xs italic py-10">No detections recorded</div>
                        ) : (
                            diseases.map((d, i) => {
                                const countVal = d.count || 0
                                const percent = diseaseTotal > 0 ? Math.round((countVal / diseaseTotal) * 100) : 0
                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-700">{d.prediction || d.status || 'General'}</span>
                                            <span className="text-slate-450 font-bold">{countVal} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${percent}%` }}
                                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 4. Timeline list: Recent Activities */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FiList className="text-slate-500" />
                            {t.recentActivity}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Audit timeline for the last 10 actions</p>
                    </div>

                    <div className="mt-6 space-y-3 max-h-72 overflow-y-auto pr-1">
                        {(!charts?.recent_activity ||
                            ((charts?.recent_activity?.farmers || []).length === 0 &&
                                (charts?.recent_activity?.experts || []).length === 0 &&
                                (charts?.recent_activity?.consultations || []).length === 0 &&
                                (charts?.recent_activity?.predictions || []).length === 0 &&
                                (charts?.recent_activity?.schemes || []).length === 0)) ? (
                            <div className="w-full text-center text-slate-400 text-xs italic py-10">No events logged in this session</div>
                        ) : (
                            (() => {
                                // Flatten and sort activities by date
                                const list = [];
                                const acts = charts?.recent_activity || {};
                                const rawFarmers = acts.farmers || [];
                                const rawExperts = acts.experts || [];
                                const rawConsultations = acts.consultations || [];
                                const rawPredictions = acts.predictions || [];
                                const rawSchemes = acts.schemes || [];

                                rawFarmers.forEach(f => {
                                    list.push({
                                        title: 'Farmer Registered',
                                        subtitle: `${f.full_name || 'Farmer'} (${f.mobile || '—'})`,
                                        time: f.created_at || f.date_joined,
                                        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    });
                                });

                                rawExperts.forEach(e => {
                                    list.push({
                                        title: 'Expert Appointed',
                                        subtitle: `${e.full_name || 'Expert'} (${e.mobile || e.email || '—'}) - ${e.expertise || 'General'}`,
                                        time: e.created_at || e.date_joined,
                                        badge: 'bg-blue-50 text-blue-700 border-blue-100'
                                    });
                                });

                                rawConsultations.forEach(c => {
                                    list.push({
                                        title: 'Consultation Created',
                                        subtitle: `Subject: ${c.subject || 'Inquiry'} (Status: ${c.status || 'Active'})`,
                                        time: c.created_date || c.created_at,
                                        badge: 'bg-purple-50 text-purple-700 border-purple-100'
                                    });
                                });

                                rawPredictions.forEach(p => {
                                    list.push({
                                        title: 'Crop Recommendation Query',
                                        subtitle: `City: ${p.city || 'Gujarat'} -> Recommended: ${p.recommended_crop || '—'} (Conf: ${p.confidence ? Math.round(p.confidence * 100) : 0}%)`,
                                        time: p.created_at,
                                        badge: 'bg-teal-50 text-teal-700 border-teal-100'
                                    });
                                });

                                rawSchemes.forEach(s => {
                                    list.push({
                                        title: 'Govt Scheme Added',
                                        subtitle: s.title || s.scheme_name || 'Scheme',
                                        time: s.created_at || s.updated_at,
                                        badge: 'bg-amber-50 text-amber-700 border-amber-100'
                                    });
                                });

                                // Sort descending
                                list.sort((a, b) => new Date(b.time) - new Date(a.time));

                                return list.map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 border rounded-xl hover:bg-slate-100/50 transition">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${item.badge}`}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-800 font-semibold">{item.subtitle}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-450 font-bold block whitespace-nowrap">
                                            {item.time ? new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </span>
                                    </div>
                                ));
                            })()
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
