import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
    FiSearch,
    FiX,
    FiAlertCircle,
    FiExternalLink,
    FiBookOpen,
    FiCheck
} from 'react-icons/fi'
import { farmerSchemesAPI } from '../../services/api'
import { SCHEME_TRANSLATIONS } from './schemeTranslations'

const DOC_TRANSLATIONS = {
    'Aadhaar Card': 'આધાર કાર્ડ',
    'Voter ID': 'મતદાર ઓળખપત્ર',
    'Bank Passbook': 'બેંક પાસબુક',
    'Land Records': 'જમીનના દસ્તાવેજો',
    'Sowing Details': 'વાવણીની વિગતો',
    'Identity Proof': 'ઓળખનો પુરાવો',
    'Passport Size Photographs': 'પાસપોર્ટ સાઇઝના ફોટા',
    'Address Proof': 'સરનામાનો પુરાવો',
    'Income Certificate': 'આવકનું પ્રમાણપત્ર',
    'Caste Certificate': 'જાતિનું પ્રમાણપત્ર',
    'Ration Card': 'રેશન કાર્ડ',
    '7/12 & 8-A Details': '૭/૧૨ અને ૮-અ ના ઉતારા',
    '7/12 and 8-A Extract': '૭/૧૨ અને ૮-અ ના ઉતારા',
    'Bank Account Details': 'બેંક ખાતાની વિગતો'
};

const translateDocsText = (docString, langCode) => {
    if (!docString || langCode !== 'GUJ') return docString;
    let res = String(docString);
    for (const [eng, guj] of Object.entries(DOC_TRANSLATIONS)) {
        res = res.replace(new RegExp(eng, 'gi'), guj);
    }
    return res;
};

const toGujaratiDigits = (str, langCode) => {
    if (langCode !== 'GUJ' || str == null) return str;
    const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/\d/g, d => gujDigits[d]);
};

const getLocalizedScheme = (scheme, langCode) => {
    if (!scheme) return null;
    if (langCode !== 'GUJ') return { ...scheme, display_name: scheme.scheme_name, display_subtitle: scheme.gujarati_name };
    const tr = SCHEME_TRANSLATIONS[scheme.scheme_name];
    if (tr) {
        return {
            ...scheme,
            display_name: tr.title,
            display_subtitle: scheme.scheme_name,
            description: tr.description,
            benefits: toGujaratiDigits(tr.benefits, langCode),
            eligibility: tr.eligibility,
            farmer_category: tr.farmer_category,
            crop_category: tr.crop_category
        };
    }
    return { ...scheme, display_name: scheme.gujarati_name || scheme.scheme_name, display_subtitle: scheme.scheme_name };
};

// English/Gujarati translations dictionary
const dictionary = {
    GUJ: {
        title: "🏛 સરકારી યોજનાઓ (Government Schemes)",
        subtitle: "ગુજરાતના ખેડૂતો માટે કેન્દ્રીય અને રાજ્ય સરકારની કલ્યાણકારી યોજનાઓ",
        searchPlaceholder: "યોજનાનું નામ અથવા વિગત શોધો... (દા.ત. કિસાન, વીમો)",
        filterTitle: "યોજના પ્રકાર અને લાભો:",
        eligibility: "લાયકાત (Eligibility)",
        benefits: "લાભ અને સહાય (Benefits)",
        requiredDocs: "જરૂરી દસ્તાવેજો (Required Documents)",
        officialSite: "સત્તાવાર વેબસાઇટ",
        applyNow: "અહીં અરજી કરો",
        viewDetails: "વિગતો જુઓ",
        close: "બંધ કરો",
        loading: "યોજનાઓ લોડ થઈ રહી છે...",
        noSchemes: "કોઈ મેળ ખાતી યોજના મળી નથી. કૃપા કરીને અન્ય કીવર્ડ સાથે શોધો.",
        errorTitle: "સિસ્ટમ ભૂલ (System Error)",
        errorDesc: "યોજનાઓની યાદી મેળવવામાં સમસ્યા આવી રહી છે.",
        retry: "ફરી પ્રયાસ કરો",
        farmerCategory: "લાભાર્થી શ્રેણી (Farmer Category)",
        cropCategory: "પાક પ્રકાર (Crop Category)",
        status: "સ્થિતિ",
        active: "સક્રિય",
        central: "કેન્દ્રીય યોજના",
        gujarat: "ગુજરાત રાજ્ય યોજના",
        detailsTitle: "યોજના વિગતવાર માહિતી"
    },
    ENG: {
        title: "🏛 Government Schemes",
        subtitle: "Centrally sponsored and state-level schemes to support Gujarat farmers",
        searchPlaceholder: "Search scheme name or keywords... (e.g. Kisan, Bima)",
        filterTitle: "Scheme Type & Categories:",
        eligibility: "Eligibility",
        benefits: "Benefits Summary",
        requiredDocs: "Required Documents",
        officialSite: "Official Website",
        applyNow: "Apply Now",
        viewDetails: "View Details",
        close: "Close",
        loading: "Loading government schemes...",
        noSchemes: "No matching schemes found. Try a different search input.",
        errorTitle: "System Error",
        errorDesc: "Something went wrong while fetching the schemes list.",
        retry: "Retry Collection",
        farmerCategory: "Farmer Category",
        cropCategory: "Crop Category",
        status: "Status",
        active: "Active",
        central: "Central Government Scheme",
        gujarat: "Gujarat State Scheme",
        detailsTitle: "Detailed Scheme Information"
    }
}

const FilterChipList = [
    { id: 'Central', labelGuj: 'કેન્દ્રીય (Central)', labelEng: 'Central' },
    { id: 'Gujarat', labelGuj: 'ગુજરાત (Gujarat)', labelEng: 'Gujarat' },
    { id: 'Insurance', labelGuj: 'વીમો (Insurance)', labelEng: 'Insurance' },
    { id: 'Loan', labelGuj: 'ધિરાણ / લોન (Loan)', labelEng: 'Loan' },
    { id: 'Subsidy', labelGuj: 'સહાય / Subsidy', labelEng: 'Subsidy' },
    { id: 'Organic', labelGuj: 'સજીવ ખેતી (Organic)', labelEng: 'Organic' },
    { id: 'Solar', labelGuj: 'સોલાર સોલ્યુશન (Solar)', labelEng: 'Solar' },
    { id: 'Irrigation', labelGuj: 'સિંચાઈ (Irrigation)', labelEng: 'Irrigation' }
]

export const GovernmentSchemes = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [schemes, setSchemes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(false)

    // Filter and Search conditions
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChips, setSelectedChips] = useState([])

    // Modal view states
    const [activeDetailScheme, setActiveDetailScheme] = useState(null)

    const t = dictionary[lang]

    useEffect(() => {
        loadSchemes()
    }, [])

    const loadSchemes = async () => {
        setIsLoading(true)
        setErrorMsg(false)
        try {
            const data = await farmerSchemesAPI.getAll()
            setSchemes(data)
        } catch (err) {
            console.error('Error fetching schemes:', err)
            setErrorMsg(true)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleChip = (chipId) => {
        setSelectedChips(prev => {
            if (prev.includes(chipId)) {
                return prev.filter(c => c !== chipId)
            } else {
                return [...prev, chipId]
            }
        })
    }

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    // Client side search and chip filtering
    const filteredSchemes = schemes.filter(scheme => {
        const matchesSearch = searchQuery.trim() === "" || [
            scheme.scheme_name ?? '',
            scheme.gujarati_name ?? '',
            scheme.description ?? '',
            scheme.eligibility ?? '',
            scheme.benefits ?? ''
        ].some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))

        if (selectedChips.length > 0) {
            return matchesSearch && selectedChips.every(chip => {
                if (chip === 'Central') return scheme.scheme_type === 'Central'
                if (chip === 'Gujarat') return scheme.scheme_type === 'Gujarat'

                const keywords = {
                    'Insurance': ['insurance', 'bima', 'બિમા', 'વીમો', 'વીમા', 'suraksha', 'સુરક્ષા'],
                    'Loan': ['loan', 'credit', 'kredit', 'kcc', 'ધિરાણ', 'લોન', 'ક્રેડિટ', 'વ્યાજ'],
                    'Subsidy': ['subsidy', 'સહાય', 'સબસિડી', 'અનામત', 'સહાયતા', 'મદદ'],
                    'Organic': ['organic', 'સજીવ', 'ઓર્ગેનિક', 'ગાય', 'સેન્દ્રિય', 'કુદરતી'],
                    'Solar': ['solar', 'સૂર્ય', 'સોલાર', 'વીજળી', 'surya', 'ઉર્જા'],
                    'Irrigation': ['irrigation', 'sinchai', 'સિંચાઈ', 'ટપક', 'સૂક્ષ્મ', 'કૂવો', 'પાણી']
                }[chip] || []

                const fullText = [
                    scheme.scheme_name ?? '',
                    scheme.gujarati_name ?? '',
                    scheme.description ?? '',
                    scheme.eligibility ?? '',
                    scheme.benefits ?? '',
                    scheme.crop_category ?? '',
                    scheme.farmer_category ?? ''
                ].join(' ').toLowerCase()

                return keywords.some(k => fullText.includes(k))
            })
        }

        return matchesSearch
    })

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-card border border-dark/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                        {t.title}
                    </h1>
                    <p className="text-xs text-dark-light select-none font-semibold">
                        {t.subtitle}
                    </p>
                </div>
            </div>

            {/* Error View */}
            {errorMsg && (
                <div className="p-6 rounded-card border shadow-sm bg-red-50 border-red-200 text-red-900 flex flex-col md:flex-row items-center gap-4 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 text-red-[650px] flex-shrink-0">
                        <FiAlertCircle size={24} />
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h4 className="font-extrabold text-sm">{t.errorTitle}</h4>
                        <p className="text-xs mt-1 font-semibold opacity-90">{t.errorDesc}</p>
                    </div>
                    <Button variant="primary" onClick={loadSchemes} className="text-xs font-bold py-2 px-4 rounded-btn active:scale-95 bg-primary text-white">
                        {t.retry}
                    </Button>
                </div>
            )}

            {/* Filter and Search Actions Panel */}
            <div className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-4">
                {/* Search Bar Input */}
                <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Chips */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-dark-light select-none">
                        {t.filterTitle}
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1 select-none">
                        {FilterChipList.map(chip => {
                            const isSelected = selectedChips.includes(chip.id)
                            return (
                                <button
                                    key={chip.id}
                                    onClick={() => toggleChip(chip.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 flex items-center gap-1.5 ${isSelected
                                        ? 'bg-primary text-white border-primary shadow-xs'
                                        : 'bg-secondary-dark hover:bg-dark/10 text-dark border-dark/10'
                                        }`}
                                >
                                    {isSelected && <FiCheck size={12} />}
                                    <span>{lang === 'GUJ' ? chip.labelGuj : chip.labelEng}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Loader Skeleton Grid */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-grow">
                                    <div className="h-4 bg-dark/10 rounded w-3/4"></div>
                                    <div className="h-3 bg-dark/10 rounded w-1/2"></div>
                                </div>
                                <div className="h-5 bg-dark/10 rounded w-16"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 bg-dark/10 rounded"></div>
                                <div className="h-3 bg-dark/10 rounded"></div>
                                <div className="h-3 bg-dark/10 rounded w-5/6"></div>
                            </div>
                            <div className="pt-3 border-t border-dark/5 space-y-2">
                                <div className="h-3 bg-dark/10 rounded w-2/3"></div>
                                <div className="h-3 bg-dark/10 rounded w-1/2"></div>
                            </div>
                            <div className="pt-2 flex gap-2">
                                <div className="h-9 bg-dark/10 rounded flex-grow"></div>
                                <div className="h-9 bg-dark/10 rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredSchemes.length === 0 && (
                <div className="bg-white p-12 rounded-card border border-dark/5 shadow-sm text-center max-w-lg mx-auto space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 mx-auto rounded-full bg-secondary-dark flex items-center justify-center text-dark-light">
                        <FiBookOpen size={30} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-dark text-lg">{lang === 'GUJ' ? 'યોજના મળી નથી' : 'No Schemes Found'}</h3>
                        <p className="text-xs text-dark-light font-semibold max-w-sm mx-auto leading-relaxed">
                            {t.noSchemes}
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => { handleClearSearch(); setSelectedChips([]); }} className="text-xs font-bold py-2 px-4 rounded-btn border border-dark/15 hover:bg-secondary-dark text-primary">
                        {lang === 'GUJ' ? 'બધું સાફ કરો' : 'Clear Filters'}
                    </Button>
                </div>
            )}

            {/* Schemes Cards Grid */}
            {!isLoading && filteredSchemes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {filteredSchemes.map(scheme => {
                        const localizedScheme = getLocalizedScheme(scheme, lang)
                        const showName = localizedScheme.display_name
                        const nameSubtitle = localizedScheme.display_subtitle
                        const isCentral = scheme.scheme_type === 'Central'

                        return (
                            <div key={scheme.id} className="bg-white p-6 rounded-card border border-dark/5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                                <div className="space-y-3">
                                    {/* Scheme Type & Name */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-0.5">
                                            <h3 className="font-bold text-dark text-sm md:text-base leading-snug">
                                                {showName}
                                            </h3>
                                            {nameSubtitle && (
                                                <p className="text-xs text-dark-light italic font-semibold font-sans">
                                                    {nameSubtitle}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${isCentral
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-105'
                                            : 'bg-blue-50 text-blue-800 border border-blue-105'
                                            }`}>
                                            {isCentral ? (lang === 'GUJ' ? 'કેન્દ્ર' : 'Central') : (lang === 'GUJ' ? 'ગુજરાત' : 'Gujarat')}
                                        </span>
                                    </div>

                                    {/* Short Description */}
                                    <p className="text-xs text-dark/95 leading-relaxed">
                                        {localizedScheme.description && localizedScheme.description.length > 120
                                            ? `${localizedScheme.description.slice(0, 120)}...`
                                            : localizedScheme.description}
                                    </p>

                                    {/* Highlights Area */}
                                    <div className="pt-2.5 border-t border-dark/5 text-xs space-y-1.5">
                                        <div>
                                            <span className="font-bold text-dark-light mr-1.5">{t.eligibility}:</span>
                                            <span className="text-dark font-medium">{localizedScheme.eligibility}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-dark-light mr-1.5">{t.benefits}:</span>
                                            <span className="text-dark font-medium">{localizedScheme.benefits}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-2 items-center">
                                    <Button
                                        onClick={() => setActiveDetailScheme(scheme)}
                                        className="flex-grow py-2 px-3 text-xs md:text-sm font-bold bg-primary text-white rounded-btn hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <FiBookOpen size={14} />
                                        <span>{t.viewDetails}</span>
                                    </Button>

                                    {scheme.official_website && (
                                        <a
                                            href={scheme.official_website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-btn bg-secondary-dark border border-dark/10 hover:bg-dark/10 text-primary transition-colors flex items-center justify-center"
                                            title={t.officialSite}
                                        >
                                            <FiExternalLink size={16} />
                                        </a>
                                    )}

                                    {scheme.apply_link && (
                                        <a
                                            href={scheme.apply_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-btn bg-accent text-dark font-bold text-xs hover:bg-accent-dark transition-all flex items-center gap-1"
                                            title={t.applyNow}
                                        >
                                            <span>{lang === 'GUJ' ? 'અરજી' : 'Apply'}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Scheme Details Modal */}
            {activeDetailScheme && (() => {
                const activeLocalized = getLocalizedScheme(activeDetailScheme, lang);
                return (
                    <div className="fixed inset-0 bg-dark/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div className="bg-white w-full max-w-2xl rounded-card shadow-xl overflow-hidden border border-dark/10 max-h-[85vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-dark/5 bg-primary text-white flex justify-between items-center">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mr-2 select-none border ${activeDetailScheme.scheme_type === 'Central'
                                        ? 'bg-white/10 text-white border-white/20'
                                        : 'bg-accent text-dark border-accent/20'
                                        }`}>
                                        {activeDetailScheme.scheme_type === 'Central' ? (lang === 'GUJ' ? 'કેન્દ્ર' : 'Central') : (lang === 'GUJ' ? 'ગુજરાત' : 'Gujarat')}
                                    </span>
                                    <h3 className="font-extrabold text-sm md:text-base inline-block mt-0.5 leading-snug">
                                        {activeLocalized.display_name}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setActiveDetailScheme(null)}
                                    className="p-1 rounded-btn hover:bg-white/15 text-white transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto space-y-5 text-dark text-xs md:text-sm">
                                {/* Subtitle name */}
                                {activeLocalized.display_subtitle && (
                                    <div className="bg-secondary-dark p-3 rounded-btn border border-dark/5">
                                        <p className="font-semibold text-dark-light select-none">
                                            {lang === 'GUJ' ? 'અંગ્રેજી નામ (English Title):' : 'ગુજરાતી નામ (Gujarati Name):'}
                                        </p>
                                        <p className="font-bold text-dark mt-0.5">
                                            {activeLocalized.display_subtitle}
                                        </p>
                                    </div>
                                )}

                                {/* Full Description */}
                                <div className="space-y-1.5">
                                    <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider select-none">{lang === 'GUJ' ? 'યોજનાની વિગત (Description)' : 'Scheme Description'}</h4>
                                    <p className="leading-relaxed whitespace-pre-line text-dark/95">
                                        {activeLocalized.description}
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-1.5">
                                    <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider select-none">{t.benefits}</h4>
                                    <p className="leading-relaxed whitespace-pre-line text-dark/95">
                                        {activeLocalized.benefits}
                                    </p>
                                </div>

                                {/* Eligibility */}
                                <div className="space-y-1.5">
                                    <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider select-none">{t.eligibility}</h4>
                                    <p className="leading-relaxed whitespace-pre-line text-dark/95">
                                        {activeLocalized.eligibility}
                                    </p>
                                </div>

                                {/* Required Documents */}
                                {activeLocalized.required_documents && (
                                    <div className="space-y-1.5">
                                        <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider select-none">{t.requiredDocs}</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-dark/95">
                                            {(activeLocalized.required_documents ? translateDocsText(activeLocalized.required_documents, lang) : '').split(',').map((doc, idx) => (
                                                <li key={idx} className="font-medium">{doc.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="pt-4 border-t border-dark/5 grid grid-cols-2 gap-4 text-xs font-semibold text-dark-light select-none">
                                    <div>
                                        <span className="block font-bold">{t.farmerCategory}</span>
                                        <span className="text-dark bg-secondary-dark px-2 py-0.5 rounded-sm inline-block mt-1 font-medium border border-dark/5">
                                            {activeLocalized.farmer_category || 'All Farmers'}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block font-bold">{t.cropCategory}</span>
                                        <span className="text-dark bg-secondary-dark px-2 py-0.5 rounded-sm inline-block mt-1 font-medium border border-dark/5">
                                            {activeLocalized.crop_category || 'All Crops'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-secondary-dark/60 border-t border-dark/5 flex justify-end gap-2.5 select-none">
                                <Button
                                    onClick={() => setActiveDetailScheme(null)}
                                    className="py-2 px-4 text-xs font-bold bg-white border border-dark/15 hover:bg-secondary-dark rounded-btn text-dark text-center"
                                >
                                    {t.close}
                                </Button>

                                {activeLocalized.official_website && (
                                    <a
                                        href={activeLocalized.official_website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-btn transition-colors flex items-center gap-1.5 justify-center"
                                    >
                                        <FiExternalLink size={14} />
                                        <span>{t.officialSite}</span>
                                    </a>
                                )}

                                {activeLocalized.apply_link && (
                                    <a
                                        href={activeLocalized.apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-xs font-bold bg-accent text-dark hover:bg-accent-dark rounded-btn transition-all flex items-center gap-1 justify-center shadow-xs"
                                    >
                                        <span>{t.applyNow}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    )
}


export default GovernmentSchemes
