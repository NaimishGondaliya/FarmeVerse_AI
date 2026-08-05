import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiCheckCircle, FiLock, FiStar, FiX } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import { formatGujaratiDateTime } from '../../utils/gujaratiFormat'
import Toast from '../../components/common/Toast'

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')

export const ConversationView = () => {
    const { id } = useParams()
    const { language } = useLanguage()
    const { t: tRaw } = useTranslation()
    const lang = language === 'en' ? 'en' : 'gu'
    const te = (key) => tRaw(`expert.${key}`)
    const navigate = useNavigate()
    const [consultation, setConsultation] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState('')
    const [toast, setToast] = useState(null)

    const [showRatingModal, setShowRatingModal] = useState(false)
    const [rating, setRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [isSubmittingRating, setIsSubmittingRating] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)

    const role = (localStorage.getItem('role') || 'farmer').toLowerCase() // 'farmer' or 'expert'
    const messagesEndRef = useRef(null)

    const fetchDetails = async (showLoading = false) => {
        if (showLoading) setIsLoading(true)
        try {
            const data = await consultationAPI.getDetails(id)
            setConsultation(data)
            setError('')
        } catch (err) {
            console.error(err)
            setError(te('errorConvDesc'))
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    // Polling refresh for real-time messages
    useEffect(() => {
        fetchDetails(true)
        const interval = setInterval(() => {
            fetchDetails(false)
        }, 3000)
        return () => clearInterval(interval)
    }, [id, lang])

    // Scroll to bottom on updates
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [consultation])

    const handleSend = async (e) => {
        e.preventDefault()
        const text = replyText.trim()
        if (!text) {
            alert(te('validationEmpty'))
            return
        }
        setIsSending(true)
        try {
            await consultationAPI.reply(id, text)
            setReplyText('')
            fetchDetails(false)
        } catch (err) {
            alert(te('replyError'))
        } finally {
            setIsSending(false)
        }
    }

    const handleCloseThread = async () => {
        if (window.confirm(te('confirmClose'))) {
            try {
                await consultationAPI.close(id)
                fetchDetails(false)
                if (role === 'farmer') {
                    setShowRatingModal(true)
                }
            } catch (err) {
                alert(te('closeError'))
            }
        }
    }

    const handleRatingSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            alert(lang === 'gu' ? 'કૃપા કરીને રેટિંગ આપો' : 'Please provide a rating (1-5 stars).')
            return
        }
        setIsSubmittingRating(true)
        try {
            await consultationAPI.submitRating(id, { rating, review: reviewText })
            setShowRatingModal(false)
            setRating(0)
            setReviewText('')
            fetchDetails(false)
            setToast({ message: lang === 'gu' ? 'રેટિંગ સફળતાપૂર્વક સબમિટ થયું!' : 'Rating submitted successfully!', type: 'success' })
            setTimeout(() => setToast(null), 3000)
        } catch (err) {
            alert(lang === 'gu' ? 'રેટિંગ સબમિટ કરવામાં નિષ્ફળતા' : 'Failed to submit rating.')
        } finally {
            setIsSubmittingRating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-center font-semibold text-primary">{te('loadingConv')}</div>
            </div>
        )
    }

    if (error || !consultation) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                    <h3 className="font-bold text-lg">{te('errorConv')}</h3>
                    <p className="mt-2">{error || te('errorConvDesc')}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark transition"
                    >
                        {te('back')}
                    </button>
                </div>
            </div>
        )
    }

    const isClosed = consultation.status === 'Closed'

    const statusLabel = (status) => {
        if (status === 'Pending') return te('convPending')
        if (status === 'Replied') return te('convReplied')
        return te('convClosed')
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[85vh] flex flex-col relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-white rounded-t-2xl shadow-md p-4 md:p-6 border-b border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-lg md:text-xl font-extrabold text-slate-800">{consultation.subject}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {role === 'expert'
                                ? `${te('farmerLabel')}: ${consultation.farmer_name}`
                                : `${te('expertLabel')}: ${consultation.expert_name} (${consultation.expert_specialization})`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${consultation.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        consultation.status === 'Replied' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                        {statusLabel(consultation.status)}
                    </span>

                    {/* Rate Expert Button if closed & unrated */}
                    {(isClosed && role === 'farmer' && !consultation.has_rating) && (
                        <button
                            onClick={() => setShowRatingModal(true)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <FiStar size={14} className="fill-amber-500" />
                            <span>{lang === 'gu' ? 'રેટિંગ આપો' : 'Rate Expert'}</span>
                        </button>
                    )}

                    {/* Close action */}
                    {!isClosed && (
                        <button
                            onClick={handleCloseThread}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <FiCheckCircle size={14} />
                            <span>{te('closeBtn')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-slate-50 border-x border-slate-200 p-4 md:p-6 overflow-y-auto max-h-[55vh] min-h-[40vh] flex flex-col space-y-4">
                {/* Initial Consultation message */}
                <div className="flex items-start gap-2.5 max-w-[85%] self-start">
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            {te('farmerLabel')} - {consultation.farmer_name}
                        </span>
                        <p className="text-sm font-semibold text-slate-700">{consultation.message}</p>

                        {consultation.image && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 max-w-sm">
                                <img
                                    src={`${BACKEND_URL}${consultation.image}`}
                                    alt="Consultation attachment"
                                    className="w-full h-auto object-cover max-h-60 hover:opacity-95 cursor-zoom-in"
                                    onClick={() => window.open(`${BACKEND_URL}${consultation.image}`)}
                                />
                            </div>
                        )}
                        <span className="text-[9px] text-slate-400 block text-right mt-1.5">
                            {formatGujaratiDateTime(consultation.created_date, lang)}
                        </span>
                    </div>
                </div>

                {/* Reply list */}
                {consultation.replies && consultation.replies.map((reply) => {
                    const isCurrentUser =
                        (role === 'expert' && reply.sender === 'Expert') ||
                        (role === 'farmer' && reply.sender === 'Farmer')

                    return (
                        <div
                            key={reply.id}
                            className={`flex items-start gap-2.5 max-w-[85%] ${isCurrentUser ? 'self-end' : 'self-start'}`}
                        >
                            <div className={`p-4 rounded-2xl shadow-xs border ${isCurrentUser
                                ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-500'
                                : 'bg-white text-slate-700 rounded-tl-none border-slate-100'
                                }`}>
                                <span className={`text-[10px] font-extrabold uppercase block mb-1 ${isCurrentUser ? 'text-emerald-100' : 'text-slate-400'
                                    }`}>
                                    {reply.sender === 'Expert' ? te('expertLabel') : te('farmerLabel')}
                                </span>
                                <p className="text-sm">{reply.message}</p>
                                <span className={`text-[9px] block text-right mt-1.5 ${isCurrentUser ? 'text-emerald-100' : 'text-slate-400'
                                    }`}>
                                    {formatGujaratiDateTime(reply.created_date, lang)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-white rounded-b-2xl shadow-md p-4 border-t border-light">
                {isClosed ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400 p-2 font-medium">
                        <FiLock size={16} />
                        <span>{te('closedMessage')}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={te('typePlaceholder')}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-slate-800 font-medium"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={isSending || !replyText.trim()}
                            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                            <FiSend size={15} />
                            <span className="hidden sm:inline">{te('sendBtn')}</span>
                        </button>
                    </form>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <button
                            onClick={() => setShowRatingModal(false)}
                            className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition"
                        >
                            <FiX size={18} />
                        </button>
                        <div className="p-6">
                            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                                {lang === 'gu' ? 'નિષ્ણાતને રેટિંગ આપો' : 'Rate this Expert'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {lang === 'gu' ? 'તમારો અનુભવ કેવો રહ્યો?' : 'How was your consultation experience?'}
                            </p>
                            <form onSubmit={handleRatingSubmit} className="space-y-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none p-1 transition-transform hover:scale-110 cursor-pointer"
                                        >
                                            <FiStar
                                                size={32}
                                                className={`transition-colors duration-200 ${star <= (hoverRating || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {lang === 'gu' ? 'તમારો રિવ્યુ (વૈકલ્પિક)' : 'Your Review (Optional)'}
                                    </label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        rows="3"
                                        placeholder={lang === 'gu' ? 'અહી લખો...' : 'Write your feedback here...'}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-slate-800 font-medium whitespace-pre-wrap resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRatingModal(false)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold transition cursor-pointer"
                                    >
                                        {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingRating}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
                                    >
                                        {isSubmittingRating ? (lang === 'gu' ? 'સબમિટ થાય છે...' : 'Submitting...') : (lang === 'gu' ? 'સબમિટ કરો' : 'Submit Rating')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConversationView
