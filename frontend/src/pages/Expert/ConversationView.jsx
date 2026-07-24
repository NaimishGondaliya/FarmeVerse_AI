import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiCheckCircle, FiLock } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')

const translations = {
    ENG: {
        back: "Back",
        status: "Status",
        pending: "Pending",
        replied: "Replied",
        closed: "Closed",
        closeBtn: "Close Consultation",
        sendBtn: "Send",
        typePlaceholder: "Type your message here...",
        initialMessage: "Initial Query Description",
        noReplies: "No responses yet.",
        errorTitle: "Error loading conversation",
        errorDesc: "Ensure you are authorized and the server is online.",
        closedMessage: "This query thread is closed.",
        replyError: "Failed to send message.",
        validationEmpty: "Message content cannot be blank.",
        farmerLabel: "Farmer",
        expertLabel: "Expert",
    },
    GUJ: {
        back: "પાછા જાઓ",
        status: "સ્થિતિ",
        pending: "બાકી છે",
        replied: "જવાબ આપેલ છે",
        closed: "બંધ કરેલ છે",
        closeBtn: "પ્રશ્ન પૂર્ણ કરો",
        sendBtn: "મોકલો",
        typePlaceholder: "તમારો સંદેશ અહીં લખો...",
        initialMessage: "પ્રારંભિક વર્ણન",
        noReplies: "હજી સુધી કોઈ પ્રતિક્રિયા નથી.",
        errorTitle: "વાતચીત લોડ કરવામાં ભૂલ",
        errorDesc: "ચકાસો કે તમે લૉગ ઇન છો અને સર્વર ચાલુ છે.",
        closedMessage: "આ ચર્ચા બંધ થઈ ગઈ છે.",
        replyError: "સંદેશ મોકલવામાં નિષ્ફળતા.",
        validationEmpty: "ખાલી સંદેશ મોકલી શકાતો નથી.",
        farmerLabel: "ખેડૂત",
        expertLabel: "નિષ્ણાત",
    }
}

export const ConversationView = () => {
    const { id } = useParams()
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const navigate = useNavigate()
    const [consultation, setConsultation] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState('')

    const role = localStorage.getItem('role') || 'farmer' // 'farmer' or 'expert'
    const messagesEndRef = useRef(null)
    const t = translations[lang]

    const fetchDetails = async (showLoading = false) => {
        if (showLoading) setIsLoading(true)
        try {
            const data = await consultationAPI.getDetails(id)
            setConsultation(data)
            setError('')
        } catch (err) {
            console.error(err)
            setError(t.errorDesc)
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
            alert(t.validationEmpty)
            return
        }
        setIsSending(true)
        try {
            await consultationAPI.reply(id, text)
            setReplyText('')
            fetchDetails(false)
        } catch (err) {
            alert(t.replyError)
        } finally {
            setIsSending(false)
        }
    }

    const handleCloseThread = async () => {
        if (window.confirm("Are you sure you want to close this consultation?")) {
            try {
                await consultationAPI.close(id)
                fetchDetails(false)
            } catch (err) {
                alert("Failed to close consultation.")
            }
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-center font-semibold text-primary">{t.typePlaceholder} Loading...</div>
            </div>
        )
    }

    if (error || !consultation) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                    <h3 className="font-bold text-lg">{t.errorTitle}</h3>
                    <p className="mt-2">{error || t.errorDesc}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark transition"
                    >
                        {t.back}
                    </button>
                </div>
            </div>
        )
    }

    const isClosed = consultation.status === 'Closed'

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[85vh] flex flex-col">
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
                            {role === 'expert' ? `${t.farmerLabel}: ${consultation.farmer_name}` : `${t.expertLabel}: ${consultation.expert_name} (${consultation.expert_specialization})`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Language Switch */}


                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${consultation.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        consultation.status === 'Replied' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                        {consultation.status === 'Pending' ? t.pending :
                            consultation.status === 'Replied' ? t.replied :
                                t.closed}
                    </span>

                    {/* Close action */}
                    {!isClosed && (
                        <button
                            onClick={handleCloseThread}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <FiCheckCircle size={14} />
                            <span>{t.closeBtn}</span>
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
                            {t.farmerLabel} - {consultation.farmer_name}
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
                            {new Date(consultation.created_date).toLocaleString()}
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
                                    {reply.sender === 'Expert' ? t.expertLabel : t.farmerLabel}
                                </span>
                                <p className="text-sm">{reply.message}</p>
                                <span className={`text-[9px] block text-right mt-1.5 ${isCurrentUser ? 'text-emerald-100' : 'text-slate-400'
                                    }`}>
                                    {new Date(reply.created_date).toLocaleString()}
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
                        <span>{t.closedMessage}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t.typePlaceholder}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-slate-800 font-medium"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={isSending || !replyText.trim()}
                            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                            <FiSend size={15} />
                            <span className="hidden sm:inline">{t.sendBtn}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
