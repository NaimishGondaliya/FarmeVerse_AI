import { useState, useEffect, useCallback, memo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiUsers, FiUserCheck, FiUserX, FiMessageSquare, FiClock,
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiToggleLeft,
    FiToggleRight, FiX, FiStar, FiMapPin, FiPhone, FiMail,
    FiAward, FiGlobe, FiCalendar, FiBookOpen, FiAlertTriangle,
    FiCheck, FiChevronDown
} from 'react-icons/fi'
import { adminExpertAPI } from '../../services/api'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

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

// ─── Translations ───────────────────────────────────────────────
const T = {
    ENG: {
        title: 'Expert Management', subtitle: 'Manage agriculture expert accounts and consultations',
        totalExperts: 'Total Experts', activeExperts: 'Active Experts', inactiveExperts: 'Inactive Experts',
        totalConsultations: 'Total Consultations', pendingMessages: 'Pending Messages',
        searchPlaceholder: 'Search by name, email, district, specialization...',
        filterAll: 'All Status', filterActive: 'Active', filterInactive: 'Inactive',
        sortNewest: 'Newest', sortRating: 'Highest Rating', sortConsultations: 'Most Consultations',
        addExpert: 'Add Expert', editExpert: 'Edit Expert', viewExpert: 'Expert Details',
        name: 'Full Name', email: 'Email', phone: 'Mobile', password: 'Password',
        confirmPassword: 'Confirm Password', qualification: 'Qualification',
        specialization: 'Specialization', experience: 'Experience (years)', district: 'District',
        languages: 'Languages', bio: 'Bio', activeStatus: 'Active Status',
        save: 'Save', cancel: 'Cancel', create: 'Create Expert', update: 'Update Expert',
        deleteTitle: 'Confirm Deactivation', deleteMsg: 'Are you sure you want to deactivate this expert? They will no longer be able to log in or receive consultations.',
        deleteConfirm: 'Deactivate', actions: 'Actions', status: 'Status', rating: 'Rating',
        consultations: 'Consultations', noExperts: 'No experts found', noExpertsDesc: 'Try changing your search or filter criteria.',
        recentConsultations: 'Recent Consultations', loading: 'Loading...', active: 'Active', inactive: 'Inactive',
        errorLoad: 'Failed to load experts', retry: 'Retry', successCreated: 'Expert created successfully',
        successUpdated: 'Expert updated successfully', successStatus: 'Expert status updated',
        successDeleted: 'Expert deactivated successfully', photo: 'Photo URL', profilePhoto: 'Profile Photo URL',
        officeAddress: 'Office Address', availability: 'Availability', googleMap: 'Google Map Link',
        lang: 'English (ENG)'
    },
    GUJ: {
        title: 'નિષ્ણાત વ્યવસ્થાપન', subtitle: 'કૃષિ નિષ્ણાત ખાતાઓ અને પરામર્શનું સંચાલન',
        totalExperts: 'કુલ નિષ્ણાતો', activeExperts: 'સક્રિય નિષ્ણાતો', inactiveExperts: 'નિષ્ક્રિય નિષ્ણાતો',
        totalConsultations: 'કુલ પરામર્શ', pendingMessages: 'બાકી સંદેશા',
        searchPlaceholder: 'નામ, ઈમેલ, જિલ્લો, વિશેષતા દ્વારા શોધો...',
        filterAll: 'બધા', filterActive: 'સક્રિય', filterInactive: 'નિષ્ક્રિય',
        sortNewest: 'સૌથી નવા', sortRating: 'ઉચ્ચ રેટિંગ', sortConsultations: 'સૌથી વધુ પરામર્શ',
        addExpert: 'નિષ્ણાત ઉમેરો', editExpert: 'નિષ્ણાત સંપાદિત કરો', viewExpert: 'નિષ્ણાત વિગતો',
        name: 'પૂરું નામ', email: 'ઈમેલ', phone: 'મોબાઈલ', password: 'પાસવર્ડ',
        confirmPassword: 'પાસવર્ડ ખાતરી', qualification: 'લાયકાત',
        specialization: 'વિશેષતા', experience: 'અનુભવ (વર્ષ)', district: 'જિલ્લો',
        languages: 'ભાષાઓ', bio: 'બાયો', activeStatus: 'સક્રિય સ્થિતિ',
        save: 'સાચવો', cancel: 'રદ કરો', create: 'નિષ્ણાત બનાવો', update: 'અપડેટ કરો',
        deleteTitle: 'નિષ્ક્રિય કરવાની પુષ્ટિ', deleteMsg: 'શું તમે ખરેખર આ નિષ્ણાતને નિષ્ક્રિય કરવા માંગો છો?',
        deleteConfirm: 'નિષ્ક્રિય કરો', actions: 'ક્રિયાઓ', status: 'સ્થિતિ', rating: 'રેટિંગ',
        consultations: 'પરામર્શ', noExperts: 'કોઈ નિષ્ણાત મળ્યા નથી', noExpertsDesc: 'શોધ અથવા ફિલ્ટર બદલો.',
        recentConsultations: 'તાજેતરના પરામર્શ', loading: 'લોડ થઈ રહ્યું છે...', active: 'સક્રિય', inactive: 'નિષ્ક્રિય',
        errorLoad: 'નિષ્ણાતો લોડ કરવામાં નિષ્ફળ', retry: 'ફરી પ્રયાસ કરો', successCreated: 'નિષ્ણાત સફળતાપૂર્વક બનાવાયા',
        successUpdated: 'નિષ્ણાત સફળતાપૂર્વક અપડેટ થયા', successStatus: 'નિષ્ણાતની સ્થિતિ અપડેટ થઈ',
        successDeleted: 'નિષ્ણાત નિષ્ક્રિય થયા', photo: 'ફોટો URL', profilePhoto: 'પ્રોફાઇલ ફોટો URL',
        officeAddress: 'ઓફિસ સરનામું', availability: 'ઉપલબ્ધતા', googleMap: 'ગુગલ મેપ લિંક',
        lang: 'ગુજરાતી (GUJ)'
    }
}

const EMPTY_FORM = {
    name: '', email: '', phone: '', password: '', confirm_password: '',
    qualification: '', specialization: '', experience: '', district: '',
    languages: 'Gujarati, English', bio: '', photo: '', profile_photo: '',
    office_address: '', availability: 'Mon-Fri 9:00 AM - 5:00 PM',
    google_map_link: '', active_status: true
}

const getInitials = (n) => {
    if (!n) return 'EX'
    const p = n.replace('Dr. ', '').replace('Prof. ', '').trim().split(' ')
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase()
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

// ─── Form Field — module-level to prevent re-mount on every render ───
const Field = memo(({ label, name, type = 'text', required, textarea, form, setForm, formErrors, t }) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="w-full flex flex-col font-sans">
            {label && (
                <label className="text-xs md:text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1 select-none">
                    {label}
                    {required && <span className="text-red-500 font-bold">*</span>}
                </label>
            )}

            <div className="relative flex items-center h-[46px]">
                {textarea ? (
                    <textarea
                        value={form[name] || ''}
                        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                        rows={3}
                        className={`w-full bg-white text-dark placeholder:text-dark-light/40 px-4 py-3 rounded-btn border text-sm transition-all duration-200 outline-none ${
                            formErrors[name]
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-red-50/5 animate-shake'
                                : 'border-dark/15 focus:border-primary focus:ring-2 focus:ring-primary/10'
                        }`}
                    />
                ) : name === 'active_status' ? (
                    <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, active_status: !f.active_status }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-btn border text-sm font-bold transition duration-200 select-none ${
                            form.active_status 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                        }`}
                    >
                        {form.active_status ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        {form.active_status ? t.active : t.inactive}
                    </button>
                ) : (
                    <>
                        <input
                            type={inputType}
                            value={form[name] || ''}
                            onChange={e => setForm(f => ({ ...f, [name]: type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }))}
                            className={`w-full h-full bg-white text-dark placeholder:text-dark-light/40 px-4 rounded-btn border text-sm transition-all duration-200 outline-none ${
                                isPassword ? 'pr-11' : ''
                            } ${
                                formErrors[name]
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-red-50/5 animate-shake'
                                    : 'border-dark/15 focus:border-primary focus:ring-2 focus:ring-primary/10'
                            }`}
                        />
                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-light/60 hover:text-dark outline-none cursor-pointer flex items-center justify-center transition-colors z-10"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        )}
                    </>
                )}
            </div>

            {formErrors[name] && (
                <span className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1 animate-fadeIn">
                    <FiAlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                    <span>{formErrors[name]}</span>
                </span>
            )}
        </div>
    )
})

// ─── Modal Wrapper — module-level to prevent re-mount on every render ─
const Modal = ({ show, onClose, title, children, wide }) => {
    if (!show) return null
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 z-50 overflow-y-auto animate-fadeIn" onClick={onClose}>
            <div className={`bg-white rounded-2xl shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'} w-full my-8 relative animate-scaleUp`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"><FiX size={18} /></button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────
export const AdminExpertManagement = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const t = T[lang]

    // Data
    const [experts, setExperts] = useState([])
    const [stats, setStats] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    // Search/filter/sort
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    // Modals
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedExpert, setSelectedExpert] = useState(null)
    const [viewData, setViewData] = useState(null)

    // Form
    const [form, setForm] = useState({ ...EMPTY_FORM })
    const [formErrors, setFormErrors] = useState({})
    const [isSaving, setIsSaving] = useState(false)

    // Toast
    const [toast, setToast] = useState(null)
    const showToast = (message, type = 'success') => setToast({ message, type })

    // ─── Fetch ──────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const params = {}
            if (search.trim()) params.search = search.trim()
            if (statusFilter) params.status = statusFilter
            if (sortBy) params.sort = sortBy
            const [expertsList, statsData] = await Promise.all([
                adminExpertAPI.getAll(params),
                adminExpertAPI.getStats()
            ])
            setExperts(expertsList || [])
            setStats(statsData || {})
        } catch (err) {
            console.error('Load error:', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }, [search, statusFilter, sortBy])

    useEffect(() => {
        const delay = setTimeout(() => fetchAll(), 300)
        return () => clearTimeout(delay)
    }, [fetchAll])

    // ─── CRUD Handlers ──────────────────────────────────────────
    const openAdd = () => { setForm({ ...EMPTY_FORM }); setFormErrors({}); setShowAddModal(true) }

    const openEdit = (expert) => {
        setSelectedExpert(expert)
        setForm({
            name: expert.name || '', email: expert.email || '', phone: expert.phone || '',
            password: '', confirm_password: '',
            qualification: expert.qualification || '', specialization: expert.specialization || '',
            experience: expert.experience || '', district: expert.district || '',
            languages: expert.languages || '', bio: expert.bio || '',
            photo: expert.photo || '', profile_photo: expert.profile_photo || '',
            office_address: expert.office_address || '', availability: expert.availability || '',
            google_map_link: expert.google_map_link || '', active_status: expert.active_status
        })
        setFormErrors({})
        setShowEditModal(true)
    }

    const openView = async (expert) => {
        try {
            const data = await adminExpertAPI.getById(expert.id)
            setViewData(data)
            setShowViewModal(true)
        } catch (err) {
            showToast('Failed to load details', 'error')
        }
    }

    const openDelete = (expert) => { setSelectedExpert(expert); setShowDeleteModal(true) }

    const validateForm = (isEdit = false) => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Required'
        if (!form.email.trim()) errs.email = 'Required'
        if (!form.phone.trim()) errs.phone = 'Required'
        if (!isEdit) {
            if (!form.password) errs.password = 'Required'
            if (form.password && form.password.length < 6) errs.password = 'Min 6 characters'
            if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
        } else {
            if (form.password && form.password.length < 6) errs.password = 'Min 6 characters'
            if (form.password && form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
        }
        if (!form.qualification.trim()) errs.qualification = 'Required'
        if (!form.specialization.trim()) errs.specialization = 'Required'
        if (!form.district.trim()) errs.district = 'Required'
        if (!form.experience && form.experience !== 0) errs.experience = 'Required'
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleCreate = async () => {
        if (!validateForm(false)) return
        setIsSaving(true)
        try {
            await adminExpertAPI.create(form)
            showToast(t.successCreated)
            setShowAddModal(false)
            fetchAll()
        } catch (err) {
            const data = err.response?.data
            if (data) {
                const errs = {}
                Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? v[0] : v })
                setFormErrors(errs)
            } else { showToast('Creation failed', 'error') }
        } finally { setIsSaving(false) }
    }

    const handleUpdate = async () => {
        if (!validateForm(true)) return
        setIsSaving(true)
        try {
            const payload = { ...form }
            if (!payload.password) { delete payload.password; delete payload.confirm_password }
            delete payload.confirm_password
            await adminExpertAPI.update(selectedExpert.id, payload)
            showToast(t.successUpdated)
            setShowEditModal(false)
            fetchAll()
        } catch (err) {
            const data = err.response?.data
            if (data) {
                const errs = {}
                Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? v[0] : v })
                setFormErrors(errs)
            } else { showToast('Update failed', 'error') }
        } finally { setIsSaving(false) }
    }

    const handleDelete = async () => {
        setIsSaving(true)
        try {
            await adminExpertAPI.remove(selectedExpert.id)
            showToast(t.successDeleted)
            setShowDeleteModal(false)
            fetchAll()
        } catch { showToast('Deactivation failed', 'error') }
        finally { setIsSaving(false) }
    }

    const handleToggleStatus = async (expert) => {
        try {
            await adminExpertAPI.toggleStatus(expert.id, !expert.active_status)
            showToast(t.successStatus)
            fetchAll()
        } catch { showToast('Status update failed', 'error') }
    }

    // ─── Dashboard Cards ────────────────────────────────────────
    const cards = [
        { label: t.totalExperts, value: stats.total_experts ?? '—', icon: FiUsers, color: 'emerald' },
        { label: t.activeExperts, value: stats.active_experts ?? '—', icon: FiUserCheck, color: 'green' },
        { label: t.inactiveExperts, value: stats.inactive_experts ?? '—', icon: FiUserX, color: 'red' },
        { label: t.totalConsultations, value: stats.total_consultations ?? '—', icon: FiMessageSquare, color: 'blue' },
        { label: t.pendingMessages, value: stats.pending_messages ?? '—', icon: FiClock, color: 'amber' }
    ]
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    }
    const iconBg = {
        emerald: 'bg-emerald-100 text-emerald-700',
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700'
    }

    // ─── Render ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 animate-fadeIn">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 pt-6 mb-8 animate-fadeIn">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-700 text-white p-6 md:p-10 shadow-lg border border-emerald-850/20">
                    <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none select-none translate-x-4 translate-y-4 hidden md:block">
                        <span className="text-[200px]">🌾</span>
                    </div>
                    <div className="absolute left-[-50px] top-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    
                    <div className="max-w-3xl space-y-3.5 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-accent border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            એડમિન પોર્ટલ • Admin Control Center
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{t.title}</h1>
                        <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
                    {cards.map((c, i) => {
                        const Icon = c.icon
                        return (
                            <div key={i} className={`rounded-2xl border p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${colorMap[c.color]}`}>
                                <div>
                                    <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider leading-none">{c.label}</p>
                                    <h3 className="text-2xl font-black mt-3.5 tracking-tight">
                                        {typeof c.value === 'number' || !isNaN(Number(c.value)) ? (
                                            <AnimatedCounter value={c.value} />
                                        ) : (
                                            c.value
                                        )}
                                    </h3>
                                </div>
                                <div className={`self-end p-2.5 rounded-xl shadow-xs mt-4 flex items-center justify-center ${iconBg[c.color]}`}>
                                    <Icon size={18} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Search / Filter / Sort / Add */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        {/* Search */}
                        <div className="flex-1 relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"><FiX size={16} /></button>}
                        </div>
                        {/* Status Filter */}
                        <div className="relative">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="appearance-none bg-slate-50/70 border border-slate-200 px-4 py-2.5 pr-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                                <option value="">{t.filterAll}</option>
                                <option value="active">{t.filterActive}</option>
                                <option value="inactive">{t.filterInactive}</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                        {/* Sort */}
                        <div className="relative">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="appearance-none bg-slate-50/70 border border-slate-200 px-4 py-2.5 pr-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                                <option value="newest">{t.sortNewest}</option>
                                <option value="rating">{t.sortRating}</option>
                                <option value="consultations">{t.sortConsultations}</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                        {/* Add Button */}
                        <button onClick={openAdd}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 text-sm shadow-xs transition select-none whitespace-nowrap">
                            <FiPlus size={16} /> {t.addExpert}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                {isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                        <FiAlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                        <h3 className="text-lg font-bold text-red-800">{t.errorLoad}</h3>
                        <button onClick={fetchAll} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition">{t.retry}</button>
                    </div>
                ) : isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                </div>
                                <div className="h-8 w-20 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : experts.length === 0 ? (
                    <EmptyState
                        icon={FiBookOpen}
                        title={t.noExperts}
                        description={t.noExpertsDesc}
                    />
                ) : (
                    /* Expert Table */
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Expert</th>
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">{t.specialization}</th>
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">{t.district}</th>
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden xl:table-cell">{t.email}</th>
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden xl:table-cell">{t.phone}</th>
                                        <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">{t.experience}</th>
                                        <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.status}</th>
                                        <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">{t.consultations}</th>
                                        <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">{t.rating}</th>
                                        <th className="text-center px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {experts.map(exp => (
                                        <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                                            {/* Expert Name + Avatar */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-100 overflow-hidden">
                                                        {exp.photo ? <img src={exp.photo} alt="" className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '' }} /> : getInitials(exp.name)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 whitespace-nowrap">{exp.name}</div>
                                                        <div className="text-xs text-slate-400 lg:hidden">{exp.specialization}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{exp.specialization}</td>
                                            <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{exp.district}</td>
                                            <td className="px-4 py-3 text-slate-500 hidden xl:table-cell text-xs">{exp.email}</td>
                                            <td className="px-4 py-3 text-slate-500 hidden xl:table-cell text-xs">{exp.phone}</td>
                                            <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{exp.experience}y</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${exp.active_status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {exp.active_status ? t.active : t.inactive}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-600 hidden sm:table-cell">{exp.consultation_count ?? exp.total_consultations ?? 0}</td>
                                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                                    <FiStar className="fill-amber-500" size={12} />
                                                    {exp.rating ? parseFloat(exp.rating).toFixed(1) : '0.0'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openView(exp)} title="View" className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"><FiEye size={15} /></button>
                                                    <button onClick={() => openEdit(exp)} title="Edit" className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition"><FiEdit2 size={15} /></button>
                                                    <button onClick={() => handleToggleStatus(exp)} title={exp.active_status ? 'Deactivate' : 'Activate'}
                                                        className={`p-1.5 rounded-md transition ${exp.active_status ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                                                        {exp.active_status ? <FiToggleRight size={15} /> : <FiToggleLeft size={15} />}
                                                    </button>
                                                    <button onClick={() => openDelete(exp)} title="Deactivate" className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition"><FiTrash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Add Expert Modal ─────────────────────────────────── */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title={t.addExpert} wide>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    <Field label={t.name} name="name" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.email} name="email" type="email" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.phone} name="phone" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.password} name="password" type="password" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.confirmPassword} name="confirm_password" type="password" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.qualification} name="qualification" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.specialization} name="specialization" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.experience} name="experience" type="number" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.district} name="district" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.languages} name="languages" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.photo} name="photo" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.activeStatus} name="active_status" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <div className="sm:col-span-2"><Field label={t.bio} name="bio" textarea form={form} setForm={setForm} formErrors={formErrors} t={t} /></div>
                    <div className="sm:col-span-2"><Field label={t.officeAddress} name="office_address" textarea form={form} setForm={setForm} formErrors={formErrors} t={t} /></div>
                    <Field label={t.availability} name="availability" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.googleMap} name="google_map_link" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                </div>
                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
                    <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">{t.cancel}</button>
                    <button onClick={handleCreate} disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition disabled:opacity-50">
                        {isSaving ? t.loading : t.create}
                    </button>
                </div>
            </Modal>

            {/* ─── Edit Expert Modal ────────────────────────────────── */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={t.editExpert} wide>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    <Field label={t.name} name="name" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.email} name="email" type="email" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.phone} name="phone" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.password + ' (leave blank to keep)'} name="password" type="password" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.confirmPassword} name="confirm_password" type="password" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.qualification} name="qualification" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.specialization} name="specialization" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.experience} name="experience" type="number" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.district} name="district" required form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.languages} name="languages" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.photo} name="photo" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.activeStatus} name="active_status" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <div className="sm:col-span-2"><Field label={t.bio} name="bio" textarea form={form} setForm={setForm} formErrors={formErrors} t={t} /></div>
                    <div className="sm:col-span-2"><Field label={t.officeAddress} name="office_address" textarea form={form} setForm={setForm} formErrors={formErrors} t={t} /></div>
                    <Field label={t.availability} name="availability" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                    <Field label={t.googleMap} name="google_map_link" form={form} setForm={setForm} formErrors={formErrors} t={t} />
                </div>
                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
                    <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">{t.cancel}</button>
                    <button onClick={handleUpdate} disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition disabled:opacity-50">
                        {isSaving ? t.loading : t.update}
                    </button>
                </div>
            </Modal>

            {/* ─── View Expert Modal ────────────────────────────────── */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} title={t.viewExpert} wide>
                {viewData && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Header */}
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xl flex items-center justify-center border border-emerald-100 overflow-hidden flex-shrink-0">
                                {viewData.photo ? <img src={viewData.photo} alt="" className="w-full h-full object-cover" /> : getInitials(viewData.name)}
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-800">{viewData.name}</h3>
                                <p className="text-emerald-600 text-sm font-semibold">{viewData.specialization}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${viewData.active_status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {viewData.active_status ? t.active : t.inactive}
                                </span>
                            </div>
                        </div>
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: FiAward, label: t.qualification, val: viewData.qualification },
                                { icon: FiCalendar, label: t.experience, val: `${viewData.experience} years` },
                                { icon: FiMapPin, label: t.district, val: viewData.district },
                                { icon: FiGlobe, label: t.languages, val: viewData.languages },
                                { icon: FiMail, label: t.email, val: viewData.email },
                                { icon: FiPhone, label: t.phone, val: viewData.phone },
                                { icon: FiStar, label: t.rating, val: viewData.rating ? parseFloat(viewData.rating).toFixed(1) : '0.0' },
                                { icon: FiMessageSquare, label: t.consultations, val: viewData.consultation_count ?? viewData.total_consultations ?? 0 }
                            ].map((item, i) => {
                                const Ico = item.icon
                                return (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
                                        <Ico className="text-slate-400 flex-shrink-0" size={16} />
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                                            <div className="text-sm font-bold text-slate-700">{item.val}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {viewData.office_address && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.officeAddress}</div>
                                <div className="text-sm text-slate-700">{viewData.office_address}</div>
                            </div>
                        )}
                        {viewData.bio && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.bio}</div>
                                <div className="text-sm text-slate-700">{viewData.bio}</div>
                            </div>
                        )}
                        {/* Recent Consultations */}
                        {viewData.recent_consultations?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-2">{t.recentConsultations}</h4>
                                <div className="space-y-2">
                                    {viewData.recent_consultations.map(c => (
                                        <div key={c.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between text-sm">
                                            <div>
                                                <div className="font-bold text-slate-700">{c.subject}</div>
                                                <div className="text-xs text-slate-400">{c.farmer_name} · {new Date(c.created_date).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Pending' ? 'bg-amber-100 text-amber-700' : c.status === 'Replied' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* ─── Delete Confirmation Modal ────────────────────────── */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t.deleteTitle}>
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertTriangle className="text-red-600" size={28} />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">{t.deleteMsg}</p>
                    {selectedExpert && <p className="font-bold text-slate-800 mt-3">{selectedExpert.name}</p>}
                </div>
                <div className="flex justify-center gap-3 mt-4">
                    <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">{t.cancel}</button>
                    <button onClick={handleDelete} disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition disabled:opacity-50">
                        {isSaving ? t.loading : t.deleteConfirm}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default AdminExpertManagement
