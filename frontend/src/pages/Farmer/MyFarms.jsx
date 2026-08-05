import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import {
    FiLayers,
    FiMapPin,
    FiPlus,
    FiTrash2,
    FiEdit,
    FiSearch,
    FiX,
    FiCheck,
    FiInfo,
    FiNavigation
} from 'react-icons/fi'
import { farmAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const formatDisplay = (type, val, language) => {
    if (language !== 'gu') return val;
    const maps = {
        soil: {
            'Sandy Soil': 'રેતાળ જમીન', 'Black Cotton Soil': 'કાળી કપાસ જમીન', 'Clay Soil': 'ચીકણી જમીન', 'Loamy Soil': 'ગોરાડુ જમીન'
        },
        irrigation: {
            'Well': 'કૂવો', 'Drip Irrigation': 'ટપક સિંચાઈ', 'Sprinkler': 'ફુવારા સિંચાઈ', 'Canal': 'નહેર'
        },
        unit: {
            'Acre': 'એકર'
        }
    };
    return maps[type]?.[val] || val;
};

const toGuDigits = (str, language) => {
    if (language !== 'gu' || !str) return str;
    const gu = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/[0-9]/g, d => gu[d]);
};

// List of all 33 districts of Gujarat for the dropdown
const GUJARAT_DISTRICTS = [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
    'Botad', 'Chhota Udepur', 'Dahod', 'Devbhumi Dwarka', 'Gandhinagar', 'Gir Somnath',
    'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada',
    'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat',
    'Surendranagar', 'Tapi', 'The Dangs', 'Vadodara', 'Valsad'
]

export const MyFarms = () => {
    const { language } = useLanguage();
    const lang = (gu, en) => language === 'gu' ? gu : en;

    const [farms, setFarms] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // Modals state
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedFarm, setSelectedFarm] = useState(null)
    const [detailFarm, setDetailFarm] = useState(null)

    // Form inputs state
    const [formData, setFormData] = useState({
        farm_name: '',
        village: '',
        taluka: '',
        district: '',
        state: 'Gujarat',
        total_area: '',
        area_unit: 'Acre',
        soil_type: '',
        irrigation_type: '',
        latitude: '',
        longitude: ''
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        fetchFarms()
    }, [])

    const fetchFarms = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const res = await farmAPI.getAll()
            if (res.success && res.data) {
                setFarms(res.data)
            } else {
                setErrorMsg(res.message || 'Farms could not be retrieved.')
            }
        } catch (err) {
            console.error('Error fetching farms:', err)
            setErrorMsg(lang('કનેક્ટીવીટી સમસ્યા! કૃપા કરીને ફરી ટ્રાય કરો.', 'Connectivity issue! Please try again.'))
        } finally {
            setIsLoading(false)
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.farm_name.trim()) errors.farm_name = lang('ખેતરનું નામ લખવું ફરજિયાત છે', 'Farm name is required')
        if (!formData.village.trim()) errors.village = lang('ગામનું નામ ફરજિયાત છે', 'Village name is required')
        if (!formData.taluka.trim()) errors.taluka = lang('તાલુકો ફરજિયાત છે', 'Taluka is required')
        if (!formData.district.trim()) errors.district = lang('જિલ્લો પસંદ કરવો ફરજિયાત છે', 'Selecting district is required')

        const areaNum = parseFloat(formData.total_area)
        if (!formData.total_area) {
            errors.total_area = lang('કુલ જમીનનું માપ ફરજિયાત છે', 'Total area is required')
        } else if (isNaN(areaNum) || areaNum <= 0) {
            errors.total_area = lang('જમીનનું માપ 0 થી વધુ હોવું જોઈએ', 'Area must be greater than 0')
        }

        if (!formData.soil_type.trim()) errors.soil_type = lang('જમીનનો પ્રકાર ફરજિયાત છે', 'Soil type is required')
        if (!formData.irrigation_type.trim()) errors.irrigation_type = lang('સિંચાઈ પદ્ધતિ ફરજિયાત છે', 'Irrigation type is required')

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const openAddModal = () => {
        setSelectedFarm(null)
        setFormData({
            farm_name: '',
            village: '',
            taluka: '',
            district: '',
            state: 'Gujarat',
            total_area: '',
            area_unit: 'Acre',
            soil_type: '',
            irrigation_type: '',
            latitude: '',
            longitude: ''
        })
        setFormErrors({})
        setShowFormModal(true)
    }

    const openEditModal = (farm) => {
        setSelectedFarm(farm)
        setFormData({
            farm_name: farm.farm_name,
            village: farm.village,
            taluka: farm.taluka,
            district: farm.district,
            state: farm.state || 'Gujarat',
            total_area: farm.total_area,
            area_unit: farm.area_unit,
            soil_type: farm.soil_type,
            irrigation_type: farm.irrigation_type,
            latitude: farm.latitude || '',
            longitude: farm.longitude || ''
        })
        setFormErrors({})
        setShowFormModal(true)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const payload = {
                ...formData,
                total_area: parseFloat(formData.total_area),
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null
            }

            let res
            if (selectedFarm) {
                res = await farmAPI.update(selectedFarm.id, payload)
            } else {
                res = await farmAPI.create(payload)
            }

            if (res.success) {
                setShowFormModal(false)
                fetchFarms()
                if (detailFarm && detailFarm.id === selectedFarm?.id) {
                    setDetailFarm(res.data)
                }
            } else {
                setErrorMsg(res.message || lang('માહિતી સાચવી શકાઈ નહિ.', 'Could not save data.'))
            }
        } catch (err) {
            console.error('Error saving farm:', err)
            setErrorMsg(lang('ખેતર સાચવવામાં અડચણ આવી. વિગતો તપાસો.', 'Error saving farm. Check details.'))
        } finally {
            setIsLoading(false)
        }
    }

    const [locationLoading, setLocationLoading] = useState(false)

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Your browser does not support geolocation.')
            return
        }

        setLocationLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }))
                setLocationLoading(false)
            },
            (error) => {
                console.error("Error getting location: ", error)
                alert(lang('ભૂલ: લોકેશન મેળવી શકાયું નથી. કૃપા કરીને સ્થાનની પરવાનગી આપો.', 'Error: Could not get location. Please allow location permissions.'))
                setLocationLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    const openDeleteModal = (farm) => {
        setSelectedFarm(farm)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedFarm) return
        setIsLoading(true)
        try {
            const res = await farmAPI.delete(selectedFarm.id)
            if (res.success) {
                setShowDeleteModal(false)
                if (detailFarm?.id === selectedFarm.id) {
                    setDetailFarm(null)
                }
                fetchFarms()
            } else {
                setErrorMsg(res.message || 'Failed to delete farm.')
            }
        } catch (err) {
            console.error('Error deleting farm:', err)
            setErrorMsg(lang('ડેલીટ કરવામાં અડચણ આવી.', 'Failed to delete data.'))
        } finally {
            setIsLoading(false)
        }
    }

    // Filter farms based on query match (farm name or village name)
    const filteredFarms = farms.filter((f) => {
        const query = searchQuery.toLowerCase()
        return (
            f.farm_name.toLowerCase().includes(query) ||
            f.village.toLowerCase().includes(query) ||
            f.district.toLowerCase().includes(query)
        )
    })

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Row Layout - Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-card border border-dark/5 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
                        <span>🌱</span> {lang('મારા ખેતરો', 'My Farms')}
                    </h1>
                    <p className="text-xs text-dark-light select-none">
                        {lang('તમારા તમામ ખેતરો અને ખેતરની માહિતી એક જ જગ્યાએ સંચાલિત કરો.', 'Manage all your farms and field information in one place.')}
                    </p>
                </div>
                <Button
                    onClick={openAddModal}
                    variant="primary"
                    className="flex items-center gap-2 text-xs md:text-sm font-semibold py-2.5 px-4 rounded-btn transition-transform active:scale-95"
                >
                    <FiPlus size={16} />
                    <span>{lang('નવું ખેતર ઉમેરો', 'Add Farm')}</span>
                </Button>
            </div>

            {/* Error notifications */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded text-xs md:text-sm font-semibold flex items-center justify-between">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded">
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {/* Split Screen Layout: Farm List and Details View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Left Side: Search & Farm Cards (Takes 2 cols if detail is visible, otherwise all) */}
                <div className={`space-y-4 ${detailFarm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>

                    {/* Search Controls */}
                    <div className="relative w-full">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <input
                            type="text"
                            placeholder={lang('ખેતરનું નામ, ગામ અથવા જિલ્લો શોધો...', 'Search farm name, village or district...')}
                            className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                    {/* Farms List */}
                    {isLoading && farms.length === 0 ? (
                        <Loader variant="skeleton" type="card" count={3} />
                    ) : filteredFarms.length === 0 ? (
                        <EmptyState
                            icon={FiLayers}
                            title={lang('આ સાઈટ પર કોઈ ખેતર મળ્યું નથી', 'No farm found on this site')}
                            description={searchQuery ? lang('અન્ય કોઈ નામ અથવા વિગત ટાઈપ કરીને ફરીથી સર્ચ કરો.', 'Type another name or detail and search again.') : lang('તમારી પાસે હાલમાં સંચાલન માટે કોઈ સક્રિય જમીન રેકોર્ડ નથી. નવું ખેતર ઉમેરવા અહી પ્લસ પર ક્લિક કરો.', 'You currently have no active land records to manage. Click plus here to add a new farm.')}
                            actionText={!searchQuery ? lang("નવું ખેતર ઉમેરો", "Add Farm") : undefined}
                            onActionClick={openAddModal}
                        />
                    ) : (
                        <div className={`grid grid-cols-1 gap-4 ${detailFarm ? 'sm:grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                            {filteredFarms.map((farm) => (
                                <Card
                                    key={farm.id}
                                    hoverEffect
                                    className={`relative cursor-pointer transition-all border p-5 flex flex-col justify-between h-48 ${detailFarm && detailFarm.id === farm.id
                                        ? 'border-primary ring-1 ring-primary bg-emerald-50/10'
                                        : 'border-dark/5 bg-white'
                                        }`}
                                    onClick={() => setDetailFarm(farm)}
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-dark tracking-tight truncate max-w-[80%]">
                                                {farm.farm_name}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-emerald-55 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100 uppercase">
                                                {toGuDigits(farm.total_area, language)} {lang(farm.area_unit === 'Acre' ? 'એકર' : farm.area_unit, farm.area_unit)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-dark-light font-medium flex items-center gap-1">
                                            <FiMapPin size={12} className="text-primary-dark/65" />
                                            <span>
                                                {lang(`જિ. ${farm.district}, તા. ${farm.taluka}, ગામ. ${farm.village}`, `Dist. ${farm.district}, Tal. ${farm.taluka}, Vil. ${farm.village}`)}
                                            </span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-dark-light/90 pt-1.5 border-t border-dark/5">
                                            <div>
                                                <span className="block text-[9px] uppercase font-bold text-dark-light/65">{lang('જમીનનો પ્રકાર', 'Soil Type')}</span>
                                                <span className="font-semibold text-dark/85">{formatDisplay('soil', farm.soil_type, language)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] uppercase font-bold text-dark-light/65">{lang('સિંચાઈ પદ્ધતિ', 'Irrigation')}</span>
                                                <span className="font-semibold text-dark/85">{formatDisplay('irrigation', farm.irrigation_type, language)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 pt-3 border-t border-dark/5 mt-auto">
                                        <button
                                            aria-label="Edit farm"
                                            className="p-2 text-primary hover:bg-secondary-dark rounded-btn transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openEditModal(farm)
                                            }}
                                        >
                                            <FiEdit size={14} />
                                        </button>
                                        <button
                                            aria-label="Delete farm"
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-btn transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openDeleteModal(farm)
                                            }}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Detail Page Sidebar */}
                {detailFarm && (
                    <div className="bg-white rounded-card border border-primary/20 shadow-md p-6 space-y-4 animate-fadeIn lg:sticky lg:top-4 overflow-hidden relative">
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-4 -translate-y-4">
                            <span className="text-[120px]">🗺️</span>
                        </div>
                        <div className="flex justify-between items-start border-b border-dark/5 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-dark tracking-tight">{detailFarm.farm_name}</h2>
                                <span className="text-xs text-dark-light uppercase font-semibold">{lang('ચોક્કસ વિગતો', 'Farm Info')}</span>
                            </div>
                            <button
                                onClick={() => setDetailFarm(null)}
                                className="p-1.5 text-dark-light hover:text-dark hover:bg-secondary-dark rounded-full transition-colors"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            {/* Geographical Coordinates */}
                            <div className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-2">
                                <span className="text-[10px] font-bold text-dark-light uppercase tracking-wider block">{lang('ભૌગોલિક સ્થાન', 'Geographical Location')}</span>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-dark-light">{lang('ગામ:', 'Village:')}</span> <strong className="text-dark">{detailFarm.village}</strong>
                                    </div>
                                    <div>
                                        <span className="text-dark-light">{lang('તાલુકો:', 'Taluka:')}</span> <strong className="text-dark">{detailFarm.taluka}</strong>
                                    </div>
                                    <div>
                                        <span className="text-dark-light">{lang('જિલ્લો:', 'District:')}</span> <strong className="text-dark">{detailFarm.district}</strong>
                                    </div>
                                    <div>
                                        <span className="text-dark-light">{lang('રાજ્ય:', 'State:')}</span> <strong className="text-dark">{detailFarm.state}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-2">
                                <span className="text-[10px] font-bold text-dark-light uppercase tracking-wider block">{lang('જમીનની માહિતી', 'Specifications')}</span>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-dark-light">{lang('કુલ ક્ષેત્રફળ:', 'Total Area:')}</span>
                                        <strong className="text-dark font-extrabold">{toGuDigits(detailFarm.total_area, language)} {lang(detailFarm.area_unit === 'Acre' ? 'એકર' : detailFarm.area_unit, detailFarm.area_unit)}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-light">{lang('જમીનનો પ્રકાર:', 'Soil Type:')}</span>
                                        <strong className="text-dark">{formatDisplay('soil', detailFarm.soil_type, language)}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-light">{lang('સિંચાઈ પદ્ધતિ:', 'Irrigation Method:')}</span>
                                        <strong className="text-dark">{formatDisplay('irrigation', detailFarm.irrigation_type, language)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Map Coordinates (Optional) */}
                            <div className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-1.5 text-xs">
                                <span className="text-[10px] font-bold text-dark-light uppercase tracking-wider block">{lang('GPS લોકેશન (Coordinates)', 'GPS Coordinates')}</span>
                                <div className="grid grid-cols-2 gap-2 text-dark font-semibold">
                                    <div>Latitude: {detailFarm.latitude ? detailFarm.latitude : lang('અનુભૂતિ વગરની', 'N/A')}</div>
                                    <div>Longitude: {detailFarm.longitude ? detailFarm.longitude : lang('અનુભૂતિ વગરની', 'N/A')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex gap-2.5 pt-3 border-t border-dark/5 justify-end">
                            <Button
                                onClick={() => openEditModal(detailFarm)}
                                variant="secondary"
                                className="flex items-center gap-1.5 text-xs py-2 px-3 hover:bg-primary-light"
                            >
                                <FiEdit size={14} />
                                <span>{lang('ખેતર સંપાદિત કરો', 'Edit Farm')}</span>
                            </Button>
                            <Button
                                onClick={() => openDeleteModal(detailFarm)}
                                className="flex items-center gap-1.5 text-xs py-2 px-3 bg-red-50 text-red-600 border border-red-150 hover:bg-red-100 rounded-btn"
                            >
                                <FiTrash2 size={14} />
                                <span>{lang('ખેતર કાઢી નાખો', 'Delete Farm')}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* FARM ADD / EDIT MODAL */}
            {showFormModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <form
                        onSubmit={handleFormSubmit}
                        className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-primary px-6 py-4 text-white">
                            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                                <span>🌱</span>
                                {selectedFarm
                                    ? lang('ખેતર સંપાદિત કરો', 'Edit Farm')
                                    : lang('નવું ખેતર નોંધાવો', 'Register New Farm')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                className="p-1 hover:bg-primary-dark/80 rounded transition-colors text-white"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Body - Scrollable content */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-dark font-sans select-none">
                            {/* Farm Name */}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-dark/75 mb-1.5">
                                    {lang('ખેતરનું નામ', 'Farm Name')} <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.farm_name ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                        }`}
                                    placeholder={lang('દા.ત. મારા ઘર પાછળનું સીમ અથવા પ્લોટ A', 'e.g. Farm behind my house or Plot A')}
                                    value={formData.farm_name}
                                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                />
                                {formErrors.farm_name && (
                                    <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.farm_name}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Village */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('ગામ', 'Village')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.village ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        placeholder={lang('ગામનું નામ', 'Enter village name')}
                                        value={formData.village}
                                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                    />
                                    {formErrors.village && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.village}</span>
                                    )}
                                </div>

                                {/* Taluka */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('તાલુકો', 'Taluka')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.taluka ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        placeholder={lang('તાલુકો', 'Enter taluka')}
                                        value={formData.taluka}
                                        onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                                    />
                                    {formErrors.taluka && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.taluka}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* District */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('જિલ્લો', 'District')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <select
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.district ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    >
                                        <option value="">{lang('જિલ્લો પસંદ કરો', 'Select District')}</option>
                                        {GUJARAT_DISTRICTS.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    {formErrors.district && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.district}</span>
                                    )}
                                </div>

                                {/* State */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark-light/90 mb-1.5">{lang('રાજ્ય', 'State')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary-dark border border-dark/15 px-3.5 py-2.5 text-sm rounded-btn cursor-not-allowed"
                                        value={lang('ગુજરાત', 'Gujarat')}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Area Value */}
                                <div className="flex flex-col col-span-2">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('કુલ વિસ્તાર', 'Total Area')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.total_area ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        placeholder={lang('દા.ત. 5.5', 'e.g. 5.5')}
                                        value={formData.total_area}
                                        onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                                    />
                                    {formErrors.total_area && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.total_area}</span>
                                    )}
                                </div>

                                {/* Area Unit */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">{lang('એકમ', 'Unit')}</label>
                                    <select
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-sm rounded-btn focus:border-primary transition-colors"
                                        value={formData.area_unit}
                                        onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                                    >
                                        <option value="Acre">{lang('એકર', 'Acre')}</option>
                                        <option value="Hectare">{lang('હેક્ટર', 'Hectare')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Soil Type */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('જમીનનો પ્રકાર', 'Soil Type')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.soil_type ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        placeholder={lang('દા.ત. કાળી, લાલ અથવા ગોરાડુ જમીન', 'e.g. Sandy, Loamy or Black Cotton Soil')}
                                        value={formData.soil_type}
                                        onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                    />
                                    {formErrors.soil_type && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.soil_type}</span>
                                    )}
                                </div>

                                {/* Irrigation */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('સિંચાઈ પદ્ધતિ', 'Irrigation Type')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-sm rounded-btn transition-colors ${formErrors.irrigation_type ? 'border-red-500 focus:border-red-500' : 'border-dark/15 focus:border-primary'
                                            }`}
                                        placeholder={lang('દા.ત. ટપક સિંચાઈ, કુવો, નહેર', 'e.g. Drip Irrigation, Well, Canal')}
                                        value={formData.irrigation_type}
                                        onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                                    />
                                    {formErrors.irrigation_type && (
                                        <span className="text-[11px] text-red-650 font-bold mt-1">{formErrors.irrigation_type}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex justify-between items-end mb-2">
                                    <label className="text-xs text-dark-light font-bold">{lang('GPS સ્થાન (વૈકલ્પિક)', 'GPS Coordinates (Optional)')}</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-1.5 px-3 rounded flex items-center gap-2 transition-colors font-bold disabled:opacity-50"
                                    >
                                        <FiNavigation size={12} className={locationLoading ? 'animate-spin' : ''} />
                                        {locationLoading ? lang('મેળવવામાં આવી રહ્યું છે...', 'Fetching...') : lang('મારું વર્તમાન સ્થાન વાપરો', 'Use My Current Location')}
                                    </button>
                                </div>
                                {/* Latitude */}
                                <div className="flex flex-col">
                                    <label className="text-[11px] text-dark-light mb-1.5">{lang('અક્ષાંશ (Latitude)', 'Latitude')}</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-sm rounded-btn focus:border-primary transition-colors"
                                        placeholder="23.0225"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    />
                                </div>

                                {/* Longitude */}
                                <div className="flex flex-col">
                                    <label className="text-[11px] text-dark-light mb-1.5">{lang('રેખાંશ (Longitude)', 'Longitude')}</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-sm rounded-btn focus:border-primary transition-colors"
                                        placeholder="72.5714"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-secondary-dark border-t border-dark/5 flex justify-end gap-3.5">
                            <Button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                variant="secondary"
                                className="text-xs md:text-sm font-bold min-w-[80px]"
                                disabled={isLoading}
                            >
                                {lang('રદ કરો', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="text-xs md:text-sm font-bold min-w-[80px] bg-primary text-white hover:bg-primary-dark"
                                isLoading={isLoading}
                            >
                                {lang('સાચવો', 'Save')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && selectedFarm && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-sm w-full p-6 space-y-4 animate-scaleUp">
                        <h3 className="font-bold text-base md:text-lg text-dark flex items-center gap-2">
                            <span className="text-red-500">⚠️</span> {lang('કાઢી નાખવાની ખાતરી કરો', 'Confirm Deletion')}
                        </h3>
                        <p className="text-xs text-dark-light bg-red-50/20 p-3 rounded border border-red-100/50 leading-relaxed font-sans">
                            {lang(`શું તમે ખરેખર ખેતર "${selectedFarm.farm_name}" ની નોંધ કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં.`, `Are you sure you want to delete the farm "${selectedFarm.farm_name}"? This decision cannot be undone.`)}
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowDeleteModal(false)}
                                variant="secondary"
                                className="text-xs font-bold py-2 px-4"
                                disabled={isLoading}
                            >
                                {lang('રદ કરો', 'Cancel')}
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                className="text-xs font-bold py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-btn"
                                isLoading={isLoading}
                            >
                                {lang('ખેતર કાઢી નાખો', 'Delete Farm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyFarms
