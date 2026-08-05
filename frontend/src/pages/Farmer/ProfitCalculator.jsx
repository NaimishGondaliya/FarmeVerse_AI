import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { SalesModal } from '../../components/common/SalesModal'
import {
    FiTrendingUp,
    FiPercent,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiX,
    FiCheck,
    FiFilter,
    FiCalendar,
    FiInfo,
    FiArrowRight
} from 'react-icons/fi'
import { BiRupee } from 'react-icons/bi'
import { cropAPI, expenseAPI, salesAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'

export const ProfitCalculator = () => {
    const { formatNumber, formatCurrency, formatDate, language } = useLanguage()
    const { t } = useTranslation()

    const lang = (gu, en) => language === 'gu' ? gu : en;
    const toGuDigits = (str, langKey) => {
        if (langKey !== 'gu' || str === undefined || str === null) return String(str || '');
        const gu = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
        return String(str).replace(/[0-9]/g, d => gu[d]);
    };

    const localizeCropName = (cropName) => {
        if (!cropName) return '';
        const cleanName = String(cropName).trim();
        if (language !== 'gu') return cleanName;
        const cropDict = {
            'groundnut': 'મગફળી',
            'cotton': 'કપાસ',
            'cumin': 'જીરું',
            'wheat': 'ઘઉં',
            'mustard': 'રાઈ',
            'castor seed': 'દિવેલા'
        };
        return cropDict[cleanName.toLowerCase()] || cleanName;
    };

    const localizeExpenseType = (type) => {
        if (!type) return '';
        const cleanType = String(type).trim();
        const typeKey = cleanType.toLowerCase();

        if (language !== 'gu') {
            const engDict = {
                'seed': 'Seed',
                'fertilizer': 'Fertilizer',
                'pesticide': 'Pesticide',
                'labour': 'Labour',
                'irrigation': 'Irrigation',
                'machinery': 'Machinery',
                'transportation': 'Transportation',
                'other': 'Other'
            };
            return engDict[typeKey] || cleanType;
        }

        const guDict = {
            'seed': 'બીજ',
            'fertilizer': 'ખાતર',
            'pesticide': 'જંતુનાશક',
            'labour': 'મજૂરી',
            'irrigation': 'પિયત',
            'machinery': 'યંત્રો',
            'transportation': 'પરિવહન',
            'other': 'અન્ય'
        };
        return guDict[typeKey] || cleanType;
    };
    const [crops, setCrops] = useState([])
    const [expenses, setExpenses] = useState([])
    const [sales, setSales] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Selection Filter
    const [selectedCropFilter, setSelectedCropFilter] = useState('all')

    // Tab control
    const [activeTab, setActiveTab] = useState('expenses') // expenses | sales

    // Search and sub-filters
    const [expenseSearch, setExpenseSearch] = useState('')
    const [expenseTypeFilter, setExpenseTypeFilter] = useState('all')
    const [salesSearch, setSalesSearch] = useState('')

    // Modals Control
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [showSalesModal, setShowSalesModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Current Action Item
    const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'expense' | 'sales', id }
    const [editExpense, setEditExpense] = useState(null)
    const [editSales, setEditSales] = useState(null)

    // Form states
    const [expenseForm, setExpenseForm] = useState({
        crop: '',
        expense_type: t('expenseType.Seed'),
        amount: '',
        expense_date: new Date().toISOString().substring(0, 10),
        description: ''
    })
    const [salesForm, setSalesForm] = useState({
        crop: '',
        market_yard: '',
        sale_date: new Date().toISOString().substring(0, 10),
        sold_quantity: '',
        price_per_kg: ''
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const [cropsRes, expRes, salesRes] = await Promise.all([
                cropAPI.getAll(),
                expenseAPI.getAll(),
                salesAPI.getAll()
            ])

            if (cropsRes.success) setCrops(cropsRes.data || [])
            if (expRes.success) setExpenses(expRes.data || [])
            if (salesRes.success) setSales(salesRes.data || [])
        } catch (err) {
            console.error('Error loading calculator data:', err)
            setErrorMsg(t('profitCalc.errorLoad'))
        } finally {
            setIsLoading(false)
        }
    }

    // Filtered data based on chosen crop
    const filteredExpenses = expenses.filter(exp => {
        const matchesCrop = selectedCropFilter === 'all' || String(exp.crop) === String(selectedCropFilter)
        const matchesType = expenseTypeFilter === 'all' || exp.expense_type === expenseTypeFilter
        const matchesSearch = exp.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
            exp.crop_name?.toLowerCase().includes(expenseSearch.toLowerCase())
        return matchesCrop && matchesType && matchesSearch
    })

    const filteredSales = sales.filter(sale => {
        const matchesCrop = selectedCropFilter === 'all' || String(sale.crop) === String(selectedCropFilter)
        const matchesSearch = sale.market_yard.toLowerCase().includes(salesSearch.toLowerCase()) ||
            sale.crop_name?.toLowerCase().includes(salesSearch.toLowerCase())
        return matchesCrop && matchesSearch
    })

    // Financial calculations
    const selectedCropData = crops.find(c => String(c.id) === String(selectedCropFilter))

    const totalRevenue = selectedCropFilter === 'all'
        ? sales.reduce((acc, curr) => acc + (parseFloat(curr.total_revenue) || 0), 0)
        : sales.filter(s => String(s.crop) === String(selectedCropFilter))
            .reduce((acc, curr) => acc + (parseFloat(curr.total_revenue) || 0), 0)

    const totalExpense = selectedCropFilter === 'all'
        ? expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)
        : expenses.filter(e => String(e.crop) === String(selectedCropFilter))
            .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)

    const netProfit = totalRevenue - totalExpense
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Pie chart expense category split
    const expenseTypeSummary = expenses
        .filter(exp => selectedCropFilter === 'all' || String(exp.crop) === String(selectedCropFilter))
        .reduce((acc, curr) => {
            acc[curr.expense_type] = (acc[curr.expense_type] || 0) + (parseFloat(curr.amount) || 0)
            return acc
        }, {})

    // Expense & Sales CRUD handlers
    const validateExpense = () => {
        const errors = {}
        if (!expenseForm.crop) errors.crop = t('profitCalc.valCropReq')
        if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
            errors.amount = t('profitCalc.valAmtZero')
        }
        if (!expenseForm.expense_date) errors.expense_date = t('profitCalc.valExpDateReq')
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateSales = () => {
        const errors = {}
        if (!salesForm.crop) errors.crop = t('profitCalc.valCropReq')
        if (!salesForm.market_yard.trim()) errors.market_yard = t('profitCalc.valYardReq')
        if (!salesForm.sold_quantity || parseFloat(salesForm.sold_quantity) <= 0) {
            errors.sold_quantity = t('profitCalc.valQtyZero')
        }
        if (!salesForm.price_per_kg || parseFloat(salesForm.price_per_kg) <= 0) {
            errors.price_per_kg = t('profitCalc.valPriceZero')
        }
        if (!salesForm.sale_date) errors.sale_date = t('profitCalc.valSaleDateReq')
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleExpenseSubmit = async (e) => {
        e.preventDefault()
        if (!validateExpense()) return
        setIsLoading(true)
        setErrorMsg('')
        try {
            let res
            if (editExpense) {
                res = await expenseAPI.update(editExpense.id, expenseForm)
            } else {
                res = await expenseAPI.create(expenseForm)
            }

            if (res.success) {
                setSuccessMsg(editExpense ? t('profitCalc.msgExpUpdateSuccess') : t('profitCalc.msgExpAddSuccess'))
                setShowExpenseModal(false)
                loadData()
            } else {
                setErrorMsg(res.message || t('profitCalc.msgSaveFailed'))
            }
        } catch (err) {
            console.error('Error saving expense:', err)
            setErrorMsg(t('profitCalc.msgCheckDetails'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleSalesSubmit = async (e) => {
        e.preventDefault()
        if (!validateSales()) return
        setIsLoading(true)
        setErrorMsg('')
        try {
            let res
            if (editSales) {
                res = await salesAPI.update(editSales.id, salesForm)
            } else {
                res = await salesAPI.create(salesForm)
            }

            if (res.success) {
                setSuccessMsg(editSales ? t('profitCalc.msgSaleUpdateSuccess') : t('profitCalc.msgSaleAddSuccess'))
                setShowSalesModal(false)
                loadData()
            } else {
                setErrorMsg(res.message || t('profitCalc.msgSaveFailed'))
            }
        } catch (err) {
            console.error('Error saving sales:', err)
            setErrorMsg(t('profitCalc.msgSystemError'))
        } finally {
            setIsLoading(false)
        }
    }

    const openAddExpense = () => {
        setEditExpense(null)
        setExpenseForm({
            crop: crops.length > 0 ? crops[0].id : '',
            expense_type: t('expenseType.Seed'),
            amount: '',
            expense_date: new Date().toISOString().substring(0, 10),
            description: ''
        })
        setFormErrors({})
        setShowExpenseModal(true)
    }

    const openEditExpense = (exp) => {
        setEditExpense(exp)
        setExpenseForm({
            crop: exp.crop,
            expense_type: exp.expense_type,
            amount: exp.amount,
            expense_date: exp.expense_date,
            description: exp.description || ''
        })
        setFormErrors({})
        setShowExpenseModal(true)
    }

    const openAddSales = () => {
        setEditSales(null)
        setSalesForm({
            crop: crops.length > 0 ? crops[0].id : '',
            market_yard: '',
            sale_date: new Date().toISOString().substring(0, 10),
            sold_quantity: '',
            price_per_kg: ''
        })
        setFormErrors({})
        setShowSalesModal(true)
    }

    const openEditSales = (sale) => {
        setEditSales(sale)
        setSalesForm({
            crop: sale.crop,
            market_yard: sale.market_yard,
            sale_date: sale.sale_date,
            sold_quantity: sale.sold_quantity,
            price_per_kg: sale.price_per_kg
        })
        setFormErrors({})
        setShowSalesModal(true)
    }

    const triggerDelete = (type, id) => {
        setDeleteTarget({ type, id })
        setShowDeleteModal(true)
    }

    const confirmDeletion = async () => {
        if (!deleteTarget) return
        setIsLoading(true)
        setErrorMsg('')
        try {
            let res
            if (deleteTarget.type === 'expense') {
                res = await expenseAPI.delete(deleteTarget.id)
            } else {
                res = await salesAPI.delete(deleteTarget.id)
            }

            if (res.success) {
                setSuccessMsg(t('profitCalc.msgDelSuccess'))
                loadData()
            } else {
                setErrorMsg(res.message || t('profitCalc.msgDelFailed'))
            }
        } catch (err) {
            console.error('Error during deletion:', err)
            setErrorMsg(t('profitCalc.msgDelError'))
        } finally {
            setIsLoading(false)
            setShowDeleteModal(false)
            setDeleteTarget(null)
        }
    }

    // Colors mapping helper for Expense Types chart (clean HSL generated palette)
    const expenseColors = {
        Seed: '#10B981',        // Emerald
        Fertilizer: '#3B82F6',  // Blue
        Pesticide: '#EF4444',   // Red
        Labour: '#F59E0B',      // Amber
        Irrigation: '#06B6D4',  // Cyan
        Machinery: '#8B5CF6',   // Violet
        Transportation: '#EC4899', // Pink
        Other: '#6B7280'        // Gray
    }

    // Dynamic HSL variables/calculations for SVG rendering
    const pieSummaryData = Object.entries(expenseTypeSummary).map(([key, val]) => ({
        label: key, // original key name
        displayLabel: localizeExpenseType(key), // dynamically localized text
        value: val,
        color: expenseColors[key] || '#6B7280'
    })).filter(item => item.value > 0)

    // Computes cumulative angle points for dynamic visual donut pie chart slices
    let cumulativePercent = 0
    const donutSlices = pieSummaryData.map((slice) => {
        const percent = slice.value / (totalExpense || 1)
        const startPercent = cumulativePercent
        cumulativePercent += percent

        // polar coordinates algorithm for SVG path rendering
        const x1 = Math.cos(2 * Math.PI * startPercent)
        const y1 = Math.sin(2 * Math.PI * startPercent)
        const x2 = Math.cos(2 * Math.PI * cumulativePercent)
        const y2 = Math.sin(2 * Math.PI * cumulativePercent)

        const largeArcFlag = percent > 0.5 ? 1 : 0

        const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

        return {
            ...slice,
            pathData
        }
    })

    return (
        <div className="space-y-6 animate-fadeIn font-sans text-dark">
            {/* Header Portal info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-card border border-dark/5 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
                        {t('profitCalc.titleMain')}
                    </h1>
                    <p className="text-xs text-dark-light">
                        {t('profitCalc.subtitleMain')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={openAddExpense}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-btn transition-all active:scale-95"
                    >
                        <FiPlus size={14} />
                        <span>{t('profitCalc.btnAddExpHeader')}</span>
                    </Button>
                    <Button
                        onClick={openAddSales}
                        className="bg-primary hover:bg-primary-dark text-white flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-btn transition-all active:scale-95"
                    >
                        <FiPlus size={14} />
                        <span>{t('profitCalc.btnAddSaleHeader')}</span>
                    </Button>
                </div>
            </div>

            {/* Notification messages */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-2.5 rounded text-xs font-semibold flex items-center justify-between shadow-xs">
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
                        <FiX size={15} />
                    </button>
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-650 px-4 py-2.5 rounded text-xs font-semibold flex items-center justify-between shadow-xs">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded">
                        <FiX size={15} />
                    </button>
                </div>
            )}

            {/* Selector Dropdown to isolate data */}
            <div className="bg-white p-4 rounded-card border border-dark/5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <FiFilter className="text-primary" size={16} />
                    <span className="text-xs font-bold text-dark/75">{t('profitCalc.cropSelection')}</span>
                </div>
                <select
                    className="w-full sm:w-64 bg-secondary-dark border border-dark/10 outline-none px-3.5 py-2 text-xs rounded-btn focus:border-primary font-bold"
                    value={selectedCropFilter}
                    onChange={(e) => setSelectedCropFilter(e.target.value)}
                >
                    <option value="all">{t('profitCalc.allActiveCrops')}</option>
                    {crops.map(c => (
                        <option key={c.id} value={c.id}>{localizeCropName(c.crop_name)} ({c.crop_variety}) - {c.farm_name}</option>
                    ))}
                </select>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border border-dark/5 shadow-sm rounded-card flex items-center">
                    <div className="p-3.5 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <FiTrendingUp size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">{t('profitCalc.metricRevenue')}</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">{toGuDigits(formatCurrency(totalRevenue), language)}</h4>
                    </div>
                </Card>

                <Card className="p-4 bg-white border border-dark/5 shadow-sm rounded-card flex items-center">
                    <div className="p-3.5 rounded-full bg-red-50 text-red-500 mr-4">
                        <BiRupee size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">{t('profitCalc.metricExpense')}</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">{toGuDigits(formatCurrency(totalExpense), language)}</h4>
                    </div>
                </Card>

                <Card className={`p-4 border shadow-sm rounded-card flex items-center ${netProfit >= 0 ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/20 border-red-100'}`}>
                    <div className={`p-3.5 rounded-full mr-4 ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'}`}>
                        <BiRupee size={22} className={netProfit < 0 ? 'rotate-180' : ''} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">{t('profitCalc.metricNetProfit')}</span>
                        <h4 className={`text-lg font-extrabold select-none mt-0.5 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {netProfit < 0 ? '-' : ''}{toGuDigits(formatCurrency(Math.abs(netProfit)), language)}
                        </h4>
                    </div>
                </Card>

                <Card className="p-4 bg-white border border-dark/5 shadow-sm rounded-card flex items-center">
                    <div className="p-3.5 rounded-full bg-amber-50 text-amber-600 mr-4">
                        <FiPercent size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">{t('profitCalc.metricMargin')}</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">{toGuDigits(profitMargin.toFixed(1), language)}%</h4>
                    </div>
                </Card>
            </div>

            {/* Split Visualisation Section (Charts list) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Visual graph */}
                <Card className="lg:col-span-1 bg-white p-5 rounded-card border border-dark/5 shadow-sm flex flex-col justify-start">
                    <h3 className="font-bold text-sm text-dark border-b border-dark/5 pb-2.5 mb-4 select-none flex items-center gap-2">
                        {t('profitCalc.expenseSplit')}
                    </h3>
                    {totalExpense === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark-light/60">
                            <FiInfo size={28} className="mb-2" />
                            <p className="text-xs font-semibold">{t('profitCalc.noExpenseReg')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* SVG Donut */}
                            <div className="relative w-44 h-44 mx-auto">
                                <svg className="w-full h-full transform -rotate-90" viewBox="-1.1 -1.1 2.2 2.2">
                                    {donutSlices.map((slice, i) => (
                                        <path
                                            key={i}
                                            d={slice.pathData}
                                            fill={slice.color}
                                            className="transition-transform duration-200 hover:scale-105"
                                            title={`${slice.label}: ₹${slice.value}`}
                                        />
                                    ))}
                                    {/* Inner white circle for donut effect */}
                                    <circle cx="0" cy="0" r="0.65" fill="#fff" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                                    <span className="text-[9px] font-bold text-dark-light uppercase">{t('profitCalc.expenseSum')}</span>
                                    <span className="text-sm font-extrabold text-dark-light/95">{toGuDigits(formatCurrency(totalExpense), language)}</span>
                                </div>
                            </div>
                            {/* Legend labels */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-dark-light/95 select-none pt-2">
                                {pieSummaryData.map((slice, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 truncate">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: slice.color }}></span>
                                        <span className="truncate">{slice.displayLabel}: {toGuDigits(formatCurrency(slice.value), language)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Listing Tables and Tabs */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tab Navigation buttons */}
                    <div className="flex bg-white rounded-card overflow-hidden p-1 border border-dark/5 shadow-sm max-w-xs font-bold text-xs select-none">
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 text-center py-2 rounded-btn transition-all ${activeTab === 'expenses' ? 'bg-primary text-white shadow-sm' : 'text-dark-light hover:bg-secondary-dark'}`}
                        >
                            {t('profitCalc.tabExpenseList')}
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex-1 text-center py-2 rounded-btn transition-all ${activeTab === 'sales' ? 'bg-primary text-white shadow-sm' : 'text-dark-light hover:bg-secondary-dark'}`}
                        >
                            {t('profitCalc.tabSalesList')}
                        </button>
                    </div>

                    {/* EXPENSES MANAGEMENT TAB */}
                    {activeTab === 'expenses' && (
                        <div className="bg-white rounded-card border border-dark/5 shadow-sm overflow-hidden p-4 space-y-4">
                            {/* Search and Category Filters */}
                            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-secondary-dark/45 p-3 rounded-btn border border-dark/5">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    <input
                                        type="text"
                                        placeholder={t('profitCalc.searchExpPlaceholder')}
                                        className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={expenseSearch}
                                        onChange={(e) => setExpenseSearch(e.target.value)}
                                    />
                                    {expenseSearch && (
                                        <button onClick={() => setExpenseSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>

                                <select
                                    className="bg-white border border-dark/10 outline-none px-2 py-1.5 text-xs rounded-btn focus:border-primary font-semibold"
                                    value={expenseTypeFilter}
                                    onChange={(e) => setExpenseTypeFilter(e.target.value)}
                                >
                                    <option value="all">{t('profitCalc.allCategories')}</option>
                                    <option value="Seed">{localizeExpenseType('Seed')}</option>
                                    <option value="Fertilizer">{localizeExpenseType('Fertilizer')}</option>
                                    <option value="Pesticide">{localizeExpenseType('Pesticide')}</option>
                                    <option value="Labour">{localizeExpenseType('Labour')}</option>
                                    <option value="Irrigation">{localizeExpenseType('Irrigation')}</option>
                                    <option value="Machinery">{localizeExpenseType('Machinery')}</option>
                                    <option value="Transportation">{localizeExpenseType('Transportation')}</option>
                                    <option value="Other">{localizeExpenseType('Other')}</option>
                                </select>
                            </div>

                            {/* Table listing */}
                            {isLoading ? (
                                <Loader variant="skeleton" type="table" />
                            ) : filteredExpenses.length === 0 ? (
                                <EmptyState
                                    icon={FiInfo}
                                    title={t('profitCalc.noExp')}
                                    description={expenseSearch || expenseTypeFilter !== 'all' ? t('profitCalc.noExpMatch') : t('profitCalc.noExpAdd')}
                                    actionText={!(expenseSearch || expenseTypeFilter !== 'all') ? t('profitCalc.btnAddExpHeader') : undefined}
                                    onActionClick={openAddExpense}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase tracking-wider">
                                                <th className="p-3">{t('profitCalc.thCrop')}</th>
                                                <th className="p-3">{t('profitCalc.thExpType')}</th>
                                                <th className="p-3">{t('profitCalc.thDate')}</th>
                                                <th className="p-3">{t('profitCalc.thAmount')}</th>
                                                <th className="p-3 text-center">ક્રિયાઓ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5 text-xs select-none">
                                            {filteredExpenses.map(exp => (
                                                <tr key={exp.id} className="hover:bg-secondary-dark/30 transition-colors">
                                                    <td className="p-3 font-semibold text-dark/90">
                                                        {exp.crop_name ? localizeCropName(exp.crop_name) : `પાક ID: ${exp.crop}`}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                                                            style={{ backgroundColor: expenseColors[exp.expense_type] || '#6B7280' }}
                                                        >
                                                            {localizeExpenseType(exp.expense_type)}
                                                        </span>
                                                        {exp.description && <div className="text-[10px] text-dark-light font-medium truncate max-w-[150px] mt-0.5">{exp.description === "Auto-synced from crop records" ? lang("પાક રેકોર્ડમાંથી આપમેળે સમન્વયિત", exp.description) : exp.description}</div>}
                                                    </td>
                                                    <td className="p-3 text-dark-light font-semibold">{toGuDigits(formatDate(exp.expense_date), language)}</td>
                                                    <td className="p-3 font-extrabold text-dark-light/95">{toGuDigits(formatCurrency(parseFloat(exp.amount) || 0), language)}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => openEditExpense(exp)}
                                                                className="p-1 px-1.5 text-primary hover:bg-secondary-dark rounded"
                                                                title={t('common.edit')}
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete('expense', exp.id)}
                                                                className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                title={t('common.delete')}
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SALES MANAGEMENT TAB */}
                    {activeTab === 'sales' && (
                        <div className="bg-white rounded-card border border-dark/5 shadow-sm overflow-hidden p-4 space-y-4">
                            {/* Search */}
                            <div className="flex justify-between gap-3 bg-secondary-dark/45 p-3 rounded-btn border border-dark/5">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    <input
                                        type="text"
                                        placeholder={t('profitCalc.searchSalePlaceholder')}
                                        className="w-full h-12 rounded-xl border border-slate-300 pl-11 pr-10 text-sm leading-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={salesSearch}
                                        onChange={(e) => setSalesSearch(e.target.value)}
                                    />
                                    {salesSearch && (
                                        <button onClick={() => setSalesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table listing */}
                            {isLoading ? (
                                <Loader variant="skeleton" type="table" />
                            ) : filteredSales.length === 0 ? (
                                <EmptyState
                                    icon={FiInfo}
                                    title={t('profitCalc.noSales')}
                                    description={salesSearch ? t('profitCalc.noSaleMatch') : t('profitCalc.noSaleAdd')}
                                    actionText={!salesSearch ? t('profitCalc.btnAddSaleHeader') : undefined}
                                    onActionClick={openAddSales}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase tracking-wider">
                                                <th className="p-3">{t('profitCalc.thCrop')}</th>
                                                <th className="p-3">{t('profitCalc.thMarketYard')}</th>
                                                <th className="p-3">{t('profitCalc.thQtyKg')}</th>
                                                <th className="p-3">{t('common.pricePerKg')}</th>
                                                <th className="p-3">{t('profitCalc.thTotalRevenue')}</th>
                                                <th className="p-3 text-center">ક્રિયાઓ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5 text-xs select-none">
                                            {filteredSales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-secondary-dark/30 transition-colors">
                                                    <td className="p-3 font-semibold text-dark/90">
                                                        {sale.crop_name ? localizeCropName(sale.crop_name) : `પાક ID: ${sale.crop}`}
                                                        <div className="text-[9px] text-dark-light font-semibold mt-0.5">{toGuDigits(formatDate(sale.sale_date), language)}</div>
                                                    </td>
                                                    <td className="p-3 font-semibold text-dark-light/90">{sale.market_yard}</td>
                                                    <td className="p-3 text-dark font-bold">{toGuDigits(formatNumber(parseFloat(sale.sold_quantity)), language)} {lang('કિગ્રા', 'kg')}</td>
                                                    <td className="p-3 text-dark font-bold">{toGuDigits(formatCurrency(parseFloat(sale.price_per_kg)), language)}</td>
                                                    <td className="p-3 font-extrabold text-emerald-800">{toGuDigits(formatCurrency(parseFloat(sale.total_revenue) || 0), language)}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => openEditSales(sale)}
                                                                className="p-1 px-1.5 text-primary hover:bg-secondary-dark rounded"
                                                                title={t('common.edit')}
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete('sales', sale.id)}
                                                                className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                title={t('common.delete')}
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* EXPENSE ADD/EDIT MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <form
                        onSubmit={handleExpenseSubmit}
                        className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-md w-full overflow-hidden flex flex-col animate-scaleUp text-xs font-semibold text-dark select-none"
                    >
                        <div className="flex justify-between items-center bg-primary px-5 py-3.5 text-white">
                            <h3 className="font-bold text-sm flex items-center gap-1">
                                {editExpense ? t('profitCalc.modalEditExp') : t('profitCalc.modalAddExp')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowExpenseModal(false)}
                                className="p-1 hover:bg-primary-dark/80 rounded"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-3.5">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">{t('profitCalc.lblTargetCrop')}</label>
                                <select
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.crop ? 'border-red-500' : 'border-dark/15'}`}
                                    value={expenseForm.crop}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, crop: e.target.value }))}
                                >
                                    <option value="">{t('profitCalc.phSelectCrop')}</option>
                                    {crops.map(c => (
                                        <option key={c.id} value={c.id}>{localizeCropName(c.crop_name)} ({c.crop_variety}) - {c.farm_name}</option>
                                    ))}
                                </select>
                                {formErrors.crop && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.crop}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">{t('profitCalc.lblExpType')}</label>
                                    <select
                                        className="w-full bg-white border border-dark/15 outline-none px-3 py-2 rounded-btn focus:border-primary"
                                        value={expenseForm.expense_type}
                                        onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_type: e.target.value }))}
                                    >
                                        <option value="Seed">{t('expenseType.Seed', { defaultValue: 'Seed' })}</option>
                                        <option value="Fertilizer">{t('expenseType.Fertilizer', { defaultValue: 'Fertilizer' })}</option>
                                        <option value="Pesticide">{t('expenseType.Pesticide', { defaultValue: 'Pesticide' })}</option>
                                        <option value="Labour">{t('expenseType.Labour', { defaultValue: 'Labour' })}</option>
                                        <option value="Irrigation">{t('expenseType.Other', { defaultValue: 'Other' })}</option>
                                        <option value="Machinery">{t('expenseType.Machinery', { defaultValue: 'Machinery' })}</option>
                                        <option value="Transportation">{t('expenseType.Other', { defaultValue: 'Other' })}</option>
                                        <option value="Other">{t('expenseType.Other', { defaultValue: 'Other' })}</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">{t('profitCalc.lblAmount')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.amount ? 'border-red-500' : 'border-dark/15'}`}
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                    {formErrors.amount && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.amount}</span>}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">{t('profitCalc.lblExpDate')}</label>
                                <input
                                    type="date"
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.expense_date ? 'border-red-500' : 'border-dark/15'}`}
                                    value={expenseForm.expense_date}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_date: e.target.value }))}
                                />
                                {formErrors.expense_date && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.expense_date}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">{t('profitCalc.lblDesc')}</label>
                                <textarea
                                    rows="2"
                                    className="w-full bg-white border border-dark/15 outline-none px-3 py-2 rounded-btn focus:border-primary font-medium"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="bg-secondary-dark px-5 py-3 border-t border-dark/5 flex justify-end gap-2 text-[11px] font-bold">
                            <button
                                type="button"
                                onClick={() => setShowExpenseModal(false)}
                                className="px-4 py-2 hover:bg-dark/5 text-dark-light rounded"
                            >
                                {lang('રદ કરો', 'Cancel')}
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="px-4 py-2 hover:opacity-90 transition-all font-bold rounded-btn"
                            >
                                {lang('સાચવો', 'Save')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* SALES ADD/EDIT MODAL */}
            <SalesModal
                isOpen={showSalesModal}
                onClose={() => setShowSalesModal(false)}
                onSuccess={(data, isEdit) => {
                    setSuccessMsg(isEdit ? t('profitCalc.msgSaleUpdateSuccess') : t('profitCalc.msgSaleAddSuccess'))
                    loadData()
                }}
                editSales={editSales}
                crops={crops}
            />

            {/* DELETE CONFIRMATION DIALOG MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <Card className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-sm w-full overflow-hidden flex flex-col animate-scaleUp text-xs text-dark select-none">
                        <div className="p-6 pb-4 flex-1">
                            <div className="flex items-center gap-3 text-red-600 mb-3">
                                <FiTrash2 size={24} className="shrink-0" />
                                <h3 className="font-extrabold text-sm">{lang('કોઈ આઇટમ કાઢી નાખવાની ખાતરી છે?', 'Confirm Deletion')}</h3>
                            </div>
                            <p className="text-dark-light font-medium leading-relaxed">{lang('આ ક્રિયા કાયમી છે અને પાછી લાવી શકાશે નહીં. શું તમે ખરેખર આગળ વધવા માંગો છો?', 'This action is permanent and cannot be undone. Are you sure you want to proceed?')}</p>
                        </div>
                        <div className="bg-secondary-dark px-6 py-4 border-t border-dark/5 flex justify-end gap-3 sm:gap-4 mt-auto w-full">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteTarget(null)
                                }}
                                className="min-w-[100px] flex-1 sm:flex-none px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-dark rounded-btn transition-colors font-bold flex justify-center items-center h-10 shadow-sm"
                            >
                                {lang('રદ કરો', 'Cancel')}
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className="min-w-[100px] flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-btn transition-colors font-bold flex justify-center items-center h-10 shadow-sm"
                            >
                                {lang('કાઢી નાખો', 'Delete')}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default ProfitCalculator;

