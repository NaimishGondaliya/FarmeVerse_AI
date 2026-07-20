import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiCamera, FiSend, FiUser, FiInfo } from 'react-icons/fi'
import { expertAPI, consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

import Loader from '../../components/common/Loader'
import Select from '../../components/common/Select'

const translations = {
    ENG: {
        title: "Submit New Consultation",
        subtitle: "Describe your agricultural problems and upload a photo to get expert advice",
        expertLabel: "Select Agriculture Expert",
        subjectLabel: "Subject / Topic",
        subjectPlaceholder: "e.g. Cotton Leaf disease, Tomato pest control...",
        messageLabel: "Describe your Issue",
        messagePlaceholder: "Please describe the symptoms, duration, soil type, and other diagnostic clues...",
        uploadPhoto: "Upload Crop Photo (Optional)",
        submitBtn: "Submit Query",
        cancelBtn: "Cancel",
        loadingExperts: "Loading experts list...",
        submitting: "Submitting details...",
        successMsg: "Consultation successfully created!",
        errFetch: "Failed to load expert lists.",
        errSubmit: "Failed to submit request. Please check input parameters.",
        validationExpert: "Please choose an expert.",
        validationSubject: "Subject cannot be blank.",
        validationMessage: "Please write a message description.",
        back: "Back"
    },
    GUJ: {
        title: "નવો પ્રશ્ન પૂછો",
        subtitle: "તમારા કૃષિ પ્રશ્નનું વર્ણન કરો અને નિષ્ણાતોની સલાહ મેળવવા માટે ફોટો અપલોડ કરો",
        expertLabel: "કૃષિ નિષ્ણાત પસંદ કરો",
        subjectLabel: "વિષય / ટાઇટલ",
        subjectPlaceholder: "દા.ત. કપાસના પાકમાં રોગચાળો, ટામેટાના પાકમાં જીવાત નિયંત્રણ...",
        messageLabel: "તમારી સમસ્યાનું વર્ણન",
        messagePlaceholder: "લક્ષણો, સમયગાળો, જમીનનો પ્રકાર અને અન્ય માહિતી વિગતવાર જણાવો...",
        uploadPhoto: "પાકનો ફોટો અપલોડ કરો (વૈકલ્પિક)",
        submitBtn: "પ્રશ્ન સબમિટ કરો",
        cancelBtn: "રદ કરો",
        loadingExperts: "નિષ્ણાતોની યાદી લોડ થઈ રહી છે...",
        submitting: "સબમિટ થઈ રહ્યું છે...",
        successMsg: "પ્રશ્ન સફળતાપૂર્વક મોકલવામાં આવ્યો છે!",
        errFetch: "નિષ્ણાતોની માહિતી મેળવવામાં નિષ્ફળતા.",
        errSubmit: "પ્રશ્ન સબમિટ કરવામાં નિષ્ફળતા. કૃપા કરીને વિગતો તપાસો.",
        validationExpert: "કૃપા કરીને એક નિષ્ણાત પસંદ કરો.",
        validationSubject: "કૃપા કરીને વિષય લખો.",
        validationMessage: "કૃપા કરીને સમસ્યાનું વર્ણન લખો.",
        back: "પાછા જાઓ"
    }
}

export const SendMessage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const [experts, setExperts] = useState([])
    const [selectedExpertId, setSelectedExpertId] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const t = translations[lang]

    useEffect(() => {
        const fetchExpertsList = async () => {
            try {
                const list = await expertAPI.getAll()
                setExperts(list)
                const preselectedId = searchParams.get('expertId')
                if (preselectedId) {
                    setSelectedExpertId(preselectedId)
                } else if (list.length > 0) {
                    setSelectedExpertId(list[0].id.toString())
                }
                setError('')
            } catch (err) {
                console.error(err)
                setError(t.errFetch)
            } finally {
                setIsLoading(false)
            }
        }
        fetchExpertsList()
    }, [searchParams])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!selectedExpertId) {
            alert(t.validationExpert)
            return
        }
        if (!subject.trim()) {
            alert(t.validationSubject)
            return
        }
        if (!message.trim()) {
            alert(t.validationMessage)
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('expert', selectedExpertId)
            formData.append('subject', subject.trim())
            formData.append('message', message.trim())
            if (imageFile) {
                formData.append('image', imageFile)
            }

            const response = await consultationAPI.create(formData)
            alert(t.successMsg)
            navigate('/farmer/consultation/history')
        } catch (err) {
            console.error(err)
            setError(t.errSubmit)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <Loader variant="skeleton" type="form" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
                >
                    <FiArrowLeft size={16} />
                    <span>{t.back}</span>
                </button>


            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{t.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                        <FiInfo size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Expert Dropdown */}
                    <Select
                        label={t.expertLabel}
                        name="expert"
                        icon={FiUser}
                        value={selectedExpertId}
                        onChange={(e) => setSelectedExpertId(e.target.value)}
                    >
                        {experts.map(expert => (
                            <option key={expert.id} value={expert.id}>
                                {expert.name} ({expert.specialization}) - {expert.district}
                            </option>
                        ))}
                    </Select>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.subjectLabel}</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={t.subjectPlaceholder}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-medium"
                        />
                    </div>

                    {/* Message details */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.messageLabel}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t.messagePlaceholder}
                            rows="5"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-medium"
                        />
                    </div>

                    {/* Image Selector */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.uploadPhoto}</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold text-slate-700 transition">
                                <FiCamera size={18} className="text-slate-500" />
                                <span>Choose Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
                                    <img src={imagePreview} alt="crop preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
                        >
                            <FiSend size={16} />
                            <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold transition"
                        >
                            {t.cancelBtn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
