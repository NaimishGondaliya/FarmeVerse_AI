import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiSearch,
    FiPhone,
    FiMail,
    FiMapPin,
    FiAward,
    FiClock,
    FiBookOpen,
    FiCalendar,
    FiGlobe,
    FiStar,
    FiExternalLink,
    FiX,
    FiMessageSquare
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { expertAPI } from '../../services/api'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

const translations = {
    ENG: {
        title: "Expert Consultation",
        subtitle: "Connect with certified Agriculture Experts in Gujarat to solve your farming challenges",
        searchPlaceholder: "Search experts by name, specialization, or language...",
        districtLabel: "District",
        allDistricts: "All Districts",
        specializationLabel: "Specialization",
        allSpecializations: "All Specializations",
        experience: "years experience",
        languages: "Languages",
        rating: "Rating",
        callBtn: "Call",
        emailBtn: "Email",
        viewDetails: "View Details",
        close: "Close",
        availability: "Availability",
        officeAddress: "Office Address",
        googleMapBtn: "Open in Google Maps",
        noExperts: "No Agriculture Experts Found",
        noExpertsDesc: "Try adjusting your search query, selecting another district/specialization, or resetting filters.",
        resetFilters: "Reset Filters",
        loading: "Loading Agriculture Experts...",
        errorTitle: "Failed to load experts",
        errorDesc: "An error occurred while fetching expert profiles from the server. Please try again.",
        retry: "Retry"
    },
    GUJ: {
        title: "કૃષિ નિષ્ણાત સેવાઓ",
        subtitle: "તમારા ખેતીના પ્રશ્નો અને સમસ્યાઓના ઉકેલ માટે ગુજરાતના પ્રમાણિત કૃષિ નિષ્ણાતો સાથે જોડાઓ",
        searchPlaceholder: "નિષ્ણાતનું નામ, વિશેષતા અથવા ભાષા દ્વારા શોધો...",
        districtLabel: "જિલ્લો",
        allDistricts: "બધા જિલ્લા",
        specializationLabel: "વિશેષતા",
        allSpecializations: "બધી વિશેષતાઓ",
        experience: "વર્ષનો અનુભવ",
        languages: "ભાષાઓ",
        rating: "રેટિંગ",
        callBtn: "ફોન કરો",
        emailBtn: "ઈમેલ મોકલો",
        viewDetails: "વિગતો જુઓ",
        close: "બંધ કરો",
        availability: "ઉપલબ્ધતા સમય",
        officeAddress: "ઓફિસનું સરનામું",
        googleMapBtn: "ગુગલ મેપ પર જુઓ",
        noExperts: "કોઈ કૃષિ નિષ્ણાત મળ્યા નથી",
        noExpertsDesc: "કૃપા કરીને શોધો અથવા પસંદ કરેલ જિલ્લો બદલો અથવા ફિલ્ટર સાફ કરો.",
        resetFilters: "ફિલ્ટર સાફ કરો",
        loading: "કૃષિ નિષ્ણાતોની માહિતી લોડ થઈ રહી છે...",
        errorTitle: "માહિતી મેળવવામાં નિષ્ફળતા",
        errorDesc: "સર્વરમાંથી નિષ્ણાતોની પ્રોફાઇલ લોડ કરવામાં સમસ્યા આવી છે. કૃપા કરીને ફરી ટ્રાય કરો.",
        retry: "ફરી પ્રયાસ કરો"
    }
}

// Predefined specializations for filtering
const SPECIALIZATIONS = [
    { value: 'Horticulture', label: 'Horticulture & Fruits' },
    { value: 'Pathology', label: 'Plant Pathology & Pests' },
    { value: 'Organic', label: 'Organic Farming & Soil' },
    { value: 'Agronomy', label: 'Agronomy & Crops' },
    { value: 'Irrigation', label: 'Irrigation Technology' },
    { value: 'Cotton', label: 'Cotton & Oilseeds' },
    { value: 'Dryland', label: 'Dryland Agriculture' },
    { value: 'Dairy', label: 'Dairy & Animal Husbandry' },
    { value: 'Spices', label: 'Spices Research' }
]

export const ExpertConsultation = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [experts, setExperts] = useState([])
    const [districts, setDistricts] = useState([])
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [selectedExpert, setSelectedExpert] = useState(null)

    const t = translations[lang]

    // Fetch initial list and list of districts
    const fetchData = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const [expertsRes, districtsRes] = await Promise.all([
                expertAPI.getAll(),
                expertAPI.getDistricts()
            ])
            setExperts(expertsRes || [])
            setDistricts(districtsRes || [])
        } catch (err) {
            console.error('Error fetching expert data:', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Handle search/filtering from API
    const handleSearch = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const params = {}
            if (searchQuery.trim()) {
                params.name = searchQuery.trim()
                // Also search in languages/specialization via backend
                params.language = searchQuery.trim()
                params.specialization = searchQuery.trim()
            }
            if (selectedDistrict) {
                params.district = selectedDistrict
            }
            if (selectedSpecialization) {
                // If backend does exact match we query, otherwise matches specialization
                params.specialization = selectedSpecialization
            }

            const data = await expertAPI.search(params)
            setExperts(data || [])
        } catch (err) {
            console.error('Search error:', err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    // Trigger handleSearch when filters change
    useEffect(() => {
        // debounce/skip initial fetch to avoid duplicate calls
        const delayDebounce = setTimeout(() => {
            handleSearch()
        }, 300)
        return () => clearTimeout(delayDebounce)
    }, [selectedDistrict, selectedSpecialization, searchQuery])

    const resetFilters = () => {
        setSearchQuery('')
        setSelectedDistrict('')
        setSelectedSpecialization('')
    }

    const listFilteredExperts = () => {
        return experts
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white py-12 px-4 shadow-md mb-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.title}</h1>
                        <p className="mt-2 text-emerald-100/90 text-sm md:text-base max-w-2xl">{t.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="history"
                            className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
                        >
                            {lang === 'GUJ' ? 'મારા સવાલો (My Queries)' : 'My Queries'}
                        </Link>
                        
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Search and Filter Panel */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Live Search */}
                        <div className="md:col-span-6 relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {lang === 'GUJ' ? 'શોધો (Search)' : 'Search'}
                            </label>
                            <div className="relative w-full">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t.searchPlaceholder}
                                    className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* District Dropdown */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {t.districtLabel}
                            </label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full bg-slate-50/70 border border-slate-200 px-4 py-3 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">{t.allDistricts}</option>
                                {districts.map(dist => (
                                    <option key={dist} value={dist}>{dist}</option>
                                ))}
                            </select>
                        </div>

                        {/* Specialization Dropdown */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {t.specializationLabel}
                            </label>
                            <select
                                value={selectedSpecialization}
                                onChange={(e) => setSelectedSpecialization(e.target.value)}
                                className="w-full bg-slate-50/70 border border-slate-200 px-4 py-3 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">{t.allSpecializations}</option>
                                {SPECIALIZATIONS.map(spec => (
                                    <option key={spec.value} value={spec.value}>
                                        {lang === 'GUJ' ? spec.label : spec.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
                        <h3 className="text-lg font-bold text-red-800">{t.errorTitle}</h3>
                        <p className="text-red-600/90 text-sm mt-2">{t.errorDesc}</p>
                        <button
                            onClick={fetchData}
                            className="mt-5 bg-red-800 hover:bg-red-950 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition duration-150 cursor-pointer"
                        >
                            {t.retry}
                        </button>
                    </div>
                ) : isLoading ? (
                    /* Loading Skeleton States */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded-sm w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded-sm w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="h-3 bg-slate-200 rounded-sm w-5/6"></div>
                                    <div className="h-3 bg-slate-200 rounded-sm w-2/3"></div>
                                    <div className="h-3 bg-slate-200 rounded-sm w-3/4"></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-9 bg-slate-200 rounded-md"></div>
                                    <div className="h-9 bg-slate-200 rounded-md"></div>
                                    <div className="h-9 bg-slate-200 rounded-md col-span-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listFilteredExperts().length === 0 ? (
                    <EmptyState
                        icon={FiBookOpen}
                        title={t.noExperts}
                        description={t.noExpertsDesc}
                        actionText={(searchQuery || selectedDistrict || selectedSpecialization) ? t.resetFilters : undefined}
                        onActionClick={resetFilters}
                    />
                ) : (
                    /* Expert Grid List */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {listFilteredExperts().map(expert => (
                            <div
                                key={expert.id}
                                className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden relative group"
                            >
                                {/* Rating Badge on TOP Left */}
                                <div className="absolute top-3 left-3 bg-amber-500/90 text-white font-bold py-1 px-2.5 rounded-full text-xs flex items-center gap-1.5 shadow-xs z-10">
                                    <FiStar className="fill-white" size={12} />
                                    <span>{expert.rating ? parseFloat(expert.rating).toFixed(1) : '5.0'}</span>
                                </div>

                                <div className="p-5 flex-1">
                                    {/* Expert Header details */}
                                    <div className="flex items-center gap-4 mb-4 mt-2">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center rounded-full flex-shrink-0 border border-emerald-100 overflow-hidden shadow-inner">
                                            {expert.photo ? (
                                                <img
                                                    src={expert.photo}
                                                    alt={expert.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '';
                                                    }}
                                                />
                                            ) : (
                                                <span>{getInitials(expert.name)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-850 text-base leading-tight group-hover:text-emerald-700 transition duration-150">
                                                {expert.name}
                                            </h3>
                                            <p className="text-emerald-600 text-xs font-semibold mt-1">
                                                {expert.specialization}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile Specifications */}
                                    <div className="space-y-2.5 text-slate-600 text-xs border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <FiAward className="text-slate-400 flex-shrink-0" size={14} />
                                            <span>
                                                <strong>{expert.qualification}</strong>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="text-slate-400 flex-shrink-0" size={14} />
                                            <span>
                                                {expert.experience} {t.experience}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FiMapPin className="text-slate-400 flex-shrink-0" size={14} />
                                            <span>
                                                <strong>{expert.district}</strong>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FiGlobe className="text-slate-400 flex-shrink-0" size={14} />
                                            <span className="truncate">
                                                {t.languages}: <strong>{expert.languages}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expert Card Footer Actions */}
                                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                                    <a
                                        href={`tel:${expert.phone}`}
                                        className="bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 py-2 sm:py-2.5 px-1 rounded-md text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs transition duration-150"
                                        title={t.callBtn}
                                    >
                                        <FiPhone size={13} className="text-emerald-600" />
                                        <span className="hidden sm:inline">{t.callBtn}</span>
                                    </a>
                                    <a
                                        href={`mailto:${expert.email}`}
                                        className="bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 py-2 sm:py-2.5 px-1 rounded-md text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs transition duration-150"
                                        title={t.emailBtn}
                                    >
                                        <FiMail size={13} className="text-emerald-600" />
                                        <span className="hidden sm:inline">{t.emailBtn}</span>
                                    </a>
                                    <button
                                        onClick={() => setSelectedExpert(expert)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold select-none cursor-pointer text-center flex items-center justify-center gap-1 transition duration-150 py-2"
                                    >
                                        <span className="truncate">{t.viewDetails}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Expert Detail Modal */}
            {selectedExpert && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative animate-slide-up">
                        {/* Close button top right */}
                        <button
                            onClick={() => setSelectedExpert(null)}
                            className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-250 text-slate-500 hover:text-slate-800 p-2 rounded-full transition duration-150 select-none cursor-pointer z-20"
                        >
                            <FiX size={18} />
                        </button>

                        <div className="p-6">
                            {/* Modal Header Card */}
                            <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5 mr-8">
                                <div className="w-18 h-18 bg-emerald-50 text-emerald-800 font-extrabold text-2xl flex items-center justify-center rounded-full flex-shrink-0 border border-emerald-100 overflow-hidden shadow-inner">
                                    {selectedExpert.photo ? (
                                        <img
                                            src={selectedExpert.photo}
                                            alt={selectedExpert.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '';
                                            }}
                                        />
                                    ) : (
                                        <span>{getInitials(selectedExpert.name)}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {selectedExpert.specialization}
                                    </span>
                                    <h2 className="text-xl font-extrabold text-slate-800 mt-1 leading-tight">
                                        {selectedExpert.name}
                                    </h2>
                                    <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold text-sm">
                                        <FiStar className="fill-amber-500" size={14} />
                                        <span>{selectedExpert.rating ? parseFloat(selectedExpert.rating).toFixed(1) : '5.0'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Fields grid content */}
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Qualification */}
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <FiAward /> {lang === 'GUJ' ? 'શિક્ષણ' : 'Qualification'}
                                        </div>
                                        <div className="text-sm font-bold text-slate-705">
                                            {selectedExpert.qualification}
                                        </div>
                                    </div>
                                    {/* Experience */}
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <FiCalendar /> {lang === 'GUJ' ? 'અનુભવ' : 'Experience'}
                                        </div>
                                        <div className="text-sm font-bold text-slate-705">
                                            {selectedExpert.experience} {t.experience}
                                        </div>
                                    </div>
                                </div>

                                {/* Availability schedule */}
                                <div className="bg-slate-50 p-3.5 rounded-lg flex items-start gap-3">
                                    <FiClock className="text-slate-400 mt-0.5 flex-shrink-0" size={16} />
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            {t.availability}
                                        </div>
                                        <div className="text-sm text-slate-700 font-semibold">
                                            {selectedExpert.availability}
                                        </div>
                                    </div>
                                </div>

                                {/* Office Location Address */}
                                <div className="bg-slate-50 p-3.5 rounded-lg flex items-start gap-3">
                                    <FiMapPin className="text-slate-400 mt-0.5 flex-shrink-0" size={16} />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            {t.officeAddress}
                                        </div>
                                        <div className="text-sm text-slate-700 font-semibold leading-relaxed">
                                            {selectedExpert.office_address}
                                        </div>
                                    </div>
                                </div>

                                {/* Languages */}
                                <div className="bg-slate-50 p-3.5 rounded-lg flex items-start gap-3">
                                    <FiGlobe className="text-slate-400 mt-0.5 flex-shrink-0" size={16} />
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            {t.languages}
                                        </div>
                                        <div className="text-sm text-slate-700 font-bold">
                                            {selectedExpert.languages}
                                        </div>
                                    </div>
                                </div>

                                {/* Google Maps link connection */}
                                {selectedExpert.google_map_link && (
                                    <a
                                        href={selectedExpert.google_map_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm font-bold flex items-center justify-center gap-2 select-none transition duration-150 mt-2"
                                    >
                                        <FiExternalLink />
                                        <span>{t.googleMapBtn}</span>
                                    </a>
                                )}
                            </div>

                            {/* Consultation Chat Triggers */}
                            <div className="mt-5 mb-4">
                                <Link
                                    to={`new?expertId=${selectedExpert.id}`}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition duration-150"
                                >
                                    <FiMessageSquare size={16} />
                                    <span>{lang === 'GUJ' ? 'પરામર્શ પૂછો (Ask Consultation)' : 'Ask Consultation / Chat'}</span>
                                </Link>
                            </div>

                            {/* Actions footer buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <a
                                    href={`tel:${selectedExpert.phone}`}
                                    className="bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 font-bold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition duration-150"
                                >
                                    <FiPhone className="text-emerald-600" size={16} />
                                    <span>{t.callBtn}</span>
                                </a>
                                <a
                                    href={`mailto:${selectedExpert.email}`}
                                    className="bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 font-bold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition duration-150"
                                >
                                    <FiMail className="text-emerald-600" size={16} />
                                    <span>{t.emailBtn}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper to obtain initials from names
const getInitials = (name) => {
    if (!name) return 'EX'
    const parts = name.replace("Dr. ", "").replace("Prof. ", "").trim().split(" ")
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
}

