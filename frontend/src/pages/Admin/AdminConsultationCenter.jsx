import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiMessageSquare, FiClock, FiCheckSquare, FiAlertCircle,
    FiSearch, FiTrash2, FiEye, FiX, FiUser, FiInfo, FiLayers,
    FiCalendar, FiArrowRight, FiRotateCcw, FiChevronLeft, FiChevronRight,
    FiChevronDown, FiGlobe, FiAlertTriangle, FiCheck
} from 'react-icons/fi'
import { adminConsultationAPI } from '../../services/api'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

// ─── Translations ───────────────────────────────────────────────
const T = {
    ENG: {
        title: 'Admin Consultation Center',
        subtitle: 'Monitor and manage consultation threads and ticket status',
        totalConsultations: 'Total Tickets',
        pendingTickets: 'Pending Response',
        repliedTickets: 'Replied Tickets',
        closedTickets: 'Closed Tickets',
        todayTickets: "Today's Tickets",
        searchPlaceholder: 'Search by Farmer, Expert, Subject, or Ticket ID...',
        filterAllStatus: 'All Statuses',
        filterPending: 'Pending',
        filterReplied: 'Replied',
        filterClosed: 'Closed',
        filterAllDate: 'All Dates',
        filterToday: 'Today',
        filterWeek: 'This Week',
        filterMonth: 'This Month',
        sortNewest: 'Newest First',
        sortOldest: 'Oldest First',
        ticketId: 'Ticket ID',
        farmer: 'Farmer',
        specialization: 'Category',
        subject: 'Subject',
        status: 'Status',
        lastReply: 'Last Reply',
        actions: 'Actions',
        noTickets: 'No consultations found',
        noTicketsDesc: 'Try adjusting your search filters or check back later.',
        viewConversation: 'Conversation Thread',
        closeTicket: 'Close Ticket',
        reopenTicket: 'Reopen Ticket',
        deleteTicket: 'Delete Ticket',
        confirmDeleteTitle: 'Soft-Delete Consultation',
        confirmDeleteMsg: 'Are you sure you want to remove this consultation from the admin center? This action is soft-delete only and does not delete raw farmer data.',
        cancel: 'Cancel',
        confirm: 'Confirm Deletion',
        loading: 'Loading...',
        errorLoad: 'Failed to retrieve consultations',
        retry: 'Retry',
        successDeleted: 'Consultation deleted successfully',
        successStatusClose: 'Consultation closed successfully',
        successStatusReopen: 'Consultation reopened successfully',
        statusUpdated: 'Consultation status updated',
        farmerMessage: 'Farmer inquiry',
        expertMessage: 'Expert reply',
        adminControls: 'Administrative Controls',
        lang: 'English (ENG)'
    },
    GUJ: {
        title: 'પરામર્શ કેન્દ્ર સંચાલન',
        subtitle: 'પરામર્શ થ્રેડો અને ટિકિટ સ્થિતિનું નિરીક્ષણ અને સંચાલન કરો',
        totalConsultations: 'કુલ ટિકિટો',
        pendingTickets: 'પ્રતિસાદ બાકી',
        repliedTickets: 'જવાબ આપેલ',
        closedTickets: 'બંધ કરેલ ટિકિટો',
        todayTickets: 'આજની ટિકિટો',
        searchPlaceholder: 'ખેડૂત, નિષ્ણાત, વિષય અથવા ટિકિટ ID દ્વારા શોધો...',
        filterAllStatus: 'બધી સ્થિતિ',
        filterPending: 'બાકી',
        filterReplied: 'જવાબ આપેલ',
        filterClosed: 'બંધ',
        filterAllDate: 'બધા દિવસો',
        filterToday: 'આજે',
        filterWeek: 'આ અઠવાડિયે',
        filterMonth: 'આ મહિને',
        sortNewest: 'પ્રથમ નવા',
        sortOldest: 'પ્રથમ જૂના',
        ticketId: 'ટિકિટ ID',
        farmer: 'ખેડૂત',
        specialization: 'કેટેગરી',
        subject: 'વિષય',
        status: 'સ્થિતિ',
        lastReply: 'છેલ્લો જવાબ',
        actions: 'ક્રિયાઓ',
        noTickets: 'કોઈ પરામર્શ મળ્યા નથી',
        noTicketsDesc: 'તમારા ફિલ્ટર્સ બદલીને ફરીથી પ્રયાસ કરો.',
        viewConversation: 'વાતચીત થ્રેડ',
        closeTicket: 'ટિકિટ બંધ કરો',
        reopenTicket: 'ટિકિટ ફરી ખોલો',
        deleteTicket: 'ટિકિટ કાઢી નાખો',
        confirmDeleteTitle: 'પરામર્શ દૂર કરવાની પુષ્ટિ',
        confirmDeleteMsg: 'શું તમે આ પરામર્શને સંચાલન કેન્દ્રમાંથી દૂર કરવા માંગો છો? આ ખેડૂતના ડેટાને અસર કરશે નહીં.',
        cancel: 'રદ કરો',
        confirm: 'દૂર કરવાની ખાતરી',
        loading: 'લોડ થઈ રહ્યું છે...',
        errorLoad: 'પરામર્શ લોડ કરવામાં નિષ્ફળ',
        retry: 'ફરી પ્રયાસ કરો',
        successDeleted: 'પરામર્શ સફળતાપૂર્વક દૂર કરવામાં આવ્યો',
        successStatusClose: 'પરામર્શ સફળતાપૂર્વક બંધ કરવામાં આવ્યો',
        successStatusReopen: 'પરામર્શ સફળતાપૂર્વક ફરી ખોલવામાં આવ્યો',
        statusUpdated: 'પરામર્શની સ્થિતિ અપડેટ થઈ',
        farmerMessage: 'ખેડૂત પૂછપરછ',
        expertMessage: 'નિષ્ણાત પ્રતિસાદ',
        adminControls: 'વહીવટી નિયંત્રણો',
        lang: 'ગુજરાતી (GUJ)'
    }
}

// ─── Toast Component ────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-700'
    return (
        <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold animate-slide-down`}>
            {type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><FiX size={16} /></button>
        </div>
    )
}

export const AdminConsultationCenter = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const t = T[lang]

    // Data State
    const [consultations, setConsultations] = useState([])
    const [stats, setStats] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    // Filtering, Search, Pagination
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 10

    // Modals
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [viewData, setViewData] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    // Toast
    const [toast, setToast] = useState(null)
    const showToast = (message, type = 'success') => setToast({ message, type })

    // Fetch Data
    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const params = {
                page,
                page_size: pageSize,
                sort: sortBy
            }
            if (search.trim()) params.search = search.trim()
            if (statusFilter) params.status = statusFilter
            if (dateFilter) params.date_range = dateFilter

            const [listData, statsData] = await Promise.all([
                adminConsultationAPI.getAll(params),
                adminConsultationAPI.getStats()
            ])
            setConsultations(listData.results || [])
            setTotalCount(listData.total_count || 0)
            setStats(statsData || {})
        } catch (err) {
            console.error('Consultation fetch error:', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, statusFilter, dateFilter, sortBy])

    useEffect(() => {
        const delay = setTimeout(() => fetchData(), 300)
        return () => clearTimeout(delay)
    }, [fetchData])

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [search, statusFilter, dateFilter, sortBy])

    // Actions
    const handleOpenView = async (ticket) => {
        try {
            const data = await adminConsultationAPI.getById(ticket.id)
            setViewData(data)
            setSelectedTicket(ticket)
            setShowViewModal(true)
        } catch (err) {
            showToast('Failed to load consultation details', 'error')
        }
    }

    const handleOpenDelete = (ticket) => {
        setSelectedTicket(ticket)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        setIsSaving(true)
        try {
            await adminConsultationAPI.remove(selectedTicket.id)
            showToast(t.successDeleted)
            setShowDeleteModal(false)
            fetchData()
        } catch (err) {
            showToast('Deletion failed', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateStatus = async (newStatus) => {
        setIsSaving(true)
        try {
            await adminConsultationAPI.updateStatus(selectedTicket.id, newStatus)
            showToast(newStatus === 'Closed' ? t.successStatusClose : t.successStatusReopen)

            // Refresh detail view
            const updatedDetail = await adminConsultationAPI.getById(selectedTicket.id)
            setViewData(updatedDetail)

            // Refresh list & statistics
            fetchData()
        } catch (err) {
            showToast('Failed to update status', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Modal Wrapper
    const Modal = ({ show, onClose, title, children, wide }) => {
        if (!show) return null
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
                <div className={`bg-white rounded-2xl shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'} w-full my-8 relative`} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"><FiX size={18} /></button>
                    </div>
                    <div className="p-5">{children}</div>
                </div>
            </div>
        )
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    // Dashboard Cards layout
    const cards = [
        { label: t.totalConsultations, value: stats.total_consultations ?? '—', icon: FiMessageSquare, color: 'emerald' },
        { label: t.pendingTickets, value: stats.pending ?? '—', icon: FiClock, color: 'amber' },
        { label: t.repliedTickets, value: stats.replied ?? '—', icon: FiArrowRight, color: 'blue' },
        { label: t.closedTickets, value: stats.closed ?? '—', icon: FiCheckSquare, color: 'green' },
        { label: t.todayTickets, value: stats.today_consultations ?? '—', icon: FiCalendar, color: 'indigo' }
    ]

    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    }

    const iconBg = {
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        indigo: 'bg-indigo-100 text-indigo-700'
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-100 text-amber-800 border-amber-200'
            case 'Replied':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'Closed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white py-10 px-4 shadow-md mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.title}</h1>
                        <p className="mt-1.5 text-emerald-100/80 text-sm">{t.subtitle}</p>
                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {cards.map((c, i) => {
                        const Icon = c.icon
                        return (
                            <div key={i} className={`rounded-xl border p-4 shadow-xs ${colorMap[c.color]}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[c.color]}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <div className="text-2xl font-extrabold">{c.value}</div>
                                <div className="text-xs font-bold mt-1 opacity-70">{c.label}</div>
                            </div>
                        )
                    })}
                </div>

                {/* Filters Row */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        {/* Search Bar */}
                        <div className="flex-1 relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full">
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full appearance-none bg-slate-50/70 border border-slate-200 px-4 py-2.5 pr-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="">{t.filterAllStatus}</option>
                                <option value="Pending">{t.filterPending}</option>
                                <option value="Replied">{t.filterReplied}</option>
                                <option value="Closed">{t.filterClosed}</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Date Filter */}
                        <div className="relative w-full md:w-auto">
                            <select
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="w-full appearance-none bg-slate-50/70 border border-slate-200 px-4 py-2.5 pr-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="">{t.filterAllDate}</option>
                                <option value="today">{t.filterToday}</option>
                                <option value="week">{t.filterWeek}</option>
                                <option value="month">{t.filterMonth}</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Sorting */}
                        <div className="relative w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full appearance-none bg-slate-50/70 border border-slate-200 px-4 py-2.5 pr-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="newest">{t.sortNewest}</option>
                                <option value="oldest">{t.sortOldest}</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Directory Content */}
                {isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                        <FiAlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                        <h3 className="text-lg font-bold text-red-800">{t.errorLoad}</h3>
                        <button onClick={fetchData} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition">{t.retry}</button>
                    </div>
                ) : isLoading ? (
                    <Loader variant="skeleton" type="table" />
                ) : consultations.length === 0 ? (
                    <EmptyState
                        icon={FiMessageSquare}
                        title={t.noTickets}
                        description={t.noTicketsDesc}
                    />
                ) : (
                    <>
                        {/* Consultation Table */}
                        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden mb-6">
                            <div className="overflow-x-auto animate-fade-in">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.ticketId}</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.farmer}</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">{t.specialization}</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.subject}</th>
                                            <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.status}</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">{t.lastReply}</th>
                                            <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {consultations.map(ticket => (
                                            <tr key={ticket.id} className="hover:bg-slate-50/60 transition">
                                                {/* ID */}
                                                <td className="px-4 py-3 font-semibold text-slate-700 text-xs">#{ticket.id}</td>
                                                {/* Farmer */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100">
                                                            <FiUser size={13} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-xs md:text-sm">{ticket.farmer_name || 'Farmer'}</div>
                                                            {ticket.expert_name && (
                                                                <div className="text-[10px] text-slate-400">Assigned: {ticket.expert_name}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Category */}
                                                <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">{ticket.category || 'General'}</td>
                                                {/* Subject */}
                                                <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px] truncate text-xs md:text-sm">
                                                    {ticket.subject}
                                                </td>
                                                {/* Status Badge */}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                {/* Last Reply */}
                                                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                                                    {ticket.last_reply_date ? (
                                                        new Date(ticket.last_reply_date).toLocaleString(lang === 'GUJ' ? 'gu-IN' : 'en-US', {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                                {/* Actions */}
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleOpenView(ticket)}
                                                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition"
                                                            title={t.viewConversation}
                                                        >
                                                            <FiEye size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(ticket)}
                                                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition"
                                                            title={t.deleteTicket}
                                                        >
                                                            <FiTrash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Foot bar */}
                        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-xs">
                            <span className="text-slate-500 text-xs font-semibold">
                                {totalCount} results · Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ─── Details View Modal ───────────────────────────────── */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} title={t.viewConversation} wide>
                {viewData && (
                    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Ticket Overview Card */}
                        <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div>
                                <span className="text-xs font-bold text-slate-400 tracking-wide">TICKET ID: #{viewData.id}</span>
                                <h4 className="text-base font-extrabold text-slate-800">{viewData.subject}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1"><FiUser /> {viewData.farmer_name || 'Farmer'}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1"><FiLayers /> {viewData.category || 'General'}</span>
                                    {viewData.expert_name && (
                                        <>
                                            <span>·</span>
                                            <span>Expert: {viewData.expert_name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(viewData.status)}`}>
                                {viewData.status}
                            </span>
                        </div>

                        {/* Message Stream */}
                        <div className="space-y-4 pt-1">
                            {/* Farmer Original Inquiry */}
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase">
                                    F
                                </div>
                                <div className="bg-emerald-50 text-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm border border-emerald-100/60">
                                    <div className="text-[10px] font-bold text-emerald-800 uppercase mb-1">{t.farmerMessage}</div>
                                    <p className="text-sm font-semibold">{viewData.message}</p>
                                    {viewData.image && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-emerald-250 max-w-sm">
                                            <img src={viewData.image} alt="Inquiry Attachment" className="max-h-60 object-contain w-full bg-black/5" />
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-400 mt-2 font-medium">
                                        {new Date(viewData.created_date).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {viewData.replies && viewData.replies.map((reply, i) => {
                                const isExpert = reply.sender === 'Expert';
                                return (
                                    <div key={reply.id || i} className={`flex gap-3 max-w-[85%] ${isExpert ? 'ml-auto flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase text-white ${isExpert ? 'bg-blue-700' : 'bg-slate-700'}`}>
                                            {isExpert ? 'E' : 'F'}
                                        </div>
                                        <div className={`rounded-2xl p-3.5 shadow-sm border ${isExpert ? 'bg-blue-50 border-blue-100/60 text-slate-800 rounded-tr-none' : 'bg-slate-50 border-slate-100 text-slate-800 rounded-tl-none'}`}>
                                            <div className={`text-[10px] font-bold uppercase mb-1 ${isExpert ? 'text-blue-800' : 'text-slate-800'}`}>
                                                {isExpert ? t.expertMessage : t.farmerMessage}
                                            </div>
                                            <p className="text-sm font-semibold whitespace-pre-wrap">{reply.message}</p>
                                            <div className="text-[10px] text-slate-400 mt-2 font-medium">
                                                {new Date(reply.created_date).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Administrative Controls */}
                        <div className="border-t border-slate-100 pt-4 mt-6">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <FiInfo /> {t.adminControls}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {viewData.status !== 'Closed' ? (
                                    <button
                                        onClick={() => handleUpdateStatus('Closed')}
                                        disabled={isSaving}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                                    >
                                        <FiCheckSquare size={14} /> {t.closeTicket}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus('Pending')}
                                        disabled={isSaving}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                                    >
                                        <FiRotateCcw size={14} /> {t.reopenTicket}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ─── Delete Consultation Modal ────────────────────────── */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t.confirmDeleteTitle}>
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertTriangle className="text-red-650" size={28} />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">{t.confirmDeleteMsg}</p>
                    {selectedTicket && (
                        <p className="font-extrabold text-slate-800 mt-3 text-sm">Ticket ID: #{selectedTicket.id}</p>
                    )}
                </div>
                <div className="flex justify-center gap-3 mt-4">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition disabled:opacity-50"
                    >
                        {isSaving ? t.loading : t.confirm}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default AdminConsultationCenter
