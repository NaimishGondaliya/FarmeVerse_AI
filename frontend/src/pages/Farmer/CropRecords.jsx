import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import {
    FiLayers,
    FiPlus,
    FiTrash2,
    FiEdit,
    FiSearch,
    FiX,
    FiCheck,
    FiInfo,
    FiImage,
    FiTrendingUp,
    FiCalendar
} from 'react-icons/fi'
import { BiRupee } from 'react-icons/bi'
import { cropAPI, farmAPI, salesAPI } from '../../services/api'
import { SalesModal } from '../../components/common/SalesModal'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'

export const CropRecords = () => {
    const { formatCurrency, language } = useLanguage()
    const { t } = useTranslation()

    const lang = (guStr, enStr) => language === 'gu' ? guStr : enStr;

    const toGuDigits = (str, language) => {
        if (language !== 'gu' || !str) return String(str);
        const gu = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
        return String(str).replace(/[0-9]/g, d => gu[d]);
    };

    const formatDisplay = (type, val, language) => {
        if (language !== 'gu' || !val) return val;
        const maps = {
            crop: {
                'Groundnut': 'મગફળી', 'Cotton': 'કપાસ', 'Cumin': 'જીરું', 'Wheat': 'ઘઉં', 'Mustard': 'રાઈ', 'Castor Seed': 'દિવેલા'
            },
            season: {
                'Kharif': 'ખરીફ', 'Rabi': 'રવિ', 'Summer': 'ઉનાળુ', 'Zaid': 'ઝાયદ'
            },
            status: {
                'Sown': 'વાવણી', 'Growing': 'વૃદ્ધિ', 'Ready': 'તૈયાર', 'Harvested': 'લણણી', 'Sold': 'વેચાયેલ'
            },
            unit: {
                'Acre': 'એકર', 'Hectare': 'હેક્ટર'
            }
        };
        return maps[type]?.[val] || val;
    };
    const [crops, setCrops] = useState([])
    const [farms, setFarms] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterFarm, setFilterFarm] = useState('')
    const [filterSeason, setFilterSeason] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    // Modals state
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showSalesModal, setShowSalesModal] = useState(false)
    const [selectedCrop, setSelectedCrop] = useState(null)
    const [detailCrop, setDetailCrop] = useState(null)
    const [editSalesData, setEditSalesData] = useState(null)
    const [initialSalesData, setInitialSalesData] = useState(null)

    // Form inputs state
    const [formData, setFormData] = useState({
        farm: '',
        crop_name: '',
        crop_variety: '',
        season: 'Kharif',
        sowing_date: '',
        expected_harvest_date: '',
        harvest_date: '',
        area_used: '',
        area_unit: 'Acre',
        expected_yield: '',
        actual_yield: '',
        seed_cost: '0',
        fertilizer_cost: '0',
        pesticide_cost: '0',
        labour_cost: '0',
        other_cost: '0',
        total_cost: 0,
        selling_price: '',
        sold_quantity: '',
        crop_image: null,
        notes: '',
        crop_status: 'Sown',
        disease_status: 'Healthy'
    })
    const [imagePreview, setImagePreview] = useState('')
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        fetchCrops()
        fetchFarms()
    }, [])

    const fetchCrops = async () => {
        setIsLoading(true)
        setErrorMsg('')
        let res
        try {
            res = await cropAPI.getAll()
        } catch (err) {
            console.error('Error fetching crops:', err)
            if (err.response && err.response.status === 200) {
                setErrorMsg('પાક રેકોર્ડ્સ પ્રોસેસ કરવામાં ભૂલ આવી.')
            } else if (err.response) {
                setErrorMsg(err.response.data?.message || err.response.data?.detail || 'પાક રેકોર્ડ્સ મેળવી શકાયા નથી.')
            } else {
                setErrorMsg('કનેક્ટીવીટી સમસ્યા! કૃપા કરીને ફરી ટ્રાય કરો.')
            }
            setIsLoading(false)
            return null
        }

        try {
            if (res && res.success && res.data) {
                setCrops(res.data)
                setErrorMsg('')
                return res.data
            } else {
                setErrorMsg(res?.message || 'પાક રેકોર્ડ્સ મેળવી શકાયા નથી.')
            }
        } catch (err) {
            console.error('Error processing crops response:', err)
            setErrorMsg('પાક રેકોર્ડ્સ પ્રોસેસ કરવામાં ભૂલ આવી.')
        } finally {
            setIsLoading(false)
        }
        return null
    }

    const fetchFarms = async () => {
        try {
            const res = await farmAPI.getAll()
            if (res.success && res.data) {
                setFarms(res.data)
            }
        } catch (err) {
            console.error('Error fetching farms for dropdown:', err)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Intercept change to 'Sold' Status
        if (name === 'crop_status' && value === 'Sold') {
            if (!selectedCrop) {
                // It is a NEW crop - validate and automatically save first!
                if (!validateForm()) return;

                setIsLoading(true);
                const data = new FormData();
                const tempFormData = {
                    ...formData,
                    crop_status: 'Harvested' // Fallback status if they cancel sale
                };
                Object.keys(tempFormData).forEach(key => {
                    if (key === 'crop_image') {
                        if (tempFormData[key] instanceof File) {
                            data.append(key, tempFormData[key]);
                        }
                    } else if (tempFormData[key] !== null && tempFormData[key] !== undefined && tempFormData[key] !== '') {
                        data.append(key, tempFormData[key]);
                    }
                });

                cropAPI.create(data).then(async (res) => {
                    if (res.success) {
                        setSuccessMsg('પાક રેકોર્ડ સફળ થયો. કૃપા કરીને વેચાણની વિગતો પૂર્ણ કરો.');
                        await fetchCrops();
                        await fetchFarms();

                        const newCropId = res.data.id;
                        setEditSalesData(null);
                        setInitialSalesData({
                            crop: newCropId,
                            market_yard: '',
                            sold_quantity: formData.actual_yield || formData.expected_yield || '',
                            price_per_kg: '',
                            maxYield: formData.actual_yield || formData.expected_yield || '',
                            sale_date: new Date().toISOString().substring(0, 10),
                        });
                        setShowFormModal(false);
                        setShowSalesModal(true);
                    } else {
                        setErrorMsg(res.message || 'માહિતી સાચવી શકાઈ નહિ.');
                    }
                }).catch(err => {
                    console.error("Auto-save error: ", err);
                    setErrorMsg('માહિતી સાચવતી વખતે અણધારી સમસ્યા આવી.');
                }).finally(() => {
                    setIsLoading(false);
                });
                return;
            }

            salesAPI.getAll().then(res => {
                let existingSale = null;
                if (res.success && res.data) {
                    existingSale = res.data.find(sale => String(sale.crop) === String(selectedCrop.id));
                }

                if (existingSale) {
                    setEditSalesData(existingSale);
                    setInitialSalesData(null);
                } else {
                    setEditSalesData(null);
                    setInitialSalesData({
                        crop: selectedCrop.id,
                        market_yard: '',
                        sold_quantity: formData.actual_yield || formData.expected_yield || '',
                        price_per_kg: '',
                        maxYield: formData.actual_yield || formData.expected_yield || '',
                        sale_date: new Date().toISOString().substring(0, 10),
                    });
                }
                setShowFormModal(false);
                setShowSalesModal(true);
            }).catch(err => {
                console.error("Error fetching sales: ", err);
                alert("વેચાણ ડેટા મેળવવામાં મુશ્કેલી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.");
            });
            return; // prevent updating form so it doesn't stay 'Sold' locally if user cancels
        }

        setFormData(prev => {
            const nextData = { ...prev, [name]: value }

            // Auto-fill crop defaults
            if (['crop_name', 'sowing_date', 'area_used', 'area_unit'].includes(name)) {
                const cropDefaults = {
                    'cotton': { days: 180, yieldPerAcre: 150 },
                    'કપાસ': { days: 180, yieldPerAcre: 150 },
                    'groundnut': { days: 120, yieldPerAcre: 70 },
                    'મગફળી': { days: 120, yieldPerAcre: 70 },
                    'wheat': { days: 125, yieldPerAcre: 80 },
                    'ઘઉં': { days: 125, yieldPerAcre: 80 },
                    'cumin': { days: 110, yieldPerAcre: 25 },
                    'જીરું': { days: 110, yieldPerAcre: 25 },
                    'castor': { days: 180, yieldPerAcre: 60 },
                    'દિવેલા': { days: 180, yieldPerAcre: 60 },
                    'એરંડા': { days: 180, yieldPerAcre: 60 }
                };

                const currentCropName = (name === 'crop_name' ? value : prev.crop_name).toLowerCase().trim();
                const matchedCrop = cropDefaults[currentCropName];

                if (matchedCrop) {
                    // Update harvest date
                    if ((name === 'crop_name' || name === 'sowing_date') && nextData.sowing_date) {
                        const sDate = new Date(nextData.sowing_date);
                        sDate.setDate(sDate.getDate() + matchedCrop.days);
                        nextData.expected_harvest_date = sDate.toISOString().split('T')[0];
                    }

                    // Update expected yield
                    if (name === 'crop_name' || name === 'area_used' || name === 'area_unit') {
                        let area = parseFloat(nextData.area_used) || 1;
                        if (nextData.area_unit === 'Hectare') {
                            area = area * 2.47105;
                        }
                        const calculatedYield = Math.round(area * matchedCrop.yieldPerAcre).toString();

                        // We set expected_yield if we are reacting to a change
                        nextData.expected_yield = calculatedYield;
                    }
                }
            }

            // Auto update total cost if any cost field changes
            if (['seed_cost', 'fertilizer_cost', 'pesticide_cost', 'labour_cost', 'other_cost'].includes(name)) {
                const seed = parseFloat(nextData.seed_cost) || 0
                const fert = parseFloat(nextData.fertilizer_cost) || 0
                const pest = parseFloat(nextData.pesticide_cost) || 0
                const lab = parseFloat(nextData.labour_cost) || 0
                const oth = parseFloat(nextData.other_cost) || 0
                nextData.total_cost = seed + fert + pest + lab + oth
            }
            return nextData
        })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, crop_image: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.farm) errors.farm = 'ખેતર પસંદ કરવું ફરજિયાત છે'
        if (!formData.crop_name.trim()) errors.crop_name = 'પાકનું નામ ફરજિયાત છે'
        if (!formData.crop_variety.trim()) errors.crop_variety = 'પાકની જાત ફરજિયાત છે'
        if (!formData.sowing_date) errors.sowing_date = 'વાવણી તારીખ ફરજિયાત છે'
        if (!formData.expected_harvest_date) errors.expected_harvest_date = 'અંદાજિત લણણી તારીખ ફરજિયાત છે'

        const areaNum = parseFloat(formData.area_used)
        if (!formData.area_used) {
            errors.area_used = 'વપરાયેલ જમીનનું માપ ફરજિયાત છે'
        } else if (isNaN(areaNum) || areaNum <= 0) {
            errors.area_used = 'જમીનનું માપ 0 થી વધુ હોવું જોઈએ'
        } else if (formData.farm && (formData.crop_status === 'Sown' || formData.crop_status === 'Growing')) {
            const selectedFarm = farms.find(f => String(f.id) === String(formData.farm));
            if (selectedFarm) {
                let farmTotalAcres = parseFloat(selectedFarm.total_area) || 0;
                if (selectedFarm.area_unit === 'Hectare') farmTotalAcres *= 2.47105;

                let usedAcres = 0;
                crops.forEach(c => {
                    if (String(c.farm) === String(formData.farm) && (c.crop_status === 'Sown' || c.crop_status === 'Growing')) {
                        // Exclude the current crop if editing
                        if (selectedCrop && String(selectedCrop.id) === String(c.id)) return;

                        let cArea = parseFloat(c.area_used) || 0;
                        if (c.area_unit === 'Hectare') cArea *= 2.47105;
                        usedAcres += cArea;
                    }
                });

                const availableAcres = farmTotalAcres - usedAcres;
                let reqAcres = areaNum;
                if (formData.area_unit === 'Hectare') {
                    reqAcres *= 2.47105;
                }

                if (reqAcres > availableAcres + 0.001) {
                    const availableInReqUnit = (formData.area_unit === 'Hectare' ? availableAcres / 2.47105 : availableAcres);
                    const rounded = availableInReqUnit.toFixed(2).replace(/\.?0+$/, '');
                    const unitStr = formData.area_unit === 'Hectare' ? 'Hectare' : 'Acre';
                    errors.area_used = `Only ${rounded || 0} ${unitStr} is available in this farm.`;
                }
            }
        }

        const expYieldNum = parseFloat(formData.expected_yield)
        if (!formData.expected_yield) {
            errors.expected_yield = 'અંદાજિત ઉત્પાદન ફરજિયાત છે'
        } else if (isNaN(expYieldNum) || expYieldNum <= 0) {
            errors.expected_yield = 'અંદાજિત ઉત્પાદન 0 થી વધુ હોવું જોઈએ'
        }

        // Date logic validation
        if (formData.sowing_date && formData.expected_harvest_date) {
            if (new Date(formData.expected_harvest_date) < new Date(formData.sowing_date)) {
                errors.expected_harvest_date = 'અંદાજિત લણણી તારીખ વાવણી તારીખથી પહેલાં ન હોઈ શકે'
            }
        }
        if (formData.sowing_date && formData.harvest_date) {
            if (new Date(formData.harvest_date) < new Date(formData.sowing_date)) {
                errors.harvest_date = 'લણણી તારીખ વાવણી તારીખથી પહેલાં ન હોઈ શકે'
            }
        }

        // Negative numbers validation
        const costFields = ['seed_cost', 'fertilizer_cost', 'pesticide_cost', 'labour_cost', 'other_cost']
        costFields.forEach(field => {
            const val = parseFloat(formData[field])
            if (formData[field] && (isNaN(val) || val < 0)) {
                errors[field] = 'ખર્ચ શૂન્ય અથવા તેથી વધુ હોવો જોઈએ'
            }
        })

        if (formData.actual_yield && parseFloat(formData.actual_yield) < 0) {
            errors.actual_yield = 'વાસ્તવિક ઉત્પાદન શૂન્ય અથવા વધુ હોવું જોઈએ'
        }
        if (formData.selling_price && parseFloat(formData.selling_price) < 0) {
            errors.selling_price = 'વેચાણ કિંમત શૂન્ય અથવા વધુ હોવી જોઈએ'
        }
        if (formData.sold_quantity && parseFloat(formData.sold_quantity) < 0) {
            errors.sold_quantity = 'વેચેલો જથ્થો શૂન્ય અથવા વધુ હોવો જોઈએ'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const openAddModal = () => {
        setSelectedCrop(null)
        setFormData({
            farm: farms.length > 0 ? farms[0].id : '',
            crop_name: '',
            crop_variety: '',
            season: 'Kharif',
            sowing_date: '',
            expected_harvest_date: '',
            harvest_date: '',
            area_used: '',
            area_unit: 'Acre',
            expected_yield: '',
            actual_yield: '',
            seed_cost: '0',
            fertilizer_cost: '0',
            pesticide_cost: '0',
            labour_cost: '0',
            other_cost: '0',
            total_cost: 0,
            selling_price: '',
            sold_quantity: '',
            crop_image: null,
            notes: '',
            crop_status: 'Sown',
            disease_status: 'Healthy'
        })
        setImagePreview('')
        setFormErrors({})
        setErrorMsg('')
        setSuccessMsg('')
        setShowFormModal(true)
    }

    const openEditModal = (crop) => {
        setSelectedCrop(crop)
        setFormData({
            farm: crop.farm,
            crop_name: crop.crop_name,
            crop_variety: crop.crop_variety,
            season: crop.season,
            sowing_date: crop.sowing_date || '',
            expected_harvest_date: crop.expected_harvest_date || '',
            harvest_date: crop.harvest_date || '',
            area_used: crop.area_used,
            area_unit: crop.area_unit,
            expected_yield: crop.expected_yield,
            actual_yield: crop.actual_yield || '',
            seed_cost: crop.seed_cost || '0',
            fertilizer_cost: crop.fertilizer_cost || '0',
            pesticide_cost: crop.pesticide_cost || '0',
            labour_cost: crop.labour_cost || '0',
            other_cost: crop.other_cost || '0',
            total_cost: parseFloat(crop.total_cost) || 0,
            selling_price: crop.selling_price || '',
            sold_quantity: crop.sold_quantity || '',
            crop_image: null, // Keep file input empty by default
            notes: crop.notes || '',
            crop_status: crop.crop_status || 'Sown',
            disease_status: crop.disease_status || 'Healthy'
        })
        setImagePreview(crop.crop_image || '')
        setFormErrors({})
        setErrorMsg('')
        setSuccessMsg('')
        setShowFormModal(true)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setErrorMsg('')
        setSuccessMsg('')

        let res
        try {
            const data = new FormData()
            // Append all string/numeric parameters
            Object.keys(formData).forEach(key => {
                if (key === 'crop_image') {
                    if (formData[key] instanceof File) {
                        data.append(key, formData[key])
                    }
                } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    data.append(key, formData[key])
                }
            })

            if (selectedCrop) {
                res = await cropAPI.update(selectedCrop.id, data)
            } else {
                res = await cropAPI.create(data)
            }
        } catch (err) {
            console.error('Error saving crop:', err)
            if (err.response && err.response.status === 200) {
                setErrorMsg('માહિતી સાચવતી વખતે અણધારી સમસ્યા આવી.')
            } else if (err.response) {
                setErrorMsg(err.response.data?.message || err.response.data?.detail || 'પાક રેકોર્ડ સાચવવામાં અડચણ આવી. કૃપા કરીને વિગતો તપાસો.')
            } else {
                setErrorMsg('કનેક્ટીવીટી સમસ્યા! કૃપા કરીને ફરી ટ્રાય કરો.')
            }
            setIsLoading(false)
            return
        }

        try {
            if (res && res.success) {
                setSuccessMsg(selectedCrop ? 'પાકની માહિતી સફળતાપૂર્વક અપડેટ થઈ.' : 'પાક રેકોર્ડ સફળતાપૂર્વક ઉમેરાયો.')
                setErrorMsg('')
                setShowFormModal(false)

                const updatedCropsList = await fetchCrops()
                await fetchFarms() // Update farm areas from database

                if (detailCrop && detailCrop.id === selectedCrop?.id) {
                    const updatedCrop = updatedCropsList?.find(c => c.id === selectedCrop.id) || res.data
                    if (updatedCrop) {
                        setDetailCrop(updatedCrop)
                    }
                }
            } else {
                setErrorMsg(res?.message || 'માહિતી સાચવી શકાઈ નહિ.')
            }
        } catch (err) {
            console.error('Error processing save crop response:', err)
            setErrorMsg('માહિતી સાચવતી વખતે અણધારી સમસ્યા આવી.')
        } finally {
            setIsLoading(false)
        }
    }

    const openDeleteModal = (crop) => {
        setSelectedCrop(crop)
        setErrorMsg('')
        setSuccessMsg('')
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedCrop) return
        setIsLoading(true)
        setErrorMsg('')
        setSuccessMsg('')

        let res
        try {
            res = await cropAPI.delete(selectedCrop.id)
        } catch (err) {
            console.error('Error deleting crop:', err)
            if (err.response && err.response.status === 200) {
                setErrorMsg('કાઢી નાખવામાં મુશ્કેલી પડી.')
            } else if (err.response) {
                setErrorMsg(err.response.data?.message || err.response.data?.detail || 'કાઢી નાખવામાં મુશ્કેલી પડી.')
            } else {
                setErrorMsg('કનેક્ટીવીટી સમસ્યા! કૃપા કરીને ફરી ટ્રાય કરો.')
            }
            setIsLoading(false)
            return
        }

        try {
            if (res && res.success) {
                setSuccessMsg('પાક રેકોર્ડ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.')
                setErrorMsg('')
                setShowDeleteModal(false)
                if (detailCrop?.id === selectedCrop.id) {
                    setDetailCrop(null)
                }
                await fetchCrops()
                await fetchFarms() // Update farm areas from database
                setSelectedCrop(null)
            } else {
                setErrorMsg(res?.message || 'રેકોર્ડ કાઢી નાખવામાં નિષ્ફળતા.')
            }
        } catch (err) {
            console.error('Error processing delete response:', err)
            setErrorMsg('કાઢી નાખવામાં મુશ્કેલી પડી.')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter crops
    const filteredCrops = crops.filter(c => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = c.crop_name.toLowerCase().includes(query) || c.crop_variety.toLowerCase().includes(query)
        const matchesFarm = filterFarm ? String(c.farm) === String(filterFarm) : true
        const matchesSeason = filterSeason ? c.season === filterSeason : true
        const matchesStatus = filterStatus ? c.crop_status === filterStatus : true
        return matchesSearch && matchesFarm && matchesSeason && matchesStatus
    })

    // Active Farm Summary
    const activeSummaryFarm = filterFarm ? farms.find(f => String(f.id) === String(filterFarm)) : null;
    const utilizationRaw = activeSummaryFarm && activeSummaryFarm.total_area > 0
        ? Math.round((activeSummaryFarm.used_area / activeSummaryFarm.total_area) * 100)
        : 0;
    const utilization = Math.min(100, Math.max(0, utilizationRaw));

    // Calculations for Summary Cards
    const totalInvestment = crops.reduce((acc, curr) => acc + (parseFloat(curr.total_cost) || 0), 0)
    const activeCropsCount = crops.filter(c => c.crop_status === 'Growing' || c.crop_status === 'Sown').length
    const totalYield = crops.filter(c => c.actual_yield).reduce((acc, curr) => acc + (parseFloat(curr.actual_yield) || 0), 0)

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-card border border-dark/5 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
                        <span>🌾</span> {lang('પાક રેકોર્ડ્સ', 'Crop Records')}
                    </h1>
                    <p className="text-xs text-dark-light select-none">
                        {lang('તમારા તમામ પાકની વાવણી, ખર્ચ, તબક્કા અને ઉપજના રેકોર્ડનું સંચાલન કરો.', 'Manage sowing, expenses, stages and yield records for all your crops.')}
                    </p>
                </div>
                {farms.length === 0 ? (
                    <div className="text-red-500 font-semibold text-xs md:text-sm bg-red-50 p-2.5 rounded-lg border border-red-100">
                        {lang('પાક ઉમેરતા પહેલાં કૃપા કરીને ઓછામાં ઓછું એક ખેતર ઉમેરો.', 'Please add at least one farm before adding a crop.')}
                    </div>
                ) : (
                    <Button
                        onClick={openAddModal}
                        variant="primary"
                        className="flex items-center gap-2 text-xs md:text-sm font-semibold py-2.5 px-4 rounded-btn transition-transform active:scale-95"
                    >
                        <FiPlus size={16} />
                        <span>{lang('નવો પાક ઉમેરો', 'Add Crop')}</span>
                    </Button>
                )}
            </div>

            {/* Success & Error alerts */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-2.5 rounded text-xs md:text-sm font-semibold flex items-center justify-between">
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
                        <FiX size={16} />
                    </button>
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded text-xs md:text-sm font-semibold flex items-center justify-between">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded">
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {/* Dynamic Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="flex items-center p-4 bg-white border border-dark/5 shadow-sm rounded-card">
                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mr-4">
                        <FiLayers size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/75">{lang('સક્રિય પાક', 'Active Crops')}</span>
                        <h4 className="text-lg font-bold text-dark">{toGuDigits(activeCropsCount, language)} {lang('પાક', 'Crops')}</h4>
                    </div>
                </Card>
                <Card className="flex items-center p-4 bg-white border border-dark/5 shadow-sm rounded-card">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <BiRupee size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/75">{lang('કુલ રોકાણ', 'Total Investment')}</span>
                        <h4 className="text-lg font-bold text-dark">{toGuDigits(formatCurrency(totalInvestment), language)}</h4>
                    </div>
                </Card>
                <Card className="flex items-center p-4 bg-white border border-dark/5 shadow-sm rounded-card">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                        <FiTrendingUp size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/75">{lang('કુલ ઉપજ', 'Actual Yield')}</span>
                        <h4 className="text-lg font-bold text-dark">{totalYield > 0 ? `${toGuDigits(totalYield, language)} ${lang('મણ', 'Man')}` : lang('રેકોર્ડ નથી', 'No Records')}</h4>
                    </div>
                </Card>
            </div>

            {/* Split screen layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Listing Side */}
                <div className={`space-y-4 ${detailCrop ? 'lg:col-span-2' : 'lg:col-span-3'}`}>

                    {/* Filters Dashboard */}
                    <div className="bg-white p-4 rounded-card border border-dark/5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="relative col-span-1 sm:col-span-2 w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type="text"
                                placeholder={lang('પાકનું નામ અથવા જાત શોધો...', 'Search crop name or variety...')}
                                className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full">
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        <div>
                            <select
                                className="w-full bg-secondary-dark border border-dark/10 outline-none px-2 py-2 text-xs rounded-btn focus:border-primary"
                                value={filterFarm}
                                onChange={(e) => setFilterFarm(e.target.value)}
                            >
                                <option value="">{lang('બધા ખેતરો', 'All Farms')}</option>
                                {farms.map(f => (
                                    <option key={f.id} value={f.id}>{f.farm_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                className="w-full bg-secondary-dark border border-dark/10 outline-none px-2 py-2 text-xs rounded-btn focus:border-primary"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">{lang('બધા તબક્કાઓ', 'All Stages')}</option>
                                <option value="Sown">{formatDisplay('status', 'Sown', language)}</option>
                                <option value="Growing">{formatDisplay('status', 'Growing', language)}</option>
                                <option value="Harvested">{formatDisplay('status', 'Harvested', language)}</option>
                                <option value="Sold">{formatDisplay('status', 'Sold', language)}</option>
                            </select>
                        </div>
                    </div>

                    {/* Live Farm Summary */}
                    {activeSummaryFarm && (
                        <div className="bg-emerald-50/50 p-4 rounded-card border border-emerald-100 shadow-sm animate-fadeIn">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-dark flex items-center gap-1.5">
                                    <span>📊</span> {lang(`લાઇવ ખેતર સારાંશ (${activeSummaryFarm.farm_name})`, `Live Farm Summary (${activeSummaryFarm.farm_name})`)}
                                </h4>
                                <span className="text-xs font-bold text-primary">{toGuDigits(utilization, language)}% {lang('ઉપયોગ થયેલ', 'Utilized')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-dark-light">{lang('ખેતરનું કુલ માપ', 'Farm Area')}</span>
                                    <strong className="text-dark">{toGuDigits(activeSummaryFarm.total_area, language)} {lang(activeSummaryFarm.area_unit === 'Acre' ? 'એકર' : activeSummaryFarm.area_unit, activeSummaryFarm.area_unit)}</strong>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-red-500/80">{lang('ઉપયોગમાં લેવાયેલ', 'Used Area')}</span>
                                    <strong className="text-red-600 border-b border-red-200">{toGuDigits(activeSummaryFarm.used_area, language)} {lang(activeSummaryFarm.area_unit === 'Acre' ? 'એકર' : activeSummaryFarm.area_unit, activeSummaryFarm.area_unit)}</strong>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-emerald-600/80">Available Area</span>
                                    <strong className="text-emerald-700 border-b border-emerald-200">{activeSummaryFarm.available_area} {activeSummaryFarm.area_unit}</strong>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden flex">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${utilization > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${utilization}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Table listing */}
                    {isLoading && crops.length === 0 ? (
                        <Loader variant="skeleton" type="table" />
                    ) : filteredCrops.length === 0 ? (
                        <EmptyState
                            icon={FiLayers}
                            title={lang('કોઈ પાક રેકોર્ડ મળ્યો નથી', 'No Crop Records Found')}
                            description={searchQuery || filterFarm || filterStatus
                                ? lang('પસંદ કરેલ ફિલ્ટર્સ અથવા સર્ચ માટે કોઈ ડેટા નથી.', 'No data found for the selected filters or search.')
                                : lang('તમે હજુ સુધી કોઈપણ પાકની વિગતો દાખલ કરી નથી. પાક ઉમેરવા ઉપર પ્લસ પર ક્લિક કરો.', 'You have not entered any crop details yet. Click plus above to add a crop.')}
                            actionText={!searchQuery && !filterFarm && !filterStatus && farms.length > 0 ? lang("નવો પાક ઉમેરો", "Add Crop") : undefined}
                            onActionClick={openAddModal}
                        />
                    ) : (
                        <div className="bg-white rounded-card border border-dark/5 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase tracking-wider">
                                            <th className="p-4">{lang('પાક / જાત', 'Crop / Variety')}</th>
                                            <th className="p-4">{lang('ખેતર', 'Farm')}</th>
                                            <th className="p-4">{lang('ઋતુ', 'Season')}</th>
                                            <th className="p-4">{lang('જમીન (એકર)', 'Land (Acre)')}</th>
                                            <th className="p-4">{lang('તબક્કો', 'Status')}</th>
                                            <th className="p-4 text-right">{lang('કુલ ખર્ચ', 'Total Expense')}</th>
                                            <th className="p-4 text-center">{lang('ક્રિયાઓ', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark/5 text-xs text-dark select-none">
                                        {filteredCrops.map(crop => (
                                            <tr
                                                key={crop.id}
                                                className={`hover:bg-secondary-dark/30 transition-colors cursor-pointer ${detailCrop && detailCrop.id === crop.id ? 'bg-emerald-50/20' : ''}`}
                                                onClick={() => setDetailCrop(crop)}
                                            >
                                                <td className="p-4">
                                                    <div className="font-bold">{formatDisplay('crop', crop.crop_name, language)}</div>
                                                    <div className="text-[10px] text-dark-light font-medium">{crop.crop_variety}</div>
                                                </td>
                                                <td className="p-4 font-semibold text-dark-light/95">
                                                    {crop.farm_name || lang(`ખેતર ID: ${crop.farm}`, `Farm ID: ${crop.farm}`)}
                                                </td>
                                                <td className="p-4 font-semibold">
                                                    {formatDisplay('season', crop.season, language)}
                                                </td>
                                                <td className="p-4 font-bold text-dark-light/90">
                                                    {toGuDigits(crop.area_used, language)} {lang(crop.area_unit === 'Acre' ? 'એકર' : crop.area_unit, crop.area_unit)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${crop.crop_status === 'Sown' ? 'bg-blue-50 text-blue-750 border-blue-100' :
                                                        crop.crop_status === 'Growing' ? 'bg-orange-50 text-orange-750 border-orange-100' :
                                                            crop.crop_status === 'Harvested' ? 'bg-emerald-55 text-emerald-800 border-emerald-100' :
                                                                'bg-gray-50 text-gray-750 border-gray-100'
                                                        }`}>
                                                        {formatDisplay('status', crop.crop_status, language)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-extrabold text-dark-light/95">
                                                    {formatCurrency(parseFloat(crop.total_cost) || 0)}
                                                </td>
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            aria-label="Edit crop"
                                                            className="p-1.5 text-primary hover:bg-secondary-dark rounded-btn transition-colors"
                                                            onClick={() => openEditModal(crop)}
                                                        >
                                                            <FiEdit size={13} />
                                                        </button>
                                                        <button
                                                            aria-label="Delete crop"
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-btn transition-colors"
                                                            onClick={() => openDeleteModal(crop)}
                                                        >
                                                            <FiTrash2 size={13} />
                                                        </button>
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

                {/* Right Side: Details View Sidebar */}
                {detailCrop && (
                    <div className="bg-white rounded-card border border-primary/20 shadow-md p-6 space-y-4 animate-fadeIn lg:sticky lg:top-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start border-b border-dark/5 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-dark tracking-tight">{formatDisplay('crop', detailCrop.crop_name, language)} ({detailCrop.crop_variety})</h2>
                                <p className="text-[10px] text-dark-light font-bold select-none uppercase">{detailCrop.farm_name} • {formatDisplay('season', detailCrop.season, language)}</p>
                            </div>
                            <button
                                onClick={() => setDetailCrop(null)}
                                className="p-1.5 text-dark-light hover:text-dark hover:bg-secondary-dark rounded-full transition-colors"
                            >
                                <FiX size={15} />
                            </button>
                        </div>

                        {/* Crop Optional Image display */}
                        {detailCrop.crop_image && (
                            <div className="aspect-video w-full rounded-card overflow-hidden border border-dark/5 relative shadow-sm">
                                <img
                                    src={detailCrop.crop_image}
                                    alt={detailCrop.crop_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-3 text-xs leading-relaxed">
                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-2.5 p-3 bg-secondary-dark/60 rounded-btn border border-dark/5">
                                <div>
                                    <span className="block text-[9px] font-bold text-dark-light uppercase">{lang('વાવણી વિસ્તાર', 'Sowing Area')}</span>
                                    <span className="font-extrabold text-dark">{toGuDigits(detailCrop.area_used, language)} {lang(detailCrop.area_unit === 'Acre' ? 'એકર' : detailCrop.area_unit, detailCrop.area_unit)}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] font-bold text-dark-light uppercase">{lang('પાક આરોગ્ય', 'Crop Health')}</span>
                                    <span className={`inline-block px-1.5 py-0.2 rounded font-bold text-[9px] ${detailCrop.disease_status === 'Healthy' ? 'bg-emerald-50 text-emerald-800' :
                                        detailCrop.disease_status === 'Monitored' ? 'bg-amber-50 text-amber-800' :
                                            'bg-red-50 text-red-800'
                                        }`}>
                                        {detailCrop.disease_status === 'Healthy' ? lang('સ્વસ્થ', 'Healthy') :
                                            detailCrop.disease_status === 'Monitored' ? lang('સાવચેત', 'Monitored') :
                                                lang('રોગગ્રસ્ત', 'Infected')}
                                    </span>
                                </div>
                            </div>

                            {/* Dates Timeline */}
                            <Card className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-1.5">
                                <span className="text-[9px] font-bold text-dark-light uppercase tracking-wider block">{lang('સમયરેખા', 'Timeline')}</span>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-dark-light flex items-center gap-1"><FiCalendar size={11} /> {lang('વાવણી:', 'Sowing Date:')}</span>
                                        <strong className="text-dark">{toGuDigits(detailCrop.sowing_date, language)}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-light flex items-center gap-1"><FiCalendar size={11} /> {lang('અંદાજિત લણણી:', 'Expected Harvest:')}</span>
                                        <strong className="text-dark">{toGuDigits(detailCrop.expected_harvest_date, language)}</strong>
                                    </div>
                                    {detailCrop.harvest_date && (
                                        <div className="flex justify-between border-t border-dark/5 pt-1.5">
                                            <span className="text-emerald-700 flex items-center gap-1"><FiCheck size={12} /> {lang('વાસ્તવિક લણણી:', 'Actual Harvest:')}</span>
                                            <strong className="text-emerald-800">{toGuDigits(detailCrop.harvest_date, language)}</strong>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Costs Breakdown */}
                            <Card className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-2">
                                <div className="flex justify-between items-center border-b border-dark/5 pb-1">
                                    <span className="text-[9px] font-bold text-dark-light uppercase tracking-wider">{lang('ખર્ચ બ્રેકડાઉન', 'Cost Breakdown')}</span>
                                    <strong className="text-dark font-extrabold text-[13px]">{toGuDigits(formatCurrency(parseFloat(detailCrop.total_cost) || 0), language)}</strong>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-dark-light/95">
                                    <div className="flex justify-between"><span>{lang('બીજ:', 'Seed:')}</span><strong className="text-dark">₹{toGuDigits(detailCrop.seed_cost || 0, language)}</strong></div>
                                    <div className="flex justify-between"><span>{lang('ખાતર:', 'Fertilizer:')}</span><strong className="text-dark">₹{toGuDigits(detailCrop.fertilizer_cost || 0, language)}</strong></div>
                                    <div className="flex justify-between"><span>{lang('જંતુનાશક:', 'Pesticide:')}</span><strong className="text-dark">₹{toGuDigits(detailCrop.pesticide_cost || 0, language)}</strong></div>
                                    <div className="flex justify-between"><span>{lang('મજૂરી:', 'Labour:')}</span><strong className="text-dark">₹{toGuDigits(detailCrop.labour_cost || 0, language)}</strong></div>
                                    <div className="flex justify-between col-span-2 border-t border-dark/5 pt-1.5 mt-1">
                                        <span>{lang('અન્ય ખર્ચ:', 'Other:')}</span><strong className="text-dark">₹{toGuDigits(detailCrop.other_cost || 0, language)}</strong>
                                    </div>
                                </div>
                            </Card>

                            {/* Yield & Sell Data if Harvested/Sold */}
                            {(detailCrop.expected_yield || detailCrop.actual_yield) && (
                                <Card className="p-3 bg-secondary-dark/60 rounded-btn border border-dark/5 space-y-1.5">
                                    <span className="text-[9px] font-bold text-dark-light uppercase tracking-wider block">{lang('ઉત્પાદન વિગતો', 'Yield Metrics')}</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-dark-light">{lang('અંદાજિત ઉત્પાદન:', 'Expected Yield:')}</span>
                                            <div className="font-bold text-dark">{toGuDigits(detailCrop.expected_yield, language)} {lang('મણ', 'Man')}</div>
                                        </div>
                                        {detailCrop.actual_yield && (
                                            <div>
                                                <span className="text-[10px] text-emerald-700">{lang('વાસ્તવિક ઉત્પાદન:', 'Actual Yield:')}</span>
                                                <div className="font-extrabold text-emerald-800">{toGuDigits(detailCrop.actual_yield, language)} {lang('મણ', 'Man')}</div>
                                            </div>
                                        )}
                                    </div>
                                    {detailCrop.selling_price && (
                                        <div className="border-t border-dark/5 pt-1.5 mt-1.5 grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[10px] text-dark-light">{lang('વેચાણ કિંમત:', 'Selling Price:')}</span>
                                                <div className="font-bold text-dark">₹{toGuDigits(detailCrop.selling_price, language)} / {lang('મણ', 'Man')}</div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-dark-light">{lang('વેચેલ જથ્થો:', 'Sold Qty:')}</span>
                                                <div className="font-bold text-dark">{toGuDigits(detailCrop.sold_quantity, language)} {lang('મણ', 'Man')}</div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {/* Notes */}
                            {detailCrop.notes && (
                                <div className="p-3 bg-secondary-dark/40 rounded border border-dark/5">
                                    <span className="block text-[9px] font-bold text-dark-light uppercase">{lang('ખાસ નોંધ', 'Notes')}</span>
                                    <p className="text-dark-light text-[11px] italic mt-0.5">{detailCrop.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Drawer Actions */}
                        <div className="flex gap-2 pt-2 justify-end border-t border-dark/5">
                            <Button
                                onClick={() => openEditModal(detailCrop)}
                                variant="secondary"
                                className="flex items-center gap-1.5 text-xs py-2 px-3 self-end"
                            >
                                <FiEdit size={13} />
                                <span>{lang('સુધારો કરો', 'Edit')}</span>
                            </Button>
                            <Button
                                onClick={() => openDeleteModal(detailCrop)}
                                className="flex items-center gap-1.5 text-xs py-2 px-3 bg-red-50 text-red-650 border border-red-150 hover:bg-red-100 rounded-btn"
                            >
                                <FiTrash2 size={13} />
                                <span>{lang('કાઢી નાખો', 'Delete')}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT CROP MODAL */}
            {showFormModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <form
                        onSubmit={handleFormSubmit}
                        className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp text-sm text-dark font-sans select-none"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-primary px-6 py-4 text-white">
                            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                                <span>🌾</span>
                                {selectedCrop
                                    ? lang('પાકની વિગતો સુધારો', 'Edit Crop Record')
                                    : lang('નવો પાક રેકોર્ડ ઉમેરો', 'Add New Crop Record')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                className="p-1 hover:bg-primary-dark/80 rounded transition-colors text-white"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">

                            {/* Farm Choice & Crop Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('ખેતર પસંદ કરો', 'Select Farm')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <select
                                        name="farm"
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary ${formErrors.farm ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.farm}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">{lang('ખેતર પસંદ કરો', 'Select Farm')}</option>
                                        {farms.map(f => (
                                            <option key={f.id} value={f.id}>{f.farm_name}</option>
                                        ))}
                                    </select>
                                    {formErrors.farm && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.farm}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('ઋતુ', 'Season')}
                                    </label>
                                    <select
                                        name="season"
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary"
                                        value={formData.season}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Kharif">{lang('ખરીફ', 'Kharif')}</option>
                                        <option value="Rabi">{lang('રવિ', 'Rabi')}</option>
                                        <option value="Summer">{lang('ઉનાળુ', 'Summer')}</option>
                                        <option value="Zaid">{lang('ઝાયદ', 'Zaid')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('પાકનું નામ', 'Crop Name')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="crop_name"
                                        placeholder={lang('દા.ત. ઘઉં, કપાસ, મગફળી', 'e.g. Wheat, Cotton, Groundnut')}
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary ${formErrors.crop_name ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.crop_name}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.crop_name && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.crop_name}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('પાકની જાત', 'Variety')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="crop_variety"
                                        placeholder={lang('દા.ત. લોક-વન, GW-496', 'e.g. Lok-1, GW-496')}
                                        className={`w-full bg-white border outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary ${formErrors.crop_variety ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.crop_variety}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.crop_variety && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.crop_variety}</span>
                                    )}
                                </div>
                            </div>

                            {/* Dates Timeline */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-dark/5 pt-3.5">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('વાવણી તારીખ', 'Sowing Date')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="sowing_date"
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.sowing_date ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.sowing_date}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.sowing_date && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.sowing_date}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('અંદાજિત લણણી તારીખ', 'Expected Harvest Date')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="expected_harvest_date"
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.expected_harvest_date ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.expected_harvest_date}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.expected_harvest_date && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.expected_harvest_date}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs text-dark-light mb-1.5">
                                        {lang('વાસ્તવિક લણણી તારીખ (જો થઈ હોય)', 'Actual Harvest Date (If Done)')}
                                    </label>
                                    <input
                                        type="date"
                                        name="harvest_date"
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.harvest_date ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.harvest_date}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.harvest_date && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.harvest_date}</span>
                                    )}
                                </div>
                            </div>

                            {/* Sowing Area & Yield */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-dark/5 pt-3.5">
                                <div className="flex flex-col col-span-1">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('વાવેતર વિસ્તાર', 'Sowing Area')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="area_used"
                                        placeholder={lang('દા.ત. 3.2', 'e.g. 3.2')}
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.area_used ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.area_used}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.area_used && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.area_used}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">{lang('એકમ', 'Unit')}</label>
                                    <select
                                        name="area_unit"
                                        className="w-full bg-white border border-dark/15 outline-none px-3 py-2 text-xs rounded-btn focus:border-primary"
                                        value={formData.area_unit}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Acre">{lang('એકર', 'Acre')}</option>
                                        <option value="Hectare">{lang('હેક્ટર', 'Hectare')}</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">
                                        {lang('અંદાજિત ઉત્પાદન (મણ)', 'Expected Yield (Man)')} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="expected_yield"
                                        placeholder="દા.ત. 150"
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.expected_yield ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.expected_yield}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.expected_yield && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.expected_yield}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs text-dark-light mb-1.5">
                                        {lang('વાસ્તવિક ઉત્પાદન (મણ)', 'Actual Yield (Man)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="actual_yield"
                                        placeholder={lang('લણણી બાદ', 'After Harvest')}
                                        className={`w-full bg-white border outline-none px-3 py-2 text-xs rounded-btn focus:border-primary ${formErrors.actual_yield ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.actual_yield}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.actual_yield && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.actual_yield}</span>
                                    )}
                                </div>
                            </div>

                            {/* Costs Breakdown */}
                            <div className="border-t border-dark/5 pt-3.5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-dark uppercase tracking-wider">{lang('રોકાણ ખર્ચ', 'Investments Breakdown')}</h4>
                                    <div className="text-xs font-extrabold text-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        {lang('કુલ ખર્ચ:', 'Total Cost:')} {toGuDigits(formatCurrency(formData.total_cost), language)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-dark/75 mb-1">{lang('બીજ ખર્ચ (₹)', 'Seed Cost (₹)')}</label>
                                        <input
                                            type="number"
                                            name="seed_cost"
                                            className={`w-full bg-white border outline-none px-2.5 py-1.5 text-xs rounded-btn focus:border-primary ${formErrors.seed_cost ? 'border-red-500' : 'border-dark/15'
                                                }`}
                                            value={formData.seed_cost}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-dark/75 mb-1">{lang('ખાતર ખર્ચ (₹)', 'Fertilizer Cost (₹)')}</label>
                                        <input
                                            type="number"
                                            name="fertilizer_cost"
                                            className={`w-full bg-white border outline-none px-2.5 py-1.5 text-xs rounded-btn focus:border-primary ${formErrors.fertilizer_cost ? 'border-red-500' : 'border-dark/15'
                                                }`}
                                            value={formData.fertilizer_cost}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-dark/75 mb-1">{lang('જંતુનાશક (₹)', 'Pesticide (₹)')}</label>
                                        <input
                                            type="number"
                                            name="pesticide_cost"
                                            className={`w-full bg-white border outline-none px-2.5 py-1.5 text-xs rounded-btn focus:border-primary ${formErrors.pesticide_cost ? 'border-red-500' : 'border-dark/15'
                                                }`}
                                            value={formData.pesticide_cost}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-dark/75 mb-1">{lang('મજૂરી ખર્ચ (₹)', 'Labour Cost (₹)')}</label>
                                        <input
                                            type="number"
                                            name="labour_cost"
                                            className={`w-full bg-white border outline-none px-2.5 py-1.5 text-xs rounded-btn focus:border-primary ${formErrors.labour_cost ? 'border-red-500' : 'border-dark/15'
                                                }`}
                                            value={formData.labour_cost}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-dark/75 mb-1">{lang('અન્ય ખર્ચ (₹)', 'Other Cost (₹)')}</label>
                                        <input
                                            type="number"
                                            name="other_cost"
                                            className={`w-full bg-white border outline-none px-2.5 py-1.5 text-xs rounded-btn focus:border-primary ${formErrors.other_cost ? 'border-red-500' : 'border-dark/15'
                                                }`}
                                            value={formData.other_cost}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Selling details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dark/5 pt-3.5">
                                <div className="flex flex-col">
                                    <label className="text-xs text-dark-light mb-1.5">{lang('વેચાણ કિંમત (₹ પ્રતિ મણ)', 'Selling Price (₹ per Man)')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="selling_price"
                                        placeholder={lang('દા.ત. 1200', 'e.g. 1200')}
                                        className={`w-full bg-white border outline-none px-3.5 py-2 text-xs rounded-btn focus:border-primary ${formErrors.selling_price ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.selling_price}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.selling_price && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.selling_price}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs text-dark-light mb-1.5">{lang('વેચેલો જથ્થો (મણ)', 'Sold Quantity (Man)')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="sold_quantity"
                                        placeholder={lang('દા.ત. 120', 'e.g. 120')}
                                        className={`w-full bg-white border outline-none px-3.5 py-2 text-xs rounded-btn focus:border-primary ${formErrors.sold_quantity ? 'border-red-500' : 'border-dark/15'
                                            }`}
                                        value={formData.sold_quantity}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.sold_quantity && (
                                        <span className="text-[10px] text-red-600 font-bold mt-1">{formErrors.sold_quantity}</span>
                                    )}
                                </div>
                            </div>

                            {/* Statuses, Notes & Image upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark/5 pt-3.5">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">{lang('પાકનો તબક્કો', 'Crop Status')}</label>
                                    <select
                                        name="crop_status"
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary"
                                        value={formData.crop_status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Sown">{lang('વાવેતર કરેલ', 'Sown')}</option>
                                        <option value="Growing">{lang('ઉગતો પાક', 'Growing')}</option>
                                        <option value="Harvested">{lang('લણેલો પાક', 'Harvested')}</option>
                                        <option value="Sold">{lang('વેચાયેલ', 'Sold')}</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-dark/75 mb-1.5">{lang('સ્વાસ્થ્ય તબક્કો', 'Health Status')}</label>
                                    <select
                                        name="disease_status"
                                        className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-xs rounded-btn focus:border-primary"
                                        value={formData.disease_status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Healthy">{lang('તંદુરસ્ત', 'Healthy')}</option>
                                        <option value="Healthy (Low Risk)">{lang('ઓછું જોખમ', 'Low Risk')}</option>
                                        <option value="Monitored">{lang('રેખરેખ હેઠળ', 'Monitored')}</option>
                                        <option value="Diseased">{lang('બીમાર / ચેપી', 'Diseased')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col border-t border-dark/5 pt-3.5">
                                <label className="text-xs text-dark-light mb-1.5">{lang('નોંધ / માહિતી', 'Notes')}</label>
                                <textarea
                                    name="notes"
                                    rows="2"
                                    placeholder={lang('પાક વિશે કોઈ ખાસ નોંધ ઉમેરો...', 'Add special notes about the crop...')}
                                    className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2 text-xs rounded-btn focus:border-primary resize-none"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Optional image selector */}
                            <div className="flex flex-col border-t border-dark/5 pt-3.5">
                                <label className="text-xs text-dark-light mb-1.5">{lang('પાકનો ફોટો', 'Optional Crop Image')}</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-secondary-dark border border-dark/15 hover:bg-dark/5 transition-all text-xs font-bold py-2.5 px-4 rounded-btn flex items-center gap-2">
                                        <FiImage size={15} />
                                        <span>{lang('ફોટો પસંદ કરો', 'Select Photo')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative w-16 h-16 border rounded overflow-hidden shadow-xs">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, crop_image: null }))
                                                    setImagePreview('')
                                                }}
                                                className="absolute top-0 right-0 bg-red-650 text-white rounded-full p-0.5"
                                            >
                                                <FiX size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
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

            {/* DELETE MODAL */}
            {showDeleteModal && selectedCrop && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-sm w-full p-6 space-y-4 animate-scaleUp text-xs font-sans">
                        <h3 className="font-bold text-base text-dark flex items-center gap-2">
                            <span className="text-red-500">⚠️</span> {lang('કાઢી નાખવાની ખાતરી કરો', 'Confirm Deletion')}
                        </h3>
                        <p className="text-dark bg-red-50/20 p-3 rounded border border-red-100/50 leading-relaxed font-sans select-none">
                            {lang(
                                `શું તમે ખરેખર પાકનો રેકોર્ડ "${selectedCrop.crop_name}" ની વિગતો કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં.`,
                                `Are you sure you want to delete the crop record for "${selectedCrop.crop_name}"? This action cannot be undone.`
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border rounded font-bold hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                {lang('રદ કરો', 'Cancel')}
                            </button>
                            <Button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white rounded font-bold"
                                isLoading={isLoading}
                            >
                                {lang('હા, કાઢી નાખો', 'Yes, Delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* SALES MODAL */}
            <SalesModal
                isOpen={showSalesModal}
                onClose={() => setShowSalesModal(false)}
                onSuccess={async (data, isEdit) => {
                    setSuccessMsg(lang(
                        isEdit ? 'વેચાણનો રેકોર્ડ અપડેટ થયો.' : 'નવું વેચાણ સફળતાપૂર્વક ઉમેરાયું.',
                        isEdit ? 'Sales record updated successfully.' : 'New sale added successfully.'
                    ))
                    // We must refetch the crops so that the Table updates the Status to "Sold"
                    await fetchCrops()
                }}
                editSales={editSalesData}
                initialData={initialSalesData}
                crops={crops}
            />
        </div>
    )
}

export default CropRecords
