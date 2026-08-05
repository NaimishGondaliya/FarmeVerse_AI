import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare, FiChevronRight, FiAlertCircle } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Card } from '../../components/common/Card'
import { formatGujaratiDateTime } from '../../utils/gujaratiFormat'

export const ExpertInbox = () => {
    const [consultations, setConsultations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const { language } = useLanguage()
    const { t } = useTranslation()
    const lang = language === 'en' ? 'en' : 'gu'

    // Shorthand for expert locale section
    const te = (key) => t(`expert.${key}`)

    const fetchConsultations = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const data = await consultationAPI.getExpertList()
            setConsultations(data)
        } catch (err) {
            console.error('Inbox load error', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConsultations()
    }, [])

    const statusLabel = (status) => {
        if (status === 'Pending') return te('statusPending')
        if (status === 'Replied') return te('statusReplied')
        return te('statusClosed')
    }

    const statusClass = (status) => {
        if (status === 'Pending') return 'bg-amber-50 text-amber-800 border-amber-200'
        if (status === 'Replied') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{te('loading')}</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-8 text-center max-w-lg mx-auto mt-12">
                <FiAlertCircle size={42} className="text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-dark text-lg">{te('errorInbox')}</h3>
                <button
                    onClick={fetchConsultations}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition"
                >
                    {te('retry')}
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiMessageSquare className="text-emerald-600" /> {te('inboxTitle')}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{te('inboxSubtitle')}</p>
                </div>
            </div>

            {/* Table Card */}
            <Card className="p-0 overflow-hidden shadow-sm">
                {consultations.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-dark-light">
                        <FiMessageSquare size={40} className="mb-4 text-dark-light/50" />
                        <h4 className="font-bold text-dark/80">{te('noQueries')}</h4>
                        <p className="text-xs mt-1">{te('noQueriesDesc')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f3f4f6] border-b border-slate-100 text-[10px] text-slate-500 tracking-widest uppercase font-extrabold">
                                    <th className="px-5 py-4">{te('tableFarmer')}</th>
                                    <th className="px-5 py-4">{te('tableSubject')}</th>
                                    <th className="px-5 py-4">{te('tableDate')}</th>
                                    <th className="px-5 py-4">{te('tableStatus')}</th>
                                    <th className="px-5 py-4 text-right">{te('tableAction')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {consultations.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-primary-light/20 transition group text-sm text-dark font-medium"
                                    >
                                        <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                                            {c.farmer_name}
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <div className="font-bold truncate">{c.subject}</div>
                                            <div className="text-[10px] text-dark-light truncate mt-0.5">{c.message}</div>
                                        </td>
                                        <td className="px-5 py-4 text-[11px] text-dark-light whitespace-nowrap">
                                            {formatGujaratiDateTime(c.created_date, lang)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusClass(c.status)}`}>
                                                {statusLabel(c.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                to={`/expert/consultation/${c.id}`}
                                                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-[11px] font-extrabold group-hover:underline transition"
                                            >
                                                {te('openChat')} <FiChevronRight size={13} />
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
    )
}

export default ExpertInbox
