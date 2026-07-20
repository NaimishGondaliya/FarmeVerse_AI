import React, { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import {
    FiDollarSign,
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
import { cropAPI, expenseAPI, salesAPI } from '../../services/api'

export const ProfitCalculator = () => {
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
        expense_type: 'Seed',
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
            setErrorMsg('માહિતી લોડ કરવામાં સમસ્યા આવી. કૃપા કરીને રીફ્રેશ કરો.')
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
        if (!expenseForm.crop) errors.crop = 'પાક પસંદ કરવો જરૂરી છે.'
        if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
            errors.amount = 'ખર્ચની રકમ 0 થી વધુ હોવી જોઈએ.'
        }
        if (!expenseForm.expense_date) errors.expense_date = 'ખર્ચ તારીખ જરૂરી છે.'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateSales = () => {
        const errors = {}
        if (!salesForm.crop) errors.crop = 'પાક પસંદ કરવો જરૂરી છે.'
        if (!salesForm.market_yard.trim()) errors.market_yard = 'માર્કેટ યાર્ડનું નામ જરૂરી છે.'
        if (!salesForm.sold_quantity || parseFloat(salesForm.sold_quantity) <= 0) {
            errors.sold_quantity = 'વેચેલો જથ્થો 0 થી વધુ હોવો જોઈશે.'
        }
        if (!salesForm.price_per_kg || parseFloat(salesForm.price_per_kg) <= 0) {
            errors.price_per_kg = 'કિંમત (પ્રતિ કિલો) 0 થી વધુ હોવી જોઈશે.'
        }
        if (!salesForm.sale_date) errors.sale_date = 'વેચાણ તારીખ અપાયેલી હોવી જરૂરી છે.'
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
                setSuccessMsg(editExpense ? 'ખર્ચ સફળતાપૂર્વક અપડેટ થયો.' : 'નવો ખર્ચ સફળતાપૂર્વક ઉમેરાયો.')
                setShowExpenseModal(false)
                loadData()
            } else {
                setErrorMsg(res.message || 'માહિતી સંગ્રહ નિષ્ફળ.')
            }
        } catch (err) {
            console.error('Error saving expense:', err)
            setErrorMsg('તપાસ કરો કે વિગતો સાચી છે અને ફરીથી પ્રયાસ કરો.')
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
                setSuccessMsg(editSales ? 'વેચાણનો રેકોર્ડ અપડેટ થયો.' : 'નવું વેચાણ સફળતાપૂર્વક ઉમેરાયું.')
                setShowSalesModal(false)
                loadData()
            } else {
                setErrorMsg(res.message || 'માહિતી સંગ્રહ નિષ્ફળ.')
            }
        } catch (err) {
            console.error('Error saving sales:', err)
            setErrorMsg('સિસ્ટમ એરર! કૃપા રકમ વિગતો ચકાસો.')
        } finally {
            setIsLoading(false)
        }
    }

    const openAddExpense = () => {
        setEditExpense(null)
        setExpenseForm({
            crop: crops.length > 0 ? crops[0].id : '',
            expense_type: 'Seed',
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
                setSuccessMsg('રેકોર્ડ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.')
                loadData()
            } else {
                setErrorMsg(res.message || 'કાઢી નાખવામાં નિષ્ફળતા.')
            }
        } catch (err) {
            console.error('Error during deletion:', err)
            setErrorMsg('કાઢી નાખવામાં મુશ્કેલી પડી.')
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
        label: key,
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
                        <span>📊</span> નફાની ગણતરી (Farm Profit Calculator)
                    </h1>
                    <p className="text-xs text-dark-light">
                        તમારા પાક પાછળ થતાં કુલ ખર્ચ, વેચાણ અને ચોખ્ખો નફાનું વિશ્લેષણ મેળવો
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={openAddExpense}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-btn transition-all active:scale-95"
                    >
                        <FiPlus size={14} />
                        <span>ખર્ચ ઉમેરો (Add Expense)</span>
                    </Button>
                    <Button
                        onClick={openAddSales}
                        className="bg-primary hover:bg-primary-dark text-white flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-btn transition-all active:scale-95"
                    >
                        <FiPlus size={14} />
                        <span>વેચાણ ઉમેરો (Add Sale)</span>
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
                    <span className="text-xs font-bold text-dark/75">પાક પસંદગી (Select Crop):</span>
                </div>
                <select
                    className="w-full sm:w-64 bg-secondary-dark border border-dark/10 outline-none px-3.5 py-2 text-xs rounded-btn focus:border-primary font-bold"
                    value={selectedCropFilter}
                    onChange={(e) => setSelectedCropFilter(e.target.value)}
                >
                    <option value="all">બધા સક્રિય પાક (All Crops)</option>
                    {crops.map(c => (
                        <option key={c.id} value={c.id}>{c.crop_name} ({c.crop_variety}) - {c.farm_name}</option>
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
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">કુલ આવક (Revenue)</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                    </div>
                </Card>

                <Card className="p-4 bg-white border border-dark/5 shadow-sm rounded-card flex items-center">
                    <div className="p-3.5 rounded-full bg-red-50 text-red-500 mr-4">
                        <FiDollarSign size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">કુલ સરવાળો ખર્ચ (Expense)</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">₹{totalExpense.toLocaleString('en-IN')}</h4>
                    </div>
                </Card>

                <Card className={`p-4 border shadow-sm rounded-card flex items-center ${netProfit >= 0 ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/20 border-red-100'}`}>
                    <div className={`p-3.5 rounded-full mr-4 ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'}`}>
                        <FiDollarSign size={22} className={netProfit < 0 ? 'rotate-180' : ''} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">ચોખ્ખો નફો (Net Profit)</span>
                        <h4 className={`text-lg font-extrabold select-none mt-0.5 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {netProfit < 0 ? '-' : ''}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                        </h4>
                    </div>
                </Card>

                <Card className="p-4 bg-white border border-dark/5 shadow-sm rounded-card flex items-center">
                    <div className="p-3.5 rounded-full bg-amber-50 text-amber-600 mr-4">
                        <FiPercent size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-dark-light/85">નફાનો સીમાડો (Profit Margin)</span>
                        <h4 className="text-lg font-bold text-dark select-none mt-0.5">{profitMargin.toFixed(1)}%</h4>
                    </div>
                </Card>
            </div>

            {/* Split Visualisation Section (Charts list) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Visual graph */}
                <Card className="lg:col-span-1 bg-white p-5 rounded-card border border-dark/5 shadow-sm flex flex-col justify-start">
                    <h3 className="font-bold text-sm text-dark border-b border-dark/5 pb-2.5 mb-4 select-none flex items-center gap-2">
                        <span>🍩</span> પાક ખર્ચ શ્રેણી (Expense Split)
                    </h3>
                    {totalExpense === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark-light/60">
                            <FiInfo size={28} className="mb-2" />
                            <p className="text-xs font-semibold">પસંદ કરેલ પાક પર કોઈ રજિસ્ટર્ડ ખર્ચ નથી.</p>
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
                                    <span className="text-[9px] font-bold text-dark-light uppercase">ખર્ચ સરવાળો</span>
                                    <span className="text-sm font-extrabold text-dark-light/95">₹{totalExpense.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            {/* Legend labels */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-dark-light/95 select-none pt-2">
                                {pieSummaryData.map((slice, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 truncate">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: slice.color }}></span>
                                        <span className="truncate">{slice.label}: ₹{slice.value.toLocaleString()}</span>
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
                            ખર્ચ લિસ્ટ (Expenses)
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex-1 text-center py-2 rounded-btn transition-all ${activeTab === 'sales' ? 'bg-primary text-white shadow-sm' : 'text-dark-light hover:bg-secondary-dark'}`}
                        >
                            વેચાણ લિસ્ટ (Sales)
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
                                        placeholder="ખર્ચ વિગત શોધો..."
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
                                    <option value="all">બધા પ્રકાર (All Categories)</option>
                                    <option value="Seed">બીજ (Seed)</option>
                                    <option value="Fertilizer">ખાતર (Fertilizer)</option>
                                    <option value="Pesticide">જંતુનાશક (Pesticide)</option>
                                    <option value="Labour">મજૂરી (Labour)</option>
                                    <option value="Irrigation">પિયત (Irrigation)</option>
                                    <option value="Machinery">મશીનરી (Machinery)</option>
                                    <option value="Transportation">ટ્રાન્સપોર્ટ (Transportation)</option>
                                    <option value="Other">અન્ય (Other)</option>
                                </select>
                            </div>

                            {/* Table listing */}
                            {isLoading ? (
                                <Loader variant="skeleton" type="table" />
                            ) : filteredExpenses.length === 0 ? (
                                <EmptyState
                                    icon={FiInfo}
                                    title="કોઈ ખર્ચ રેકોર્ડ મળ્યો નથી"
                                    description={expenseSearch || expenseTypeFilter !== 'all' ? "પસંદ કરેલ ફિલ્ટર્સ અથવા સર્ચ માટે કોઈ ડેટા નથી." : "તમારા પાક માટેના ખર્ચની વિગતો અહીં ઉમેરો."}
                                    actionText={!(expenseSearch || expenseTypeFilter !== 'all') ? "ખર્ચ ઉમેરો (Add Expense)" : undefined}
                                    onActionClick={openAddExpense}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase tracking-wider">
                                                <th className="p-3">પાક</th>
                                                <th className="p-3">ખર્ચ પ્રકાર</th>
                                                <th className="p-3">તારીખ</th>
                                                <th className="p-3">રકમ</th>
                                                <th className="p-3 text-center">ક્રિયાઓ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5 text-xs select-none">
                                            {filteredExpenses.map(exp => (
                                                <tr key={exp.id} className="hover:bg-secondary-dark/30 transition-colors">
                                                    <td className="p-3 font-semibold text-dark/90">
                                                        {exp.crop_name || `પાક ID: ${exp.crop}`}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                                                            style={{ backgroundColor: expenseColors[exp.expense_type] || '#6B7280' }}
                                                        >
                                                            {exp.expense_type}
                                                        </span>
                                                        {exp.description && <div className="text-[10px] text-dark-light font-medium truncate max-w-[150px] mt-0.5">{exp.description}</div>}
                                                    </td>
                                                    <td className="p-3 text-dark-light font-semibold">{exp.expense_date}</td>
                                                    <td className="p-3 font-extrabold text-dark-light/95">₹{(parseFloat(exp.amount) || 0).toLocaleString('en-IN')}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => openEditExpense(exp)}
                                                                className="p-1 px-1.5 text-primary hover:bg-secondary-dark rounded"
                                                                title="સુધારો કરો"
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete('expense', exp.id)}
                                                                className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                title="કાઢી નાખો"
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
                                        placeholder="યાર્ડ અથવા પાક શોધો..."
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
                                    title="કોઈ વેચાણ રેકોર્ડ મળ્યો નથી"
                                    description={salesSearch ? "પસંદ કરેલ સર્ચ માટે કોઈ ડેટા નથી." : "તમારા લણેલા પાક વેચાણની વિગતો અહીં ઉમેરો."}
                                    actionText={!salesSearch ? "વેચાણ ઉમેરો (Add Sale)" : undefined}
                                    onActionClick={openAddSales}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-secondary-dark/65 border-b border-dark/5 text-dark-light/95 text-[10px] font-bold uppercase tracking-wider">
                                                <th className="p-3">પાક</th>
                                                <th className="p-3">માર્કેટ યાર્ડ</th>
                                                <th className="p-3">જથ્થો (kg)</th>
                                                <th className="p-3">ભાવ (₹/kg)</th>
                                                <th className="p-3">કુલ આવક</th>
                                                <th className="p-3 text-center">ક્રિયાઓ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5 text-xs select-none">
                                            {filteredSales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-secondary-dark/30 transition-colors">
                                                    <td className="p-3 font-semibold text-dark/90">
                                                        {sale.crop_name || `પાક ID: ${sale.crop}`}
                                                        <div className="text-[9px] text-dark-light font-semibold mt-0.5">{sale.sale_date}</div>
                                                    </td>
                                                    <td className="p-3 font-semibold text-dark-light/90">{sale.market_yard}</td>
                                                    <td className="p-3 text-dark font-bold">{parseFloat(sale.sold_quantity).toLocaleString()} kg</td>
                                                    <td className="p-3 text-dark font-bold">₹{parseFloat(sale.price_per_kg).toLocaleString()}</td>
                                                    <td className="p-3 font-extrabold text-emerald-800">₹{(parseFloat(sale.total_revenue) || 0).toLocaleString('en-IN')}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => openEditSales(sale)}
                                                                className="p-1 px-1.5 text-primary hover:bg-secondary-dark rounded"
                                                                title="સુધારો કરો"
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete('sales', sale.id)}
                                                                className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                title="કાઢી નાખો"
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
                                {editExpense ? 'ખર્ચ સુધારો (Edit Expense)' : 'નવો ખર્ચ ઉમેરો (Add New Expense)'}
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
                                <label className="text-[10px] font-bold text-dark/75 mb-1">આસક્ત પાક (Target Crop) *</label>
                                <select
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.crop ? 'border-red-500' : 'border-dark/15'}`}
                                    value={expenseForm.crop}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, crop: e.target.value }))}
                                >
                                    <option value="">પાક પસંદ કરો</option>
                                    {crops.map(c => (
                                        <option key={c.id} value={c.id}>{c.crop_name} ({c.crop_variety}) - {c.farm_name}</option>
                                    ))}
                                </select>
                                {formErrors.crop && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.crop}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">ખર્ચનો પ્રકાર (Expense Type)</label>
                                    <select
                                        className="w-full bg-white border border-dark/15 outline-none px-3 py-2 rounded-btn focus:border-primary"
                                        value={expenseForm.expense_type}
                                        onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_type: e.target.value }))}
                                    >
                                        <option value="Seed">બીજ (Seed)</option>
                                        <option value="Fertilizer">ખાતર (Fertilizer)</option>
                                        <option value="Pesticide">જંતુનાશક (Pesticide)</option>
                                        <option value="Labour">મજૂરી (Labour)</option>
                                        <option value="Irrigation">પિયત (Irrigation)</option>
                                        <option value="Machinery">મશીનરી (Machinery)</option>
                                        <option value="Transportation">ટ્રાન્સપોર્ટ (Transportation)</option>
                                        <option value="Other">અન્ય (Other)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">ખર્ચની રકમ (Amount) *</label>
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
                                <label className="text-[10px] font-bold text-dark/75 mb-1">ખર્ચ તારીખ (Expense Date) *</label>
                                <input
                                    type="date"
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.expense_date ? 'border-red-500' : 'border-dark/15'}`}
                                    value={expenseForm.expense_date}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_date: e.target.value }))}
                                />
                                {formErrors.expense_date && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.expense_date}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">સ્પષ્ટીકરણ / નોંધ (Description)</label>
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
                                રદ કરો (Cancel)
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="px-4 py-2 hover:opacity-90 transition-all font-bold rounded-btn"
                            >
                                Save (સાચવો)
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* SALES ADD/EDIT MODAL */}
            {showSalesModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <form
                        onSubmit={handleSalesSubmit}
                        className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-md w-full overflow-hidden flex flex-col animate-scaleUp text-xs font-semibold text-dark select-none"
                    >
                        <div className="flex justify-between items-center bg-primary px-5 py-3.5 text-white">
                            <h3 className="font-bold text-sm flex items-center gap-1">
                                {editSales ? 'વેચાણ નોંધ સુધારો (Edit Sale)' : 'નવું વેચાણ ઉમેરો (Record Sale)'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowSalesModal(false)}
                                className="p-1 hover:bg-primary-dark/80 rounded"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-3.5">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">આસક્ત પાક (Target Crop) *</label>
                                <select
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.crop ? 'border-red-500' : 'border-dark/15'}`}
                                    value={salesForm.crop}
                                    onChange={(e) => setSalesForm(prev => ({ ...prev, crop: e.target.value }))}
                                >
                                    <option value="">પાક પસંદ કરો</option>
                                    {crops.map(c => (
                                        <option key={c.id} value={c.id}>{c.crop_name} ({c.crop_variety}) - {c.farm_name}</option>
                                    ))}
                                </select>
                                {formErrors.crop && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.crop}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">બજાર / એપીએમસી (Market Yard / APMC) *</label>
                                <input
                                    type="text"
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.market_yard ? 'border-red-500' : 'border-dark/15'}`}
                                    placeholder="દા.ત. ગોંડલ માર્કેટ યાર્ડ"
                                    value={salesForm.market_yard}
                                    onChange={(e) => setSalesForm(prev => ({ ...prev, market_yard: e.target.value }))}
                                />
                                {formErrors.market_yard && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.market_yard}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">વેચેલો જથ્થો (Quantity in kg) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.sold_quantity ? 'border-red-500' : 'border-dark/15'}`}
                                        value={salesForm.sold_quantity}
                                        onChange={(e) => setSalesForm(prev => ({ ...prev, sold_quantity: e.target.value }))}
                                    />
                                    {formErrors.sold_quantity && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.sold_quantity}</span>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-dark/75 mb-1">કિંમત પ્રતિ કિલો (Price/kg) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.price_per_kg ? 'border-red-500' : 'border-dark/15'}`}
                                        value={salesForm.price_per_kg}
                                        onChange={(e) => setSalesForm(prev => ({ ...prev, price_per_kg: e.target.value }))}
                                    />
                                    {formErrors.price_per_kg && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.price_per_kg}</span>}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-dark/75 mb-1">વેચાણ તારીખ (Sale Date) *</label>
                                <input
                                    type="date"
                                    className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.sale_date ? 'border-red-500' : 'border-dark/15'}`}
                                    value={salesForm.sale_date}
                                    onChange={(e) => setSalesForm(prev => ({ ...prev, sale_date: e.target.value }))}
                                />
                                {formErrors.sale_date && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.sale_date}</span>}
                            </div>
                        </div>

                        <div className="bg-secondary-dark px-5 py-3 border-t border-dark/5 flex justify-end gap-2 text-[11px] font-bold">
                            <button
                                type="button"
                                onClick={() => setShowSalesModal(false)}
                                className="px-4 py-2 hover:bg-dark/5 text-dark-light rounded"
                            >
                                રદ કરો (Cancel)
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="px-4 py-2 hover:opacity-90 transition-all font-bold rounded-btn"
                            >
                                Save (સાચવો)
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* DELETE CONFIRMATION DIALOG MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <Card className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-sm w-full p-6 space-y-4 animate-scaleUp text-xs font-semibold text-dark select-none">
                        <div className="flex items-center gap-3 text-red-600">
                            <FiTrash2 size={24} />
                            <h3 className="font-extrabold text-sm">કોઈ આઇટમ કાઢી નાખવાની ખાતરી છે?</h3>
                        </div>
                        <p className="text-dark-light font-medium">આ ક્રિયા કાયમી છે અને પાછી લાવી શકાશે નહીં. શું તમે ખરેખર આગળ વધવા માંગો છો?</p>
                        <div className="flex justify-end gap-2 pt-2 text-[11px] font-bold">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteTarget(null)
                                }}
                                className="px-4 py-2 hover:bg-dark/5 text-dark-light rounded"
                            >
                                ના (Cancel)
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white rounded-btn transition-colors"
                            >
                                હા, કાઢી નાખો (Delete)
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default ProfitCalculator;

