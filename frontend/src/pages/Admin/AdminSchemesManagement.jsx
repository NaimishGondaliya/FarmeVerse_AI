import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiAward, FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX,
    FiCheck, FiAlertTriangle, FiBookOpen, FiClock, FiGrid,
    FiCalendar, FiGlobe, FiMapPin, FiCheckSquare, FiAlertCircle
} from 'react-icons/fi'
import { adminSchemesAPI } from '../../services/api'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

// ─── Translations ───────────────────────────────────────────────
const T = {
    ENG: {
        title: 'Government Schemes Management',
        subtitle: 'Manage and update state and central government agriculture schemes',
        totalSchemes: 'Total Schemes',
        activeSchemes: 'Active Schemes',
        expiredSchemes: 'Expired Schemes',
        draftSchemes: 'Draft Schemes',
        searchPlaceholder: 'Search by title, department, category...',
        filterStatus: 'Status: All',
        filterFeatured: 'Featured: All',
        statusAll: 'All Statuses',
        statusDraft: 'Draft',
        statusActive: 'Active',
        statusExpired: 'Expired',
        featuredAll: 'All Featured',
        featuredYes: 'Featured',
        featuredNo: 'Non-Featured',
        sortNewest: 'Newest Updated',
        sortTitle: 'Title (A-Z)',
        addScheme: 'Add New Scheme',
        editScheme: 'Edit Government Scheme',
        viewScheme: 'Scheme Details',
        schemeTitleLabel: 'Scheme Title (English)',
        schemeTitleGujLabel: 'Scheme Title (Gujarati)',
        schemeType: 'Scheme Type',
        department: 'Department',
        category: 'Category',
        district: 'District (Optional)',
        startDate: 'Start Date',
        endDate: 'End Date',
        officialWebsite: 'Official Website URL',
        applyLink: 'Apply Link URL',
        description: 'Description',
        eligibility: 'Eligibility Criteria',
        benefits: 'Benefits Offered',
        requiredDocuments: 'Required Documents',
        statusField: 'Status',
        featuredField: 'Featured (Show First)',
        save: 'Save Scheme',
        cancel: 'Cancel',
        create: 'Create Scheme',
        update: 'Update Scheme',
        deleteTitle: 'Delete Government Scheme',
        deleteConfirmMsg: 'Are you sure you want to delete this government scheme? This is a soft-delete and the scheme will hidden from the farmers, but can be restored by the database administrator.',
        deleteConfirmBtn: 'Delete Scheme',
        actions: 'Actions',
        featuredIcon: 'Featured',
        central: 'Central',
        gujarat: 'Gujarat state',
        noSchemes: 'No government schemes found',
        noSchemesDesc: 'Try adjusting your search query or filters.',
        loading: 'Fetching schemes data...',
        errorLoad: 'Failed to retrieve schemes listing',
        retry: 'Retry',
        successCreated: 'Government scheme successfully created',
        successUpdated: 'Government scheme successfully updated',
        successStatus: 'Scheme status changed',
        successDeleted: 'Government scheme successfully deleted',
        lang: 'English (ENG)'
    },
    GUJ: {
        title: 'સરકારી યોજનાઓ વ્યવસ્થાપન',
        subtitle: 'રાજ્ય અને કેન્દ્ર સરકારની કૃષિ યોજનાઓનું સંચાલન અને અપડેટ કરો',
        totalSchemes: 'કુલ યોજનાઓ',
        activeSchemes: 'સક્રિય યોજનાઓ',
        expiredSchemes: 'મુદત પૂરી થયેલ યોજનાઓ',
        draftSchemes: 'ડ્રાફ્ટ યોજનાઓ',
        searchPlaceholder: 'શીર્ષક, વિભાગ, શ્રેણી દ્વારા શોધો...',
        filterStatus: 'સ્થિતિ: બધી',
        filterFeatured: 'વિશેષતા: બધી',
        statusAll: 'બધી સ્થિતિઓ',
        statusDraft: 'ડ્રાફ્ટ',
        statusActive: 'સક્રિય',
        statusExpired: 'મુદત પૂરી થયેલ',
        featuredAll: 'બધી વિશેષતાઓ',
        featuredYes: 'વિશેષ (Featured)',
        featuredNo: 'સામાન્ય',
        sortNewest: 'છેલ્લે અપડેટ કરેલ',
        sortTitle: 'શીર્ષક (અ થી જ્ઞ)',
        addScheme: 'નવી યોજના ઉમેરો',
        editScheme: 'સરકારી યોજના સંપાદિત કરો',
        viewScheme: 'યોજનાની વિગતો',
        schemeTitleLabel: 'યોજનાનું શીર્ષક (અંગ્રેજી)',
        schemeTitleGujLabel: 'યોજનાનું શીર્ષક (ગુજરાતી)',
        schemeType: 'યોજના પ્રકાર',
        department: 'સરકારી વિભાગ',
        category: 'શ્રેણી',
        district: 'જિલ્લો (વૈકલ્પિક)',
        startDate: 'શરૂઆતની તારીખ',
        endDate: 'અંતિમ તારીખ',
        officialWebsite: 'સત્તાવાર વેબસાઇટ લિંક',
        applyLink: 'અરજી કરવાની લિંક',
        description: 'યોજનાનું વર્ણન',
        eligibility: 'પાત્રતા માપદંડ',
        benefits: 'મળવાપાત્ર લાભો',
        requiredDocuments: 'જરૂરી દસ્તાવેજો',
        statusField: 'સ્થિતિ',
        featuredField: 'વિશેષ હાઇલાઇટ કરો (Featured)',
        save: 'યોજના સાચવો',
        cancel: 'રદ કરો',
        create: 'યોજના બનાવો',
        update: 'યોજના અપડેટ કરો',
        deleteTitle: 'સરકારી યોજના કાઢી નાખો',
        deleteConfirmMsg: 'શું તમે ખરેખર આ સરકારી યોજના કાઢી નાખવા માંગો છો? આ સોફ્ટ-ડિલીટ છે જે ખેડૂત દૃશ્યથી છુપાવશે.',
        deleteConfirmBtn: 'યોજના દૂર કરો',
        actions: 'ક્રિયાઓ',
        featuredIcon: 'વિશેષ',
        central: 'કેન્દ્રીય',
        gujarat: 'ગુજરાત રાજ્ય',
        noSchemes: 'કોઈ સરકારી યોજનાઓ મળી નથી',
        noSchemesDesc: 'કૃપા કરીને તમારી શોધ ક્વેરી અથવા ફિલ્ટર્સ બદલો.',
        loading: 'યોજનાઓ લોડ થઈ રહી છે...',
        errorLoad: 'સરકારી યોજનાઓની સૂચિ પુનઃપ્રાપ્ત કરવામાં નિષ્ફળ',
        retry: 'ફરીથી પ્રયત્ન કરો',
        successCreated: 'સરકારી યોજના સફળતાપૂર્વક બનાવવામાં આવી છે',
        successUpdated: 'સરકારી યોજના સફળતાપૂર્વક અપડેટ કરવામાં આવી છે',
        successStatus: 'યોજનાની સ્થિતિ બદલાઈ ગઈ છે',
        successDeleted: 'સરકારી યોજના સફળતાપૂર્વક કાઢી નાખવામાં આવી છે',
        lang: 'ગુજરાતી (GUJ)'
    }
}

const EMPTY_FORM = {
    title: '',
    scheme_name: '',
    gujarati_name: '',
    scheme_type: 'Central',
    department: '',
    description: '',
    eligibility: '',
    benefits: '',
    required_documents: '',
    official_website: '',
    apply_link: '',
    category: '',
    district: '',
    status: 'Active',
    start_date: '',
    end_date: '',
    featured: false
}

// ─── Toast Alert ──────────────────────────────────────────────
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

// ─── Main Admin Schemes Component ──────────────────────────────
export const AdminSchemesManagement = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const t = T[lang]

    // States
    const [schemes, setSchemes] = useState([])
    const [stats, setStats] = useState({ total_schemes: 0, active_schemes: 0, expired_schemes: 0, draft_schemes: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    // Pagination/Filters
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [featuredFilter, setFeaturedFilter] = useState('')
    const [sortBy, setSortBy] = useState('updated')

    // Toast
    const [toast, setToast] = useState(null)
    const showToast = (msg, type = 'success') => setToast({ message: msg, type })

    // Modals
    const [activeModal, setActiveModal] = useState(null) // 'view' | 'create' | 'edit' | 'delete'
    const [selectedScheme, setSelectedScheme] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)

    // Load Stats & Data
    const loadStats = async () => {
        try {
            const data = await adminSchemesAPI.getStats()
            setStats(data)
        } catch (err) {
            console.error('Stats load error', err)
        }
    }

    const loadSchemes = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const params = {
                page,
                search: search.trim(),
                status: statusFilter,
                featured: featuredFilter,
                sort_by: sortBy === 'title' ? 'title' : sortBy === 'newest' ? 'newest' : 'featured'
            }
            const data = await adminSchemesAPI.getAll(params)
            setSchemes(data.results || [])
            setTotalPages(Math.ceil((data.count || 0) / 10))
        } catch (err) {
            setIsError(true)
            console.error('Schemes list load error', err)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, statusFilter, featuredFilter, sortBy])

    useEffect(() => {
        loadStats()
        loadSchemes()
    }, [loadSchemes])

    // Modals Handlers
    const handleOpenView = (scheme) => {
        setSelectedScheme(scheme)
        setActiveModal('view')
    }

    const handleOpenCreate = () => {
        setFormData(EMPTY_FORM)
        setActiveModal('create')
    }

    const handleOpenEdit = (scheme) => {
        setSelectedScheme(scheme)
        setFormData({
            title: scheme.title || scheme.scheme_name || '',
            scheme_name: scheme.scheme_name || '',
            gujarati_name: scheme.gujarati_name || '',
            scheme_type: scheme.scheme_type || 'Central',
            department: scheme.department || '',
            description: scheme.description || '',
            eligibility: scheme.eligibility || '',
            benefits: scheme.benefits || '',
            required_documents: scheme.required_documents || '',
            official_website: scheme.official_website || '',
            apply_link: scheme.apply_link || '',
            category: scheme.category || '',
            district: scheme.district || '',
            status: scheme.status || 'Active',
            start_date: scheme.start_date || '',
            end_date: scheme.end_date || '',
            featured: scheme.featured || false
        })
        setActiveModal('edit')
    }

    const handleOpenDelete = (scheme) => {
        setSelectedScheme(scheme)
        setActiveModal('delete')
    }

    // API Mutations
    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                scheme_name: formData.title // keep name and title synced
            }
            await adminSchemesAPI.create(payload)
            showToast(t.successCreated, 'success')
            setActiveModal(null)
            loadStats()
            loadSchemes()
        } catch (err) {
            showToast(err.response?.data?.scheme_name?.[0] || 'Validation failed. Check scheme redundancy.', 'error')
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                scheme_name: formData.title // keep synced
            }
            await adminSchemesAPI.update(selectedScheme.id, payload)
            showToast(t.successUpdated, 'success')
            setActiveModal(null)
            loadStats()
            loadSchemes()
        } catch (err) {
            showToast('Failed to update the scheme details.', 'error')
        }
    }

    const handleDeleteConfirm = async () => {
        try {
            await adminSchemesAPI.remove(selectedScheme.id)
            showToast(t.successDeleted, 'success')
            setActiveModal(null)
            loadStats()
            loadSchemes()
        } catch (err) {
            showToast('Error removing scheme. Try again.', 'error')
        }
    }

    const handleToggleFeatured = async (scheme) => {
        try {
            await adminSchemesAPI.update(scheme.id, { featured: !scheme.featured })
            showToast(t.successStatus, 'success')
            loadSchemes()
        } catch (err) {
            showToast('Unable to update featured setting.', 'error')
        }
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header section with Language Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FiAward className="text-emerald-600" />
                        {t.title}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={handleOpenCreate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-emerald-100 transition duration-200 text-sm flex items-center gap-2"
                    >
                        <FiPlus size={18} />
                        {t.addScheme}
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: t.totalSchemes, val: stats.total_schemes, icon: FiGrid, color: 'text-blue-500 bg-blue-50' },
                    { label: t.activeSchemes, val: stats.active_schemes, icon: FiCheckSquare, color: 'text-emerald-500 bg-emerald-50' },
                    { label: t.expiredSchemes, val: stats.expired_schemes, icon: FiClock, color: 'text-rose-500 bg-rose-50' },
                    { label: t.draftSchemes, val: stats.draft_schemes, icon: FiBookOpen, color: 'text-amber-500 bg-amber-50' }
                ].map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-semibold uppercase">{card.label}</span>
                            <h3 className="text-2xl font-bold text-slate-800 mt-2">{card.val}</h3>
                        </div>
                        <div className={`p-3.5 rounded-xl ${card.color}`}>
                            <card.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="relative w-full lg:max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {search && (
                        <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full">
                            <FiX size={16} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Status dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-white border rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-700"
                    >
                        <option value="">{t.statusAll}</option>
                        <option value="Active">{t.statusActive}</option>
                        <option value="Draft">{t.statusDraft}</option>
                        <option value="Expired">{t.statusExpired}</option>
                    </select>

                    {/* Featured dropdown */}
                    <select
                        value={featuredFilter}
                        onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                        className="bg-white border rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-700"
                    >
                        <option value="">{t.featuredAll}</option>
                        <option value="true">{t.featuredYes}</option>
                        <option value="false">{t.featuredNo}</option>
                    </select>

                    {/* Sort dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        className="bg-white border rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-700"
                    >
                        <option value="featured">{t.sortNewest}</option>
                        <option value="title">{t.sortTitle}</option>
                    </select>
                </div>
            </div>

            {/* Scheme List Table */}
            {isLoading ? (
                <Loader variant="skeleton" type="table" />
            ) : isError ? (
                <div className="bg-white p-20 rounded-2xl border text-center shadow-sm">
                    <FiAlertTriangle className="text-rose-500 mx-auto mb-4" size={40} />
                    <h3 className="text-slate-800 font-bold text-lg">{t.errorLoad}</h3>
                    <button onClick={loadSchemes} className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                        {t.retry}
                    </button>
                </div>
            ) : schemes.length === 0 ? (
                <EmptyState
                    icon={FiAlertCircle}
                    title={t.noSchemes}
                    description={t.noSchemesDesc}
                />
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase">
                                    <th className="px-6 py-4">{t.schemeTitleLabel}</th>
                                    <th className="px-6 py-4">{t.department}</th>
                                    <th className="px-6 py-4">{t.category}</th>
                                    <th className="px-6 py-4 text-center">{t.statusField}</th>
                                    <th className="px-6 py-4 text-center">{t.featuredIcon}</th>
                                    <th className="px-6 py-4 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-700 text-sm">
                                {schemes.map((scheme) => (
                                    <tr key={scheme.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{scheme.title || scheme.scheme_name}</div>
                                            {scheme.gujarati_name && <div className="text-slate-400 text-xs mt-0.5 font-normal">{scheme.gujarati_name}</div>}
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${scheme.scheme_type === 'Central' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {scheme.scheme_type}
                                                </span>
                                                {scheme.district && (
                                                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                                        <FiMapPin size={10} /> {scheme.district}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{scheme.department || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                                {scheme.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${scheme.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                                                scheme.status === 'Expired' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                {scheme.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(scheme)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${scheme.featured
                                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400'
                                                    }`}
                                            >
                                                {scheme.featured ? '★ ' + t.featuredYes : '☆ ' + t.featuredNo}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenView(scheme)}
                                                    className="p-2 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 rounded-lg transition"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(scheme)}
                                                    className="p-2 hover:bg-blue-50 hover:text-blue-700 text-slate-400 rounded-lg transition"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDelete(scheme)}
                                                    className="p-2 hover:bg-rose-50 hover:text-rose-700 text-slate-400 rounded-lg transition"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t flex items-center justify-between bg-slate-50">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="px-4 py-2 border rounded-xl text-sm bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 font-semibold shadow-sm"
                            >
                                Previous
                            </button>
                            <span className="text-slate-500 text-xs font-semibold">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="px-4 py-2 border rounded-xl text-sm bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 font-semibold shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── MODALS ───────────────────────────────────────────── */}

            {/* 1. View Detail Modal */}
            {activeModal === 'view' && selectedScheme && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-zoom-in">
                        <div className="p-6 border-b flex justify-between items-start bg-slate-50/50">
                            <div>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-600 uppercase`}>
                                    {selectedScheme.scheme_type} Scheme
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 mt-2">{selectedScheme.title || selectedScheme.scheme_name}</h3>
                                {selectedScheme.gujarati_name && <p className="text-slate-400 text-sm mt-0.5 font-medium">{selectedScheme.gujarati_name}</p>}
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><FiX size={20} /></button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
                            {/* Department / Category Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <div className="text-xs text-slate-450 uppercase font-semibold">Dept</div>
                                    <div className="text-sm font-semibold text-slate-700 mt-1">{selectedScheme.department || '—'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-450 uppercase font-semibold">Category</div>
                                    <div className="text-sm font-semibold text-slate-700 mt-1">{selectedScheme.category || 'General'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-450 uppercase font-semibold">District</div>
                                    <div className="text-sm font-semibold text-slate-700 mt-1">{selectedScheme.district || 'All Districts'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-450 uppercase font-semibold">Status</div>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${selectedScheme.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                                        selectedScheme.status === 'Expired' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        {selectedScheme.status}
                                    </span>
                                </div>
                            </div>

                            {/* Dates Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                                    <FiCalendar className="text-slate-400" size={18} />
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Start date</div>
                                        <div className="text-sm font-medium text-slate-700">{selectedScheme.start_date || 'None'}</div>
                                    </div>
                                </div>
                                <div className="border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                                    <FiCalendar className="text-slate-400" size={18} />
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">End date</div>
                                        <div className="text-sm font-medium text-slate-700">{selectedScheme.end_date || 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Blocks */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                                    <p className="text-slate-650 text-sm mt-1.5 leading-relaxed bg-slate-50/20 p-3 rounded-xl border border-slate-100/50 whitespace-pre-line">{selectedScheme.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility</h4>
                                    <p className="text-slate-650 text-sm mt-1.5 leading-relaxed bg-slate-50/20 p-3 rounded-xl border border-slate-100/50 whitespace-pre-line">{selectedScheme.eligibility}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Benefits</h4>
                                    <p className="text-slate-650 text-sm mt-1.5 leading-relaxed bg-slate-50/20 p-3 rounded-xl border border-slate-100/50 whitespace-pre-line">{selectedScheme.benefits}</p>
                                </div>
                                {selectedScheme.required_documents && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Papers</h4>
                                        <p className="text-slate-650 text-sm mt-1.5 leading-relaxed bg-slate-50/20 p-3 rounded-xl border border-slate-100/50 whitespace-pre-line">{selectedScheme.required_documents}</p>
                                    </div>
                                )}
                            </div>

                            {/* Outer Web Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                {selectedScheme.official_website && (
                                    <a
                                        href={selectedScheme.official_website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <FiGlobe size={16} /> Official Information Site
                                    </a>
                                )}
                                {selectedScheme.apply_link && (
                                    <a
                                        href={selectedScheme.apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-white hover:bg-emerald-700 bg-emerald-600 px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-50"
                                    >
                                        <FiCheckSquare size={16} /> Apply Online link
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Create / Edit Form Modal */}
            {(activeModal === 'create' || activeModal === 'edit') && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-zoom-in">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FiAward className="text-emerald-600" />
                                {activeModal === 'create' ? t.addScheme : t.editScheme}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><FiX size={20} /></button>
                        </div>

                        <form onSubmit={activeModal === 'create' ? handleCreateSubmit : handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Inner grid for inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Scheme Title */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.schemeTitleLabel} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)"
                                    />
                                </div>

                                {/* Title Gujarati */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.schemeTitleGujLabel}</label>
                                    <input
                                        type="text"
                                        value={formData.gujarati_name}
                                        onChange={(e) => setFormData({ ...formData, gujarati_name: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. પીએમ કિસાન સન્માન નિધિ"
                                    />
                                </div>

                                {/* Scheme Type */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.schemeType}</label>
                                    <select
                                        value={formData.scheme_type}
                                        onChange={(e) => setFormData({ ...formData, scheme_type: e.target.value })}
                                        className="w-full bg-slate-50/55 border rounded-xl px-4 py-2.5 outline-none text-sm focus:border-emerald-500 text-slate-800"
                                    >
                                        <option value="Central">Central</option>
                                        <option value="Gujarat">Gujarat</option>
                                    </select>
                                </div>

                                {/* Department */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.department} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. Department of Agriculture"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.category} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. Subsidy, Irrigation, Insurance"
                                    />
                                </div>

                                {/* District Optional */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.district}</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. Rajkot (leave blank for all)"
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.startDate}</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.endDate}</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                    />
                                </div>

                                {/* Official Info Link */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.officialWebsite}</label>
                                    <input
                                        type="url"
                                        value={formData.official_website}
                                        onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Official Apply Link */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.applyLink}</label>
                                    <input
                                        type="url"
                                        value={formData.apply_link}
                                        onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.description} <span className="text-rose-500">*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="Provide complete scheme objective and operational details..."
                                    />
                                </div>

                                {/* Eligibility */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.eligibility} <span className="text-rose-500">*</span></label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.eligibility}
                                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="Who gets this? e.g. marginal farmers owning up to 2 hectares..."
                                    />
                                </div>

                                {/* Benefits */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.benefits} <span className="text-rose-500">*</span></label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.benefits}
                                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="Describe subventions/credits/subsidies rate..."
                                    />
                                </div>

                                {/* Required Documents */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.requiredDocuments}</label>
                                    <textarea
                                        rows={2}
                                        value={formData.required_documents}
                                        onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
                                        className="w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 outline-none focus:bg-white text-sm focus:border-emerald-500 text-slate-800"
                                        placeholder="e.g. Aadhaar Card, 7/12 Land registry records, bank passbook copies..."
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t.statusField}</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-slate-50/55 border rounded-xl px-4 py-2.5 outline-none text-sm focus:border-emerald-500 text-slate-800"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </div>

                                {/* Featured Toggle */}
                                <div className="flex items-center gap-3 pt-5">
                                    <input
                                        type="checkbox"
                                        id="featuredCheckbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-[18px] h-[18px] text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <label htmlFor="featuredCheckbox" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                        {t.featuredField}
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-5 py-2.5 border rounded-xl text-sm font-semibold text-slate-650 hover:bg-slate-55 transition"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-50 transition"
                                >
                                    {activeModal === 'create' ? t.create : t.update}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Delete confirmation Modal */}
            {activeModal === 'delete' && selectedScheme && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoom-in">
                        <div className="p-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                                <FiAlertCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{t.deleteTitle}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{t.deleteConfirmMsg}</p>
                            <div className="font-semibold text-slate-700 pt-1 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {selectedScheme.title || selectedScheme.scheme_name}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex items-center justify-end gap-2.5">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 hover:bg-slate-100 text-sm font-semibold rounded-xl text-slate-600 border bg-white"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-100"
                            >
                                {t.deleteConfirmBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
