import React, { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
    FiUploadCloud,
    FiCamera,
    FiPlus,
    FiTrash2,
    FiX,
    FiCheckCircle,
    FiAlertTriangle,
    FiList,
    FiActivity,
    FiCalendar,
    FiCpu
} from 'react-icons/fi'
import { diseaseDetectionAPI } from '../../services/api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const SUPPORTED_CROPS = [
    { id: 'Tomato', name: 'ટમેટા (Tomato)' },
    { id: 'Cotton', name: 'કપાસ (Cotton)' },
    { id: 'Wheat', name: 'ઘઉં (Wheat)' },
    { id: 'Rice', name: 'ડાંગર/ચોખા (Rice)' },
    { id: 'Potato', name: 'બટાકા (Potato)' },
    { id: 'Groundnut', name: 'મગફળી (Groundnut)' },
    { id: 'Mustard', name: 'રાઈ (Mustard)' },
    { id: 'Cumin', name: 'જીરૂ (Cumin)' }
]

export const DiseaseDetection = () => {
    const [selectedCrop, setSelectedCrop] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isDetecting, setIsDetecting] = useState(false)
    const [diagnosisResult, setDiagnosisResult] = useState(null)
    const [history, setHistory] = useState([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const fileInputRef = useRef(null)
    const dragCounterRef = useRef(0)
    const [isDragActive, setIsDragActive] = useState(false)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setIsLoadingHistory(true)
        try {
            const res = await diseaseDetectionAPI.getHistory()
            setHistory(res || [])
        } catch (err) {
            console.error('Error fetching history:', err)
            setErrorMsg('ઇતિહાસ લોડ કરવામાં ભૂલ આવી (Failed to load history)')
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('ફાઇલનું કદ 5MB કરતાં ઓછું હોવું જોઈએ (File size must be less than 5MB)')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setErrorMsg('')
        }
    }

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragActive(true)
        }
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current--
        if (dragCounterRef.current === 0) {
            setIsDragActive(false)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        dragCounterRef.current = 0

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
                if (file.size > 5 * 1024 * 1024) {
                    setErrorMsg('ફાઇલનું કદ 5MB કરતાં ઓછું હોવું જોઈએ (File size must be less than 5MB)')
                    return
                }
                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
                setErrorMsg('')
            } else {
                setErrorMsg('ફક્ત ઇમેજ ફાઇલ જ માન્ય છે (Only image files are allowed)')
            }
        }
    }

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setDiagnosisResult(null)
        setErrorMsg('')
    }

    const handleDetect = async () => {
        if (!selectedCrop) {
            setErrorMsg('કૃપા કરીને પહેલા પાક પસંદ કરો (Please select a crop first)')
            return
        }
        if (!imageFile) {
            setErrorMsg('કૃપા કરીને પાંદડાનો ફોટો અપલોડ કરો (Please upload a leaf image)')
            return
        }

        setIsDetecting(true)
        setErrorMsg('')
        setSuccessMsg('')
        setDiagnosisResult(null)

        const formData = new FormData()
        formData.append('crop', selectedCrop)
        formData.append('image', imageFile)

        try {
            const res = await diseaseDetectionAPI.upload(formData)
            if (res.success && res.data) {
                // Attach the probabilities from the prediction API response to the record
                setDiagnosisResult({
                    ...res.data,
                    probabilities: res.probabilities
                })
                setSuccessMsg('રોગ નિદાન સફળતાપૂર્વક પૂર્ણ થયું! (Diagnosis completed successfully!)')
                fetchHistory()
            } else {
                setErrorMsg(res.message || 'નિદાન નિષ્ફળ રહ્યું (Diagnosis failed)')
            }
        } catch (err) {
            console.error('Diagnosis upload error:', err)
            setErrorMsg('સર્વર સાથે જોડાણ થઈ શક્યું નહીં. ફરી પ્રયાસ કરો (Server connection failed)')
        } finally {
            setIsDetecting(false)
        }
    }

    const handleDeleteRecord = async (id, e) => {
        e.stopPropagation()
        if (!confirm('શું તમે ખરેખર આ રેકોર્ડ કાઢી નાખવા માંગો છો?')) return

        try {
            const res = await diseaseDetectionAPI.deleteHistory(id)
            if (res.success) {
                setHistory(prev => prev.filter(item => item.id !== id))
                if (diagnosisResult && diagnosisResult.id === id) {
                    setDiagnosisResult(null)
                }
            }
        } catch (err) {
            console.error('Delete history item error:', err)
            setErrorMsg('રેકોર્ડ કાઢી નાખવામાં નિષ્ફળતા (Failed to delete record)')
        }
    }

    const handleClearHistory = async () => {
        if (!confirm('શું તમે ખરેખર બધો જ ઇતિહાસ સાફ કરવા માંગો છો?')) return

        try {
            const res = await diseaseDetectionAPI.clearHistory()
            if (res.success) {
                setHistory([])
                setDiagnosisResult(null)
            }
        } catch (err) {
            console.error('Clear history error:', err)
            setErrorMsg('ઇતિહાસ સાફ કરવામાં ભૂલ (Failed to clear history)')
        }
    }

    const getFullImageUrl = (path) => {
        if (!path) return ''
        if (path.startsWith('http://') || path.startsWith('https://')) return path
        return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-card border border-dark/5 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
                        <span>🍂</span> પાક રોગ નિદાન (Crop Disease Diagnosis)
                    </h1>
                    <p className="text-xs text-dark-light select-none mt-1">
                        તમારા પાકના પાંદડાનો ફોટો અપલોડ કરી અને ત્વરિત AI રોગ નિદાન મેળવો
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
                    <FiCpu className="animate-spin text-primary" size={14} />
                    <span>AI Engine Active (ગુજરાત ઝોન)</span>
                </div>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-650 px-4 py-2.5 rounded text-xs md:text-sm font-semibold flex items-center justify-between">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded">
                        <FiX size={16} />
                    </button>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-2.5 rounded text-xs md:text-sm font-semibold flex items-center justify-between">
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
                        <FiX size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side - Upload Form (Takes 5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="p-6 bg-white border border-dark/5 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-dark border-b border-dark/5 pb-2">
                            ૧. નવું રોગ નિદાન વિશ્લેષણ (New Diagnosis)
                        </h2>

                        {/* Crop Select */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-dark-light mb-1.5">
                                પાક પસંદ કરો (Select Crop) <span className="text-red-500 font-bold">*</span>
                            </label>
                            <select
                                className="w-full bg-white border border-dark/15 outline-none px-3.5 py-2.5 text-sm rounded-btn focus:border-primary transition-colors text-dark font-semibold"
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                            >
                                <option value="">--- પાંદડા પાક પસંદ કરો ---</option>
                                {SUPPORTED_CROPS.map(crop => (
                                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-dark-light mb-1.5">
                                પાંદડાનો ફોટો અપલોડ કરો (Leaf Photo) <span className="text-red-500 font-bold">*</span>
                            </label>

                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={triggerFileSelect}
                                    className={`border-2 border-dashed rounded-card p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive
                                        ? 'border-primary bg-emerald-50/15 scale-98'
                                        : 'border-dark/15 hover:border-primary hover:bg-secondary-dark/60'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <FiUploadCloud className="text-dark-light/65 mb-3 animate-pulse" size={40} />
                                    <p className="text-xs font-bold text-dark text-center">
                                        ફોટો અહીં ડ્રેગ એન્ડ ડ્રોપ કરો અથવા
                                    </p>
                                    <p className="text-[11px] text-primary font-bold mt-1 text-center hover:underline">
                                        બ્રાઉઝ કરો (Browse Image)
                                    </p>
                                    <p className="text-[10px] text-dark-light/75 mt-3 text-center">
                                        કેમેરાથી સીધો ફોટો પણ લઇ શકાય છે (JPEG, PNG)
                                    </p>
                                </div>
                            ) : (
                                <div className="relative rounded-card overflow-hidden border border-dark/15 group aspect-video">
                                    <img
                                        src={imagePreview}
                                        alt="Uploading leaf preview"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                                    />
                                    <div className="absolute inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="p-2.5 bg-red-650 text-white rounded-full hover:bg-red-700 shadow-md font-bold transition-all transform hover:scale-105"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2.5 right-2.5 p-1 bg-dark/65 hover:bg-dark/80 text-white rounded-full transition-colors"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                onClick={handleDetect}
                                variant="primary"
                                className="w-full text-center flex items-center justify-center gap-2 py-3 rounded-btn font-extrabold text-sm transition-transform active:scale-98"
                                isLoading={isDetecting}
                                disabled={!selectedCrop || !imageFile || isDetecting}
                            >
                                <FiCamera size={16} style={{ strokeWidth: '2.5' }} />
                                <span>રોગ શોધો (Run Diagnosis)</span>
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Side - Diagnostic Results & History Dashboard (Takes 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Diagnosis Result Card */}
                    {diagnosisResult && (
                        <Card className={`overflow-hidden border shadow-md animate-scaleUp ${diagnosisResult.status === 'Healthy'
                            ? 'border-emerald-250 bg-emerald-50/5'
                            : 'border-red-200 bg-red-50/5'
                            }`}>
                            <div className={`px-6 py-4 flex justify-between items-center text-white font-extrabold text-sm ${diagnosisResult.status === 'Healthy' ? 'bg-emerald-650' : 'bg-red-650'
                                }`}>
                                <span className="flex items-center gap-2">
                                    {diagnosisResult.status === 'Healthy' ? <FiCheckCircle size={16} /> : <FiAlertTriangle size={16} />}
                                    <span>વિશ્લેષણ પરિણામ (Diagnostic Analysis Result)</span>
                                </span>
                                <span className="px-2 py-0.5 bg-dark/25 rounded-md hover:bg-dark/40 font-mono text-xs select-all">
                                    Confidence: {diagnosisResult.confidence}%
                                </span>
                            </div>

                            {/* Confidence Progress Bar */}
                            <div className="px-6 py-3 bg-dark/3 border-b border-dark/5 flex items-center gap-3">
                                <span className="text-[10px] uppercase font-bold text-dark-light whitespace-nowrap">
                                    વિશ્વાસ સ્તર (Confidence):
                                </span>
                                <div className="w-full bg-dark/10 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${diagnosisResult.status === 'Healthy' ? 'bg-emerald-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${diagnosisResult.confidence}%` }}
                                    ></div>
                                </div>
                                <span className={`text-xs font-mono font-bold ${diagnosisResult.status === 'Healthy' ? 'text-emerald-700' : 'text-red-750'
                                    }`}>
                                    {diagnosisResult.confidence}%
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Result Overview */}
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dark/5">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-dark-light">પાકનું નામ</span>
                                        <span className="text-sm font-bold text-dark block mt-0.5">
                                            {SUPPORTED_CROPS.find(c => c.id === diagnosisResult.crop)?.name || diagnosisResult.crop}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-dark-light">આકસ્મિક રોગ નિદાન</span>
                                        <span className="text-sm font-bold text-dark block mt-0.5">
                                            {diagnosisResult.prediction}
                                        </span>
                                    </div>
                                </div>

                                {/* Health Status Warning */}
                                <div className={`p-4 rounded-btn border ${diagnosisResult.status === 'Healthy'
                                    ? 'bg-emerald-55 text-emerald-800 border-emerald-150'
                                    : 'bg-red-50 text-red-700 border-red-150'
                                    } flex items-start gap-3`}>
                                    {diagnosisResult.status === 'Healthy' ? (
                                        <FiCheckCircle size={20} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <FiAlertTriangle size={20} className="mt-0.5 text-red-500 flex-shrink-0" />
                                    )}
                                    <div className="text-xs">
                                        <p className="font-extrabold text-sm mb-1">
                                            {diagnosisResult.status === 'Healthy' ? 'પાક તંદુરસ્ત છે! (Healthy Crop)' : 'રોગની હાજરી મળી છે (Crop Infected!)'}
                                        </p>
                                        <p className="font-medium opacity-90 leading-relaxed font-sans">
                                            {diagnosisResult.status === 'Healthy'
                                                ? 'તમારા પાકના આ પાંદડામાં કોઈ રોગચાળાના લક્ષણો જોવા મળ્યા નથી. સારી માવજત ચાલુ રાખો.'
                                                : `આ પાંદડામાં ${diagnosisResult.prediction} ના લક્ષણો જણાય છે. કૃપા કરીને નીચે સૂચવેલ ઇલાજ કરો.`}
                                        </p>
                                    </div>
                                </div>

                                {/* Treatment and Prevention Details */}
                                {diagnosisResult.status !== 'Healthy' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                        <div className="p-4 bg-emerald-50/15 border border-dark/5 rounded-btn space-y-2">
                                            <h4 className="font-extrabold text-dark flex items-center gap-1.5 text-emerald-800 border-b border-emerald-100 pb-1.5">
                                                <span>🧪</span> ઉપચાર (Treatment Measures)
                                            </h4>
                                            <p className="text-dark-light leading-relaxed font-medium">
                                                {diagnosisResult.treatment || 'ઉપચાર ની માહિતી ઉપલબ્ધ નથી.'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-amber-50/15 border border-dark/5 rounded-btn space-y-2">
                                            <h4 className="font-extrabold text-dark flex items-center gap-1.5 text-amber-800 border-b border-amber-100 pb-1.5">
                                                <span>🛡️</span> અટકાવવાના પગલા (Prevention)
                                            </h4>
                                            <p className="text-dark-light leading-relaxed font-medium">
                                                {diagnosisResult.prevention || 'અટકાવવાની માહિતી ઉપલબ્ધ નથી.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Class Probabilities Breakdown */}
                                {diagnosisResult.probabilities && (
                                    <div className="pt-4 border-t border-dark/5 space-y-3 font-sans text-xs">
                                        <h4 className="font-extrabold text-dark flex items-center gap-1.5 border-b border-dark/5 pb-2">
                                            <span>📊</span> વર્ગ સંભાવના વિશ્લેષણ (Model Class Probabilities)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                                            {Object.entries(diagnosisResult.probabilities)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([className, score]) => (
                                                    <div key={className} className="space-y-1">
                                                        <div className="flex justify-between items-center text-[11px] font-semibold text-dark">
                                                            <span>
                                                                {className === 'Healthy' ? 'તંદુરસ્ત (Healthy)' : className}
                                                            </span>
                                                            <span className="font-mono text-dark-light">{score}%</span>
                                                        </div>
                                                        <div className="w-full bg-dark/5 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all duration-500 ${className === diagnosisResult.prediction
                                                                        ? className === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500'
                                                                        : 'bg-dark/25'
                                                                    }`}
                                                                style={{ width: `${score}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Detections History Check List */}
                    <Card className="p-6 bg-white border border-dark/5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-dark/5 pb-3">
                            <h2 className="text-base font-bold text-dark flex items-center gap-2">
                                <FiList className="text-primary" />
                                <span>નિદાન ઇતિહાસ (Diagnosis History)</span>
                            </h2>
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-btn font-extrabold flex items-center gap-1 transition-colors"
                                >
                                    <FiTrash2 size={13} />
                                    <span>બધા રેકોર્ડ સાફ કરો</span>
                                </button>
                            )}
                        </div>

                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-10 bg-secondary-dark/60 rounded-btn">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-dark-light mt-3">ઇતિહાસ લોડ થાય છે...</span>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary-dark/60 rounded-btn border border-dashed border-dark/15">
                                <FiActivity className="text-dark-light/50 mb-3" size={28} />
                                <h4 className="text-xs font-bold text-dark mb-1">હજુ કોઈ રોગ નિદાન કરવામાં આવ્યું નથી</h4>
                                <p className="text-[10px] text-dark-light max-w-xs leading-relaxed font-sans">
                                    અહીં તમારા તાજેતરના લીધેલા ફોટોની ચકાસણી અને તપાસ પરિણામોનો એકત્રિત ઇતિહાસ સંગ્રહિત થશે.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                                {history.map((record) => (
                                    <div
                                        key={record.id}
                                        onClick={() => setDiagnosisResult(record)}
                                        className={`p-3.5 bg-white border rounded-btn flex items-center justify-between gap-4 cursor-pointer hover:border-primary hover:shadow-xs transition-all relative ${diagnosisResult && diagnosisResult.id === record.id
                                            ? 'border-primary ring-1 ring-primary'
                                            : 'border-dark/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-xl bg-secondary-dark overflow-hidden flex-shrink-0 border border-dark/10">
                                                <img
                                                    src={getFullImageUrl(record.image)}
                                                    alt="analyzed leaf"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/100x100/eaeaea/555555?text=Leaf';
                                                    }}
                                                />
                                            </div>
                                            {/* Info */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-dark truncate">
                                                        {record.prediction || 'Healthy'}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${record.status === 'Healthy'
                                                        ? 'bg-emerald-55 text-emerald-800 border-emerald-100'
                                                        : 'bg-red-50 text-red-750 border-red-100'
                                                        }`}>
                                                        {record.status === 'Healthy' ? 'તંદુરસ્ત' : 'રોગગ્રસ્ત'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-dark-light mt-1 font-medium font-sans">
                                                    <span className="font-semibold text-primary">
                                                        {SUPPORTED_CROPS.find(c => c.id === record.crop)?.name.split(' ')[0] || record.crop}
                                                    </span>
                                                    <span className="text-dark-light/50">•</span>
                                                    <span className="flex items-center gap-0.5">
                                                        <FiCalendar size={10} className="text-dark-light" />
                                                        {new Date(record.created_at).toLocaleDateString('gu-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <button
                                            aria-label="Delete history item"
                                            onClick={(e) => handleDeleteRecord(record.id, e)}
                                            className="p-2 text-dark-light hover:text-red-600 hover:bg-red-50 rounded-btn transition-colors flex-shrink-0"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DiseaseDetection
