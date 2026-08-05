import React, { useState, useEffect } from 'react'
import { FiClock, FiCalendar, FiSave, FiAlertCircle } from 'react-icons/fi'
import { expertAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'

const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAYS_GU = ["સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર", "રવિવાર"]

const dayKeys = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export const ExpertAvailability = () => {
    const { language, changeLanguage } = useLanguage()
    const lang = language === 'en' ? 'en' : 'gu'
    const { t: tRaw } = useTranslation()
    const te = (key) => tRaw(`expert.${key}`)
    const t = {
        title: te('availTitle'),
        subtitle: te('availSubtitle'),
        statusCard: te('statusCard'),
        onlineStatus: te('onlineStatus'),
        offlineStatus: te('offlineStatus'),
        workingDays: te('workingDays'),
        workingHours: te('workingHours'),
        startTime: te('startTime'),
        endTime: te('endTime'),
        days: lang === 'gu' ? DAYS_GU : DAYS_EN,
        saveBtn: te('saveAvail'),
        saving: te('savingAvail'),
        loading: te('loadingAvail'),
        error: te('errorAvail'),
        success: te('successAvail'),
        warningOffline: te('warningOffline'),
        toggleLabel: te('toggleLabel'),
        toggleDesc: te('toggleDesc'),
        retry: te('retry')
    }
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' })

    // Helper State
    const [isOnline, setIsOnline] = useState(true)
    const [selectedDays, setSelectedDays] = useState({
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false
    })
    const [timeRange, setTimeRange] = useState({
        start: '09:00',
        end: '17:00'
    })



    // Load expert settings
    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const res = await expertAPI.getDashboard()
            setProfile(res.profile)
            setIsOnline(res.profile.active_status)

            if (res.profile.language === 'GUJ' || res.profile.language === 'ENG') {
                const targetLang = res.profile.language === 'ENG' ? 'en' : 'gu'
                if (language !== targetLang) {
                    changeLanguage(targetLang)
                }
            }

            // Parse availability string (pattern: "Monday-Friday, 09:00 AM - 05:00 PM" or "Monday, Tuesday, 09:00 - 17:00")
            const availStr = res.profile.availability || ''
            if (availStr) {
                // Try simple splitting by comma
                const parts = availStr.split(',')
                if (parts.length >= 2) {
                    const daysPart = parts[0].trim()
                    const timePart = parts[1].trim()

                    // Parse days (checks if it specifies ranges e.g. "Monday-Friday" or list)
                    const tempDays = { ...selectedDays }
                    dayKeys.forEach(dk => {
                        tempDays[dk] = false
                    })

                    if (daysPart.includes('-')) {
                        const rangeParts = daysPart.split('-')
                        const startDayIdx = dayKeys.indexOf(rangeParts[0].trim())
                        const endDayIdx = dayKeys.indexOf(rangeParts[1].trim())
                        if (startDayIdx !== -1 && endDayIdx !== -1) {
                            for (let i = startDayIdx; i <= endDayIdx; i++) {
                                tempDays[dayKeys[i]] = true
                            }
                        }
                    } else {
                        // Check exact list inclusion
                        dayKeys.forEach(dk => {
                            if (daysPart.toLowerCase().includes(dk.toLowerCase())) {
                                tempDays[dk] = true
                            }
                        })
                    }
                    setSelectedDays(tempDays)

                    // Parse time (e.g. "09:00 - 17:00" or custom format)
                    const timeClean = timePart.replace(/[A-Za-z]/g, '').trim()
                    const timeSplit = timeClean.split('-')
                    if (timeSplit.length >= 2) {
                        setTimeRange({
                            start: timeSplit[0].trim(),
                            end: timeSplit[1].trim()
                        })
                    }
                }
            }
        } catch (err) {
            console.error(err)
            setApiMessage({ type: 'error', text: t.error })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    const handleDayToggle = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }))
    }

    const triggerMessage = (type, text) => {
        setApiMessage({ type, text })
        setTimeout(() => setApiMessage({ type: '', text: '' }), 5000)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        if (!profile) return

        setIsSaving(true)
        setApiMessage({ type: '', text: '' })

        try {
            // Build availability string representation
            const activeDays = dayKeys.filter(dk => selectedDays[dk])

            // Format days (abridged or listing)
            let daysString = ''
            if (activeDays.length === 0) {
                daysString = 'None'
            } else if (activeDays.length === 7) {
                daysString = 'Every day'
            } else {
                daysString = activeDays.join(', ')
            }

            const availabilityString = `${daysString}, ${timeRange.start} - ${timeRange.end}`

            const payload = {
                active_status: isOnline,
                availability: availabilityString
            }

            const updated = await expertAPI.update(profile.id, payload)
            setProfile(updated)
            triggerMessage('success', t.success)
        } catch (err) {
            console.error(err)
            triggerMessage('error', te('errorAvail'))
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{t.loading}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
            {/* Header / Bilingual Toggle */}
            <div className="flex justify-between items-center bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiClock className="text-emerald-600" /> {t.title}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{t.subtitle}</p>
                </div>

            </div>

            {/* Alert banner */}
            {apiMessage.text && (
                <div className={`p-4 rounded-card border leading-relaxed text-sm font-medium ${apiMessage.type === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'bg-red-50 border-red-200 text-red-750 text-red-750'
                    }`}>
                    {apiMessage.text}
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">

                {/* ACTIVE ONLINE SWITCH */}
                <Card className="p-6 space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100 mb-2">{t.statusCard}</span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-850">{t.toggleLabel}</label>
                            <p className="text-xs text-slate-400">{t.toggleDesc}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOnline(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isOnline ? 'bg-emerald-600 text-white shadow' : 'bg-slate-50 text-slate-500 border hover:bg-slate-100'
                                    }`}
                            >
                                {t.onlineStatus}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOnline(false)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${!isOnline ? 'bg-rose-600 text-white shadow' : 'bg-slate-50 text-slate-500 border hover:bg-slate-100'
                                    }`}
                            >
                                {t.offlineStatus}
                            </button>
                        </div>
                    </div>

                    {!isOnline && (
                        <div className="flex items-start gap-2 bg-yellow-50 text-yellow-808 px-4 py-3 rounded-xl border border-yellow-150 text-xs text-amber-800 bg-amber-50/50">
                            <FiAlertCircle className="mt-0.5" size={16} />
                            <p className="font-semibold">{t.warningOffline}</p>
                        </div>
                    )}
                </Card>

                {/* WORKING SCHEDULE: DAYS + TIMES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* SELECT WORKING DAYS */}
                    <Card className="p-6 space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100 mb-2 flex items-center gap-1.5">
                            <FiCalendar size={14} />
                            {t.workingDays}
                        </span>

                        <div className="space-y-2 pt-1 font-semibold text-sm">
                            {dayKeys.map((day, idx) => (
                                <label key={day} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedDays[day]}
                                        onChange={() => handleDayToggle(day)}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className={selectedDays[day] ? 'text-slate-800' : 'text-slate-400 font-medium'}>
                                        {t.days[idx]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    {/* SELECT TIME SLOTS */}
                    <Card className="p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100 mb-2 flex items-center gap-1.5">
                                <FiClock size={14} />
                                {t.workingHours}
                            </span>

                            <div className="space-y-4 pt-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500">{t.startTime}</label>
                                    <input
                                        type="time"
                                        value={timeRange.start}
                                        onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-205 text-sm font-semibold outline-none focus:border-primary transition"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500">{t.endTime}</label>
                                    <input
                                        type="time"
                                        value={timeRange.end}
                                        onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-205 text-sm font-semibold outline-none focus:border-primary transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100/50 flex justify-end">
                            <Button
                                type="submit"
                                isLoading={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5"
                            >
                                <FiSave size={16} />
                                {t.saveBtn}
                            </Button>
                        </div>
                    </Card>

                </div>

            </form>
        </div>
    )
}

export default ExpertAvailability
