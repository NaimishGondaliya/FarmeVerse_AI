import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiMessageSquare, FiChevronRight, FiSearch, FiUser } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { Card } from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

const T = {
    ENG: {
        title: "Farmer List",
        subtitle: "View all farmers who have reached out for expert consultation.",
        searchPlaceholder: "Search farmer by name or topic...",
        farmer: "Farmer Name",
        latestTopic: "Latest Topic",
        totalQueries: "Total Queries",
        lastContact: "Last Contact",
        action: "Action",
        viewChat: "View Chat",
        noFarmers: "No farmers found.",
        noFarmersDesc: "When farmers submit consultations, their profiles will appear here.",
        loading: "Loading farmer list..."
    },
    GUJ: {
        title: "ખેડૂતોની યાદી",
        subtitle: "તમામ ખેડૂતો જુઓ જેમણે નિષ્ણાત પરામર્શ માટે સંપર્ક કર્યો છે.",
        searchPlaceholder: "ખેડૂતનું નામ અથવા વિષય શોધો...",
        farmer: "ખેડૂતનું નામ",
        latestTopic: "છેલ્લો વિષય",
        totalQueries: "કુલ પ્રશ્નો",
        lastContact: "છેલ્લો સંપર્ક",
        action: "કાર્ય",
        viewChat: "વાતચીત જુઓ",
        noFarmers: "કોઈ ખેડૂત મળ્યા નથી.",
        noFarmersDesc: "જ્યારે ખેડૂતો પરામર્શ માટે અરજી કરશે ત્યારે તેમની વિગતો અહીં દેખાશે.",
        loading: "ખેડૂતોની યાદી લોડ થઈ રહી છે..."
    }
}

export const ExpertFarmerList = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [consultations, setConsultations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const t = T[lang]

    useEffect(() => {
        const fetchConsultations = async () => {
            setIsLoading(true)
            try {
                const data = await consultationAPI.getExpertList()
                setConsultations(data)
            } catch (err) {
                console.error("Failed to load farmer list", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchConsultations()
    }, [])

    // Group consultations by farmer_name to get unique farmer entries
    const farmerMap = {}
    consultations.forEach(c => {
        const key = c.farmer_name || 'Unknown'
        if (!farmerMap[key]) {
            farmerMap[key] = {
                name: key,
                totalQueries: 0,
                latestSubject: c.subject,
                latestDate: c.created_date,
                latestId: c.id
            }
        }
        farmerMap[key].totalQueries += 1
        // Keep the most recent consultation
        if (new Date(c.created_date) > new Date(farmerMap[key].latestDate)) {
            farmerMap[key].latestSubject = c.subject
            farmerMap[key].latestDate = c.created_date
            farmerMap[key].latestId = c.id
        }
    })

    let farmers = Object.values(farmerMap).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate))

    // Filter by search query
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        farmers = farmers.filter(f =>
            f.name.toLowerCase().includes(q) || f.latestSubject.toLowerCase().includes(q)
        )
    }

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <Loader variant="skeleton" type="table" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiUsers className="text-emerald-600" /> {t.title}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{t.subtitle}</p>
                </div>
                
            </div>

            <Card className="p-4">
                <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-4 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </Card>

            {/* Farmer Data Table */}
            {farmers.length === 0 ? (
                <EmptyState
                    icon={FiUser}
                    title={t.noFarmers}
                    description={t.noFarmersDesc}
                />
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 select-none uppercase tracking-wider">
                                    <th className="p-4">{t.farmer}</th>
                                    <th className="p-4">{t.latestTopic}</th>
                                    <th className="p-4 text-center">{t.totalQueries}</th>
                                    <th className="p-4">{t.lastContact}</th>
                                    <th className="p-4 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {farmers.map((farmer) => (
                                    <tr key={farmer.name} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-sm border border-emerald-100 flex-shrink-0">
                                                    {farmer.name.slice(0, 1).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-sm text-slate-800">{farmer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-sm text-slate-700 truncate max-w-[200px] sm:max-w-xs">{farmer.latestSubject}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-100">
                                                {farmer.totalQueries}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(farmer.latestDate).toLocaleDateString(lang === 'GUJ' ? 'gu-IN' : 'en-US')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/expert/consultation/${farmer.latestId}`}
                                                className="inline-flex items-center gap-1 text-emerald-650 hover:text-emerald-700 font-extrabold text-xs transition"
                                            >
                                                <FiMessageSquare size={13} />
                                                <span>{t.viewChat}</span>
                                                <FiChevronRight size={13} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default ExpertFarmerList
