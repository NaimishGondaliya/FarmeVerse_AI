import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiInbox, FiMessageSquare, FiChevronRight, FiClock, FiCheckSquare } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

const translations = {
    ENG: {
        title: "Expert Consultations Inbox",
        subtitle: "Review agricultural issues submitted by farmers and provide advice",
        tableFarmer: "Farmer Name",
        tableSubject: "Topic / Subject",
        tableDate: "Date Inquired",
        tableStatus: "Query Status",
        tableAction: "Action",
        pending: "Pending Help",
        replied: "Answered",
        closed: "Closed",
        openChat: "Open Conversation",
        noQueries: "No farmer consultations found",
        noQueriesDesc: "Incoming queries assigned to your district or specialization will appear here.",
        loading: "Loading inbox messages...",
        error: "Failed to reload inbox list.",
    },
    GUJ: {
        title: "નિષ્ણાત પરામર્શ ઇનબોક્સ",
        subtitle: "ખેડૂતો દ્વારા સબમિટ કરાયેલ કૃષિ સમસ્યાઓની સમીક્ષા કરો અને નિષ્ણાત સલાહ આપો",
        tableFarmer: "ખેડૂતનું નામ",
        tableSubject: "સમસ્યા / વિષય",
        tableDate: "મોકલ્યા તારીખ",
        tableStatus: "સ્થિતિ",
        tableAction: "કાર્ય",
        pending: "જવાબ બાકી",
        replied: "જવાબ આપેલ",
        closed: "બંધ કરેલ છે",
        openChat: "વાતચીત ખોલો",
        noQueries: "કોઈ ખેડૂત પરામર્શ પ્રશ્નો મળ્યા નથી",
        noQueriesDesc: "તમારા જિલ્લા અથવા વિશેષતા માટે મોકલેલા પ્રશ્નો અહીં દેખાશે.",
        loading: "ઇનબોક્સ લોડ થઈ રહ્યું છે...",
        error: "ઇનબોક્સ લોડ કરવામાં સમસ્યા આવી રહી છે.",
    }
}

export const ExpertInbox = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [queries, setQueries] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const t = translations[lang]

    const loadInbox = async () => {
        try {
            const data = await consultationAPI.getExpertList()
            setQueries(data)
            setError('')
        } catch (err) {
            console.error(err)
            setError(t.error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadInbox()
    }, [lang])

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <Loader variant="skeleton" type="table" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{t.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                </div>


            </div>

            {/* Queries Grid */}
            {queries.length === 0 ? (
                <EmptyState
                    icon={FiInbox}
                    title={t.noQueries}
                    description={t.noQueriesDesc}
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-55 border-b border-light select-none text-xs font-bold text-slate-500">
                                    <th className="p-4 md:p-5">{t.tableFarmer}</th>
                                    <th className="p-4 md:p-5">{t.tableSubject}</th>
                                    <th className="p-4 md:p-5">{t.tableDate}</th>
                                    <th className="p-4 md:p-5">{t.tableStatus}</th>
                                    <th className="p-4 md:p-5 text-right">{t.tableAction}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queries.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 md:p-5 text-sm font-bold text-slate-800">
                                            {q.farmer_name}
                                        </td>
                                        <td className="p-4 md:p-5">
                                            <div className="font-bold text-slate-800 text-sm max-w-xs md:max-w-md truncate">
                                                {q.subject}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 max-w-xs md:max-w-md truncate">
                                                {q.message}
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-5 text-xs text-slate-500 font-medium">
                                            {new Date(q.created_date).toLocaleString()}
                                        </td>
                                        <td className="p-4 md:p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${q.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                q.status === 'Replied' ? 'bg-emerald-100 text-emerald-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {q.status === 'Pending' ? t.pending :
                                                    q.status === 'Replied' ? t.replied :
                                                        t.closed}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-5 text-right">
                                            <Link
                                                to={`/expert/consultation/${q.id}`}
                                                className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-extrabold text-xs transition"
                                            >
                                                <span>{t.openChat}</span>
                                                <FiChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
