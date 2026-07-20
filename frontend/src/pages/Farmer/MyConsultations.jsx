import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMessageSquare, FiPlus, FiChevronRight, FiClock, FiCheck } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

const translations = {
    ENG: {
        title: "My consultations History",
        subtitle: "Track your active query tickets and expert answers",
        newQueryBtn: "New Consultation Query",
        tableSubject: "Topic / Subject",
        tableExpert: "Expert Assigned",
        tableDate: "Date Inquired",
        tableStatus: "Current status",
        tableAction: "Action",
        pending: "Pending",
        replied: "Replied",
        closed: "Closed",
        openChat: "Open Chat Logs",
        noQueries: "No consultation requests found",
        noQueriesDesc: "Create your first professional consultation ticket by clicking the button above.",
        loading: "Retrieving history logs...",
        error: "Failed to load consultation records.",
        back: "Back to Experts List"
    },
    GUJ: {
        title: "મારા પ્રશ્નોનો ઇતિહાસ",
        subtitle: "તમારા સક્રિય પ્રશ્નો અને નિષ્ણાતો દ્વારા આપવામાં આવેલ જવાબોનો ઇતિહાસ જુઓ",
        newQueryBtn: "નવો પ્રશ્ન પૂછો",
        tableSubject: "સમસ્યા / વિષય",
        tableExpert: "કૃષિ નિષ્ણાત",
        tableDate: "મોકલ્યા તારીખ",
        tableStatus: "સ્થિતિ",
        tableAction: "કાર્ય",
        pending: "બાકી છે",
        replied: "જવાબ આપેલ છે",
        closed: "બંધ કરેલ છે",
        openChat: "ચેટ ખોલો",
        noQueries: "કોઈ પરામર્શ પ્રશ્નો મળ્યા નથી",
        noQueriesDesc: "ઉપરના બટન પર ક્લિક કરીને તમારો પહેલો પ્રશ્ન સબમિટ કરો.",
        loading: "ઇતિહાસ લોડ થઈ રહ્યો છે...",
        error: "માહિતી મેળવવામાં સમસ્યા આવી રહી છે.",
        back: "નિષ્ણાતોની યાદી પર પાછા જાઓ"
    }
}

export const MyConsultations = () => {
    const navigate = useNavigate()
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [queries, setQueries] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const t = translations[lang]

    const loadQueries = async () => {
        try {
            const data = await consultationAPI.getFarmerList()
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
        loadQueries()
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
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{t.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">


                    <Link
                        to="/farmer/consultation"
                        className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition text-center"
                    >
                        {t.back}
                    </Link>

                    <Link
                        to="/farmer/consultation/new"
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm text-center justify-center"
                    >
                        <FiPlus size={14} />
                        <span>{t.newQueryBtn}</span>
                    </Link>
                </div>
            </div>

            {/* Queries Grid/List */}
            {queries.length === 0 ? (
                <EmptyState
                    icon={FiMessageSquare}
                    title={t.noQueries}
                    description={t.noQueriesDesc}
                    actionText={t.newQueryBtn}
                    onActionClick={() => navigate('/farmer/consultation/new')}
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-55 border-b border-light select-none text-xs font-bold text-slate-500">
                                    <th className="p-4 md:p-5">{t.tableSubject}</th>
                                    <th className="p-4 md:p-5">{t.tableExpert}</th>
                                    <th className="p-4 md:p-5">{t.tableDate}</th>
                                    <th className="p-4 md:p-5">{t.tableStatus}</th>
                                    <th className="p-4 md:p-5 text-right">{t.tableAction}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queries.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 md:p-5">
                                            <div className="font-bold text-slate-800 text-sm max-w-xs md:max-w-md truncate">
                                                {q.subject}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 max-w-xs md:max-w-md truncate">
                                                {q.message}
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-5 text-sm font-semibold text-slate-700">
                                            <div>{q.expert_name}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{q.expert_specialization}</div>
                                        </td>
                                        <td className="p-4 md:p-5 text-xs text-slate-500 font-medium">
                                            {new Date(q.created_date).toLocaleDateString()}
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
                                                to={`/farmer/consultation/${q.id}`}
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
